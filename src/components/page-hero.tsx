import { cn } from "@/lib/utils";

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
    <section className={cn("relative overflow-hidden brand-mesh grain", compact ? "pt-28 pb-10" : "pt-32 pb-16")}>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-cream" />
      <div className="relative ff-container">
        {eyebrow && <p className="eyebrow mb-4 text-ink/70">{eyebrow}</p>}
        <h1 className="display max-w-3xl text-balance text-4xl text-ink sm:text-5xl md:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
