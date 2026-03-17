import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import AboutIntro from "@/components/about/AboutIntro";
import AboutStory from "@/components/about/AboutStory";
import AboutOwner from "@/components/about/AboutOwner";
import AboutQuality from "@/components/about/AboutQuality";
import AboutCTA from "@/components/about/AboutCTA";
import SocialSection from "@/components/home/SocialSection";

export const metadata: Metadata = {
  title: "About Us | Sunshine Smoothies & Coffee",
  alternates: { canonical: `${SITE_URL}/about` },
  description:
    "Meet Carlos and learn how Sunshine Smoothies brings fresh ingredients, community impact, and quality from Rojas Family Farm to Vallejo.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      <AboutIntro />
      <AboutStory />
      <AboutOwner />
      <AboutQuality />
      <AboutCTA />
      <SocialSection />
    </main>
  );
}
