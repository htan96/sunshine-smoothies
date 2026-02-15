"use client"

import Image from "next/image"
import SocialSection from "@/components/home/SocialSection"

export default function LocationPage() {

  const openMaps = (address: string) => {
    const encoded = encodeURIComponent(address)

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open(`https://maps.apple.com/?q=${encoded}`, "_blank")
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank")
    }
  }

  return (
    <main className="bg-white">

      {/* ===== HERO HEADER ===== */}
      <section className="pt-28 pb-16 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Visit Sunshine Smoothies
          </h1>
          <div className="h-[3px] w-16 bg-yellow-400 mx-auto mt-5 rounded-full" />
          <p className="mt-6 text-lg text-gray-600">
            Two locations. Same great energy.
          </p>
        </div>
      </section>

      {/* ===== SOLANO STOREFRONT ===== */}
      <section className="relative w-full h-[550px]">
        <Image
          src="/solano.png"
          alt="Solano Avenue Storefront"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/60 flex items-center">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <h2 className="text-4xl font-bold">
              Solano Avenue Storefront
            </h2>

            <p className="mt-3 text-lg">
              2089 Solano Ave, Vallejo, CA
            </p>

            <p className="text-lg">Open Daily</p>
            <p className="text-lg">Monday - Friday 9AM – 5PM</p>
            <p className="text-lg">Saturday - Sunday 9AM - 7PM</p>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                onClick={() =>
                  openMaps("2089 Solano Ave, Vallejo, CA")
                }
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Get Directions
              </button>

              <a
                href="/order"
                className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPACING ===== */}
      <div className="h-8 bg-white" />

      {/* ===== WATERFRONT ===== */}
      <section className="relative w-full h-[550px]">
        <Image
          src="/waterfront.png"
          alt="Waterfront Drive-Thru"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60 flex items-center">
          <div className="max-w-6xl mx-auto px-6 text-white">
            <h2 className="text-4xl font-bold">
              Waterfront Drive-Thru
            </h2>

            <p className="mt-3 text-lg">
              821 Wilson Ave, Vallejo, CA
            </p>

            <p className="text-lg">Open Daily</p>
            <p className="text-lg">Monday - Friday 7AM – 5PM</p>
            <p className="text-lg">Saturday - Sunday 8AM - 5PM</p>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                onClick={() =>
                  openMaps("821 Wilson Ave, Vallejo, CA")
                }
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Get Directions
              </button>

              <a
                href="/order"
                className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPACING BEFORE FOOTER ===== */}
      <div className="h-20 bg-white" />

      {/* ===== SOCIAL SECTION ===== */}
      <SocialSection />

    </main>
  )
}
