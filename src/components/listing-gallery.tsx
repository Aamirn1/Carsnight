"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
  title: string;
}

/**
 * Image gallery for the listing detail page. Main image is large (4/3 aspect),
 * with a row of thumbnail buttons below to switch the active image.
 * Falls back to a placeholder image when the listing has no images.
 */
export function ListingGallery({ images, alt, title }: Props) {
  const safeImages = images && images.length > 0 ? images : ["/cars/porsche-red.png"];
  const [active, setActive] = useState(0);
  const current = safeImages[active] ?? safeImages[0];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-sm">
        <Image
          key={current}
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover transition-opacity duration-300"
        />
        {safeImages.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            {active + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${safeImages.length}`}
              aria-pressed={active === i}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all",
                active === i
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-muted-foreground/40",
              )}
            >
              <Image
                src={img}
                alt={`${title} — image ${i + 1}`}
                fill
                sizes="120px"
                className={cn(
                  "object-cover transition-transform duration-300",
                  active === i ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Backwards-compat alias for the spec naming
export const Gallery = ListingGallery;
