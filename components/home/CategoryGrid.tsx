"use client";

import Link from "next/link";
import { Section } from "@/components/ui/Section";

const CATEGORIES = [
  { name: "Smoothies", href: "/menu?category=smoothies", emoji: "🥤" },
  { name: "Fuel Packs", href: "/menu?category=prepaid-packs", emoji: "⛽" },
  { name: "Juice", href: "/menu?category=juice", emoji: "🍊" },
  { name: "Acai Bowls", href: "/menu?category=acai-bowls", emoji: "🥣" },
  { name: "Coffee", href: "/menu?category=coffee", emoji: "☕" },
];

export function CategoryGrid() {
  return (
    <Section label="Quick Order" title="What are you craving?">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-neutral-200 hover:border-[var(--color-orange)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition text-center"
          >
            <span className="text-3xl mb-2">{cat.emoji}</span>
            <span className="font-medium text-[var(--color-charcoal)]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
