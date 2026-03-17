import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function LocationsSection() {
  return (
    <Section label="Visit Us" title="Locations">
      <p className="text-[var(--color-muted)] text-sm mb-4">
        Order ahead at our Solano Avenue storefront or Waterfront drive-thru in
        Vallejo.
      </p>
      <div className="flex gap-4 flex-wrap">
        <Button href="/location" variant="primary">
          Order Here
        </Button>
        <Button href="/location" variant="outline">
          Directions
        </Button>
      </div>
    </Section>
  );
}
