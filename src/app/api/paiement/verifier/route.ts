import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * Confirme auprès de Stripe qu'une session a bien été payée.
 *
 * Indispensable : le retour de Stripe passe par l'URL du navigateur, et
 * `/panier?paiement=ok` se tape à la main. Sans cette vérification, n'importe
 * qui s'inscrirait des réservations sans jamais payer.
 *
 * Ce n'est PAS la bonne source de vérité pour autant : en production, c'est le
 * webhook `checkout.session.completed` qui fait foi, parce qu'il arrive même si
 * le client ferme son onglet avant d'être redirigé. Ici il n'y a rien à
 * enregistrer côté serveur, donc la question ne se pose pas encore.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ paid: false, error: "Paiement non configuré." }, { status: 503 });
  }

  const id = new URL(request.url).searchParams.get("session");
  if (!id) {
    return NextResponse.json({ paid: false, error: "Session manquante." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    return NextResponse.json({ paid: session.payment_status === "paid" });
  } catch (e) {
    console.error("Stripe retrieve:", e);
    return NextResponse.json({ paid: false, error: "Session introuvable." }, { status: 404 });
  }
}
