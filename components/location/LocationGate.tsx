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
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">
            Select Location
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Choose where you&apos;d like to order from
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              disabled={!loc.enabled}
              onClick={() => setSelectedId(loc.id)}
              className={`w-full border rounded-xl p-4 text-left transition ${
                selectedId === loc.id
                  ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]/50"
                  : "border-neutral-200 hover:border-[var(--color-orange)]/50"
              } ${
                !loc.enabled
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }`}
            >
              <p className="font-semibold text-lg text-[var(--color-charcoal)]">
                {loc.name}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {loc.address}
              </p>
            </button>
          ))}
        </div>

        <div className="p-6 border-t">
          <button
            type="button"
            disabled={!selected}
            onClick={handleContinue}
            className="w-full py-3 rounded-xl font-medium transition disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--color-orange)] text-black hover:opacity-90 disabled:bg-neutral-200 disabled:text-[var(--color-muted)]"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}
