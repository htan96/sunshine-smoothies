"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/features/cart/store";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) =>
    state.getItemCount()
  );
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => setMounted(true), []);
  const hasItems = mounted && itemCount > 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="w-full px-6 md:px-10 py-4 md:py-6 flex items-center justify-center md:justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Sunshine Smoothies"
            width={140}
            height={50}
            priority
            className="object-contain md:w-[170px]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-10 font-medium tracking-wide text-gray-900"
        >
          <Link href="/menu" className="hover:text-[var(--color-orange)] transition">
            Menu
          </Link>

          <Link href="/location" className="hover:text-[var(--color-orange)] transition">
            Locations
          </Link>

          <Link href="/fuel" className="hover:text-[var(--color-orange)] transition">
            Fuel
          </Link>

          <Link href="/about" className="hover:text-[var(--color-orange)] transition">
            About
          </Link>

          <Link href="/community" className="hover:text-[var(--color-orange)] transition">
            Community
          </Link>

          <Link href="/events" className="hover:text-[var(--color-orange)] transition">
            Events
          </Link>

          {/* Custom Hybrid Cart Icon */}
          <button
            onClick={toggleCart}
            className="relative ml-6 transition-transform hover:scale-105"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-8 h-8 transition-all duration-200 ${hasItems ? "stroke-[var(--color-orange)] fill-[var(--color-orange)]" : "stroke-current fill-none"}`}
              strokeWidth="1.8"
            >
              <path
                d="M3 4h2l2.2 10.2a2 2 0 002 1.6h7.8a2 2 0 002-1.5l1.5-6.3a1.5 1.5 0 00-1.5-1.9H7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="19" r="1.5" />
              <circle cx="18" cy="19" r="1.5" />
            </svg>

            {hasItems && (
              <span className="absolute -top-2 -right-2 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md bg-[var(--color-orange)]">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}