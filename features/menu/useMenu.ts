// features/menu/useMenu.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocationStore } from "@/features/location/store";
import type { MenuCategory, MenuItem, MenuResponse } from "./types";

export function useMenu() {
  const selectedLocation = useLocationStore(
    (state) => state.selectedLocation
  );

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locationId = selectedLocation?.id;

    if (!locationId) {
      setItems([]);
      setCategories([]);
      setActiveCategory(null);
      return;
    }

    let mounted = true;

    async function fetchMenu() {
        try {
          setLoading(true);

  const res = await fetch(
    `/api/square/catalog?location=${locationId}`,
    { cache: "no-store" }
  );

        const data =
          (await res.json()) as MenuResponse | { error?: string };

        if (!mounted) return;

        if (
          !res.ok ||
          !("categories" in data) ||
          !("items" in data)
        ) {
          console.error("Invalid menu response:", data);
          setItems([]);
          setCategories([]);
          setActiveCategory(null);
          return;
        }

        setItems(data.items ?? []);
        setCategories(data.categories ?? []);

        if ((data.categories?.length ?? 0) > 0) {
          setActiveCategory(
            (prev) => prev ?? data.categories[0].id
          );
        } else {
          setActiveCategory(null);
        }

      } catch (err) {
        console.error("Failed to fetch menu:", err);
        if (!mounted) return;
        setItems([]);
        setCategories([]);
        setActiveCategory(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMenu();

    return () => {
      mounted = false;
    };

  }, [selectedLocation?.id]);

  const filteredItems = useMemo(() => {
    if (!activeCategory) return [];
    return items.filter(
      (i) => i.categoryId === activeCategory
    );
  }, [items, activeCategory]);

  return {
    items,
    categories,
    activeCategory,
    setActiveCategory,
    filteredItems,
    loading,
  };
}