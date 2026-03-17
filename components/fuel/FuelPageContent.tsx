"use client";

import { useState } from "react";
import { useFuel } from "@/features/fuel/useFuel";
import LocationBar from "@/components/location/LocationBar";
import BuyPacksSection from "./BuyPacksSection";
import RedeemSection from "./RedeemSection";

export default function FuelPageContent() {
  const { packItems, redeemItem, drinkItems, loading } = useFuel();
  const [activeSection, setActiveSection] = useState<"buy" | "redeem">("buy");

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <LocationBar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-[var(--color-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <LocationBar />

      <div className="max-w-3xl mx-auto px-6 pb-24 md:pb-12">
        {/* Intro */}
        <section className="pt-8 md:pt-12">
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-charcoal)]">
            Fuel Packs & Rewards
          </h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Buy prepaid packs to save on smoothies, or redeem drinks from your existing balance.
            Your balance is tied to your phone number—enter it at checkout.
          </p>
        </section>

        {/* Tab switcher */}
        <div className="mt-8 flex gap-2 p-1 bg-neutral-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSection("buy")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              activeSection === "buy"
                ? "bg-white text-[var(--color-charcoal)] shadow-sm"
                : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
            }`}
          >
            Buy Packs
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("redeem")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              activeSection === "redeem"
                ? "bg-white text-[var(--color-charcoal)] shadow-sm"
                : "text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
            }`}
          >
            Redeem
          </button>
        </div>

        {/* Sections */}
        {activeSection === "buy" && packItems.length > 0 && (
          <BuyPacksSection items={packItems} />
        )}
        {activeSection === "redeem" && redeemItem && (
          <RedeemSection
            item={redeemItem}
            drinkItems={drinkItems}
          />
        )}

        {activeSection === "buy" && packItems.length === 0 && (
          <p className="mt-8 text-[var(--color-muted)]">Fuel packs are not available at this location.</p>
        )}
        {activeSection === "redeem" && !redeemItem && (
          <p className="mt-8 text-[var(--color-muted)]">Redemption is not available at this location.</p>
        )}
      </div>
    </div>
  );
}
