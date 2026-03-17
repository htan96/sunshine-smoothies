"use client";

import { useLocationStore } from "@/features/location/store";
import LocationGate from "@/components/location/LocationGate";
import FuelPageContent from "@/components/fuel/FuelPageContent";

export default function FuelPage() {
  const { selectedLocation } = useLocationStore();

  if (!selectedLocation) {
    return <LocationGate />;
  }

  return <FuelPageContent />;
}
