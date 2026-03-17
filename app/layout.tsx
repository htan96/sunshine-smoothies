"use client";

import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});
import Footer from "@/components/layout/Footer";
import CartWithCheckoutModal from "@/components/cart/CartWithCheckoutModal";
import CartFloatingButton from "@/components/cart/CartFloatingButton";
import { useLocationStore } from "@/features/location/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedLocation } = useLocationStore();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Local Business",
    name: "Sunshine Smoothies",
    url: "https://sunshinesmoothiesvallejo.com",
    logo: "https://sunshinesmoothiesvallejo.com/logo.png",
    sameAs: [
          "https://www.instagram.com/sunshinesmoothiesandcoffee/",
          "https://www.yelp.com/biz/sunshine-smoothies-and-coffee-vallejo-2",
          "https://www.yelp.com/biz/sunshine-smoothies-and-coffee-vallejo"
    ],
    department: [
      {
        "@type": "JuiceShop",
        name: "Sunshine Smoothies – Solano Ave",
        address: {
          "@type": "PostalAddress",
          streetAddress: "2089 Solano Ave",
          addressLocality: "Vallejo",
          addressRegion: "CA",
          postalCode: "94590",
          addressCountry: "US"
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          opens: "08:30",
          closes: "17:30"
        }
      },
      {
        "@type": "JuiceShop",
        name: "Sunshine Smoothies – Waterfront Drive-Thru",
        address: {
          "@type": "PostalAddress",
          streetAddress: "821 Wilson Ave",
          addressLocality: "Vallejo",
          addressRegion: "CA",
          postalCode: "94590",
          addressCountry: "US"
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            opens: "07:00",
            closes: "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Saturday",
              "Sunday"
            ],
            opens: "08:00",
            closes: "17:00"
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <head>
  <title>Sunshine Smoothies | Fresh Smoothies & Juice Bar in Vallejo</title>

  <meta
    name="description"
    content="Order fresh smoothies, juices, and fuel packs online from Sunshine Smoothies in Vallejo. Visit our Solano Avenue storefront or Waterfront drive-thru."
  />

  {/* Favicons */}
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  {/* Local Business SEO */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
</head>

      <body className="bg-white text-neutral-900 antialiased">
        <Header />

        <main>{children}</main>

        <Footer />

        {/* Mobile: Sticky floating cart button */}
        <CartFloatingButton />

        {/* Cart + Checkout Modal (modal shows in testing mode) */}
        <CartWithCheckoutModal />
      </body>
    </html>
  );
}