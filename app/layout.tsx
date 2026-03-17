"use client";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { selectedLocation } = useLocationStore();
  const isFuelPage = pathname?.startsWith("/fuel");

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Sunshine Smoothies",
    url: "https://sunshinesmoothiesvallejo.com",
    image: "https://sunshinesmoothiesvallejo.com/logo.png",
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

  {/* Open Graph / Social Sharing */}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sunshinesmoothiesvallejo.com" />
  <meta property="og:title" content="Sunshine Smoothies | Fresh Smoothies & Juice Bar in Vallejo" />
  <meta property="og:description" content="Order fresh smoothies, juices, and fuel packs online from Sunshine Smoothies in Vallejo. Visit our Solano Avenue storefront or Waterfront drive-thru." />
  <meta property="og:image" content="https://sunshinesmoothiesvallejo.com/logo.png" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="Sunshine Smoothies" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Sunshine Smoothies | Fresh Smoothies & Juice Bar in Vallejo" />
  <meta name="twitter:description" content="Order fresh smoothies, juices, and fuel packs online from Sunshine Smoothies in Vallejo. Visit our Solano Avenue storefront or Waterfront drive-thru." />
  <meta name="twitter:image" content="https://sunshinesmoothiesvallejo.com/logo.png" />

  {/* Favicons & PWA */}
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />

  {/* Local Business SEO */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
</head>

      <body className="bg-white text-neutral-900 antialiased">
        <Header />

        <main>{children}</main>

        {!isFuelPage && <Footer />}

        {/* Mobile: Sticky floating cart button */}
        <CartFloatingButton />

        {/* Cart + Checkout Modal (modal shows in testing mode) */}
        <CartWithCheckoutModal />
      </body>
    </html>
  );
}