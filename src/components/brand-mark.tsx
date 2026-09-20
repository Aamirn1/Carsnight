import Link from "next/link";
import Image from "next/image";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Cars Night brand mark: a gold-on-black emblem logo + a stylish wordmark
 * using the Outfit font (loaded via next/font in the root layout).
 */
export function BrandMark({ className = "", size = "md" }: BrandMarkProps) {
  const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-14 w-14" : "h-10 w-10";
  const text = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";
  const tracking = size === "lg" ? "tracking-tight" : "tracking-tight";

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Cars Night — home">
      {/* Gold-on-black emblem logo */}
      <span
        className={`relative inline-flex ${dims} items-center justify-center rounded-xl overflow-hidden shadow-md ring-1 ring-black/5 shrink-0`}
      >
        <Image
          src="/logo-mark.png"
          alt="Cars Night emblem"
          fill
          sizes="(max-width: 768px) 40px, 56px"
          className="object-cover"
          priority
        />
      </span>
      {/* Stylish wordmark using Outfit (luxury geometric sans) */}
      <span
        className={`font-[family-name:var(--font-outfit)] font-bold ${tracking} ${text} text-foreground leading-none`}
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
      >
        Cars
        <span className="text-primary">Night</span>
      </span>
    </Link>
  );
}
