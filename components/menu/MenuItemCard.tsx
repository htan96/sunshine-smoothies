"use client";

import Link from "next/link";
import type { MenuItem } from "@/features/menu/types";

type Props = {
  item: MenuItem;
};

export default function MenuItemCard({ item }: Props) {
  return (
    <Link
      href={`/menu/${item.id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
    >
      {/* IMAGE */}
      <div className="aspect-square bg-neutral-100 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-neutral-400 text-sm">
            Coming Soon
          </span>
        )}
      </div>

      {/* NAME */}
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg">
          {item.name.replace(/-/g, " ")}
        </h3>
      </div>
    </Link>
  );
}