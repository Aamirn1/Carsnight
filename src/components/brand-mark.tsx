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
  // Wordmark image (683×168 → ~4:1 aspect). Fixed height, width scales.
  // Sizes are a bit larger now that the wordmark is the sole brand element
  // (no car icon beside it).
  const wordmarkHeight = size === "sm" ? "h-7" : size === "lg" ? "h-14" : "h-11";
  const wordmarkWidth = size === "sm" ? "w-[113px]" : size === "lg" ? "w-[226px]" : "w-[178px]";

  const wordmarkSrc = light ? "/brand-wordmark-light.png" : "/brand-wordmark-dark.png";

  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label="Cars Night — home">
      {/* Brush-script "Cars Night" wordmark (from the user's reference image).
          Two variants ensure it reads on both dark and light backgrounds. */}
      <span className={`relative inline-flex ${wordmarkHeight} ${wordmarkWidth} items-center justify-center shrink-0`}>
        <Image
          src={wordmarkSrc}
          alt="Cars Night — luxury car marketplace"
          fill
          sizes="(max-width: 768px) 113px, 178px"
          className="object-contain"
          priority
        />
      </span>
    </Link>
  );
}
