import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function EventsPreview() {
  return (
    <Section label="Upcoming" title="Events">
      <div className="bg-[var(--color-orange-light)]/30 border border-[var(--color-orange)]/20 rounded-2xl p-6 md:p-8">
        <Badge className="bg-[var(--color-orange)]/20 text-[var(--color-orange-dark)] mb-3">
          Next Up
        </Badge>
        <h3 className="text-xl md:text-2xl font-semibold text-[var(--color-charcoal)]">
          Free Smoothie Day — April 15, 2026
        </h3>
        <p className="mt-2 text-[var(--color-muted)]">
          Complimentary smoothies for our Vallejo community. No purchase required — just show up and enjoy.
        </p>
        <Button
          href="/events"
          variant="primary"
          className="mt-4"
        >
          Learn More
        </Button>
      </div>
      <Link
        href="/events"
        className="inline-block mt-4 text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium text-sm transition"
      >
        View all events →
      </Link>
    </Section>
  );
}
