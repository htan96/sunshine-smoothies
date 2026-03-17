"use client"

import Image from "next/image"
import SocialSection from "@/components/home/SocialSection"
import { useRouter } from "next/navigation"
import { useLocationStore } from "@/features/location/store"

export default function LocationPage() {
  const router = useRouter()
  const { setLocation } = useLocationStore()

  const openMaps = (address: string) => {
    const encoded = encodeURIComponent(address)

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open(`https://maps.apple.com/?q=${encoded}`, "_blank")
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank")
    }
  }

  const handleOrder = (location: {
    id: string
    name: string
    address: string
  }) => {
    setLocation(location)
    router.push("/menu") // ✅ Correct route
  }

  return (
    <main className="bg-white">

      {/* ===== HERO HEADER ===== */}
      <section className="pt-28 pb-16 text-center border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-charcoal)]">
            Visit Sunshine Smoothies
          </h1>
          <div className="h-[3px] w-16 bg-[var(--color-orange)] mx-auto mt-5 rounded-full" />
          <p className="mt-6 text-lg text-[var(--color-muted)]">
            Two locations. Same great energy.
          </p>
        </div>
      </section>

      {/* ===== SOLANO STOREFRONT ===== */}
      <section className="relative w-full min-h-[400px] md:h-[500px] lg:h-[550px]">
        <Image
          src="/locations/solano.png"
          alt="Solano Avenue Storefront"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/60 flex items-center">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-3">
              Storefront
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Solano Avenue Storefront
            </h2>

            <p className="mt-3 text-lg opacity-90">
              2089 Solano Ave, Vallejo, CA
            </p>

            <p className="mt-1 text-white/90">
              Open Daily • 8:00AM – 7:00PM
            </p>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  openMaps("2089 Solano Ave, Vallejo, CA")
                }
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Get Directions
              </button>

              <button
                type="button"
                onClick={() =>
                  handleOrder({
                    id: "L6W05ZHRQZB3H",
                    name: "Solano Ave",
                    address: "2089 Solano Ave, Vallejo",
                  })
                }
                className="bg-[var(--color-orange)] text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="h-8 bg-white" />

      {/* ===== WATERFRONT DRIVE-THRU ===== */}
      <section className="relative w-full min-h-[400px] md:h-[500px] lg:h-[550px]">
        <Image
          src="/locations/waterfront.png"
          alt="Waterfront Drive-Thru"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60 flex items-center">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-orange)]/90 text-black text-sm font-semibold mb-3">
              Drive-Thru Available
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Waterfront Drive-Thru
            </h2>

            <p className="mt-3 text-lg opacity-90">
              821 Wilson Ave, Vallejo, CA
            </p>

            <div className="mt-1 text-white/90 space-y-0.5">
              <p>Mon – Fri: 7:00AM – 7:00PM</p>
              <p>Sat – Sun: 8:00AM – 7:00PM</p>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  openMaps("821 Wilson Ave, Vallejo, CA")
                }
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Get Directions
              </button>

              <button
                type="button"
                onClick={() =>
                  handleOrder({
                    id: "5PHZ3HJ8ZJCQ0",
                    name: "Wilson Ave (Drive-Thru)",
                    address: "821 Wilson Ave, Vallejo",
                  })
                }
                className="bg-[var(--color-orange)] text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="h-20 bg-white" />

      <SocialSection />

    </main>
  )
}