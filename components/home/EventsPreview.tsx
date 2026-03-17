import Link from "next/link";
import { Section } from "@/components/ui/Section";

export function EventsPreview() {
  return (
    <Section label="Upcoming" title="Events">
      <p className="text-[var(--color-muted)] text-sm mb-4">
        Join us for Free Smoothie Day and other community celebrations.
      </p>
      <Link
        href="/events"
        className="text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium inline-block"
      >
        View all events →
      </Link>
    </Section>
  );
}
