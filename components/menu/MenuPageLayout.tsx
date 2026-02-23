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
    <>
      <LocationBar />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      <MenuGrid items={filteredItems} />
    </>
  );
}
