"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ratingSummary,
  type VendorOffer,
  type VendorReview,
} from "@/components/vendor/vendor-data";
import { useLocale, useT } from "@/lib/i18n";

/**
 * Avis du centre.
 *
 * La note moyenne, les barres de répartition et le taux de réponse ne sont pas
 * écrits ici : `ratingSummary` les recalcule à chaque rendu depuis les avis
 * détaillés et l'agrégat des plus anciens. Répondre à un avis fait donc bouger
 * le bloc de gauche tout seul.
 *
 * Le cours noté vient de l'offre pointée par `offerId`, la même liste que le
 * Planning et Mes offres : renommer un cours renomme l'avis avec lui.
 */
function Stars({ rating }: { rating: number }) {
  const t = useT();
  return (
    <span className="flex gap-0.5" aria-label={t(`${rating} étoiles sur 5`, `${rating} stars out of 5`)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < rating ? "fill-current text-pro-accent" : "text-ink/20")}
        />
      ))}
    </span>
  );
}

function ReviewCard({
  review,
  courseName,
  onReply,
}: {
  review: VendorReview;
  courseName: string;
  onReply: (id: string, text: string) => void;
}) {
  const t = useT();
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onReply(review.id, text);
    setComposing(false);
    setDraft("");
  };

  return (
    <article className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="pro-display text-xl text-ink">
          {review.name}
          <span className="ml-2 text-sm font-normal text-ink-soft">
            {t("sur", "on")} {courseName}
          </span>
        </p>
        <span className="flex items-center gap-2 text-xs text-ink-soft">
          <Stars rating={review.rating} />
          {t(review.date, review.dateEn)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink/80">{t(review.text, review.textEn)}</p>

      {review.reply ? (
        <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
          <span className="pro-display text-xl text-ink">{t("Votre réponse :", "Your reply:")}</span>{" "}
          {t(review.reply, review.replyEn ?? review.reply)}
        </p>
      ) : composing ? (
        <div className="mt-4 border-t border-line pt-4">
          <label htmlFor={`reponse-${review.id}`} className="sr-only">
            {t("Votre réponse", "Your reply")}
          </label>
          <textarea
            id={`reponse-${review.id}`}
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("Merci pour votre retour…", "Thanks for your feedback…")}
            className="w-full resize-y rounded-xl border border-line bg-pro-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-pro-accent"
          />
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="rounded-full bg-pro-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-40"
            >
              {t("Envoyer", "Send")}
            </button>
            <button
              onClick={() => {
                setComposing(false);
                setDraft("");
              }}
              className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {t("Annuler", "Cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setComposing(true)}
          className="mt-4 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink"
        >
          {t("Répondre", "Reply")}
        </button>
      )}
    </article>
  );
}

export function ReviewsTab({
  reviews,
  offers,
  onReply,
}: {
  reviews: VendorReview[];
  offers: VendorOffer[];
  onReply: (id: string, text: string) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const { total, average, breakdown, replyPct, awaiting } = ratingSummary(reviews);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="h-fit rounded-2xl bg-white p-6 ring-1 ring-line">
        <div className="flex items-baseline gap-3">
          <p className="font-display text-5xl font-light text-ink">
            {average.toLocaleString(locale === "en" ? "en-GB" : "fr-FR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </p>
          <p className="text-sm text-ink-soft">
            {total} {t("avis", "reviews")}
          </p>
        </div>

        <ul className="mt-6 space-y-2.5">
          {breakdown.map((r) => (
            <li key={r.stars} className="flex items-center gap-3 text-sm">
              <span className="flex w-8 shrink-0 items-center gap-1 text-ink-soft">
                {r.stars} <Star className="h-3 w-3 fill-current text-pro-accent" />
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-500"
                  style={{ width: `${Math.max(1, Math.round((r.count / total) * 100))}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums text-xs text-ink-soft">{r.count}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
          <p>
            {t(
              `Vous répondez à ${replyPct}% des avis. Les centres qui répondent remontent dans les résultats.`,
              `You reply to ${replyPct}% of reviews. Centres that reply rank higher in results.`,
            )}
          </p>
          <p className={cn("font-medium", awaiting > 0 ? "text-pro-accent" : "text-ink-soft")}>
            {awaiting === 0
              ? t("Tous vos avis récents ont une réponse.", "All your recent reviews have a reply.")
              : awaiting === 1
                ? t("1 avis récent attend une réponse.", "1 recent review is waiting for a reply.")
                : t(
                    `${awaiting} avis récents attendent une réponse.`,
                    `${awaiting} recent reviews are waiting for a reply.`,
                  )}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            courseName={offers.find((o) => o.id === r.offerId)?.title ?? t("un cours retiré", "a removed class")}
            onReply={onReply}
          />
        ))}
      </div>
    </div>
  );
}
