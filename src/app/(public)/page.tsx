import { ProHomeRedirect } from "@/components/pro-home-redirect";
import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { HowItWorks } from "@/components/sections/how-it-works";
import { MapSearch } from "@/components/sections/map-search";
import { LiveOffers } from "@/components/sections/live-offers";

export default function Home() {
  return (
    <>
      {/* Un compte centre ou administration n'a rien à faire sur la page qui
          vend le service au sportif : il repart sur `/pro`. Ne rend rien pour
          un visiteur, qui est le cas de tout le monde. */}
      <ProHomeRedirect />
      <main>
        <Hero />
        <Categories />
        <HowItWorks />
        <MapSearch />
        <LiveOffers />
      </main>
    </>
  );
}
