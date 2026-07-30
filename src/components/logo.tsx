import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark bicolore de la charte cliente : « FREE » rouge, « FLO » or.
 * Sur fond sombre le « FREE » passe en blanc pour rester lisible.
 */
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
        "group inline-flex items-baseline font-display text-[1.4rem] font-extrabold tracking-tight",
        className,
      )}
    >
      <span className={onDark ? "text-white" : "text-brand"}>FREE</span>
      <span className="text-gold">FLO</span>
    </Link>
  );
}
