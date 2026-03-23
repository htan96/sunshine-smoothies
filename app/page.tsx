import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/site";
import { HeroSection } from "@/components/home/HeroSection";
import { EventHeroBanner } from "@/components/home/EventHeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BestSellers } from "@/components/home/BestSellers";
import { FuelPackBanner } from "@/components/home/FuelPackBanner";
import { HomeGallery } from "@/components/home/HomeGallery";
import { EventsPreview } from "@/components/home/EventsPreview";
import { LocationsSection } from "@/components/home/LocationsSection";
import SocialSection from "@/components/home/SocialSection";
import { getBestSellersItems } from "@/lib/bestSellers";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sunshine Smoothies | Fresh Smoothies & Juice Bar in Vallejo",
  description:
    "Order fresh smoothies, juices, and fuel packs online from Sunshine Smoothies in Vallejo. Visit our Solano Avenue storefront or Waterfront drive-thru.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: "Sunshine Smoothies | Fresh Smoothies & Juice Bar in Vallejo",
    description:
      "Order fresh smoothies, juices, and fuel packs online from Sunshine Smoothies in Vallejo. Visit our Solano Avenue storefront or Waterfront drive-thru.",
    images: [{ url: `${SITE_URL}/logo.png` }],
    type: "website",
  },
};

async function BestSellersSection() {
  const items = await getBestSellersItems();
  return <BestSellers items={items} />;
}

function BestSellersFallback() {
  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <p className="text-sm font-medium text-[var(--color-orange)] mb-2">Customer Favorites</p>
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-[var(--color-charcoal)] mb-8">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden">
              <div className="aspect-square bg-neutral-200" />
              <div className="p-6">
                <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EventHeroBanner />
      <EventsPreview />
      <CategoryGrid />
      <Suspense fallback={<BestSellersFallback />}>
        <BestSellersSection />
      </Suspense>
      <FuelPackBanner />
      <HomeGallery />
      <LocationsSection />
      <SocialSection />
    </>
  );
}
