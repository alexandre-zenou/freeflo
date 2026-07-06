import { cn } from "@/lib/utils";
import { formatCountdown } from "@/lib/format";

/** Jauge « ember » : plus l'échéance approche, plus la barre chauffe et se remplit. */
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
          <span className={cn("flex items-center gap-1.5 font-medium", hot ? "text-ember-deep" : "text-ink-soft")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", hot ? "bg-ember pulse-dot" : "bg-peri-deep")} />
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
            background: hot
              ? "linear-gradient(90deg,#ff8a3d,#ff6a45,#e8431c)"
              : "linear-gradient(90deg,#8b9ddb,#4f61a8)",
          }}
        />
      </div>
    </div>
  );
}
