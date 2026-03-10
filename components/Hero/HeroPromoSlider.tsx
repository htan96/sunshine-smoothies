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
      className="relative text-white max-w-3xl mx-auto transition-all duration-500"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glass panel */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-10 shadow-xl">

        {/* Promo badge */}
        <div className="inline-block mb-5 rounded-full bg-yellow-400 text-black px-4 py-1 text-xs font-bold tracking-widest uppercase">
          {slide.badge}
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          {slide.headline}{" "}
          <span className="text-yellow-400">{slide.highlight}</span>
        </h1>

        {/* Description */}
        <p className="mt-5 text-lg text-gray-200 max-w-xl mx-auto">
          {slide.description}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-5 flex-wrap">

          <a
            href={slide.primary.href}
            className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black hover:bg-yellow-500 transition"
          >
            {slide.primary.label}
          </a>

          <a
            href={slide.secondary.href}
            className="rounded-full border border-white px-8 py-3 font-semibold text-white hover:bg-white hover:text-black transition"
          >
            {slide.secondary.label}
          </a>

        </div>

        {/* Social proof */}
        <div className="mt-6 text-sm text-gray-300 flex justify-center gap-4">
          <span>⭐ 4.8 Google Rating</span>
          <span>•</span>
          <span>Vallejo Local Favorite</span>
        </div>

      </div>

      {/* Navigation dots */}
      <div className="mt-8 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-3 w-3 rounded-full transition-all ${
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