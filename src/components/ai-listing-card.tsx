"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Gauge, Fuel, Settings2, Calendar, ArrowRight } from "lucide-react";

// Shape returned by /api/ai/chat (publicListingForAI in src/lib/ai-tools.ts)
export interface AIListing {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  make: string;
  model: string;
  year: number | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  bodyType: string | null;
  color: string | null;
  country: string;
  city: string;
  rentalPeriod: string | null;
  featured: boolean;
  slug: string;
  views: number;
  imageUrl: string | null;
  sellerName: string | null;
  url: string;
}

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency || ""} ${price.toLocaleString()}`;
  }
}

function formatPeriod(p?: string | null) {
  if (!p) return "";
  if (p === "day") return "/day";
  if (p === "week") return "/week";
  if (p === "month") return "/month";
  return `/${p}`;
}

export function AIListingCard({ listing }: { listing: AIListing }) {
  const isRent = listing.category === "RENT";
  const href = listing.url || `/listing/${listing.slug || listing.id}`;
  const img = listing.imageUrl || "/cars/porsche-red.png";

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-fuchsia-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0b0b14]">
        <Image
          src={img}
          alt={listing.title}
          fill
          sizes="(max-width: 480px) 100vw, 360px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-white border border-white/10">
            {isRent ? "For Rent" : "For Sale"}
          </span>
          {listing.featured && (
            <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00A8FF] via-[#8B5CF6] to-[#D946EF] text-white">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-white/95 line-clamp-1 group-hover:text-white">
            {listing.title}
          </h4>
          <p className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-fuchsia-400/80 shrink-0" />
            <span className="line-clamp-1">{listing.city}, {listing.country}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[10px] text-white/60">
          {listing.year != null && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {listing.year}
            </span>
          )}
          {listing.mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" /> {listing.mileage.toLocaleString()} mi
            </span>
          )}
          {listing.fuelType && (
            <span className="flex items-center gap-1">
              <Fuel className="h-3 w-3" /> {listing.fuelType}
            </span>
          )}
          {listing.transmission && (
            <span className="flex items-center gap-1">
              <Settings2 className="h-3 w-3" /> {listing.transmission}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-base font-bold bg-gradient-to-r from-[#00A8FF] via-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
              {formatPrice(listing.price, listing.currency)}
            </div>
            {isRent && (
              <div className="text-[10px] text-white/40">{formatPeriod(listing.rentalPeriod)}</div>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/80 group-hover:text-white">
            View
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
