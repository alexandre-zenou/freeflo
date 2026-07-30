import { cn } from "@/lib/utils";
import { formatCountdown } from "@/lib/format";

/** Jauge d’urgence : plus l'échéance approche, plus la barre chauffe et se remplit. */
export function UrgencyMeter({
  heat,
  remainingHours,
  className,
  showLabel = true,
}: {
  heat: number;
  remainingHours: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.round(heat * 100);
  const hot = heat > 0.6;
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-[0.72rem]">
          <span className={cn("flex items-center gap-1.5 font-medium", hot ? "text-brand-deep" : "text-ink-soft")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", hot ? "bg-brand pulse-dot" : "bg-gold-deep")} />
            {hot ? "Sprint final" : "Le prix fond"}
          </span>
          <span className="tabular-nums text-ink-soft">départ dans {formatCountdown(remainingHours)}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.max(6, pct)}%`,
            /* calme = or, urgent = rouge : la charte cliente en deux temps */
            background: hot
              ? "linear-gradient(90deg,#f4d26e,#a51c1e,#830606)"
              : "linear-gradient(90deg,#f6e3ad,#f4d26e)",
          }}
        />
      </div>
    </div>
  );
}
