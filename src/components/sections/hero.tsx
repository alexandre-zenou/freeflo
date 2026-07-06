"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { offers, site, categoryOf, type Offer } from "@/lib/site";
import { useLivePrice } from "@/components/use-live-price";
import { formatEuro } from "@/lib/format";

/**
 * Cinematic poster hero — blend of 21st.dev "Hero — Luxury Editorial" (dzekuza,
 * id 14846: kicker, thin rule, ghost CTAs) and "PrismaHero" (rahil1202, id 12200:
 * bottom-anchored composition, per-word pull-up reveal), re-skinned to FREEFLO.
 * The floating offer card is replaced by a live price strip on the baseline.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

function WordsPullUp({
  words,
  delayOffset = 0,
}: {
  words: { text: string; serif?: boolean }[];
  delayOffset?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  return (
    <span ref={ref} className="inline-flex flex-wrap">
      {words.map((w, i) => (
        <motion.span
          key={`${w.text}-${i}`}
          initial={reduced ? false : { y: 26, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: 0.7, delay: delayOffset + i * 0.09, ease: EASE }}
          className={
            (w.serif ? "serif-em" : "") +
            (i < words.length - 1 ? " mr-[0.22em]" : "") +
            " inline-block"
          }
        >
          {w.text}
        </motion.span>
      ))}
    </span>
  );
}

/** One ticking price in the baseline strip — the dégressivité, live, sans carte. */
function LiveTick({ offer }: { offer: Offer }) {
  const live = useLivePrice(offer.basePrice, offer.placesLeft, offer.startsInHours);
  return (
    <Link
      href={`/offres/${offer.id}`}
      className="group flex items-baseline gap-2 text-sm text-white/70 transition-colors hover:text-white"
    >
      <span>{categoryOf(offer.category).label}</span>
      <span className="font-medium tabular-nums text-white">{formatEuro(live.currentPrice)}</span>
      {live.discountPct > 0 && (
        <span className="font-medium tabular-nums text-ember">−{live.discountPct}%</span>
      )}
    </Link>
  );
}

const tickerIds = ["the-new-me-pilates", "boxe-republique", "hiit-bastille"];

export function Hero() {
  const ticker = offers.filter((o) => tickerIds.includes(o.id));

  return (
    <section className="relative min-h-dvh overflow-hidden peri-mesh grain">
      {/* duotone périwinkle : dégradé de marque + photo en mix-blend-luminosity */}
      <div className="absolute inset-0 bg-gradient-to-br from-peri via-peri-deep to-ink">
        <Image
          src="https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&w=1900&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 grayscale contrast-110 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_100%,rgba(16,18,43,0.72),rgba(16,18,43,0.28)_45%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(95%_120%_at_100%_80%,rgba(16,18,43,0.6),rgba(16,18,43,0.25)_50%,transparent_70%)]" />
      </div>

      <div className="relative z-10 ff-container flex min-h-dvh flex-col pb-10 pt-32">
        <div className="my-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="eyebrow text-white [text-shadow:0_1px_14px_rgba(16,18,43,0.6)]"
        >
          {site.city} · Le sport de dernière minute
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mt-5 h-px w-16 origin-left bg-white/30"
        />

        <div className="mt-8 grid grid-cols-12 items-end gap-x-8 gap-y-10">
          <h1 className="col-span-12 display text-[clamp(3.25rem,8.6vw,8.5rem)] leading-[0.92] tracking-[-0.01em] text-white [text-shadow:0_2px_40px_rgba(16,18,43,0.45)] lg:col-span-8">
            <span className="block whitespace-nowrap">
              <WordsPullUp words={[{ text: "Burn" }, { text: "Calories," }]} delayOffset={0.15} />
            </span>
            <span className="block whitespace-nowrap">
              <WordsPullUp
                words={[{ text: "Not" }, { text: "Cash.", serif: true }]}
                delayOffset={0.35}
              />
            </span>
          </h1>

          <div className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-4 lg:pb-2">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              className="max-w-md text-lg leading-relaxed text-white [text-shadow:0_1px_18px_rgba(16,18,43,0.55)]"
            >
              Les places de cours invendues près de chez vous, à prix qui fond.
              Plus l&apos;heure du cours approche, plus c&apos;est cadeau.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" variant="ghostline">
                <Link href="/offres">
                  Trouver mon cours de sport <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="link" className="text-white hover:text-white/80">
                <Link href="/comment-ca-marche">Comment ça marche</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        </div>

        {/* live baseline strip — product proof without the floating card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/25 pt-5"
        >
          <span className="flex items-center gap-2 text-sm text-white/75">
            <MapPin className="h-4 w-4" />
            <span className="flex h-2 w-2">
              <span className="h-2 w-2 rounded-full bg-ember pulse-dot" />
            </span>
            142 places libérées aujourd&apos;hui autour de vous
          </span>
          <span className="hidden flex-1 sm:block" />
          {ticker.map((o) => (
            <LiveTick key={o.id} offer={o} />
          ))}
          <Link
            href="/offres"
            className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
          >
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
