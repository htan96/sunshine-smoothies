import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FuelPackBanner() {
  return (
    <section className="bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-orange-dark)] py-14 md:py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto text-white text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-white/90 mb-2">
          Featured Deal
        </p>
        <h2 className="text-2xl md:text-3xl font-heading font-semibold">Smoothie Fuel Packs</h2>
        <p className="mt-4 max-w-lg mx-auto text-white/95">
          Stock up and save. Buy 7 smoothies and get 3 free.
        </p>
        <p className="mt-2 font-semibold">Buy 7 → Get 10 Total</p>
        <Button
          href="/fuel"
          variant="white"
          className="mt-6"
        >
          Learn More
        </Button>
      </div>
    </section>
  );
}
