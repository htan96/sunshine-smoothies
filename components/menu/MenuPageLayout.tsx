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
    <div className="bg-white flex flex-col">

      <LocationBar />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Only this scrolls visually */}
      <div className="pb-24">
        <MenuGrid items={filteredItems} />
      </div>

    </div>
  );
}