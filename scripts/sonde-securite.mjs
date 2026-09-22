/**
 * Sonde de sécurité de la base FREEFLO.
 *
 *   node --env-file=.env.local scripts/sonde-securite.mjs
 *
 * Tente les attaques qui comptent, avec un compte JETABLE créé pour l'occasion
 * et effacé à la fin, jamais avec un vrai compte. Sort avec le code 1 si une
 * seule d'entre elles réussit, pour pouvoir l'enchaîner à un déploiement.
 *
 * Écrite après une erreur. La migration 0001 prétendait verrouiller le rôle des
 * profils, et un test l'avait « confirmé » : il vérifiait qu'un ANONYME ne
 * pouvait pas CRÉER un profil admin. Personne n'avait vérifié qu'un membre
 * CONNECTÉ ne pouvait pas MODIFIER le sien. Il le pouvait. Cette sonde attaque
 * donc depuis un compte connecté, qui est le cas réaliste.
 *
 * Elle lit la clé `service_role` pour créer et effacer le compte jetable, et
 * pour lire l'état réel de la base : ne jamais la lancer ailleurs qu'en local.
 */
import { createClient } from "@supabase/supabase-js";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SR) {
  console.error("Variables Supabase absentes : lancer avec --env-file=.env.local");
  process.exit(2);
}

const admin = createClient(URL_, SR, { auth: { persistSession: false } });
const email = `sonde.securite.${Date.now()}@freeflo.fr`;
const mdp = `sonde-${Date.now()}-motdepasse`;
let echecs = 0;

function verdict(nom, tenu, detail) {
  if (!tenu) echecs++;
  console.log(`  ${tenu ? "✓" : "✗ FAILLE"}  ${nom}${detail ? `  (${detail})` : ""}`);
}

const { data: cree, error: eCree } = await admin.auth.admin.createUser({
  email, password: mdp, email_confirm: true,
});
if (eCree) {
  console.error("Impossible de créer le compte jetable :", eCree.message);
  process.exit(2);
}
const id = cree.user.id;
const moi = createClient(URL_, ANON, { auth: { persistSession: false } });
await moi.auth.signInWithPassword({ email, password: mdp });

try {
  console.log("\nProfils");
  for (const role of ["admin", "centre"]) {
    await moi.from("profiles").update({ role }).eq("id", id);
    const { data } = await admin.from("profiles").select("role").eq("id", id).single();
    verdict(`un membre ne peut pas se passer « ${role} »`, data.role === "member", `rôle : ${data.role}`);
  }
  await moi.from("profiles").delete().eq("id", id);
  const { data: encore } = await admin.from("profiles").select("id").eq("id", id).maybeSingle();
  verdict("un membre ne peut pas supprimer son profil", Boolean(encore));
  const { data: tous } = await moi.from("profiles").select("id");
  verdict("un membre ne lit que son propre profil", (tous ?? []).length <= 1, `${(tous ?? []).length} visible(s)`);

  console.log("\nRéservations");
  const { error: eResa } = await moi.from("bookings").insert({
    client_id: id, offer_id: "hot-yoga-marais", ref: "FLO-SONDE", price_paid_cents: 1,
    starts_at: new Date(Date.now() + 864e5).toISOString(), stripe_session_id: "cs_sonde",
  });
  verdict("un membre ne peut pas se créer une réservation gratuite", Boolean(eResa));
  const { data: autresResa } = await moi.from("bookings").select("id").neq("client_id", id);
  verdict("un membre ne lit pas les réservations des autres", (autresResa ?? []).length === 0);

  console.log("\nCandidatures des centres");
  await admin.from("candidatures_centres").insert({ profile_id: id, nom_centre: "Sonde", siret: "90214577600018" });
  const { data: cand } = await admin.from("candidatures_centres").select("id").eq("profile_id", id).single();
  await moi.rpc("trancher_candidature", { p_candidature: cand.id, p_decision: "validee" });
  const { data: apres } = await admin.from("profiles").select("role").eq("id", id).single();
  verdict("un candidat ne peut pas valider son propre dossier", apres.role === "member", `rôle : ${apres.role}`);

  console.log("\nCentres");
  const { error: eVendor } = await moi.from("vendors").insert({ profile_id: id, name: "Faux centre" });
  verdict("un membre ne peut pas se créer une fiche de centre", Boolean(eVendor));
} finally {
  await admin.auth.admin.deleteUser(id);
  console.log("\n  compte jetable effacé");
}

console.log(echecs === 0 ? "\nAucune faille trouvée.\n" : `\n${echecs} FAILLE(S). Ne pas déployer.\n`);
process.exit(echecs === 0 ? 0 : 1);
