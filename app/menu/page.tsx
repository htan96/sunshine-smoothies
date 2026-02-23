"use client";

import { useLocationStore } from "@/features/location/store";
import LocationGate from "@/components/location/LocationGate";
import MenuPageLayout from "@/components/menu/MenuPageLayout";

export default function MenuPage() {
  const { selectedLocation } = useLocationStore();

  if (!selectedLocation) {
    return <LocationGate />;
  }

  return <MenuPageLayout />;
}
