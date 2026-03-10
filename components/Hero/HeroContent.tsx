import HeroPromotions from "./HeroPromotions";
import HeroButtons from "./HeroButtons";
import HeroRatings from "./HeroRatings";

export default function HeroContent() {
  return (
    <div>

      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
        Fresh Smoothies & Juice Bar
        <br />
        in Vallejo
      </h1>

      <HeroPromotions />

      <HeroButtons />

      <HeroRatings />

    </div>
  );
}