import type Stripe from "stripe";
import { offerById } from "@/lib/site";
import { bookingRef } from "@/lib/booking-ref";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Transformer une session Stripe PAYÉE en réservations, côté serveur.
 *
 * C'est le cœur de la sécurité des réservations. Avant, le navigateur
 * inscrivait lui-même la réservation après le paiement, dans son propre
 * stockage : on pouvait s'en fabriquer une depuis la console sans rien payer.
 * Désormais :
 *
 * · QUI paie et QUOI est écrit par le serveur dans la session Stripe, au
 *   moment de la créer (`client_reference_id` et `metadata.lignes`). Le
 *   navigateur ne fournit plus rien d'autre qu'un identifiant de session ;
 * · au retour, on relit cette session CHEZ Stripe, jamais dans ce que le
 *   navigateur nous renvoie, et on n'agit que si `payment_status` vaut `paid` ;
 * · la base refuse le doublon d'elle-même, par l'unicité du couple
 *   session + offre. Rejouer la page de retour, double-cliquer ou rappeler la
 *   route ne crée rien de plus.
 *
 * Ce fichier ne doit jamais être importé côté client : il utilise la clé
 * `service_role`, qui contourne la RLS.
 */

/** Une ligne telle qu'on la range dans la session Stripe. */
export interface LigneReservee {
  offerId: string;
  /** Prix payé, en centimes entiers. */
  cents: number;
  /** Début du cours, horodatage absolu, calculé par le SERVEUR. */
  startsAt: number;
}

/*
  Format compact, parce que Stripe limite chaque valeur de métadonnée à 500
  caractères. Un tableau de triplets `[offre, centimes, début]` tient une
  dizaine de cours ; au-delà, `encoderLignes` refuse plutôt que de tronquer en
  silence, ce qui ferait payer des cours jamais réservés.
*/
export const LIMITE_METADONNEE = 500;

export function encoderLignes(lignes: LigneReservee[]): string {
  const brut = JSON.stringify(lignes.map((l) => [l.offerId, l.cents, l.startsAt]));
  if (brut.length > LIMITE_METADONNEE) {
    throw new Error("Panier trop grand pour une seule session de paiement.");
  }
  return brut;
}

export function decoderLignes(brut: string | undefined | null): LigneReservee[] {
  if (!brut) return [];
  try {
    const v = JSON.parse(brut);
    if (!Array.isArray(v)) return [];
    return v
      .filter((x) => Array.isArray(x) && x.length === 3)
      .map(([offerId, cents, startsAt]) => ({
        offerId: String(offerId),
        cents: Number(cents),
        startsAt: Number(startsAt),
      }))
      .filter((l) => l.offerId && Number.isFinite(l.cents) && l.cents > 0 && Number.isFinite(l.startsAt));
  } catch {
    return [];
  }
}

export type Confirmation =
  | { paye: false; raison: string }
  | { paye: true; creees: number; dejaPresentes: number };

/**
 * Crée les réservations d'une session, si et seulement si elle est payée.
 *
 * Idempotente : l'appeler dix fois pour la même session crée les réservations
 * une fois. C'est ce qui permet au navigateur de la rappeler sans risque, et à
 * un futur webhook Stripe de faire exactement le même travail sans doublon.
 */
export async function confirmerSession(session: Stripe.Checkout.Session): Promise<Confirmation> {
  if (session.payment_status !== "paid") {
    return { paye: false, raison: `paiement ${session.payment_status}` };
  }

  const clientId = session.client_reference_id;
  if (!clientId) {
    /* Session créée avant ce mécanisme, ou forgée : on ne sait pas à QUI
       rattacher les places, on n'invente rien. */
    return { paye: false, raison: "session sans titulaire" };
  }

  const lignes = decoderLignes(session.metadata?.lignes);
  if (lignes.length === 0) return { paye: false, raison: "session sans cours" };

  const supabase = createAdminClient();
  if (!supabase) return { paye: false, raison: "service_role absente" };

  const rangs = lignes.flatMap((l) => {
    const offer = offerById(l.offerId);
    if (!offer) return [];
    return [
      {
        client_id: clientId,
        offer_id: offer.id,
        ref: bookingRef(offer.id, offer.basePrice, offer.placesLeft),
        price_paid_cents: l.cents,
        starts_at: new Date(l.startsAt).toISOString(),
        stripe_session_id: session.id,
      },
    ];
  });

  /*
    `ignoreDuplicates` et non une erreur : un doublon n'est pas une anomalie
    ici, c'est le cas normal d'un rechargement de la page de retour. La
    contrainte d'unicité fait le tri, et on compte ce qui existait déjà.
  */
  const { data, error } = await supabase
    .from("bookings")
    .upsert(rangs, { onConflict: "stripe_session_id,offer_id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("confirmerSession:", error);
    return { paye: false, raison: "écriture refusée par la base" };
  }

  const creees = data?.length ?? 0;
  return { paye: true, creees, dejaPresentes: rangs.length - creees };
}
