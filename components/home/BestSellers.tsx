"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";

type Item = {
  id: string;
  name: string;
  image?: string;
};

const labels = [
  "🔥 Customer Favorite",
  "⭐ Top Pick",
  "🥤 Most Loved",
  "🌟 Popular Choice",
  "💛 Local Favorite",
];

export function BestSellers() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/top-sellers");
      const data = await res.json();
      if (data?.items) setItems(data.items);
    }
    load();
  }, []);

  if (!items.length) return null;

  return (
    <Section label="Customer Favorites" title="Best Sellers">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/menu?item=${item.id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition"
          >
            <div className="aspect-square bg-neutral-200">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}
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
    </Section>
  );
}
