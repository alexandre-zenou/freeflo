import { NextResponse } from "next/server";
import { offerById } from "@/lib/site";
import { lowestPossiblePrice } from "@/lib/pricing";
import { getStripe, isTestKey } from "@/lib/stripe";

/**
 * Ouvre une session Stripe Checkout pour le panier.
 *
 * Première route serveur du projet : jusqu'ici tout vivait dans le navigateur.
 * Elle existe parce qu'un paiement ne peut pas se faire autrement — la clé
 * secrète Stripe ne doit jamais atteindre le client.
 *
 * PORTÉE : démonstration en clés de TEST. L'argent irait au compte plateforme,
 * pas aux centres. Le vrai modèle est Stripe Connect, un compte connecté par
 * centre et la commission en `application_fee_amount` (`docs/ARCHITECTURE.md`
 * §6). Il demande d'abord une base de données, qui n'existe pas encore.
 *
 * CE QUE CETTE ROUTE NE FAIT PAS, et qu'il faudra en phase 2 :
 * · vérifier qu'il reste réellement une place (`placesLeft` est une constante
 *   de `site.ts`, deux personnes peuvent payer la même) ;
 * · réserver le stock le temps du paiement ;
 * · écouter les webhooks Stripe, qui sont la source de vérité d'un paiement.
 */
export const runtime = "nodejs";

interface Ligne {
  offerId: string;
  /** Prix figé à la mise au panier, en euros. */
  price: number;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Paiement non configuré : STRIPE_SECRET_KEY est absente." },
      { status: 503 },
    );
  }
  if (!isTestKey()) {
    /* Refus délibéré : voir `lib/stripe.ts`. Cette maquette n'a ni stock réel
       ni versement aux centres, elle n'a rien à faire en clés de production. */
    return NextResponse.json(
      { error: "Cette démonstration n'accepte que des clés Stripe de test (sk_test_)." },
      { status: 503 },
    );
  }

  let lignes: Ligne[];
  try {
    const body = await request.json();
    lignes = Array.isArray(body?.lignes) ? body.lignes : [];
  } catch {
    return NextResponse.json({ error: "Corps de requête illisible." }, { status: 400 });
  }
  if (lignes.length === 0) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }

  /*
    Le montant vient du navigateur, il n'est donc pas digne de confiance. On ne
    peut pas le recalculer à l'identique — le panier fige le prix à l'ajout et
    la démo accélère le temps — mais on peut refuser l'impossible : sous le
    plancher de la grille, ou au-dessus du plein tarif.
  */
  const items = [];
  for (const l of lignes) {
    const offer = offerById(l.offerId);
    if (!offer) {
      return NextResponse.json({ error: `Offre inconnue : ${l.offerId}` }, { status: 400 });
    }
    const prix = Number(l.price);
    if (!Number.isFinite(prix)) {
      return NextResponse.json({ error: `Montant invalide pour ${offer.id}.` }, { status: 400 });
    }
    const plancher = lowestPossiblePrice(offer.basePrice);
    if (prix < plancher || prix > offer.basePrice) {
      return NextResponse.json(
        {
          error: `Montant hors barème pour ${offer.id} : ${prix} €, attendu entre ${plancher} € et ${offer.basePrice} €.`,
        },
        { status: 400 },
      );
    }

    items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        /* Stripe compte en CENTIMES entiers : 13,20 € vaut 1320. Un flottant
           passerait en silence et facturerait un montant faux. */
        unit_amount: Math.round(prix * 100),
        product_data: {
          name: `${offer.title}, ${offer.gym}`,
          description: `${offer.address}, ${offer.durationMin} min`,
        },
      },
    });
  }

  /*
    L'URL de retour vient de l'en-tête `origin` et non d'une variable figée :
    le site tourne en local, sur les préversions Vercel et en production, et
    une URL codée en dur renverrait toujours au mauvais endroit.
  */
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items,
      success_url: `${origin}/panier?paiement=ok&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/panier?paiement=annule`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe Checkout:", e);

    /*
      En DÉVELOPPEMENT, le message de Stripe est renvoyé tel quel : c'est lui
      qui nomme ce qui manque au compte (capacité absente, devise refusée,
      exigence en souffrance). Sans lui, on en est réduit à deviner.

      En production il reste côté serveur : il peut décrire la configuration du
      compte, et le visiteur n'a besoin que de savoir que le paiement a raté.
    */
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Stripe a refusé la session de paiement."
            : `Stripe a refusé la session de paiement : ${detail}`,
      },
      { status: 502 },
    );
  }
}
