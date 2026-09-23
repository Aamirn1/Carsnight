import Link from "next/link";
import Image from "next/image";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** When true, uses the light wordmark (white "Cars" + gold "Night") for
      dark backgrounds like the cinematic hero. When false, uses the dark
      wordmark (dark "Cars" + gold "Night") for light backgrounds. */
  light?: boolean;
}

/**
 * Cars Night brand mark: the brush-script "Cars Night" wordmark image
 * (extracted and recolored from the user's reference image).
 *
 * The wordmark comes in two variants:
 *  - `brand-wordmark-light.png` — white "Cars" + gold "Night" (for dark/hero bg)
 *  - `brand-wordmark-dark.png`  — dark "Cars" + gold "Night" (for light navbar bg)
 *
 * The `light` prop selects which variant to show, so the wordmark always reads
 * correctly against the navbar's current background (transparent over hero vs
 * solid on inner pages).
 */
export function BrandMark({ className = "", size = "md", light = false }: BrandMarkProps) {
  // Wordmark image is 366×148 → aspect ~2.47:1. Slot dimensions match this
  // aspect so object-contain fills the slot without leaving empty space.
  // Height is the controlling dimension; width = height × 2.47.
  const wordmarkHeight = size === "sm" ? "h-9" : size === "lg" ? "h-16" : "h-12";
  const wordmarkWidth = size === "sm" ? "w-[88px]" : size === "lg" ? "w-[158px]" : "w-[118px]";

  const wordmarkSrc = light ? "/brand-wordmark-light.png" : "/brand-wordmark-dark.png";

  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label="Cars Night — home">
      {/* Brush-script "Cars Night" wordmark (from the user's reference image).
          Two variants ensure it reads on both dark and light backgrounds.
          The translate-y-[2px] nudge compensates for the brush script's tall
          ascenders which make the wordmark appear slightly above center. */}
      <span className={`relative inline-flex ${wordmarkHeight} ${wordmarkWidth} items-center justify-center shrink-0 translate-y-[4px]`}>
        <Image
          src={wordmarkSrc}
          alt="Cars Night — luxury car marketplace"
          fill
          sizes="(max-width: 768px) 88px, 118px"
          className="object-contain"
          priority
        />
      </span>
    </Link>
  );
}
