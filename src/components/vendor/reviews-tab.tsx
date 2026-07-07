"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ratingBreakdown, recentReviews } from "@/components/vendor/vendor-data";

const total = ratingBreakdown.reduce((s, r) => s + r.count, 0);

export function ReviewsTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="h-fit rounded-2xl bg-paper p-6 ring-1 ring-line">
        <div className="flex items-baseline gap-3">
          <p className="font-display text-5xl font-light text-ink">4,9</p>
          <p className="text-sm text-ink-soft">{total} avis</p>
        </div>
        <ul className="mt-6 space-y-2.5">
          {ratingBreakdown.map((r) => (
            <li key={r.stars} className="flex items-center gap-3 text-sm">
              <span className="flex w-8 shrink-0 items-center gap-1 text-ink-soft">
                {r.stars} <Star className="h-3 w-3 fill-current text-peri-deep" />
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-peri-deep"
                  style={{ width: `${Math.max(1, Math.round((r.count / total) * 100))}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums text-xs text-ink-soft">{r.count}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
          Vous répondez à 92% des avis. Les centres qui répondent remontent dans les résultats.
        </p>
      </div>

      <div className="space-y-4">
        {recentReviews.map((r) => (
          <article key={`${r.name}-${r.date}`} className="rounded-2xl bg-paper p-6 ring-1 ring-line">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-ink">
                {r.name}
                <span className="ml-2 text-sm font-normal text-ink-soft">· {r.course}</span>
              </p>
              <span className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="flex gap-0.5" aria-label={`${r.rating} étoiles sur 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn("h-3.5 w-3.5", i < r.rating ? "fill-current text-peri-deep" : "text-ink/20")}
                    />
                  ))}
                </span>
                {r.date}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{r.text}</p>
            {r.reply ? (
              <p className="mt-4 border-l-0 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                <span className="font-medium text-ink">Votre réponse ·</span> {r.reply}
              </p>
            ) : (
              <button className="mt-4 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink">
                Répondre
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
