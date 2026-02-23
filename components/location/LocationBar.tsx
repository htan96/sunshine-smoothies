"use client";

import { useState } from "react";
import { useLocationStore } from "@/features/location/store";
import LocationGate from "./LocationGate";

export default function LocationBar() {
  const { selectedLocation } = useLocationStore();
  const [open, setOpen] = useState(false);

  if (!selectedLocation) return null;

  return (
    <>
      <div className="sticky top-16 z-40 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-neutral-400">
              Pickup Location
            </span>

            <span className="text-base font-medium text-black">
              {selectedLocation.name}
            </span>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-neutral-500 hover:text-black transition"
          >
            Change
          </button>

        </div>

        <div className="h-px bg-neutral-200" />
      </div>

      {open && <LocationGate onClose={() => setOpen(false)} />}
    </>
  );
}