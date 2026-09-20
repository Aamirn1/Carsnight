import Link from "next/link";
import Image from "next/image";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** When true, renders the wordmark in white (for dark/hero backgrounds). */
  light?: boolean;
}

/**
 * Cars Night brand mark: the gold car silhouette logo (frameless, transparent
 * background) + a stylish wordmark using the Outfit font.
 *
 * The logo is displayed LARGER than the previous emblem so the car silhouette
 * is clearly visible — especially over the dark cinematic hero where the
 * navbar is transparent.
 */
export function BrandMark({ className = "", size = "md", light = false }: BrandMarkProps) {
  // Logo image dimensions (the source PNG is 1647×600 → ~2.75:1 landscape).
  // We use a fixed-height slot and let the width scale with the image aspect.
  const logoHeight = size === "sm" ? "h-7" : size === "lg" ? "h-12" : "h-10";
  const logoWidth = size === "sm" ? "w-[77px]" : size === "lg" ? "w-[132px]" : "w-[110px]";
  const text = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";
  const tracking = "tracking-tight";

  const textColor = light ? "text-white" : "text-foreground";

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="Cars Night — home">
      {/* Frameless gold car silhouette logo (transparent background).
          Larger than before so the car is clearly visible. */}
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
      {/* Stylish wordmark using Outfit (luxury geometric sans). */}
      <span
        className={`font-[family-name:var(--font-outfit)] font-bold ${tracking} ${text} ${textColor} leading-none`}
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
      >
        Cars
        <span className="text-primary">Night</span>
      </span>
    </Link>
  );
}
