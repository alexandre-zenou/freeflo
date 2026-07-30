import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/site";

export function Categories() {
  return (
    <section className="bg-secondary/50 py-6">
      <div className="mb-4 ff-container">
        <p className="serif-em text-xl text-peri-deep">Tous les sports, moins chers.</p>
      </div>
      {/* edge-to-edge marquee of category tiles */}
      <div className="group relative overflow-hidden">
        <div className="marquee-track flex w-max gap-4 group-hover:[animation-play-state:paused]">
          {[...categories, ...categories].map((c, i) => (
            <Link
              key={`${c.slug}-${i}`}
              href="/offres"
              className="relative h-40 w-64 shrink-0 overflow-hidden rounded-2xl ring-1 ring-line"
              aria-label={c.label}
            >
              <Image src={c.image} alt="" fill sizes="256px" className="object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="absolute bottom-3 left-4 text-lg font-medium text-white">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
