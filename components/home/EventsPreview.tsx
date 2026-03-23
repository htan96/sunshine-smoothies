import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

const EVENTS = [
  {
    date: "April 15",
    year: "2026",
    name: "Summer Kick Off",
    tagline: "Free Smoothie Day · Complimentary smoothies for Vallejo",
    featured: true,
  },
  {
    date: "July 7",
    year: "2026",
    name: "7/7 Lucky 7s",
    tagline: "7th day of the 7th month",
    featured: false,
  },
  {
    date: "August",
    year: "2026",
    name: "11 Year Anniversary",
    tagline: "Celebrating a decade-plus of Vallejo love",
    featured: false,
  },
  {
    date: "December",
    year: "2026",
    name: "Christmas Giveaway",
    tagline: "Holiday surprises for our community",
    featured: false,
  },
];

export function EventsPreview() {
  return (
    <Section label="Upcoming" title="Events">
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 no-scrollbar">
        {EVENTS.map((event) => (
          <Link
            key={event.name}
            href="/events"
            className={`group flex-shrink-0 w-[280px] md:w-auto rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
              event.featured
                ? "border-[var(--color-orange)]/40 bg-[var(--color-orange-light)]/30"
                : "border-neutral-200 bg-white hover:border-[var(--color-orange)]/30"
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--color-charcoal)]">
                {event.date}
              </span>
              <span className="text-sm text-[var(--color-muted)]">{event.year}</span>
            </div>
            <h3 className="mt-1 font-semibold text-[var(--color-charcoal)] group-hover:text-[var(--color-orange)] transition-colors">
              {event.name}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
              {event.tagline}
            </p>
            {event.featured && (
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-orange)]">
                Next up →
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button href="/events" variant="primary">
          View All Events
        </Button>
        <Link
          href="/events"
          className="text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium text-sm transition"
        >
          Full event details →
        </Link>
      </div>
    </Section>
  );
}
