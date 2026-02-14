"use client";

import { useState, useEffect } from "react";

const images = [
  "/community1.jpeg",
  "/community2.jpeg",
  "/community3.jpeg",
  "/community4.jpeg",
  "/community5.jpeg",
];

export default function CommunitySlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full bg-white">
      <div className="relative w-full h-[500px] overflow-hidden">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt="Community"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-3 py-6">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              index === current ? "bg-yellow-400" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
