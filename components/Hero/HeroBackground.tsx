import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";

export default function Hero() {
  return (
    <section className="relative h-screen w-full">

      <HeroBackground />

      <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
        <HeroContent />
      </div>

    </section>
  );
}