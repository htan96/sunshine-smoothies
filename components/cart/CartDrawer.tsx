"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";
import { PACK_VARIATIONS, REDEEM_VARIATIONS } from "@/lib/fuelConstants";
import LocationGate from "@/components/location/LocationGate";

/* -------------------------------- */
/* ORDERING HOURS CONFIG            */
/* -------------------------------- */

const ORDER_START_HOUR = 8;
const ORDER_END_HOUR = 18;

const PREP_TIME_MINUTES = 20;
const SLOT_INTERVAL = 15;

function isWithinOrderingHours() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= ORDER_START_HOUR && hour < ORDER_END_HOUR;
}

/* -------------------------------- */
/* HELPERS                          */
/* -------------------------------- */

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
      label: current.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      value: current.toISOString(),
    });

    current = new Date(current.getTime() + SLOT_INTERVAL * 60000);
  }

  return slots;
}

function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

/* -------------------------------- */
/* TYPES                            */
/* -------------------------------- */

type FuelBalances = {
  medium: number;
  large: number;
  xl: number;
  jumbo: number;
};

/* -------------------------------- */
/* COMPONENT                        */
/* -------------------------------- */

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getCartTotal,
  } = useCartStore();

  const selectedLocation = useLocationStore((state) => state.selectedLocation);

  const [pickupDate, setPickupDate] = useState<Date>(getReadyTime());
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  const [checkingFuel, setCheckingFuel] = useState(false);
  const [squareCustomerId, setSquareCustomerId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showLocationGate, setShowLocationGate] = useState(false);

  const [fuelBalances, setFuelBalances] = useState<FuelBalances>({
    medium: 0,
    large: 0,
    xl: 0,
    jumbo: 0,
  });

  const orderingOpen = isWithinOrderingHours();
  const timeSlots = generatePickupSlots();
  const readyTime = getReadyTime();

  /* -------------------------------- */
  /* Detect Redemption Items          */
  /* -------------------------------- */

  const redemptionItem = items.find((item) =>
    Object.values(REDEEM_VARIATIONS).includes(item.variationId)
  );

  const redemptionInCart = Boolean(redemptionItem);

  const redemptionSize = redemptionItem
    ? Object.entries(REDEEM_VARIATIONS).find(
        ([, id]) => id === redemptionItem.variationId
      )?.[0]
    : null;

  const redemptionQuantity = redemptionItem
    ? Number(redemptionItem.quantity || 0)
    : 0;

  /* -------------------------------- */
  /* Detect Fuel Pack Purchases       */
  /* -------------------------------- */

  const fuelPackItem = items.find((item) =>
    Object.values(PACK_VARIATIONS).includes(item.variationId)
  );

  const fuelPackInCart = Boolean(fuelPackItem);

  const packSize = fuelPackItem
    ? Object.entries(PACK_VARIATIONS).find(
        ([, id]) => id === fuelPackItem.variationId
      )?.[0]
    : null;

  const phoneRequired = redemptionInCart || fuelPackInCart;

  /* -------------------------------- */
  /* Fuel Balance Check               */
  /* -------------------------------- */

  async function checkFuelBalance() {
    if (!phone) return null;

    setCheckingFuel(true);

    try {
      const res = await fetch("/api/fuel/check-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          size: redemptionSize ?? undefined,
        }),
      });

      const data = await res.json();

      if (data?.squareCustomerId) {
        setSquareCustomerId(data.squareCustomerId);
      }

      setFuelBalances({
        medium: data?.balances?.medium ?? 0,
        large: data?.balances?.large ?? 0,
        xl: data?.balances?.xl ?? 0,
        jumbo: data?.balances?.jumbo ?? 0,
      });

      return data;
    } catch (error) {
      console.error("Fuel balance check failed:", error);
      return null;
    } finally {
      setCheckingFuel(false);
    }
  }

  /* -------------------------------- */
  /* Checkout                         */
  /* -------------------------------- */

  async function handleCheckout() {
    setCheckoutError(null);

    if (!selectedLocation) {
      setCheckoutError("Please select a pickup location.");
      setShowLocationGate(true);
      return;
    }

    if (!orderingOpen) {
      setCheckoutError("Online ordering is available between 8AM and 6PM.");
      return;
    }

    if (phoneRequired) {
      if (!phone.trim()) {
        setCheckoutError("Phone number is required for this order.");
        return;
      }
      if (!isValidUSPhone(phone)) {
        setCheckoutError("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    if (fuelPackInCart && redemptionInCart && packSize !== redemptionSize) {
      setCheckoutError("Fuel Pack redemption must match the pack size.");
      return;
    }

    if (redemptionInCart) {
      const data = await checkFuelBalance();

      if (!data?.allowed) {
        setCheckoutError(data?.message || "No drinks remaining.");
        return;
      }

      const remaining =
        redemptionSize === "MEDIUM"
          ? data.balances?.medium ?? 0
          : redemptionSize === "LARGE"
          ? data.balances?.large ?? 0
          : redemptionSize === "XL"
          ? data.balances?.xl ?? 0
          : redemptionSize === "JUMBO"
          ? data.balances?.jumbo ?? 0
          : 0;

      if (redemptionQuantity > remaining) {
        setCheckoutError(`You only have ${remaining} drink${remaining === 1 ? "" : "s"} remaining.`);
        return;
      }
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        pickupTime: pickupDate.toISOString(),
        notes,
        locationId: selectedLocation.id,
        phone,
        squareCustomerId,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setCheckoutError(data?.error || "Checkout failed. Please try again.");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />

      <div className="relative w-full md:w-[440px] bg-white h-full flex flex-col">

        {/* HEADER */}

        <div className="px-6 py-5 border-b flex justify-between">
          <h2 className="text-lg font-semibold">Your Order</h2>
          <button onClick={closeCart}>✕</button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* LOCATION */}

          <div className="bg-neutral-100 p-4 rounded-xl">
            {selectedLocation ? (
              <>
                <p className="font-medium">{selectedLocation.name}</p>
                <p className="text-sm text-neutral-500">
                  {selectedLocation.address}
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationGate(true)}
                  className="mt-2 text-sm text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium"
                >
                  Change location
                </button>
              </>
            ) : (
              <>
                <p className="font-medium text-neutral-600">Pickup location</p>
                <p className="text-sm text-neutral-500 mb-2">
                  Select where you&apos;d like to pick up your order.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationGate(true)}
                  className="text-sm text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium"
                >
                  Select location →
                </button>
              </>
            )}
          </div>

         {/* PICKUP TIME */}

<div className="space-y-3">

  <p className="text-xs uppercase text-neutral-400">
    Ready Around {readyTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
  </p>

  {/* MOBILE TIME PODS */}

  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:hidden">

    {timeSlots.map((time) => (
      <button
        key={time.value}
        onClick={() => setPickupDate(time.date)}
        className={`px-4 py-2 rounded-full border border-neutral-200 whitespace-nowrap transition ${
          pickupDate.getTime() === time.date.getTime()
            ? "bg-black text-white border-black"
            : "bg-white text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        {time.label}
      </button>
    ))}

  </div>

  {/* DESKTOP SELECTOR */}

  <div className="hidden md:block">

    <select
      value={pickupDate.toISOString()}
      onChange={(e) => {
        const selected = timeSlots.find(slot => slot.value === e.target.value)
        if (selected) setPickupDate(selected.date)
      }}
      className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-white"
    >

      {timeSlots.map((slot) => (
        <option key={slot.value} value={slot.value}>
          {slot.label}
        </option>
      ))}

    </select>

  </div>

</div>

          {/* PHONE INPUT */}

          {phoneRequired && (
            <div>
              <p className="text-xs uppercase text-neutral-400 mb-2">
                Phone Number Required
              </p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value;
                  setPhone(value);
                  setCheckoutError(null);

                  if (redemptionInCart && isValidUSPhone(value)) {
                    checkFuelBalance();
                  }
                }}
                placeholder="Enter phone number"
                className="w-full bg-neutral-100 rounded-xl px-4 py-3"
              />
            </div>
          )}

          {/* FUEL BALANCES */}

          {redemptionInCart && phone && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-2">
              <p className="text-sm font-semibold text-green-900">
                Fuel Balance
              </p>

              <div className="flex justify-between text-sm">
                <span>Medium</span>
                <span>{fuelBalances.medium}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Large</span>
                <span>{fuelBalances.large}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>XL</span>
                <span>{fuelBalances.xl}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Jumbo</span>
                <span>{fuelBalances.jumbo}</span>
              </div>
            </div>
          )}

          {/* CART ITEMS */}

          {items.map((item) => (
            <div key={item.id} className="border rounded-xl p-4">

              <p className="font-medium">{item.itemName}</p>

              <p className="text-sm text-neutral-500">
                {item.variationName}
              </p>

              {item.modifiers && item.modifiers.length > 0 && (
                <p className="text-xs text-neutral-600 mt-1">
                  + {item.modifiers.map((m) => `${m.name}${(m.quantity ?? 1) > 1 ? ` (×${m.quantity})` : ""}`).join(", ")}
                </p>
              )}

              <div className="flex justify-between mt-3">

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>

                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500"
                >
                  Remove
                </button>

              </div>

            </div>
          ))}

        </div>

        {/* FOOTER */}

        <div className="border-t p-6">

          {checkoutError && (
            <p className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {checkoutError}
            </p>
          )}

          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total</span>
            <span>${(getCartTotal() / 100).toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              !orderingOpen ||
              (phoneRequired && (!phone.trim() || !isValidUSPhone(phone))) ||
              checkingFuel
            }
            className={`w-full py-4 rounded-full font-semibold transition ${
              orderingOpen && (!phoneRequired || phone.trim()) && selectedLocation
                ? "bg-black text-white hover:bg-neutral-800"
                : "bg-neutral-300 cursor-not-allowed"
            }`}
          >
            {!selectedLocation
              ? "Select Location"
              : !orderingOpen
              ? "Ordering Closed"
              : phoneRequired && !phone.trim()
              ? "Enter Phone Number"
              : phoneRequired && !isValidUSPhone(phone)
              ? "Enter Valid Phone"
              : checkingFuel
              ? "Checking Balance..."
              : "Checkout"}
          </button>

        </div>

      </div>

      {showLocationGate && (
        <LocationGate onClose={() => setShowLocationGate(false)} />
      )}
    </div>
  );
}