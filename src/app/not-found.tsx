import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
        <Car className="h-8 w-8" />
      </div>
      <h1 className="text-6xl font-bold tracking-tight text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">This car took a wrong turn</h2>
      <p className="mt-3 text-muted-foreground max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or may have been removed. Let&apos;s get you back on the road.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/"><Home className="h-4 w-4 mr-1" /> Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cars-for-sale"><Search className="h-4 w-4 mr-1" /> Browse cars</Link>
        </Button>
      </div>
    </div>
  );
}
