"use client"

import Link from "next/link"
import { Utensils, MapPin, ShoppingBag, Users, Info } from "lucide-react"
import { useCartStore } from "@/features/cart/store"

export default function Footer() {
  const openCart = useCartStore((state) => state.openCart)
  const items = useCartStore((state) => state.items)

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16 text-sm">

        <Link
          href="/menu"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Utensils size={22} />
          <span className="text-xs mt-1">Menu</span>
        </Link>

        <Link
          href="/location"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <MapPin size={22} />
          <span className="text-xs mt-1">Locations</span>
        </Link>

        {/* CART BUTTON */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <ShoppingBag size={22} />

          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}

          <span className="text-xs mt-1 font-semibold">Cart</span>
        </button>

        <Link
          href="/about"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Info size={22} />
          <span className="text-xs mt-1">About</span>
        </Link>

        <Link
          href="/community"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Users size={22} />
          <span className="text-xs mt-1">Community</span>
        </Link>

      </div>
    </footer>
  )
}