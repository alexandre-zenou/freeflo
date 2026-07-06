import Link from "next/link";
import { cn } from "@/lib/utils";

/** FREEFLO wordmark + « flow » mark (double chevron = mouvement, énergie). */
export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="FREEFLO — accueil"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-[1.35rem] font-medium tracking-tight",
        onDark ? "text-white" : "text-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-[-8deg]",
          onDark ? "bg-white/15" : "bg-ink",
        )}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8l6 4-6 4M12 8l6 4-6 4"
            stroke={onDark ? "#fff" : "#ff6a45"}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>FREEFLO</span>
    </Link>
  );
}
