import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/**
 * Event hero – featured event plus year lineup.
 * Update dates/events as needed. Remove when no featured event.
 */
const YEAR_LINEUP = [
  { label: "7/7", month: "July", sub: "Lucky 7s" },
  { label: "11 years", month: "August", sub: "Anniversary" },
  { label: "Giveaway", month: "December", sub: "Christmas" },
];

export function EventHeroBanner() {
  return (
    <section className="bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-orange-dark)] py-12 md:py-16 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
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

        {/* Year lineup teaser */}
        <div className="mt-10 pt-8 border-t border-white/20">
          <p className="text-center text-white/70 text-sm font-medium uppercase tracking-wider mb-4">
            More coming this year
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {YEAR_LINEUP.map((item) => (
              <div
                key={item.month}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/95 text-sm font-medium"
              >
                <span className="font-semibold">{item.month}</span>
                <span className="text-white/80">—</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
