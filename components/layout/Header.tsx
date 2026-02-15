"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`w-full z-50 ${
        isHome
          ? "absolute top-0 left-0"
          : "relative bg-white shadow-sm"
      }`}
    >
      <div className="w-full px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">

        {/* Mobile Centered Logo */}
        <div className="flex-1 flex justify-center md:hidden">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Sunshine Smoothies"
              width={140}
              height={50}
              priority
              className="object-contain"
            />
          </Link>
        </div>

        {/* Desktop Logo (left) */}
        <Link href="/" className="hidden md:flex items-center">
          <Image
            src="/logo.png"
            alt="Sunshine Smoothies"
            width={170}
            height={60}
            priority
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className={`hidden md:flex items-center gap-10 font-medium tracking-wide ${
            isHome ? "text-white" : "text-gray-900"
          }`}
        >
          <Link href="/menu" className="hover:text-yellow-500 transition">
            Menu
          </Link>
          <Link href="/about" className="hover:text-yellow-500 transition">
            About
          </Link>
          <Link href="/community" className="hover:text-yellow-500 transition">
            Community
          </Link>
          <Link href="/location" className="hover:text-yellow-500 transition">
            Location
          </Link>

          <Link
            href="/order"
            className="ml-6 rounded-full bg-yellow-400 px-6 py-2 font-semibold text-black hover:bg-yellow-500 transition"
          >
            Order Online
          </Link>
        </nav>

      </div>
    </header>
  );
}
