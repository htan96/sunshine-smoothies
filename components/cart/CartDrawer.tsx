"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";

function getDefaultPickupTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20);
  return now;
}

function isWithinOrderingHours() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 8 && hour < 16;
}

const REDEEM_VARIATIONS: Record<string, "MEDIUM" | "LARGE" | "XL" | "JUMBO"> = {
  RMILMPJ3UMVOMOH4LFBQDS4H: "MEDIUM",
  BWJMGIMUZHU3EVPBEKMFMPEB: "LARGE",
  F7QLDQMENXO4CIOQO6QPHIV5: "XL",
  "7XQ7EXVJELMIM63UDTLMLAC7": "JUMBO",
};

type FuelBalances = {
  medium: number;
  large: number;
  xl: number;
  jumbo: number;
};

function getRedemptionItem(items: any[]) {
  return items.find((item) => REDEEM_VARIATIONS[item.variationId]);
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

  const selectedLocation = useLocationStore((state) => state.selectedLocation);

  const [pickupDate, setPickupDate] = useState<Date>(getDefaultPickupTime());
  const [asap, setAsap] = useState(true);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [checkingFuel, setCheckingFuel] = useState(false);
  const [fuelBalance, setFuelBalance] = useState<number | null>(null);
  const [lastCheckedPhone, setLastCheckedPhone] = useState<string | null>(null);

  const [fuelBalances, setFuelBalances] = useState<FuelBalances>({
    medium: 0,
    large: 0,
    xl: 0,
    jumbo: 0,
  });

  const orderingOpen = isWithinOrderingHours();

  const redemptionItem = getRedemptionItem(items);

  const redemptionSize = redemptionItem
    ? REDEEM_VARIATIONS[redemptionItem.variationId]
    : null;

  const redemptionQuantity = redemptionItem
    ? Number(redemptionItem.quantity || 0)
    : 0;

  const redemptionInCart = Boolean(redemptionItem);

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
    const time = asap ? new Date(Date.now() + 20 * 60000) : pickupDate;

    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [pickupDate, asap]);

  async function checkFuelBalance(currentPhone?: string) {
    const phoneToCheck = (currentPhone ?? phone).trim();

    if (!phoneToCheck) return null;

    const digits = phoneToCheck.replace(/\D/g, "");

if (digits.length < 10) return null;

if (lastCheckedPhone && lastCheckedPhone === digits) {
  return null;
}

setLastCheckedPhone(digits);
    setCheckingFuel(true);

    try {
      const res = await fetch("/api/fuel/check-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneToCheck,
          size: redemptionSize ?? undefined,
        }),
      });

      const data = await res.json();

      const balances: FuelBalances = {
        medium: data?.balances?.medium ?? 0,
        large: data?.balances?.large ?? 0,
        xl: data?.balances?.xl ?? 0,
        jumbo: data?.balances?.jumbo ?? 0,
      };

      setFuelBalances(balances);

      if (redemptionSize === "MEDIUM") setFuelBalance(balances.medium);
      if (redemptionSize === "LARGE") setFuelBalance(balances.large);
      if (redemptionSize === "XL") setFuelBalance(balances.xl);
      if (redemptionSize === "JUMBO") setFuelBalance(balances.jumbo);

      return data;
    } catch (error) {
      console.error("Fuel balance check failed:", error);

      setFuelBalance(0);
      setFuelBalances({
        medium: 0,
        large: 0,
        xl: 0,
        jumbo: 0,
      });

      return null;
    } finally {
      setCheckingFuel(false);
    }
  }

async function handlePhoneChange(value: string) {
  setPhone(value);

  const digits = value.replace(/\D/g, "");

  if (!redemptionInCart) return;

  if (digits.length >= 10) {
    if (digits !== lastCheckedPhone) {
      await checkFuelBalance(value);
    }
  } else {
    setFuelBalance(null);
    setFuelBalances({
      medium: 0,
      large: 0,
      xl: 0,
      jumbo: 0,
    });

    setLastCheckedPhone(null);
  }
}

  async function handleCheckout() {
    if (!selectedLocation) return;

    if (!orderingOpen) {
      alert("Online ordering is available between 8:00 AM and 4:00 PM.");
      return;
    }

    if (redemptionInCart) {
      if (!phone.trim()) {
        alert("Phone number required for redemption.");
        return;
      }

      let data = await checkFuelBalance();

      if (!data) {
        alert("Unable to verify fuel balance.");
        return;
      }

      if (!data.allowed) {
        alert(data.message || "No drinks remaining.");
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
        alert(
          `You only have ${remaining} ${redemptionSize} drinks remaining.`
        );
        return;
      }
    }

    const calculatedPickupTime = asap
      ? new Date(Date.now() + 20 * 60000)
      : pickupDate;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        pickupTime: calculatedPickupTime.toISOString(),
        notes,
        locationId: selectedLocation.id,
        phone,
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      <div className="relative w-full md:w-[440px] bg-white h-full shadow-2xl flex flex-col animate-slideIn">

        {/* HEADER */}

        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Your Order
          </h2>

          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
          >
            ✕
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* PICKUP LOCATION */}

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

          {/* FUEL REDEMPTION */}

          {redemptionInCart && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-neutral-400">
                Phone Number Required for Redemption
              </p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => checkFuelBalance()}
                placeholder="Enter phone number"
                className="w-full bg-neutral-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />

              {phone && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 space-y-2">

                  <p className="text-sm font-semibold text-green-900">
                    Fuel Balance
                  </p>

                  <div className="flex justify-between text-sm text-green-900">
                    <span>Medium</span>
                    <span>{fuelBalances.medium}</span>
                  </div>

                  <div className="flex justify-between text-sm text-green-900">
                    <span>Large</span>
                    <span>{fuelBalances.large}</span>
                  </div>

                  <div className="flex justify-between text-sm text-green-900">
                    <span>XL</span>
                    <span>{fuelBalances.xl}</span>
                  </div>

                  <div className="flex justify-between text-sm text-green-900">
                    <span>Jumbo</span>
                    <span>{fuelBalances.jumbo}</span>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ITEMS */}

          <div className="border-t pt-6 space-y-6">

            {items.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100"
              >

                <div className="flex justify-between items-start mb-3">

                  <div>
                    <p className="font-medium">{item.itemName}</p>

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
                          (sum: number, m: any) =>
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

        {/* FOOTER */}

        <div className="border-t border-neutral-100 px-6 py-5 bg-white space-y-4">

          {!orderingOpen && (
            <p className="text-xs text-red-500 text-center">
              Online ordering is available daily from 8:00 AM to 4:00 PM.
            </p>
          )}

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>${(getCartTotal() / 100).toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              !orderingOpen ||
              (redemptionInCart && !phone.trim()) ||
              checkingFuel
            }
            className={`w-full py-4 rounded-full font-semibold transition ${
              orderingOpen &&
              (!redemptionInCart || phone.trim())
                ? "bg-black text-white hover:opacity-90"
                : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
            }`}
          >

            {!orderingOpen
              ? "Ordering Closed (8AM–4PM)"
              : redemptionInCart && !phone.trim()
              ? "Enter Phone Number to Redeem"
              : checkingFuel
              ? "Checking Balance..."
              : "Checkout"}

          </button>

        </div>

      </div>
    </div>
  );
}