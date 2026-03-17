"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/features/location/store";
import { PACK_VARIATIONS, REDEEM_VARIATIONS } from "@/lib/fuelConstants";
import type { MenuItem, MenuResponse } from "@/features/menu/types";

const PACK_IDS = new Set(Object.values(PACK_VARIATIONS));
const REDEEM_IDS = new Set(Object.values(REDEEM_VARIATIONS));

export function useFuel() {
  const selectedLocation = useLocationStore((s) => s.selectedLocation);
  const [packItems, setPackItems] = useState<MenuItem[]>([]);
  const [redeemItem, setRedeemItem] = useState<MenuItem | null>(null);
  const [drinkItems, setDrinkItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locationId = selectedLocation?.id;

    if (!locationId) {
      setPackItems([]);
      setRedeemItem(null);
      setDrinkItems([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchFuel() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/square/catalog?location=${locationId}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as MenuResponse | { error?: string };

        if (!mounted) return;
        if (!res.ok || !("items" in data)) {
          setPackItems([]);
          setRedeemItem(null);
          setDrinkItems([]);
          return;
        }

        const items: MenuItem[] = data.items ?? [];
        const packs = items.filter((i) =>
          i.variations.some((v) => PACK_IDS.has(v.id))
        );
        const redeem = items.find((i) =>
          i.variations.some((v) => REDEEM_IDS.has(v.id))
        );

        const drinkCategories = ["smoothie", "juice", "smoothies", "juices"];
        const drinks = items.filter((i) => {
          const cat = (i.categoryName ?? "").toLowerCase();
          return drinkCategories.some((c) => cat.includes(c));
        });

        setPackItems(packs);
        setRedeemItem(redeem ?? null);
        setDrinkItems(drinks);
      } catch {
        if (mounted) {
          setPackItems([]);
          setRedeemItem(null);
          setDrinkItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFuel();
    return () => {
      mounted = false;
    };
  }, [selectedLocation?.id]);

  return {
    packItems,
    redeemItem,
    drinkItems,
    loading,
  };
}
