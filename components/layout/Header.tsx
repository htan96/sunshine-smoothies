"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/features/cart/store";

const ORANGE = "#FF7A00";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const itemCount = useCartStore((state) =>
    state.getItemCount()
  );
  const toggleCart = useCartStore((state) => state.toggleCart);

  const hasItems = itemCount > 0;

  return (
    <header
      className={`w-full z-50 ${
        isHome
          ? "absolute top-0 left-0"
          : "sticky top-0 bg-white shadow-sm"
      }`}
    >
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
          className={`hidden md:flex items-center gap-10 font-medium tracking-wide ${
            isHome ? "text-white" : "text-gray-900"
          }`}
        >
          <Link href="/menu" className="hover:text-orange-500 transition">
            Menu
          </Link>

          <Link href="/about" className="hover:text-orange-500 transition">
            About
          </Link>

          <Link href="/community" className="hover:text-orange-500 transition">
            Community
          </Link>

          <Link href="/events" className="hover:text-orange-500 transition">
            Events
          </Link>

          <Link href="/location" className="hover:text-orange-500 transition">
            Location
          </Link>

          {/* Custom Hybrid Cart Icon */}
          <button
            onClick={toggleCart}
            className="relative ml-6 transition-transform hover:scale-105"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 transition-all duration-200"
              style={{
                stroke: hasItems ? ORANGE : "currentColor",
                fill: hasItems ? ORANGE : "none",
              }}
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
              <span
                className="absolute -top-2 -right-2 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                style={{ backgroundColor: ORANGE }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}