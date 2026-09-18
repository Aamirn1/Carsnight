import Link from "next/link";
import { Car } from "lucide-react";

export function BrandMark({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="Cars Night home">
      <span className={`relative inline-flex ${dims} items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md`}>
        <Car className="h-1/2 w-1/2" />
      </span>
      <span className={`font-bold tracking-tight ${text} text-foreground`}>
        Cars<span className="text-primary">Night</span>
      </span>
    </Link>
  );
}
