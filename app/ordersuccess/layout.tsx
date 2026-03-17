import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order Confirmed",
  alternates: { canonical: `${SITE_URL}/ordersuccess` },
  robots: { index: false, follow: true },
};

export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
