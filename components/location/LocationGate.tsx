"use client";

import { useState, useEffect } from "react";
import { useLocationStore } from "@/features/location/store";

interface LocationGateProps {
  onClose?: () => void;
}

const LOCATIONS = [
  {
    id: "L6W05ZHRQZB3H",
    name: "Solano Ave",
    address: "2089 Solano Ave, Vallejo",
    enabled: true,
  },
  {
    id: "5PHZ3HJ8ZJCQ0",
    name: "Wilson Ave (Drive-Thru)",
    address: "821 Wilson Ave, Vallejo",
    enabled: true,
  },
];

export default function LocationGate({ onClose }: LocationGateProps) {
  const { selectedLocation, setLocation } = useLocationStore();

  const [selectedId, setSelectedId] = useState<string | null>(
    selectedLocation?.id ?? null
  );

  // If store updates while modal open, sync it
  useEffect(() => {
    if (selectedLocation) {
      setSelectedId(selectedLocation.id);
    }
  }, [selectedLocation]);

  const selected = LOCATIONS.find(
    (l) => l.id === selectedId && l.enabled
  );

  const handleContinue = () => {
    if (!selected) return;

    setLocation(selected);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold">
            Select Location
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Choose where you'd like to order from
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              disabled={!loc.enabled}
              onClick={() => setSelectedId(loc.id)}
              className={`w-full border rounded-xl p-4 text-left transition ${
                selectedId === loc.id
                  ? "border-black bg-neutral-100"
                  : "border-neutral-200"
              } ${
                !loc.enabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:border-black"
              }`}
            >
              <p className="font-semibold text-lg">
                {loc.name}
              </p>
              <p className="text-sm text-neutral-500">
                {loc.address}
              </p>
            </button>
          ))}
        </div>

        <div className="p-6 border-t">
          <button
            disabled={!selected}
            onClick={handleContinue}
            className="w-full bg-black text-white py-3 rounded-xl font-medium transition hover:bg-neutral-800 disabled:opacity-30"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}
