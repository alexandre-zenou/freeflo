import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Les portes de sécurité de la création d'une réservation.
 *
 * Ce module est ce qui empêche de s'offrir une place sans payer. On teste donc
 * surtout ce qu'il REFUSE : chaque cas où il ne doit rien écrire en base.
 */

const upsert = vi.fn();
let adminDisponible = true;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () =>
    adminDisponible
      ? {
          from: () => ({
            upsert: (...a: unknown[]) => {
              upsert(...a);
              return { select: async () => ({ data: [{ id: "x" }], error: null }) };
            },
          }),
        }
      : null,
}));

const { confirmerSession, decoderLignes, encoderLignes, LIMITE_METADONNEE } = await import(
  "./reservations-serveur"
);

const ligne = { offerId: "hot-yoga-marais", cents: 1400, startsAt: 1_900_000_000_000 };

function session(extra: Record<string, unknown> = {}) {
  return {
    id: "cs_test_1",
    payment_status: "paid",
    client_reference_id: "11111111-1111-1111-1111-111111111111",
    metadata: { lignes: encoderLignes([ligne]) },
    ...extra,
  } as never;
}

describe("codage des lignes dans la session Stripe", () => {
  it("fait l'aller-retour sans perte", () => {
    expect(decoderLignes(encoderLignes([ligne]))).toEqual([ligne]);
  });

  it("REFUSE de tronquer un panier trop grand plutôt que de perdre des cours", () => {
    const trop = Array.from({ length: 40 }, (_, i) => ({ ...ligne, offerId: `offre-${i}` }));
    expect(() => encoderLignes(trop)).toThrow();
  });

  it("tient sous la limite de Stripe pour un panier ordinaire", () => {
    const cinq = Array.from({ length: 5 }, (_, i) => ({ ...ligne, offerId: `offre-${i}` }));
    expect(encoderLignes(cinq).length).toBeLessThanOrEqual(LIMITE_METADONNEE);
  });

  it("ignore une valeur illisible ou trafiquée au lieu de planter", () => {
    expect(decoderLignes("pas du json")).toEqual([]);
    expect(decoderLignes('{"a":1}')).toEqual([]);
    expect(decoderLignes(null)).toEqual([]);
  });

  it("écarte les lignes à prix nul, négatif ou non numérique", () => {
    const brut = JSON.stringify([
      ["a", 0, 1],
      ["b", -500, 1],
      ["c", "gratuit", 1],
      ["d", 1400, 1],
    ]);
    expect(decoderLignes(brut).map((l) => l.offerId)).toEqual(["d"]);
  });
});

describe("création des réservations", () => {
  beforeEach(() => {
    upsert.mockClear();
    adminDisponible = true;
  });

  it("n'écrit RIEN si la session n'est pas payée", async () => {
    const r = await confirmerSession(session({ payment_status: "unpaid" }));
    expect(r.paye).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("n'écrit RIEN si la session ne dit pas à qui elle appartient", async () => {
    const r = await confirmerSession(session({ client_reference_id: null }));
    expect(r.paye).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("n'écrit RIEN si la session ne porte aucun cours", async () => {
    const r = await confirmerSession(session({ metadata: {} }));
    expect(r.paye).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("ignore une offre qui n'existe pas au catalogue", async () => {
    const r = await confirmerSession(
      session({ metadata: { lignes: encoderLignes([{ ...ligne, offerId: "offre-inventee" }]) } }),
    );
    expect(r.paye).toBe(true);
    expect(upsert.mock.calls[0][0]).toEqual([]);
  });

  it("rattache la réservation au titulaire de la SESSION, jamais à l'appelant", async () => {
    await confirmerSession(session());
    const [rangs] = upsert.mock.calls[0];
    expect(rangs[0].client_id).toBe("11111111-1111-1111-1111-111111111111");
    expect(rangs[0].price_paid_cents).toBe(1400);
    expect(rangs[0].stripe_session_id).toBe("cs_test_1");
  });

  it("confie le dédoublonnage à la base, sans erreur sur un rechargement", async () => {
    await confirmerSession(session());
    expect(upsert.mock.calls[0][1]).toEqual({
      onConflict: "stripe_session_id,offer_id",
      ignoreDuplicates: true,
    });
  });
});
