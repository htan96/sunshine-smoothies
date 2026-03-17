"use client";

import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useCartStore, type CartItem } from "@/features/cart/store";
import ModifierSection from "./ModifierSection";
import ConsolidatedFruitVegSection from "./ConsolidatedFruitVegSection";
import FuelPackDrinksSection from "./FuelPackDrinksSection";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";

import type {
  MenuItem,
  MenuVariation,
  MenuModifierList,
} from "@/features/menu/types";

type Props = {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  /** When provided, modal opens in edit mode: pre-fills from cart item, saves via replaceItem */
  existingCartItem?: CartItem | null;
  /** All menu items - used to match fuel pack drink modifiers to items for names & photos */
  allMenuItems?: MenuItem[];
};

const DUMMY_VARIATION: MenuVariation = {
  id: "",
  name: "",
  price: 0,
  isSoldOut: false,
};

function isFuelPackDrinksList(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("fuel pack") && n.includes("drink");
}

export default function MenuItemModal({ item, isOpen, onClose, existingCartItem, allMenuItems = [] }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const replaceItem = useCartStore((state) => state.replaceItem);
  const openCart = useCartStore((state) => state.openCart);

  const isEditMode = Boolean(existingCartItem);

  const [isDesktop, setIsDesktop] = useState(false);

  const defaultVariation = item
    ? item.variations.find((v) => v.name.toLowerCase() === "medium") ||
      item.variations[0]
    : DUMMY_VARIATION;

  const [selectedVariation, setSelectedVariation] =
    useState<MenuVariation>(defaultVariation);

  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string[]>
  >({});

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isOpen && item) {
      if (existingCartItem) {
        const variation =
          item.variations.find((v) => v.id === existingCartItem.variationId) ||
          item.variations.find((v) => v.name.toLowerCase() === "medium") ||
          item.variations[0];
        setSelectedVariation(variation ?? DUMMY_VARIATION);
        const mods: Record<string, string[]> = {};
        for (const m of existingCartItem.modifiers) {
          const arr = mods[m.modifierListId] ?? [];
          const count = m.quantity ?? 1;
          for (let i = 0; i < count; i++) arr.push(m.modifierId);
          mods[m.modifierListId] = arr;
        }
        setSelectedModifiers(mods);
        setQuantity(existingCartItem.quantity);
      } else {
        const def =
          item.variations.find((v) => v.name.toLowerCase() === "medium") ||
          item.variations[0];
        setSelectedVariation(def);
        setSelectedModifiers({});
        setQuantity(1);
      }
    }
  }, [isOpen, item?.id, existingCartItem?.id]);

  if (!item) return null;

  function toggleModifier(list: MenuModifierList, modifierId: string) {
    setSelectedModifiers((prev) => {
      const current = prev[list.id] || [];
      const exists = current.includes(modifierId);

      if (exists) {
        return { ...prev, [list.id]: current.filter((id) => id !== modifierId) };
      }
      if (list.max === 1) {
        return { ...prev, [list.id]: [modifierId] };
      }
      if (list.max > 0 && current.length >= list.max) return prev;
      return { ...prev, [list.id]: [...current, modifierId] };
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
    if (!item) return;

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

    const newItem = {
      itemId: item.id,
      itemName: item.name,
      image: item.image ?? undefined,
      variationId: selectedVariation.id,
      variationName: selectedVariation.name,
      basePrice: selectedVariation.price,
      modifiers: formattedModifiers,
      quantity,
    };

    if (isEditMode && existingCartItem) {
      replaceItem(existingCartItem.id, newItem);
    } else {
      addItem({
        id: nanoid(),
        ...newItem,
      });
    }

    onClose();
    if (!isEditMode) openCart();
  }

  const isFruitVeg = (name: string) => {
    const n = name.toLowerCase();
    return (
      (n.includes("fruit") || n.includes("vegetable")) &&
      (n.includes("add") || n.includes("extra"))
    );
  };
  const fuelPackDrinksList = item.modifiers.find((l) => isFuelPackDrinksList(l.name));
  const fruitVegLists = item.modifiers.filter((l) => isFruitVeg(l.name));
  const otherLists = item.modifiers.filter((l) => !isFruitVeg(l.name) && !isFuelPackDrinksList(l.name));

  const content = (
    <div className="flex flex-col max-h-[85vh] md:max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100 shrink-0">
        <h2 className="text-lg font-semibold text-[var(--color-charcoal)] truncate pr-2">
          {item.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {item.image && (
          <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {item.description && (
          <p className="text-sm text-[var(--color-muted)]">{item.description}</p>
        )}

        {/* Size - only show when more than one option */}
        {item.variations.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Size</h3>
            <div className="space-y-2">
              {item.variations.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariation(v)}
                  className={`w-full px-4 py-3 rounded-xl flex justify-between items-center text-left transition ${
                    selectedVariation.id === v.id
                      ? "bg-[var(--color-orange)] text-black"
                      : "bg-neutral-100 hover:bg-neutral-200"
                  }`}
                >
                  <span>{v.name}</span>
                  <span>${(v.price / 100).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modifiers */}
        {fuelPackDrinksList && allMenuItems.length > 0 && (
          <FuelPackDrinksSection
            list={fuelPackDrinksList}
            selectedModifiers={selectedModifiers}
            toggleModifier={toggleModifier}
            allMenuItems={allMenuItems}
          />
        )}
        {fuelPackDrinksList && allMenuItems.length === 0 && (
          <ModifierSection
            key={`${fuelPackDrinksList.id}-${selectedVariation.name}`}
            list={fuelPackDrinksList}
            selectedModifiers={selectedModifiers}
            toggleModifier={toggleModifier}
            selectedVariationName={selectedVariation.name}
            itemDescription={item.description}
          />
        )}
        {fruitVegLists.length > 0 && (
          <ConsolidatedFruitVegSection
            itemModifiers={fruitVegLists}
            itemDescription={item.description}
            selectedModifiers={selectedModifiers}
            toggleModifier={toggleModifier}
          />
        )}
        {otherLists.map((list) => (
          <ModifierSection
            key={`${list.id}-${selectedVariation.name}`}
            list={list}
            selectedModifiers={selectedModifiers}
            toggleModifier={toggleModifier}
            selectedVariationName={selectedVariation.name}
            itemDescription={item.description}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-100 bg-white shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-medium hover:bg-neutral-300"
          >
            −
          </button>
          <span className="font-semibold w-8 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-medium hover:bg-neutral-300"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 py-3 px-6 rounded-full bg-[var(--color-orange)] text-black font-semibold hover:opacity-90 transition"
        >
          {isEditMode ? "Save changes" : "Add to Order"} — ${(totalPrice / 100).toFixed(2)}
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
        {content}
      </Modal>
    );
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto">
      {content}
    </Drawer>
  );
}
