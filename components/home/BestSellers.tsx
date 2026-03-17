import Link from "next/link";
import { Section } from "@/components/ui/Section";
import type { BestSellerItem } from "@/lib/bestSellers";

const labels = [
  "🔥 Customer Favorite",
  "⭐ Top Pick",
  "🥤 Most Loved",
  "🌟 Popular Choice",
  "💛 Local Favorite",
];

export function BestSellers({ items }: { items: BestSellerItem[] }) {

  return (
    <Section label="Customer Favorites" title="Best Sellers">
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/menu?item=${item.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition"
            >
              <div className="aspect-square bg-neutral-200">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-charcoal)]">
                  {item.name}
                </h3>
                <p className="text-sm text-[var(--color-orange)] mt-2 font-medium">
                  {labels[i % labels.length]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--color-muted)] mb-6">
            Check out our menu for fresh smoothies, juices, and more.
          </p>
          <Link
            href="/menu"
            className="inline-block rounded-full bg-[var(--color-orange)] px-8 py-3 font-semibold text-white hover:opacity-90 transition"
          >
            View Our Menu
          </Link>
        </div>
      )}
    </Section>
  );
}
