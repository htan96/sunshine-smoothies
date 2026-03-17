"use client";

import { useCartStore } from "@/features/cart/store";

/* v3 design token */

export default function CartFloatingButton() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);

  const hasItems = itemCount > 0;

  return (
    <button
      onClick={openCart}
      aria-label={`Cart${hasItems ? ` (${itemCount} items)` : ""}`}
      className="md:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
      className={hasItems ? "bg-[var(--color-orange)] text-black border-2 border-[var(--color-orange)]" : "bg-white text-[var(--color-charcoal)] border-2 border-neutral-100"}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7"
        fill={hasItems ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2.2 10.2a2 2 0 002 1.6h7.8a2 2 0 002-1.5l1.5-6.3a1.5 1.5 0 00-1.5-1.9H7" />
        <circle cx="10" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
      </svg>
      {hasItems && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-[var(--color-charcoal)] text-white text-xs font-bold rounded-full">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
