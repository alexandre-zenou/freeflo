import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-dvh place-items-center peri-mesh grain">
        <div className="ff-container text-center">
          <p className="display text-[clamp(4rem,14vw,9rem)] text-ink">404</p>
          <p className="serif-em -mt-2 text-2xl text-peri-deep">Ce créneau est déjà parti.</p>
          <p className="mx-auto mt-4 max-w-md text-ink/70">
            La page n&apos;existe plus, mais d&apos;autres cours se libèrent en ce moment près de vous.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" variant="solid"><Link href="/offres">Voir les cours</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/">Accueil</Link></Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
