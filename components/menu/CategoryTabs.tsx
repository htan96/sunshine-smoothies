"use client";

import { useMemo, useRef, useEffect } from "react";
import type { MenuCategory } from "@/features/menu/types";

type Props = {
  categories: MenuCategory[];
  activeCategory: string | null;
  onChange: (categoryId: string) => void;
};

const CATEGORY_ORDER = [
  "Smoothies",
  "Juice",
  "Acai Bowls",
  "Coffee",
  "Shots",
  "XSB Seamoss",
  "Bagel",
  "Sandwich ",
  "Wrap",
  "Salad",
  "Fruit & Snacks",
  "Prepaid Packs",
  "Pack Redemptions",
];

export default function CategoryTabs({
  categories,
  activeCategory,
  onChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const safeCategories = useMemo(() => {
    const cats = [...(categories ?? [])];

    return cats.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const indexA = CATEGORY_ORDER.findIndex(
        (c) => c.toLowerCase() === nameA
      );
      const indexB = CATEGORY_ORDER.findIndex(
        (c) => c.toLowerCase() === nameB
      );

      if (indexA === -1 && indexB === -1) {
        return nameA.localeCompare(nameB);
      }

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }, [categories]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !activeCategory) return;

    const activeButton = el.querySelector(
      `[data-category="${activeCategory}"]`
    ) as HTMLElement | null;

    if (!activeButton) return;

    const containerWidth = el.offsetWidth;
    const buttonLeft = activeButton.offsetLeft;
    const buttonWidth = activeButton.offsetWidth;

    el.scrollTo({
      left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
      behavior: "smooth",
    });
  }, [activeCategory]);

  return (
    <div className="relative -mx-6 md:mx-0 px-6 md:px-0 overflow-hidden md:overflow-visible">
      <div
        ref={scrollRef}
        className="no-scrollbar overflow-x-auto overflow-y-visible scroll-smooth flex gap-2 min-w-0 md:min-w-0"
      >
        {safeCategories.map((cat) => {
          const active = cat.id === activeCategory;

          return (
            <button
              key={cat.id}
              data-category={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-[var(--color-orange)] text-white"
                  : "bg-white text-[var(--color-charcoal)] border border-neutral-100 hover:border-[var(--color-orange)]/30 hover:bg-[var(--color-orange-light)]/50"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}