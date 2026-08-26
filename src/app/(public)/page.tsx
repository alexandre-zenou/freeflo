import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { HowItWorks } from "@/components/sections/how-it-works";
import { MapSearch } from "@/components/sections/map-search";
import { LiveOffers } from "@/components/sections/live-offers";

export default function Home() {
  return (
    <>
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
