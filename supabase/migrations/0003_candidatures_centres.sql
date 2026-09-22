-- ============================================================================
-- FREEFLO, phase 2 — tranche 3 : candidatures des centres
--
-- Le formulaire d'inscription d'un centre demandait huit informations et n'en
-- enregistrait que quatre : prénom, nom, e-mail, mot de passe. Le NOM DU
-- CENTRE, son SIRET, son téléphone et sa ville étaient perdus. L'inscription
-- produisait donc un compte membre anonyme, et l'administration n'avait
-- aucun moyen de savoir quel centre c'était, ni de vérifier son SIRET.
--
-- Cette table garde la candidature complète. Elle ne donne AUCUN droit par
-- elle-même : un centre reste un simple membre tant que l'administration n'a
-- pas validé. C'est la vérification anti-fraude prévue par le cahier.
--
-- À exécuter dans Supabase → SQL Editor, APRÈS 0001 et 0002.
-- ============================================================================

create type public.statut_candidature as enum ('en_attente', 'validee', 'refusee');

create table public.candidatures_centres (
  id           uuid primary key default gen_random_uuid(),
  -- Une candidature par compte : un même compte ne dépose pas dix dossiers.
  profile_id   uuid not null unique references public.profiles (id) on delete cascade,
  nom_centre   text not null check (length(trim(nom_centre)) > 0),
  -- Quatorze chiffres, espaces retirés. Vérifié ici et non seulement dans le
  -- formulaire : un SIRET mal formé doit être refusé par la base elle-même.
  siret        text not null check (siret ~ '^[0-9]{14}$'),
  telephone    text not null default '',
  ville        text not null default '',
  statut       public.statut_candidature not null default 'en_attente',
  -- Qui a tranché, et quand : utile le jour où il faut expliquer un refus.
  traitee_par  uuid references public.profiles (id),
  traitee_le   timestamptz,
  created_at   timestamptz not null default now()
);

comment on table public.candidatures_centres is
  'Dossiers d''inscription des centres. Créés côté serveur ; validés par l''administration.';

create index candidatures_statut_idx on public.candidatures_centres (statut, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.candidatures_centres enable row level security;

-- Le candidat voit SON dossier, pour savoir où il en est.
create policy "candidature lisible par son auteur"
  on public.candidatures_centres for select
  using (profile_id = auth.uid());

-- L'administration voit tous les dossiers.
create policy "candidatures lisibles par l administration"
  on public.candidatures_centres for select
  using (public.is_admin());

-- Aucune policy INSERT ni UPDATE pour les comptes connectés. Déposer un
-- dossier et le valider passent par le serveur, avec la clé service_role :
-- sinon un candidat pourrait passer son propre dossier à « validee ».

-- ---------------------------------------------------------------------------
-- Trancher un dossier : valider ou refuser
--
-- Une FONCTION de la base, et non une route du site, pour deux raisons.
--
-- 1. L'autorisation vit dans Postgres. La fonction vérifie elle-même que
--    l'appelant est administrateur (`is_admin()`, qui lit `auth.uid()`), et
--    lève sinon. Aucun code de navigateur ne peut contourner ce contrôle : il
--    s'exécute là où sont les données.
--
-- 2. Tout se fait dans UNE transaction. Valider, c'est trois écritures : le
--    dossier passe à « validee », le compte passe à « centre », sa fiche est
--    créée. Si l'une échoue, aucune n'est appliquée, et on ne se retrouve
--    jamais avec un centre à moitié ouvert.
--
-- `security definer` lui permet d'écrire le rôle, colonne fermée à tous les
-- comptes connectés par la migration 0001. Elle est appelée avec la session
-- de l'ADMINISTRATEUR, pas avec la clé service_role : sinon `auth.uid()`
-- serait vide et le contrôle refuserait tout.
--
-- Seul un dossier « en_attente » se tranche. Revenir sur une décision est un
-- autre geste, qu'on ne veut pas voir arriver par un double clic.
-- ---------------------------------------------------------------------------
create function public.trancher_candidature(
  p_candidature uuid,
  p_decision    public.statut_candidature
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.candidatures_centres%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Reserve a l administration' using errcode = '42501';
  end if;

  if p_decision not in ('validee', 'refusee') then
    raise exception 'Decision invalide : %', p_decision;
  end if;

  -- `for update` verrouille la ligne : deux administrateurs qui cliquent en
  -- même temps ne trancheront pas le même dossier deux fois.
  select * into c from public.candidatures_centres
   where id = p_candidature
   for update;

  if not found then
    raise exception 'Candidature introuvable';
  end if;

  if c.statut <> 'en_attente' then
    raise exception 'Candidature deja traitee (%)', c.statut;
  end if;

  update public.candidatures_centres
     set statut = p_decision, traitee_par = auth.uid(), traitee_le = now()
   where id = p_candidature;

  if p_decision = 'validee' then
    update public.profiles set role = 'centre' where id = c.profile_id;

    insert into public.vendors (profile_id, name, address)
    values (c.profile_id, c.nom_centre, c.ville)
    on conflict (profile_id) do update set name = excluded.name;
  end if;
end;
$$;

-- Personne n'appelle la fonction par défaut ; seuls les comptes connectés le
-- peuvent, et la fonction elle-même refuse tout ce qui n'est pas admin.
revoke all on function public.trancher_candidature(uuid, public.statut_candidature) from public;
grant execute on function public.trancher_candidature(uuid, public.statut_candidature) to authenticated;
