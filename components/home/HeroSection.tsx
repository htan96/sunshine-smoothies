import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <section className="relative py-14 md:py-20 px-6 md:px-12 overflow-hidden bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <Badge className="bg-[var(--color-orange-light)] text-[var(--color-orange-dark)] mb-4">
            Drive-Thru Available
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-[var(--color-charcoal)] tracking-tight">
            Fresh Smoothies Made Daily
          </h1>
          <p className="text-[var(--color-muted)] mt-4 text-lg max-w-md">
            Real fruit. No syrups. No shortcuts.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button href="/menu" variant="primary">
              Order Now
            </Button>
            <Button href="/menu" variant="outline">
              View Menu
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
