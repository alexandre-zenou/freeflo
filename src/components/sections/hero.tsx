import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferCard } from "@/components/offer-card";
import { offers, site } from "@/lib/site";

export function Hero() {
  const featured = offers.find((o) => o.id === "the-new-me-pilates")!;

  return (
    <section className="relative min-h-dvh overflow-hidden peri-mesh grain">
      {/* athletic photo, blended into the periwinkle like the reference */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1900&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-peri-deep/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(130%_110%_at_0%_45%,rgba(16,18,43,0.82),rgba(16,18,43,0.35)_45%,rgba(16,18,43,0.15)_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/15 to-ink/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bone" />
      </div>

      <div className="relative z-10 ff-container flex min-h-dvh flex-col justify-center pt-28 pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="rise eyebrow mb-6 text-white/80" style={{ animationDelay: "0.05s" }}>
              {site.city} · Le sport de dernière minute
            </p>
            <h1 className="display text-[clamp(2.75rem,6.4vw,5.5rem)] text-white [text-shadow:0_2px_40px_rgba(16,18,43,0.45)]">
              <span className="rise block whitespace-nowrap" style={{ animationDelay: "0.15s" }}>
                Burn Calories,
              </span>
              <span className="rise block whitespace-nowrap" style={{ animationDelay: "0.28s" }}>
                Not <span className="serif-em">Cash.</span>
              </span>
            </h1>
            <p
              className="rise mt-7 max-w-md text-lg leading-relaxed text-white/85"
              style={{ animationDelay: "0.42s" }}
            >
              Les places de cours invendues près de chez vous, à prix qui fond.
              Plus l&apos;heure du cours approche, plus c&apos;est cadeau.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.52s" }}>
              <Button asChild size="lg" variant="ghostline">
                <Link href="/offres">
                  Trouver mon cours de sport <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="link" className="text-white hover:text-white/80">
                <Link href="/comment-ca-marche">Comment ça marche</Link>
              </Button>
            </div>

            <div
              className="rise mt-10 flex items-center gap-2 text-sm text-white/75"
              style={{ animationDelay: "0.62s" }}
            >
              <MapPin className="h-4 w-4" />
              <span className="flex h-2 w-2">
                <span className="h-2 w-2 rounded-full bg-ember pulse-dot" />
              </span>
              <span>142 places libérées aujourd&apos;hui autour de vous</span>
            </div>
          </div>

          {/* live floating card — the price fonds down while you watch */}
          <div className="rise mx-auto w-full max-w-sm lg:ml-auto" style={{ animationDelay: "0.7s" }}>
            <OfferCard offer={featured} priority />
          </div>
        </div>
      </div>
    </section>
  );
}
