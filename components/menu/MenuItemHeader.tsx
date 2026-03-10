"use client";

import type { MenuItem } from "@/features/menu/types";

type Props = {
  item: MenuItem;
};

export default function MenuItemHeader({ item }: Props) {
  return (
    <div className="space-y-6">
      {item.image && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <img
            src={item.image}
            alt={item.name}
            className="w-full object-contain"
          />
        </div>
      )}

      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {item.name}
        </h1>

        {item.description && (
          <p className="mt-4 text-neutral-600 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}