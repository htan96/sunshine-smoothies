import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations | Sunshine Smoothies & Coffee",
  description:
    "Visit Sunshine Smoothies in Vallejo — Solano Avenue storefront or Waterfront drive-thru. Order ahead for pickup.",
};

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
