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
 * Cars Night brand mark: the gold car silhouette logo (frameless, transparent
 * background) + a brush-script "Cars Night" wordmark image (extracted and
 * recolored from the user's reference image).
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
  // Logo image dimensions (the source PNG is ~2.75:1 landscape).
  const logoHeight = size === "sm" ? "h-7" : size === "lg" ? "h-12" : "h-10";
  const logoWidth = size === "sm" ? "w-[77px]" : size === "lg" ? "w-[132px]" : "w-[110px]";

  // Wordmark image (683×168 → ~4:1 aspect). Fixed height, width scales.
  const wordmarkHeight = size === "sm" ? "h-6" : size === "lg" ? "h-11" : "h-9";
  const wordmarkWidth = size === "sm" ? "w-[97px]" : size === "lg" ? "w-[177px]" : "w-[145px]";

  const wordmarkSrc = light ? "/brand-wordmark-light.png" : "/brand-wordmark-dark.png";

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="Cars Night — home">
      {/* Frameless gold car silhouette logo (transparent background). */}
      <span className={`relative inline-flex ${logoHeight} ${logoWidth} items-center justify-center shrink-0`}>
        <Image
          src="/logo-mark.png"
          alt="Cars Night — luxury car marketplace"
          fill
          sizes="(max-width: 768px) 110px, 132px"
          className="object-contain"
          priority
        />
      </span>
      {/* Brush-script "Cars Night" wordmark (from the user's reference image).
          Two variants ensure it reads on both dark and light backgrounds. */}
      <span className={`relative inline-flex ${wordmarkHeight} ${wordmarkWidth} items-center justify-center shrink-0`}>
        <Image
          src={wordmarkSrc}
          alt="Cars Night"
          fill
          sizes="(max-width: 768px) 97px, 145px"
          className="object-contain"
          priority
        />
      </span>
    </Link>
  );
}
