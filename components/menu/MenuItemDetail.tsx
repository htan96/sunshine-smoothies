"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useCartStore } from "@/features/cart/store";
import type {
  MenuItem,
  MenuVariation,
  MenuModifierList,
} from "@/features/menu/types";

type Props = {
  item: MenuItem;
};

export default function MenuItemDetail({ item }: Props) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const defaultVariation =
    item.variations.find(
      (v) => v.name.toLowerCase() === "medium"
    ) || item.variations[0];

  const [selectedVariation, setSelectedVariation] =
    useState<MenuVariation>(defaultVariation);

  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string[]>
  >({});

  const [quantity, setQuantity] = useState(1);

  function toggleModifier(list: MenuModifierList, modifierId: string) {
    setSelectedModifiers((prev) => {
      const current = prev[list.id] || [];
      const exists = current.includes(modifierId);

      if (exists) {
        return {
          ...prev,
          [list.id]: current.filter((id) => id !== modifierId),
        };
      }

      if (list.max === 1) {
        return {
          ...prev,
          [list.id]: [modifierId],
        };
      }

      if (list.max > 0 && current.length >= list.max) return prev;

      return {
        ...prev,
        [list.id]: [...current, modifierId],
      };
    });
  }

  const basePrice = selectedVariation.price;

  const modifierTotal = Object.entries(selectedModifiers).reduce(
    (total, [listId, modifierIds]) => {
      const list = item.modifiers.find((l) => l.id === listId);
      if (!list) return total;

      return (
        total +
        modifierIds.reduce((sum, modId) => {
          const mod = list.modifiers.find((m) => m.id === modId);
          return sum + (mod?.price || 0);
        }, 0)
      );
    },
    0
  );

  const totalPrice = (basePrice + modifierTotal) * quantity;

  function handleAddToCart() {
    const formattedModifiers = Object.entries(selectedModifiers).flatMap(
      ([listId, modifierIds]) => {
        const list = item.modifiers.find((l) => l.id === listId);
        if (!list) return [];

        return modifierIds.flatMap((modId) => {
          const mod = list.modifiers.find((m) => m.id === modId);
          if (!mod) return [];

          return [
            {
              modifierListId: list.id,
              modifierId: mod.id,
              name: mod.name,
              price: mod.price,
              quantity: 1,
            },
          ];
        });
      }
    );

    addItem({
      id: nanoid(),
      itemId: item.id,
      itemName: item.name,
      image: item.image ?? undefined, // FIXED null issue
      variationId: selectedVariation.id,
      variationName: selectedVariation.name,
      basePrice: selectedVariation.price,
      modifiers: formattedModifiers,
      quantity,
    });
  }

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 pb-44 md:pb-28 w-full">

        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/menu");
            }
          }}
          className="mb-6 text-sm text-neutral-500 hover:text-black transition"
        >
          ← Back to Menu
        </button>

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* LEFT SIDE */}
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

          {/* RIGHT SIDE */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-10">

            {/* SIZE */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Size Options
              </h2>

              <div className="space-y-3">
                {item.variations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation)}
                    className={`w-full px-5 py-4 rounded-xl transition flex justify-between items-center ${
                      selectedVariation.id === variation.id
                        ? "bg-black text-white"
                        : "bg-neutral-100 hover:bg-neutral-200"
                    }`}
                  >
                    <span>{variation.name}</span>
                    <span>
                      ${(variation.price / 100).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* MODIFIERS */}
            {item.modifiers.map((list) => (
              <div key={list.id}>
                <h2 className="text-lg font-semibold mb-4">
                  {list.name}
                </h2>

                <div className="space-y-3">
                  {list.modifiers.map((modifier) => {
                    const selected =
                      selectedModifiers[list.id]?.includes(modifier.id);

                    return (
                      <button
                        key={modifier.id}
                        onClick={() =>
                          toggleModifier(list, modifier.id)
                        }
                        className={`w-full px-5 py-4 rounded-xl transition flex justify-between items-center ${
                          selected
                            ? "bg-black text-white"
                            : "bg-neutral-100 hover:bg-neutral-200"
                        }`}
                      >
                        <span>{modifier.name}</span>
                        {modifier.price > 0 && (
                          <span>
                            +$
                            {(modifier.price / 100).toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FIXED CTA */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2 bg-neutral-200 rounded-lg"
            >
              −
            </button>

            <span className="text-lg font-semibold">{quantity}</span>

            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-4 py-2 bg-neutral-200 rounded-lg"
            >
              +
            </button>
          </div>

          <div className="text-lg font-semibold">
            Total: ${(totalPrice / 100).toFixed(2)}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition"
          >
            Add to Order
          </button>

        </div>
      </div>
    </div>
  );
}