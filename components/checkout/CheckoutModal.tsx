"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";
import { Modal } from "@/components/ui/Modal";
import LocationGate from "@/components/location/LocationGate";
import { getFuelVariationDisplayName } from "@/lib/fuelConstants";

const ORDER_START_HOUR = 8;
const ORDER_END_HOUR = 18;
const PREP_TIME_MINUTES = 20;
const SLOT_INTERVAL = 15;

function getReadyTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + PREP_TIME_MINUTES);
  return now;
}

function generatePickupSlots() {
  const now = new Date();
  const start = new Date(now.getTime() + PREP_TIME_MINUTES * 60000);
  const closing = new Date();
  closing.setHours(ORDER_END_HOUR, 0, 0, 0);
  const slots = [];
  const firstSlot = new Date(start);
  firstSlot.setMinutes(
    Math.ceil(firstSlot.getMinutes() / SLOT_INTERVAL) * SLOT_INTERVAL
  );
  let current = firstSlot;
  while (current <= closing) {
    slots.push({
      date: new Date(current),
      label: current.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      value: current.toISOString(),
    });
    current = new Date(current.getTime() + SLOT_INTERVAL * 60000);
  }
  return slots;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onContinueToPayment: () => void;
  testingMode?: boolean;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  onContinueToPayment,
  testingMode = false,
}: Props) {
  const { items, getCartTotal, removeItem, updateQuantity } = useCartStore();
  const selectedLocation = useLocationStore((state) => state.selectedLocation);
  const [pickupDate, setPickupDate] = useState<Date>(getReadyTime());
  const [showLocationGate, setShowLocationGate] = useState(false);

  const timeSlots = generatePickupSlots();
  const readyTime = getReadyTime();

  if (!isOpen) return null;

  const content = (
    <div className="flex flex-col max-h-[85vh] md:max-h-[90vh] w-full max-w-md">
      {/* Header - v3 style */}
      <div className="p-6 border-b border-neutral-100 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-charcoal)]">
            Checkout
          </h2>
          <div className="flex items-center gap-2">
            {testingMode && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--color-orange-light)] text-[var(--color-orange-dark)]">
              Testing Mode
            </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 text-[var(--color-muted)]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--color-muted)] mb-4">Your order is empty</p>
            <p className="text-sm text-[var(--color-muted)]">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
        <>
        {/* Order items */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3 uppercase tracking-wide text-[var(--color-muted)]">
            Your Order
          </h3>
          <div className="space-y-3">
            {items.map((item) => {
              const modifierTotal = item.modifiers.reduce(
                (sum, m) => sum + m.price * m.quantity,
                0
              );
              const itemTotal = (item.basePrice + modifierTotal) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex justify-between items-start gap-4 py-3 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-charcoal)]">
                      {item.itemName}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {getFuelVariationDisplayName(item.variationId) ?? item.variationName}
                      {item.modifiers?.length ? ` · +${item.modifiers.map((m) => m.name).join(", ")}` : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-sm hover:bg-neutral-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-sm hover:bg-neutral-50"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-semibold text-[var(--color-charcoal)] shrink-0">
                    ${(itemTotal / 100).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location - v3 */}
        <div className="bg-[var(--color-orange-light)]/50 rounded-xl p-4 border border-[var(--color-orange)]/20">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">
            Pickup Location
          </h3>
          {selectedLocation ? (
            <>
              <p className="font-medium text-[var(--color-charcoal)]">{selectedLocation.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{selectedLocation.address}</p>
              <button
                type="button"
                onClick={() => setShowLocationGate(true)}
                className="mt-2 text-sm font-medium text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] transition"
              >
                Change location
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowLocationGate(true)}
              className="text-sm font-medium text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] transition"
            >
              Select pickup location →
            </button>
          )}
        </div>

        {/* Pickup time */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
            Ready Around {readyTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => setPickupDate(slot.date)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  pickupDate.getTime() === slot.date.getTime()
                    ? "bg-[var(--color-orange)] text-black"
                    : "bg-neutral-100 text-[var(--color-charcoal)] hover:bg-neutral-200"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-4 border-t border-neutral-100">
          <span className="text-lg font-semibold text-[var(--color-charcoal)]">Total</span>
          <span className="text-xl font-bold text-[var(--color-charcoal)]">
            ${(getCartTotal() / 100).toFixed(2)}
          </span>
        </div>
        </>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-100 bg-white shrink-0 space-y-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            onContinueToPayment();
          }}
          disabled={!selectedLocation || items.length === 0}
          className={`w-full py-4 rounded-full font-semibold transition ${
            selectedLocation && items.length > 0
              ? "bg-[var(--color-orange)] text-black hover:opacity-90"
              : "bg-neutral-200 text-[var(--color-muted)] cursor-not-allowed"
          }`}
        >
          {items.length === 0
            ? "Add Items First"
            : !selectedLocation
            ? "Select Location First"
            : testingMode
            ? "Continue to Payment (Cart)"
            : "Continue to Payment"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-charcoal)] transition"
        >
          Keep shopping
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
        {content}
      </Modal>
      {showLocationGate && (
        <div className="fixed inset-0 z-[110]">
          <LocationGate onClose={() => setShowLocationGate(false)} />
        </div>
      )}
    </>
  );
}
