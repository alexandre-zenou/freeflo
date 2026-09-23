-- ============================================================================
-- FREEFLO — le centre entre dès que son adresse est confirmée
--
-- Décision d'Alexandre, 23/09/2026 : la confirmation par e-mail suffit, la
-- vérification du SIRET par l'administration disparaît du parcours.
--
-- CE QUE CELA CHANGE, et il faut le savoir : n'importe qui peut désormais
-- ouvrir un espace centre et publier des créneaux en confirmant une adresse.
-- Le SIRET était ce qui distinguait un établissement réel d'un inscrit
-- quelconque. Arbitrage assumé : la fluidité d'abord, le temps de lancer.
-- Pour revenir en arrière, il suffit de supprimer le déclencheur ci-dessous :
-- les dossiers repasseront par l'onglet Candidatures.
--
-- Le SIRET reste demandé, mais FACULTATIF : il resservira pour la facturation
-- et pour Stripe Connect, qui l'exigera le jour où l'argent ira aux centres.
--
-- À exécuter dans Supabase → SQL Editor, APRÈS 0004.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Le SIRET devient facultatif
--
-- La contrainte d'origine exigeait 14 chiffres. On garde le contrôle de FORME
-- quand il est renseigné : un SIRET à moitié saisi resterait une donnée fausse,
-- qu'il vaut mieux refuser à l'entrée que découvrir à la facturation.
-- ---------------------------------------------------------------------------
alter table public.candidatures_centres
  drop constraint if exists candidatures_centres_siret_check;

alter table public.candidatures_centres
  alter column siret set default '';

alter table public.candidatures_centres
  add constraint candidatures_centres_siret_check
  check (siret = '' or siret ~ '^[0-9]{14}$');

-- ---------------------------------------------------------------------------
-- 2. L'ouverture, déclenchée par la confirmation
--
-- Dans la BASE et non dans le site, pour une raison précise : la confirmation
-- peut arriver par plusieurs chemins (notre route `/auth/confirm`, un lien
-- ouvert ailleurs, une activation à la main depuis Supabase). Un déclencheur
-- posé sur la colonne elle-même les couvre tous, et ne peut pas être oublié.
--
-- `traitee_par` reste NUL : c'est ainsi qu'on reconnaît une validation
-- automatique d'une décision humaine, dans l'onglet Candidatures.
--
-- Ne fait rien si le dossier n'est plus « en_attente » : un dossier refusé à
-- la main ne se rouvre pas tout seul parce que la personne clique son lien.
-- ---------------------------------------------------------------------------
create or replace function public.activer_centre_apres_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.candidatures_centres%rowtype;
begin
  -- Uniquement au PASSAGE de « non confirmé » à « confirmé ».
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    select * into c
      from public.candidatures_centres
     where profile_id = new.id and statut = 'en_attente'
     for update;

    if found then
      update public.candidatures_centres
         set statut = 'validee', traitee_le = now()
       where id = c.id;

      update public.profiles set role = 'centre' where id = new.id;

      insert into public.vendors (profile_id, name, address)
      values (c.profile_id, c.nom_centre, c.ville)
      on conflict (profile_id) do update set name = excluded.name;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;

create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.activer_centre_apres_confirmation();
