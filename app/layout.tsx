"use client";

import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { useLocationStore } from "@/features/location/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedLocation } = useLocationStore();

  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        
        {selectedLocation && <Header />}

        <main>{children}</main>

        {selectedLocation && <Footer />}

        {/* Cart Drawer mounted globally */}
        <CartDrawer />
        
      </body>
    </html>
  );
}