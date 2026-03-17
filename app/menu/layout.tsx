import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Menu | Order Smoothies & More",
  alternates: { canonical: `${SITE_URL}/menu` },
  description:
    "Order fresh smoothies, juices, acai bowls, and more at Sunshine Smoothies in Vallejo. Real fruit, no syrups. Pick up at Solano Ave or our Waterfront drive-thru.",
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
