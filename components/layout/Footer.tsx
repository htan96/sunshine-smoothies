"use client"

import Link from "next/link"
import { Home, Menu, MapPin, ShoppingBag, Users } from "lucide-react"

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16 text-sm">


        <Link href="/menu" className="flex flex-col items-center text-gray-700 hover:text-yellow-500">
          <Menu size={22} />
          <span className="text-xs mt-1">Menu</span>
        </Link>
        <Link href="/location" className="flex flex-col items-center text-gray-700 hover:text-yellow-500">
          <MapPin size={22} />
          <span className="text-xs mt-1">Find Us</span>
        </Link>

             <Link href="/order" className="flex flex-col items-center text-gray-700 hover:text-yellow-500">
          <ShoppingBag size={22} />
          <span className="text-xs mt-1">Order</span>
        </Link>


        <Link href="/about" className="flex flex-col items-center text-gray-700 hover:text-yellow-500">
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link href="/community" className="flex flex-col items-center text-gray-700 hover:text-yellow-500">
          <Users size={22} />
          <span className="text-xs mt-1">Community</span>
        </Link>

      </div>
    </footer>
  )
}
