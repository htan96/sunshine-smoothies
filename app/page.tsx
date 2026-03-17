import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BestSellers } from "@/components/home/BestSellers";
import { FuelPackBanner } from "@/components/home/FuelPackBanner";
import { EventsPreview } from "@/components/home/EventsPreview";
import { LocationsSection } from "@/components/home/LocationsSection";
import SocialSection from "@/components/home/SocialSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <BestSellers />
      <FuelPackBanner />
      <EventsPreview />
      <LocationsSection />
      <SocialSection />
    </>
  );
}
