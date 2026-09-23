"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Car, Mail, Shield, Globe, Bitcoin } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

// Mount-detection helper (no set-state-in-effect)
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SiteFooter() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <BrandMark size="sm" light={isDark} />
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Your global car marketplace — buy, sell, and rent cars worldwide with confidence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cars-for-sale" className="hover:text-primary transition-colors">Buy</Link></li>
              <li><Link href="/cars-for-rent" className="hover:text-primary transition-colors">Rent</Link></li>
              <li><Link href="/post-ad" className="hover:text-primary transition-colors">Post an Ad</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Plans</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Payments</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" /> Secure checkout</li>
              <li className="flex items-center gap-2"><Bitcoin className="h-3.5 w-3.5 text-primary" /> Crypto accepted (BTC, ETH, USDT)</li>
              <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-primary" /> 20+ countries supported</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> support@carsnight.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground">
          <p>© {year} Cars Night. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Car className="h-3.5 w-3.5 text-primary" />
            <span>Built with care for car lovers everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
