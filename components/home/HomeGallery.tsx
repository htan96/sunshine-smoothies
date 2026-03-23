"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const ALL_IMAGES = [
  { src: "/community/community1.png", alt: "Community at Sunshine Smoothies" },
  { src: "/community/community2.jpeg", alt: "Sunshine Smoothies community moment" },
  { src: "/community/community3.jpeg", alt: "Sunshine Smoothies community event" },
  { src: "/community/community4.jpeg", alt: "Local community together" },
  { src: "/community/community5.jpeg", alt: "Sunshine Smoothies in the community" },
  { src: "/community/community6.png", alt: "Community celebration" },
  { src: "/community/community7.JPG", alt: "Sunshine Smoothies community gathering" },
  { src: "/community/community8.JPG", alt: "Community celebrating together" },
];

const ROTATE_INTERVAL_MS = 15000; // 15 seconds

function shuffleAndTake<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export function HomeGallery() {
  const [displayedImages, setDisplayedImages] = useState(() =>
    shuffleAndTake(ALL_IMAGES, 6)
  );
  const [rotationKey, setRotationKey] = useState(0);

  const rotate = useCallback(() => {
    setDisplayedImages(shuffleAndTake(ALL_IMAGES, 6));
    setRotationKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const id = setInterval(rotate, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [rotate]);

  return (
    <section className="py-14 md:py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-muted)] mb-1">
            Community
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-[var(--color-charcoal)]">
            Life at Sunshine Smoothies
          </h2>
        </div>

        <div
          key={rotationKey}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 animate-fade-in"
        >
          {displayedImages.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 group-hover:brightness-105 transition-all duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        <Link
          href="/community"
          className="inline-block mt-8 text-[var(--color-orange)] font-medium hover:text-[var(--color-orange-dark)] transition"
        >
          See more on our Community page →
        </Link>
      </div>
    </section>
  );
}
