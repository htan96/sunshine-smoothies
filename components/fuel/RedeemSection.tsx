"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { useCartStore } from "@/features/cart/store";
import { matchModifierToMenuItem } from "@/lib/matchModifierToItem";
import { REDEEM_VARIATIONS } from "@/lib/fuelConstants";
import ModifierSection from "@/components/menu/ModifierSection";
import ConsolidatedFruitVegSection from "@/components/menu/ConsolidatedFruitVegSection";
import type { MenuItem, MenuModifierList } from "@/features/menu/types";

const PACK_SIZES = ["MEDIUM", "LARGE", "XL", "JUMBO"] as const;

function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isFuelPackDrinksList(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("fuel pack") && n.includes("drink");
}

function isFruitVeg(name: string): boolean {
  const n = name.toLowerCase();
  return (
    (n.includes("fruit") || n.includes("vegetable")) &&
    (n.includes("add") || n.includes("extra"))
  );
}

type Props = {
  item: MenuItem;
  drinkItems: MenuItem[];
};

export default function RedeemSection({ item, drinkItems }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [phone, setPhone] = useState("");
  const [checkingFuel, setCheckingFuel] = useState(false);
  const [balances, setBalances] = useState({ medium: 0, large: 0, xl: 0, jumbo: 0 });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});

  const fuelPackDrinksList = item.modifiers.find((l) => isFuelPackDrinksList(l.name));
  const fruitVegLists = item.modifiers.filter((l) => isFruitVeg(l.name) && !isFuelPackDrinksList(l.name));
  const otherModifierLists = item.modifiers.filter((l) => !isFruitVeg(l.name) && !isFuelPackDrinksList(l.name));

  const sizeVariation = selectedSize
    ? item.variations.find((v) => v.id === REDEEM_VARIATIONS[selectedSize as keyof typeof REDEEM_VARIATIONS])
    : null;

  const selectedDrinkModifier = fuelPackDrinksList?.modifiers.find((m) => m.id === selectedDrinkId);
  const selectedDrinkItem = selectedDrinkModifier
    ? matchModifierToMenuItem(selectedDrinkModifier.name, drinkItems)
    : null;
  const selectedDrinkDescription = selectedDrinkItem?.description ?? "";

  function toggleModifier(list: MenuModifierList, modifierId: string) {
    setSelectedModifiers((prev) => {
      const current = prev[list.id] ?? [];
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

  async function checkBalance() {
    if (!phone.trim()) return;
    setCheckingFuel(true);
    try {
      const res = await fetch("/api/fuel/check-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setBalances({
        medium: data?.balances?.medium ?? 0,
        large: data?.balances?.large ?? 0,
        xl: data?.balances?.xl ?? 0,
        jumbo: data?.balances?.jumbo ?? 0,
      });
    } catch {
      setBalances({ medium: 0, large: 0, xl: 0, jumbo: 0 });
    } finally {
      setCheckingFuel(false);
    }
  }

  function handleRedeem() {
    if (!sizeVariation || !selectedDrinkModifier || !fuelPackDrinksList) return;

    const modifierPayloads = [
      {
        modifierListId: fuelPackDrinksList.id,
        modifierId: selectedDrinkModifier.id,
        name: selectedDrinkModifier.name,
        price: 0,
        quantity: 1,
      },
    ];

    for (const list of [...fruitVegLists, ...otherModifierLists]) {
      const modifierIds = selectedModifiers[list.id] ?? [];
      for (const modId of modifierIds) {
        const mod = list.modifiers.find((m) => m.id === modId);
        if (mod) {
          modifierPayloads.push({
            modifierListId: list.id,
            modifierId: mod.id,
            name: mod.name,
            price: mod.price,
            quantity: 1,
          });
        }
      }
    }

    addItem({
      id: nanoid(),
      itemId: item.id,
      itemName: item.name,
      image: item.image ?? undefined,
      variationId: sizeVariation.id,
      variationName: sizeVariation.name,
      basePrice: sizeVariation.price,
      modifiers: modifierPayloads,
      quantity: 1,
    });
    openCart();
  }

  const balanceForSize = selectedSize
    ? balances[selectedSize.toLowerCase() as keyof typeof balances] ?? 0
    : 0;
  const canRedeem =
    isValidUSPhone(phone) &&
    selectedSize &&
    balanceForSize > 0 &&
    selectedDrinkId;

  return (
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
        Redeem from your balance
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Enter your phone number to check your balance, then pick a size and drink.
      </p>

      {/* Phone */}
      <div>
        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)] block mb-2">
          Phone number
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="flex-1 bg-neutral-100 rounded-xl px-4 py-3 text-[var(--color-charcoal)] placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-orange)] focus:outline-none"
          />
          <button
            type="button"
            onClick={checkBalance}
            disabled={!phone.trim() || checkingFuel}
            className="px-4 py-3 rounded-xl bg-[var(--color-orange)] text-black font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingFuel ? "..." : "Check"}
          </button>
        </div>
      </div>

      {/* Balance */}
      {isValidUSPhone(phone) && (
        <div className="bg-[var(--color-orange-light)]/50 border border-[var(--color-orange)]/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">Your balance</p>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {PACK_SIZES.map((size) => (
              <div key={size} className="text-center">
                <p className="text-[var(--color-muted)]">{size}</p>
                <p className="font-semibold text-[var(--color-charcoal)]">
                  {balances[size.toLowerCase() as keyof typeof balances]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      <div>
        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)] block mb-2">
          Size
        </label>
        <div className="flex gap-2 flex-wrap">
          {PACK_SIZES.map((size) => {
            const bal = balances[size.toLowerCase() as keyof typeof balances] ?? 0;
            const disabled = bal === 0;
            return (
              <button
                key={size}
                type="button"
                onClick={() => !disabled && setSelectedSize(size)}
                disabled={disabled}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  selectedSize === size
                    ? "bg-[var(--color-orange)] text-black"
                    : disabled
                    ? "bg-neutral-100 text-[var(--color-muted)] cursor-not-allowed"
                    : "bg-neutral-100 text-[var(--color-charcoal)] hover:bg-neutral-200"
                }`}
              >
                {size} {disabled ? "(0)" : `(${bal})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drink picker */}
      {fuelPackDrinksList && (
        <div>
          <label className="text-xs uppercase tracking-wide text-[var(--color-muted)] block mb-3">
            Choose your drink
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fuelPackDrinksList.modifiers.map((mod) => {
              const matched = matchModifierToMenuItem(mod.name, drinkItems);
              const displayName = matched?.name ?? mod.name;
              const image = matched?.image ?? null;
              const selected = selectedDrinkId === mod.id;

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    setSelectedDrinkId(mod.id);
                    setSelectedModifiers({});
                  }}
                  className={`rounded-xl overflow-hidden text-left transition border-2 ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]/30"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="aspect-square bg-neutral-100">
                    {image ? (
                      <img
                        src={image}
                        alt={displayName}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                        {displayName}
                      </div>
                    )}
                  </div>
                  <p className="p-2 text-sm font-medium text-[var(--color-charcoal)] line-clamp-2">
                    {displayName}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modifiers - adjust based on selected drink (fruit/veg filter uses drink ingredients) */}
      {selectedDrinkId && (
        <>
          {fruitVegLists.length > 0 && (
            <ConsolidatedFruitVegSection
              itemModifiers={fruitVegLists}
              itemDescription={selectedDrinkDescription}
              selectedModifiers={selectedModifiers}
              toggleModifier={toggleModifier}
            />
          )}
          {otherModifierLists.map((list) => (
            <ModifierSection
              key={list.id}
              list={list}
              selectedModifiers={selectedModifiers}
              toggleModifier={toggleModifier}
              selectedVariationName={sizeVariation?.name}
              itemDescription={selectedDrinkDescription}
            />
          ))}
        </>
      )}

      {/* Redeem button */}
      <button
        type="button"
        onClick={handleRedeem}
        disabled={!canRedeem}
        className={`w-full py-4 rounded-full font-semibold transition ${
          canRedeem
            ? "bg-[var(--color-orange)] text-black hover:opacity-90"
            : "bg-neutral-200 text-[var(--color-muted)] cursor-not-allowed"
        }`}
      >
        Redeem & Add to Cart
      </button>
    </section>
  );
}
