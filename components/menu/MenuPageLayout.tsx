"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LocationBar from "@/components/location/LocationBar";
import CategoryTabs from "./CategoryTabs";
import MenuGrid from "./MenuGrid";
import MenuItemModal from "./MenuItemModal";
import { useMenu } from "@/features/menu/useMenu";

export default function MenuPageLayout() {
  const searchParams = useSearchParams();
  const {
    categories,
    items,
    activeCategory,
    setActiveCategory,
    filteredItems,
  } = useMenu();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam && items.some((i) => i.id === itemParam)) {
      setSelectedItemId(itemParam);
    }
  }, [searchParams, items]);

  return (
    <div className="bg-white flex flex-col">

      <LocationBar />

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 space-y-6 py-6 md:py-8">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        <MenuGrid
          items={filteredItems}
          onItemClick={(item) => setSelectedItemId(item.id)}
        />
      </div>

      <MenuItemModal
        item={selectedItem ?? null}
        isOpen={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </div>
  );
}