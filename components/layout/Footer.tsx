"use client"

import Link from "next/link"
import { Utensils, MapPin, Home, Calendar, Zap } from "lucide-react"

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16 text-sm">

        <Link
          href="/"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/menu"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Utensils size={22} />
          <span className="text-xs mt-1">Menu</span>
        </Link>

        <Link
          href="/fuel"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Zap size={22} />
          <span className="text-xs mt-1">Fuel</span>
        </Link>

        <Link
          href="/location"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <MapPin size={22} />
          <span className="text-xs mt-1">Locations</span>
        </Link>

        <Link
          href="/events"
          className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition"
        >
          <Calendar size={22} />
          <span className="text-xs mt-1">Events</span>
        </Link>

      </div>
    </footer>
  )
}