"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  image?: string;
};

const labels = [
  "🔥 Customer Favorite",
  "⭐ Top Pick",
  "🥤 Most Loved",
  "🌟 Popular Choice",
  "💛 Local Favorite",
];

export default function TopSellers() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/top-sellers");
      const data = await res.json();

      if (data?.items) {
        setItems(data.items);
      }
    }

    load();
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-24 bg-neutral-100">

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-16">
          Customer Favorites
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {items.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
            >

              <div className="aspect-square bg-neutral-200">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="p-6 text-center">

                <h3 className="text-lg font-semibold">
                  {item.name}
                </h3>

                <p className="text-sm text-yellow-500 mt-2 font-medium">
                  {labels[i % labels.length]}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}