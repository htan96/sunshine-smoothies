import type { Metadata } from "next";
import EventsIntro from "@/components/events/EventsIntro";
import EventsHero from "@/components/events/EventsHero";
import EventsStory from "@/components/events/EventsStory";
import EventsWhy from "@/components/events/EventsWhy";
import EventsCTA from "@/components/events/EventsCTA";
import SocialSection from "@/components/home/SocialSection";

export const metadata: Metadata = {
  title: "Free Smoothie Day | Sunshine Smoothies Events",
  description:
    "Learn about Free Smoothie Day at Sunshine Smoothies in Vallejo — we give away free smoothies to our community several times a year. The story behind this recurring celebration.",
};

export default function EventsPage() {
  return (
    <main className="bg-white">
      <EventsIntro />
      <EventsHero />
      <EventsStory />
      <EventsWhy />
      <EventsCTA />
      <SocialSection />
    </main>
  );
}
