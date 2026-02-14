"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  const navLinks = [
    { name: "Menu", href: "/menu" },
    { name: "Location", href: "/location" },
    { name: "Community", href: "/community" },
    { name: "About", href: "/about" },
  ]

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between h-20">

          {/* Desktop Logo (left) */}
          <Link href="/" className="hidden md:block">
            <img
              src="/logo.png"
              alt="Sunshine Smoothies"
              className="h-10 w-auto"
            />
          </Link>

          {/* Mobile Centered Logo */}
          <div className="flex-1 flex justify-center md:hidden">
            <Link href="/">
              <img
                src="/logo.png"
                alt="Sunshine Smoothies"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-yellow-500"
                    : "text-gray-700 hover:text-yellow-500"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Order Button */}
            <Link
              href="/order"
              className="ml-4 bg-yellow-400 px-5 py-2 rounded-full text-sm font-semibold text-black hover:bg-yellow-500 transition"
            >
              Order Online
            </Link>
          </nav>

        </div>
      </div>
    </header>
  )
}
