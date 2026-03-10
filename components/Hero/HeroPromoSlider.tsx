"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    badge: "Fuel Packs",
    headline: "Buy 5 Smoothies",
    highlight: "Get 8 Total",
    description:
      "Prepaid fuel packs save you money on your favorite smoothies.",
    primary: {
      label: "Shop Fuel Packs",
      href: "/menu?category=prepaid-packs",
    },
    secondary: {
      label: "View Locations",
      href: "/location",
    },
  },
  {
    badge: "Monday Deal",
    headline: "$2.50 Off",
    highlight: "Jumbo Smoothies",
    description:
      "Start your week fresh with $2.50 off any jumbo smoothie every Monday.",
    primary: {
      label: "Explore Menu",
      href: "/menu?category=smoothies",
    },
    secondary: {
      label: "Visit Us",
      href: "/location",
    },
  },
  {
    badge: "Order Online",
    headline: "Skip The Line",
    highlight: "Order Ahead",
    description:
      "Place your order online for quick pickup at our Vallejo locations.",
    primary: {
      label: "Order Online",
      href: "/menu",
    },
    secondary: {
      label: "View Locations",
      href: "/location",
    },
  },
];

export default function HeroPromoSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [paused]);

  const slide = slides[current];

  return (
    <div
      className="relative text-white w-full max-w-3xl mx-auto px-4 transition-all duration-500"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glass panel */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-8 md:px-8 md:py-10 shadow-xl">

        {/* Promo badge */}
        <div className="inline-block mb-4 rounded-full bg-yellow-400 text-black px-4 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase">
          {slide.badge}
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {slide.headline}{" "}
          <span className="text-yellow-400 block sm:inline">
            {slide.highlight}
          </span>
        </h1>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 max-w-xl">
          {slide.description}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-5">

          <a
            href={slide.primary.href}
            className="rounded-full bg-yellow-400 px-6 py-3 text-sm sm:text-base font-semibold text-black hover:bg-yellow-500 transition text-center"
          >
            {slide.primary.label}
          </a>

          <a
            href={slide.secondary.href}
            className="rounded-full border border-white px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-white hover:text-black transition text-center"
          >
            {slide.secondary.label}
          </a>

        </div>

        {/* Social proof */}
        <div className="mt-5 text-xs sm:text-sm text-gray-300 flex justify-center gap-3 flex-wrap">
          <span>⭐ 4.6 Google Rating</span>
          <span className="hidden sm:inline">•</span>
          <span>Vallejo Local Favorite</span>
        </div>

      </div>

      {/* Navigation dots */}
      <div className="mt-6 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full transition-all ${
              i === current
                ? "bg-yellow-400 scale-110"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}