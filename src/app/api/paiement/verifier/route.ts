import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { confirmerSession } from "@/lib/reservations-serveur";

/**
 * Retour de Stripe : vérifier le paiement ET créer les réservations.
 *
 * Avant, cette route répondait seulement « payé » ou « pas payé », et c'était
 * le navigateur qui inscrivait ensuite la réservation dans son propre stockage.
 * Il suffisait donc de la faire répondre « payé » pour s'offrir une place.
 *
 * Désormais la réservation naît ICI, côté serveur, à partir de ce que Stripe
 * dit de la session et de ce que NOUS y avions inscrit en la créant. Le
 * navigateur ne fournit qu'un identifiant de session, qui ne prouve rien par
 * lui-même : on va le vérifier chez Stripe.
 *
 * Idempotente, grâce à l'unicité en base du couple session + offre : recharger
 * la page de retour ou rappeler cette route ne crée aucun doublon.
 *
 * Ce n'est pas encore la source de vérité définitive. Si le client ferme son
 * onglet entre le paiement et la redirection, cette route n'est jamais appelée
 * et Stripe a encaissé sans réservation. C'est le rôle d'un webhook
 * `checkout.session.completed`, qui appellera exactement `confirmerSession`.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ paid: false, error: "Paiement non configuré." }, { status: 503 });
  }

  const id = new URL(request.url).searchParams.get("session");
  if (!id) {
    return NextResponse.json({ paid: false, error: "Session manquante." }, { status: 400 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(id);
  } catch {
    return NextResponse.json({ paid: false, error: "Session introuvable." }, { status: 404 });
  }

  const r = await confirmerSession(session);
  if (!r.paye) {
    return NextResponse.json({ paid: false, error: r.raison }, { status: 402 });
  }
  return NextResponse.json({ paid: true, creees: r.creees, dejaPresentes: r.dejaPresentes });
}
