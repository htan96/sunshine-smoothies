import AboutIntro from "@/components/about/AboutIntro"
import AboutStory from "@/components/about/AboutStory"
import AboutOwner from "@/components/about/AboutOwner"
import AboutQuality from "@/components/about/AboutQuality"
import AboutCTA from "@/components/about/AboutCTA"

export default function AboutPage() {
  return (
    <main className="bg-white">
      <AboutIntro />\
      <AboutStory />\
      <AboutOwner />\
      <AboutQuality />\
      <AboutCTA />\
    </main>
  )
}
