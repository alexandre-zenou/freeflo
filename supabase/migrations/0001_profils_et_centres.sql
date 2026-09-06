-- ============================================================================
-- FREEFLO, phase 2 — tranche 1 : identités
--
-- Ce fichier crée le socle sur lequel tout le reste s'appuie : une réservation
-- doit appartenir à quelqu'un, et chaque règle RLS écrite ensuite part de
-- « qui parle ». Il ne contient donc QUE les identités, ni offres ni
-- réservations, qui viendront dans les migrations suivantes.
--
-- Vocabulaire des rôles : on garde celui du CODE (`member`, `centre`, `admin`,
-- voir `src/lib/account.tsx`) et non celui de `docs/ARCHITECTURE.md`
-- (`client`, `vendor`) : coller au code déjà écrit évite une table de
-- correspondance dans chaque composant, et le document sera mis à jour.
--
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Rôles
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('member', 'centre', 'admin');

-- ---------------------------------------------------------------------------
-- 2. Profils
--
-- Une ligne par compte, en miroir de `auth.users`, que Supabase gère et qu'on
-- ne modifie jamais directement. On y met ce que l'application affiche : le
-- prénom, le nom, le rôle.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  first_name  text not null default '',
  last_name   text not null default '',
  role        public.user_role not null default 'member',
  created_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Miroir applicatif de auth.users. Le rôle vit ICI et nulle part ailleurs.';

-- ---------------------------------------------------------------------------
-- 3. Création automatique du profil à l'inscription
--
-- Le déclencheur ne lit VOLONTAIREMENT pas de rôle dans les métadonnées de
-- l'utilisateur : celles-ci sont fournies par le navigateur au moment de
-- l'inscription, donc contrôlables par n'importe qui. Les lire ouvrirait la
-- porte à se déclarer administrateur en modifiant une requête.
--
-- Le rôle prend donc toujours sa valeur par défaut, `member`. Passer un compte
-- en `centre` ou en `admin` est un geste d'administration, jamais une
-- conséquence d'une inscription.
--
-- `security definer` : le déclencheur écrit dans `public.profiles`, que le rôle
-- anonyme n'a pas le droit de toucher. `search_path = ''` est obligatoire avec
-- `security definer`, sinon un schéma placé en tête du chemin par un attaquant
-- pourrait détourner les appels de fonction.
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. « Suis-je administrateur ? »
--
-- `security definer` n'est pas ici une facilité mais une NÉCESSITÉ : la
-- fonction interroge `public.profiles`, or elle sera appelée depuis les
-- policies de cette même table. Sans elle, Postgres réévaluerait la policy en
-- boucle et lèverait une récursion infinie.
-- ---------------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. Centres de sport
--
-- Un centre est un PROFIL, plus les informations de son établissement. La
-- contrainte d'unicité sur `profile_id` dit qu'un compte tient au plus un
-- centre, ce qui suffit au modèle du cahier.
--
-- Coordonnées en `lat` / `lng` et non en `geography(Point)` : PostGIS arrivera
-- avec les offres, qui sont ce qu'on cherche par rayon. Charger l'extension
-- maintenant compliquerait cette migration sans rien servir.
-- ---------------------------------------------------------------------------
create table public.vendors (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null unique references public.profiles (id) on delete cascade,
  name             text not null,
  address          text not null default '',
  arrondissement   text not null default '',
  lat              double precision,
  lng              double precision,
  -- Renseignés à l'arrivée de Stripe Connect. Nuls tant qu'aucun centre n'est
  -- passé par la vérification d'identité.
  stripe_account_id text unique,
  created_at       timestamptz not null default now()
);

comment on table public.vendors is
  'Un centre de sport. Son compte est le profil référencé par profile_id.';

-- ---------------------------------------------------------------------------
-- 6. RLS
--
-- Activée sur les DEUX tables. Sans elle, la clé « anon » qui part dans le
-- navigateur donnerait un accès complet en lecture et en écriture : la
-- sécurité de Supabase ne vient pas du secret de cette clé, mais d'ici.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.vendors  enable row level security;

-- Profils : chacun voit et modifie le sien, l'administration voit tout.
create policy "profil lisible par son propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profils lisibles par l'administration"
  on public.profiles for select
  using (public.is_admin());

create policy "profil modifiable par son propriétaire"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- IMPÉRATIF, et facile à oublier : sans cette révocation, la policy de mise à
-- jour ci-dessus permettrait à n'importe qui de passer SON propre rôle à
-- `admin`. La policy autorise la ligne, pas le contenu de chaque colonne.
-- Le privilège se retire donc au niveau de la colonne.
revoke update (role) on public.profiles from authenticated;
revoke update (id, created_at) on public.profiles from authenticated;

-- Centres : la fiche d'un centre est PUBLIQUE, le site l'affiche à tout le
-- monde, y compris aux visiteurs déconnectés. Seul son propriétaire, ou
-- l'administration, peut l'écrire.
create policy "centres lisibles par tous"
  on public.vendors for select
  using (true);

create policy "centre modifiable par son propriétaire"
  on public.vendors for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "centre modifiable par l'administration"
  on public.vendors for all
  using (public.is_admin())
  with check (public.is_admin());

-- Personne ne crée un centre depuis le navigateur : le parcours d'inscription
-- passera par une route serveur qui vérifie le SIRET. Aucune policy INSERT
-- pour `authenticated`, donc aucune insertion possible avec la clé anon.

-- ---------------------------------------------------------------------------
-- 7. Index
-- ---------------------------------------------------------------------------
create index profiles_role_idx on public.profiles (role);
create index vendors_profile_idx on public.vendors (profile_id);
