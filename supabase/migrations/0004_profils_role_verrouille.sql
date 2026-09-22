-- ============================================================================
-- FREEFLO, correctif de sécurité : le rôle d'un profil n'était PAS verrouillé
--
-- 0001 croyait fermer la colonne `role` par `revoke update (role) ... from
-- authenticated`. Cela ne suffit pas : Supabase accorde d'office UPDATE sur
-- TOUTE la table au rôle `authenticated`, et retirer un privilège de colonne
-- ne retire pas le privilège de table qui le couvre. Postgres combine les deux,
-- et le privilège de table l'emporte.
--
-- Constaté le 22/09/2026 contre la vraie base : un compte client fraîchement
-- créé a fait, avec la seule clé anon,
--   update profiles set role = 'admin' where id = auth.uid()
-- et c'est passé. Devenu admin, il lisait les 8 profils (policy is_admin) et
-- aurait pu trancher les candidatures des centres. Aucun compte réel n'en a
-- profité : seuls les deux comptes de démonstration portaient un rôle élevé.
--
-- Même méthode que 0002 pour `bookings`, qui elle était juste : on retire le
-- privilège de TABLE, puis on rend colonne par colonne ce qui est permis.
-- Le site n'écrit jamais `profiles` depuis le navigateur aujourd'hui ; on
-- laisse le prénom et le nom, pour une future page « mon compte ».
--
-- À exécuter dans Supabase → SQL Editor, APRÈS 0003.
-- ============================================================================

revoke update on public.profiles from authenticated, anon;
grant update (first_name, last_name) on public.profiles to authenticated;

-- Même trou, par précaution, sur les deux autres tables ouvertes en écriture
-- aux comptes connectés : on ne garde que les colonnes qu'un propriétaire a
-- des raisons de toucher. `profile_id` et `stripe_account_id` d'un centre ne
-- se changent que côté serveur.
revoke update on public.vendors from authenticated, anon;
grant update (name, address, arrondissement, lat, lng) on public.vendors to authenticated;

-- Aucune insertion ni suppression de profil depuis le navigateur : c'est le
-- déclencheur `handle_new_user` qui crée, la cascade d'auth.users qui efface.
revoke insert, delete on public.profiles from authenticated, anon;
