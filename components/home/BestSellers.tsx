"use client";

import { useRef, useState, useEffect } from "react";
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

const CARD_WIDTH = 160;
const GAP = 16;

export function BestSellers({ items }: { items: BestSellerItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = (CARD_WIDTH + GAP) * 2;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <Section label="Customer Favorites" title="Best Sellers" className="py-10 md:py-12">
      {items.length > 0 ? (
        <div className="relative">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition ${
                canScrollLeft
                  ? "border-neutral-200 bg-white hover:bg-neutral-50 text-[var(--color-charcoal)]"
                  : "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-default"
              }`}
            >
              ←
            </button>

            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="flex-1 overflow-x-auto flex gap-4 pb-2 no-scrollbar scroll-smooth"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/menu?item=${item.id}`}
                  className="shrink-0 w-[140px] sm:w-[160px] bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition flex flex-col"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="aspect-square bg-neutral-200 w-full">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-semibold text-[var(--color-charcoal)] line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[var(--color-orange)] mt-1 font-medium">
                      {labels[i % labels.length]}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              disabled={!canScrollRight}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition ${
                canScrollRight
                  ? "border-neutral-200 bg-white hover:bg-neutral-50 text-[var(--color-charcoal)]"
                  : "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-default"
              }`}
            >
              →
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[var(--color-muted)] mb-4 text-sm">
            Check out our menu for fresh smoothies, juices, and more.
          </p>
          <Link
            href="/menu"
            className="inline-block rounded-full bg-[var(--color-orange)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            View Our Menu
          </Link>
        </div>
      )}
    </Section>
  );
}
