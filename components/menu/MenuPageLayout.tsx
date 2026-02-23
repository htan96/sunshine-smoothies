"use client";

import LocationBar from "@/components/location/LocationBar";
import CategoryTabs from "./CategoryTabs";
import MenuGrid from "./MenuGrid";
import { useMenu } from "@/features/menu/useMenu";

export default function MenuPageLayout() {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    filteredItems,
  } = useMenu();

  return (
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden">

      {/* Top Section */}
      <div className="shrink-0">
        <LocationBar />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        <MenuGrid items={filteredItems} />
      </div>

    </div>
  );
}