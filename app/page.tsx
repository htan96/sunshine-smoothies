import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BestSellers } from "@/components/home/BestSellers";
import { FuelPackBanner } from "@/components/home/FuelPackBanner";
import { EventsPreview } from "@/components/home/EventsPreview";
import { LocationsSection } from "@/components/home/LocationsSection";
import SocialSection from "@/components/home/SocialSection";
import { getBestSellersItems } from "@/lib/bestSellers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const bestSellerItems = await getBestSellersItems();

  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <BestSellers items={bestSellerItems} />
      <FuelPackBanner />
      <EventsPreview />
      <LocationsSection />
      <SocialSection />
    </>
  );
}
