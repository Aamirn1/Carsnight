import "@/lib/env-setup"; // Must be first — sets NEXTAUTH_URL fallback before next-auth loads
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollToTop } from "@/components/scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Stylish display font for the brand wordmark (luxury feel)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Refined serif for occasional elegant accents
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://carsnight.example.com"),
  title: {
    default: "Cars Night — Your Global Car Marketplace | Buy, Sell & Rent Cars",
    template: "%s | Cars Night",
  },
  description:
    "Cars Night is a global car marketplace to buy, sell, and rent vehicles. Post up to 2 free ads, list cars for sale or rent, and pay with credit card or crypto (BTC, ETH, USDT).",
  keywords: [
    "buy car online", "sell my car", "rent a car", "used cars for sale",
    "car marketplace", "rent sports car", "Tesla for sale", "Porsche for sale",
    "luxury car rental", "cars night",
  ],
  authors: [{ name: "Cars Night" }],
  creator: "Cars Night",
  applicationName: "Cars Night",
  icons: {
    icon: [
      { url: "/favicon-64.png", type: "image/png", sizes: "64x64" },
      { url: "/logo-mark.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://carsnight.example.com",
    siteName: "Cars Night",
    title: "Cars Night — Your Global Car Marketplace",
    description: "Buy, sell, and rent cars worldwide. 2 free listings, crypto payments, secure & SEO-optimized.",
    images: [
      { url: "/logo-full.png", width: 600, height: 300, alt: "Cars Night logo" },
      { url: "/hero-bg.png", width: 1344, height: 768, alt: "Cars Night marketplace" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cars Night — Your Global Car Marketplace",
    description: "Buy, sell, and rent cars worldwide. 2 free listings, crypto payments, secure & SEO-optimized.",
    images: ["/hero-bg.png"],
  },
  manifest: undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  category: "auto",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${playfair.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Providers>
          <ScrollToTop />
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
