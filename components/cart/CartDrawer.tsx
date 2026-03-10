"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";

import CartHeader from "./CartHeader";
import CartLocation from "./CartLocation";
import CartFuelRedemption from "./CartFuelRedemption";
import CartItems from "./CartItems";
import CartFooter from "./CartFooter";

function getDefaultPickupTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20);
  return now;
}

const TEST_MODE = true;

const ORDER_START_HOUR = 8;
const ORDER_END_HOUR = 18;

function isWithinOrderingHours() {
  if (TEST_MODE) return true;

  const now = new Date();
  const hour = now.getHours();
  return hour >= ORDER_START_HOUR && hour < ORDER_END_HOUR;
}

const REDEEM_VARIATIONS: Record<
  string,
  "MEDIUM" | "LARGE" | "XL" | "JUMBO"
> = {
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

  const selectedLocation = useLocationStore(
    (state) => state.selectedLocation
  );

  const [pickupDate, setPickupDate] = useState<Date>(
    getDefaultPickupTime()
  );
  const [asap, setAsap] = useState(true);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  const [checkingFuel, setCheckingFuel] = useState(false);
  const [fuelBalance, setFuelBalance] = useState<number | null>(null);
  const [lastCheckedPhone, setLastCheckedPhone] = useState<
    string | null
  >(null);

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

      if (redemptionSize === "MEDIUM")
        setFuelBalance(balances.medium);
      if (redemptionSize === "LARGE")
        setFuelBalance(balances.large);
      if (redemptionSize === "XL")
        setFuelBalance(balances.xl);
      if (redemptionSize === "JUMBO")
        setFuelBalance(balances.jumbo);

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
      alert(
        "Online ordering is available between 8:00 AM and 6:00 PM."
      );
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

        <CartHeader closeCart={closeCart} />

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          <CartLocation selectedLocation={selectedLocation} />

          <CartFuelRedemption
            redemptionInCart={redemptionInCart}
            phone={phone}
            handlePhoneChange={handlePhoneChange}
            fuelBalances={fuelBalances}
            checkFuelBalance={() => checkFuelBalance()}
          />

          <CartItems
            items={items}
            removeItem={removeItem}
            updateQuantity={updateQuantity}
          />

        </div>

        <CartFooter
          total={getCartTotal()}
          orderingOpen={orderingOpen}
          redemptionInCart={redemptionInCart}
          phone={phone}
          checkingFuel={checkingFuel}
          handleCheckout={handleCheckout}
        />

      </div>
    </div>
  );
}