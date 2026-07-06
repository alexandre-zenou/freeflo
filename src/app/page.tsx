import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Mechanic } from "@/components/sections/mechanic";
import { LiveOffers } from "@/components/sections/live-offers";
import { VendorCta } from "@/components/sections/vendor-cta";
import { Faq } from "@/components/sections/faq";

export default function Home() {
  return (
    <>
      <SiteHeader overHero />
      <main>
        <Hero />
        <Categories />
        <HowItWorks />
        <Mechanic />
        <LiveOffers />
        <VendorCta />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
