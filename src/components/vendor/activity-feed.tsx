"use client";

import { useEffect, useState } from "react";
import { activitySeed } from "@/components/vendor/vendor-data";
import { useLocale, useT } from "@/lib/i18n";

/** Même accélération que useLivePrice : 1 s réelle ≈ 1,5 min « démo ». */
const DEMO_SPEED = 90;

const KIND_DOT: Record<string, string> = {
  sale: "bg-brand",
  melt: "bg-brand",
  review: "bg-gold",
  payout: "bg-ink/40",
};

function label(minutes: number, en: boolean): string {
  const ago = (v: string) => (en ? `${v} ago` : `il y a ${v}`);
  if (minutes < 60) return ago(`${Math.max(1, Math.round(minutes))} min`);
  const h = Math.floor(minutes / 60);
  return ago(`${h} h ${String(Math.round(minutes % 60)).padStart(2, "0")}`);
}

export function ActivityFeed() {
  const t = useT();
  const { locale } = useLocale();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setElapsed(((Date.now() - startedAt) * DEMO_SPEED) / 60_000);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium text-ink">{t("En ce moment", "Right now")}</h3>
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-brand pulse-dot" /> {t("live", "live")}
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {activitySeed.map((e) => (
          <li key={e.text} className="flex items-baseline gap-3 text-sm">
            <span className={`h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full ${KIND_DOT[e.kind]}`} />
            <span className="min-w-0 flex-1 text-ink/85">{t(e.text, e.textEn)}</span>
            <span className="shrink-0 tabular-nums text-xs text-ink-soft">
              {label(e.minutesAgo + elapsed, locale === "en")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
