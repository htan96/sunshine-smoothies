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
  "Sandwich",
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
    return [...(categories ?? [])].sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.name) -
        CATEGORY_ORDER.indexOf(b.name)
    );
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

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
    <div className="sticky top-[124px] z-30 bg-white">
      <div className="relative border-t border-b border-neutral-200">

        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 h-full w-12 flex items-center justify-center bg-white/90 backdrop-blur z-10 text-neutral-500 hover:text-neutral-900"
        >
          <span className="text-2xl leading-none">‹</span>
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar overflow-x-auto scroll-smooth"
        >
          <div className="flex items-center justify-center gap-10 px-14 py-4 min-w-max">
            {safeCategories.map((cat) => {
              const active = cat.id === activeCategory;

              return (
                <button
                  key={cat.id}
                  data-category={cat.id}
                  type="button"
                  onClick={() => onChange(cat.id)}
                  className={`relative text-base md:text-lg font-medium transition ${
                    active
                      ? "text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {cat.name}

                  {active && (
                    <span className="absolute left-0 -bottom-2 h-[2px] w-full bg-yellow-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 h-full w-12 flex items-center justify-center bg-white/90 backdrop-blur z-10 text-neutral-500 hover:text-neutral-900"
        >
          <span className="text-2xl leading-none">›</span>
        </button>

      </div>
    </div>
  );
}