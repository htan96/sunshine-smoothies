"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Menu as MenuIcon, MapPin, ShoppingBag, Users } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()

  const navItems = [
    { name: "Menu", href: "/menu", icon: MenuIcon },
    { name: "Location", href: "/location", icon: MapPin },
    { name: "Order", href: "/order", icon: ShoppingBag },
    { name: "Community", href: "/community", icon: Users },
    { name: "About", href: "/about", icon: Home },
  ]

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          const isOrder = item.name === "Order"

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center text-xs"
            >
              <div
                className={`
                  flex items-center justify-center
                  ${isOrder ? "bg-yellow-400 text-black w-12 h-12 rounded-full -mt-6 shadow-md" : ""}
                  ${!isOrder && isActive ? "text-yellow-500" : "text-gray-600"}
                `}
              >
                <Icon size={isOrder ? 22 : 20} />
              </div>

              {!isOrder && (
                <span className={`${isActive ? "text-yellow-500 font-medium" : "text-gray-500"}`}>
                  {item.name}
                </span>
              )}

              {isOrder && (
                <span className="text-gray-700 font-medium mt-1">
                  Order
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
