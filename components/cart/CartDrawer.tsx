"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";

function getDefaultPickupTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20);
  return now;
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getCartTotal,
  } = useCartStore();

  const selectedLocation = useLocationStore(
    (state) => state.selectedLocation
  );

  const [pickupDate, setPickupDate] = useState<Date>(
    getDefaultPickupTime()
  );
  const [asap, setAsap] = useState(true);
  const [notes, setNotes] = useState("");

  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const base = getDefaultPickupTime();

    for (let i = 0; i < 8; i++) {
      const slot = new Date(base);
      slot.setMinutes(base.getMinutes() + i * 15);
      slots.push(slot);
    }

    return slots;
  }, []);

  const formattedReadyTime = useMemo(() => {
    if (asap) {
      return new Date(
        Date.now() + 20 * 60000
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return pickupDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [pickupDate, asap]);

  async function handleCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        pickupTime: asap
          ? `ASAP (${formattedReadyTime})`
          : pickupDate.toISOString(),
        notes,
        locationId: selectedLocation?.id,
        locationName: selectedLocation?.name,
        locationAddress: selectedLocation?.address,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full md:w-[440px] bg-white h-full shadow-2xl flex flex-col animate-slideIn">

        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          
          {/* Drag indicator (mobile only) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 md:hidden">
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
          </div>

          <h2 className="text-lg font-semibold tracking-tight">
            Your Order
          </h2>

          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* Location */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
              Pickup Location
            </p>
            <div className="bg-neutral-100 rounded-2xl px-5 py-4">
              <p className="text-sm font-medium text-neutral-800">
                {selectedLocation?.name}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {selectedLocation?.address}
              </p>
            </div>
          </div>

          {/* ASAP Toggle */}
          <div className="flex items-center justify-between bg-neutral-100 rounded-2xl px-5 py-4">
            <span className="text-sm font-medium">
              ASAP (Ready by {formattedReadyTime})
            </span>
            <button
              onClick={() => setAsap(!asap)}
              className={`w-12 h-6 flex items-center rounded-full transition ${
                asap ? "bg-black" : "bg-neutral-300"
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
                  asap ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {!asap && (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setPickupDate(slot)}
                  className="bg-neutral-100 rounded-xl py-2 text-xs hover:bg-neutral-200 transition"
                >
                  {slot.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          )}

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-neutral-100 rounded-2xl px-5 py-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300 transition"
            placeholder="Special instructions..."
          />

          {/* Items */}
          <div className="border-t pt-6 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">
                      {item.itemName}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {item.variationName}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-neutral-400 hover:text-red-500 transition"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center bg-neutral-100 rounded-full">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="px-4 py-1 text-sm"
                    >
                      −
                    </button>

                    <span className="px-4 text-sm">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-4 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-medium text-sm">
                    $
                    {(
                      ((item.basePrice +
                        item.modifiers.reduce(
                          (sum, m) =>
                            sum + m.price * m.quantity,
                          0
                        )) *
                        item.quantity) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-6 py-5 bg-white space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>
              ${(getCartTotal() / 100).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-4 rounded-full font-semibold hover:opacity-90 transition"
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
}