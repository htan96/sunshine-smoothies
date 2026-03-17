"use client";

import Image from "next/image";

const images = [
  { src: "/community/community1.png", alt: "Community at Sunshine Smoothies" },
  { src: "/community/community2.jpeg", alt: "Sunshine Smoothies community moment" },
  { src: "/community/community3.jpeg", alt: "Sunshine Smoothies community event" },
  { src: "/community/community4.jpeg", alt: "Local community together" },
  { src: "/community/community5.jpeg", alt: "Sunshine Smoothies in the community" },
  { src: "/community/community6.png", alt: "Community celebration" },
];

export default function CommunitySlider() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
