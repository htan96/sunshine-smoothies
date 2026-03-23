import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/**
 * Temporary hero for featured event (e.g. Summer Kick Off).
 * Remove this component from the homepage when the event has passed.
 */
export function EventHeroBanner() {
  return (
    <section className="bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-orange-dark)] py-12 md:py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto text-center">
        <Badge className="bg-white/20 text-white border-0 mb-4">
          Featured Event
        </Badge>
        <h2 className="text-3xl md:text-4xl font-heading font-semibold text-white tracking-tight">
          Summer Kick Off
        </h2>
        <p className="mt-2 text-xl md:text-2xl font-semibold text-white/95">
          April 15, 2026
        </p>
        <p className="mt-4 max-w-lg mx-auto text-white/90">
          Join us for Free Smoothie Day — complimentary smoothies for our Vallejo community. No strings attached.
        </p>
        <Button
          href="/events"
          variant="white"
          className="mt-6"
        >
          Learn More
        </Button>
      </div>
    </section>
  );
}
