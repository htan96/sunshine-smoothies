"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";
import { PACK_VARIATIONS, REDEEM_VARIATIONS } from "@/lib/fuelConstants";

/* -------------------------------- */
/* ORDERING HOURS CONFIG            */
/* -------------------------------- */

const TEST_MODE = false;

const ORDER_START_HOUR = 8;
const ORDER_END_HOUR = 18;

function isWithinOrderingHours() {
  if (TEST_MODE) return true;

  const now = new Date();
  const hour = now.getHours();
  return hour >= ORDER_START_HOUR && hour < ORDER_END_HOUR;
}

/* -------------------------------- */
/* HELPERS                          */
/* -------------------------------- */

function getDefaultPickupTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20);
  return now;
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

  const [pickupDate, setPickupDate] = useState<Date>(getDefaultPickupTime());
  const [asap, setAsap] = useState(true);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  const [checkingFuel, setCheckingFuel] = useState(false);
  const [squareCustomerId, setSquareCustomerId] = useState<string | null>(null);

  const [fuelBalances, setFuelBalances] = useState<FuelBalances>({
    medium: 0,
    large: 0,
    xl: 0,
    jumbo: 0,
  });

  const orderingOpen = isWithinOrderingHours();

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
    if (!selectedLocation) return;

    if (!orderingOpen) {
      alert("Online ordering is available between 8AM and 6PM.");
      return;
    }

    if (phoneRequired && !phone.trim()) {
      alert("Phone number required.");
      return;
    }

    if (fuelPackInCart && redemptionInCart && packSize !== redemptionSize) {
      alert("Fuel Pack redemption must match the pack size.");
      return;
    }

    if (redemptionInCart) {
      const data = await checkFuelBalance();

      if (!data?.allowed) {
        alert(data?.message || "No drinks remaining.");
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
        alert(`You only have ${remaining} drinks remaining.`);
        return;
      }
    }

    const calculatedPickupTime = asap
      ? new Date(Date.now() + 20 * 60000)
      : pickupDate;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        pickupTime: calculatedPickupTime.toISOString(),
        notes,
        locationId: selectedLocation.id,
        phone,
        squareCustomerId,
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
            <p className="font-medium">{selectedLocation?.name}</p>
            <p className="text-sm text-neutral-500">
              {selectedLocation?.address}
            </p>
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

                  if (redemptionInCart && value.length === 10) {
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

          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total</span>
            <span>${(getCartTotal() / 100).toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              !orderingOpen ||
              (phoneRequired && !phone.trim()) ||
              checkingFuel
            }
            className={`w-full py-4 rounded-full font-semibold ${
              orderingOpen && (!phoneRequired || phone.trim())
                ? "bg-black text-white"
                : "bg-neutral-300"
            }`}
          >
            {!orderingOpen
              ? "Ordering Closed"
              : phoneRequired && !phone.trim()
              ? "Enter Phone Number"
              : checkingFuel
              ? "Checking Balance..."
              : "Checkout"}
          </button>

        </div>

      </div>
    </div>
  );
}