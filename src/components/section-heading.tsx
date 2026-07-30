import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  lead,
  title,
  intro,
  align = "left",
  className,
  onDark = false,
}: {
  eyebrow?: string;
  /** Serif-italic editorial lead-in — an alternative to the uppercase eyebrow. */
  lead?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow mb-4", onDark ? "text-gold" : "text-brand")}>{eyebrow}</p>
      )}
      {lead && !eyebrow && (
        <p className={cn("serif-em mb-3 text-2xl", onDark ? "text-gold" : "text-brand")}>{lead}</p>
      )}
      <h2
        className={cn(
          "display text-balance text-4xl sm:text-5xl md:text-[3.4rem]",
          onDark ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-lg leading-relaxed", onDark ? "text-cream/70" : "text-ink-soft")}>
          {intro}
        </p>
      )}
    </div>
  );
}
