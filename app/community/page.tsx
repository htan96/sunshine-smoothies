import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import CommunityHero from "@/components/community/CommunityHero";
import CommunitySlider from "@/components/community/CommunitySlider";
import CommunityMoments from "@/components/community/CommunityMoments";
import CommunitySupport from "@/components/community/CommunitySupport";
import SocialSection from "@/components/home/SocialSection";

export const metadata: Metadata = {
  title: "Community Impact | Sunshine Smoothies & Coffee",
  alternates: { canonical: `${SITE_URL}/community` },
  description:
    "Learn how Sunshine Smoothies supports local schools, youth programs, and community initiatives in Vallejo. We invest in people, not just products.",
};

export default function CommunityPage() {
  return (
    <>
      <CommunityHero />
      <CommunitySlider />
      <CommunityMoments />
      <CommunitySupport />
      <SocialSection />
    </>
  );
}
