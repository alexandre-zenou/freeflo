import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

/**
 * En-tête de page sur nappe rouge : le texte passe en blanc pour rester lisible
 * (le fond n'est plus crème depuis la charte cliente).
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={cn("relative overflow-hidden brand-mesh grain", compact ? "pt-28 pb-12" : "pt-32 pb-20")}>
      {/* Entrée décalée : intitulé, puis titre, puis chapô, puis boutons. */}
      <Reveal stagger={0.09} className="relative ff-container">
        <div>{eyebrow && <p className="eyebrow mb-4 text-gold">{eyebrow}</p>}</div>
        <h1 className="display max-w-3xl text-balance text-4xl text-white sm:text-5xl md:text-6xl [text-shadow:0_2px_24px_rgba(60,2,2,0.45)]">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">{intro}</p>}
        {children}
      </Reveal>
    </section>
  );
}
