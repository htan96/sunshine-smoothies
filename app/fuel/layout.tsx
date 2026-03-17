import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Fuel Packs & Rewards | Sunshine Smoothies",
  description:
    "Buy prepaid smoothie packs and save. Redeem drinks from your balance. Sunshine Smoothies Vallejo.",
};

export default function FuelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
