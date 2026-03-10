import HeroPromoSlider from "./HeroPromoSlider";

export default function Hero() {
  return (
    <section className="relative h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <HeroPromoSlider />
        </div>
      </div>
    </section>
  );
}