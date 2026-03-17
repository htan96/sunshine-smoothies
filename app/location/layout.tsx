import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Locations | Sunshine Smoothies & Coffee",
  alternates: { canonical: `${SITE_URL}/location` },
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
