import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { toPublicListing, type PublicListing } from "@/lib/constants";
import {
  buildBrowseClause,
  buildBrowseQuery,
  buildPageUrl,
  BROWSE_PAGE_SIZE,
} from "@/lib/listing-pages";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters } from "@/components/listing-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Car, ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buy — Buy Used & New Cars Worldwide | Cars Night",
  description:
    "Browse thousands of cars for sale worldwide. Filter by country, city, price, make, year, fuel, transmission, and more. Buy used and new cars securely with card or crypto on Cars Night.",
  alternates: { canonical: "/cars-for-sale" },
  openGraph: {
    title: "Buy — Buy Used & New Cars Worldwide | Cars Night",
    description:
      "Browse thousands of cars for sale worldwide. Filter by country, city, price, make, year, fuel, and more.",
    url: "/cars-for-sale",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const BASE_PATH = "/cars-for-sale";
const CATEGORY: "SALE" | "RENT" = "SALE";
const PRICE_MIN = 0;
const PRICE_MAX = 250_000;

export const dynamic = "force-dynamic";

export default async function CarsForSalePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = buildBrowseQuery(sp, CATEGORY);
  const { where, orderBy } = buildBrowseClause(q);
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? BROWSE_PAGE_SIZE;
  const skip = (page - 1) * pageSize;

  let items: any[] = [];
  let total = 0;
  try {
    [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      db.listing.count({ where }),
    ]);
  } catch {
    // DB not available — render with empty results.
  }

  const listings: PublicListing[] = items.map(toPublicListing);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://carsnight.example.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Buy",
        item: "https://carsnight.example.com/cars-for-sale",
      },
    ],
  };

  // JSON-LD: ItemList (current page only)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Buy",
    numberOfItems: total,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1 + (currentPage - 1) * pageSize,
      url: `https://carsnight.example.com/listing/${l.slug}`,
      name: l.title,
    })),
  };

  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Buy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Find the perfect car to buy
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl text-sm sm:text-base">
            Filter by country, price, make and more — browse verified cars for sale worldwide.
          </p>
        </div>
      </section>

      {/* Browse layout */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border bg-card p-5 shadow-sm">
              <ListingFilters category="SALE" priceMin={PRICE_MIN} priceMax={PRICE_MAX} />
            </div>
          </aside>

          {/* Mobile filters (collapsible) */}
          <div className="lg:hidden">
            <details className="group rounded-2xl border bg-card shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium text-sm select-none">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filters
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t px-4 py-4">
                <ListingFilters category="SALE" priceMin={PRICE_MIN} priceMax={PRICE_MAX} />
              </div>
            </details>
          </div>

          {/* Main */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{total.toLocaleString()}</strong> results
                {currentPage > 1 && (
                  <span>
                    {" "}
                    · Page <strong className="text-foreground">{currentPage}</strong>
                  </span>
                )}
              </p>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-2xl border bg-card p-10 sm:p-14 text-center">
                <SearchX className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h2 className="mt-4 text-lg font-semibold">No listings found</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting or clearing your filters and search query.
                </p>
                <Button asChild variant="outline" className="mt-5">
                  <Link href={BASE_PATH}>Reset filters</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((l, i) => (
                    <ListingCard key={l.id} listing={l} priority={i < 4} />
                  ))}
                </div>

                {/* Pagination */}
                <nav
                  className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
                  aria-label="Pagination"
                >
                  {currentPage <= 1 ? (
                    <Button variant="outline" disabled>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link
                        href={buildPageUrl(BASE_PATH, sp, currentPage - 1)}
                        rel="prev"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Link>
                    </Button>
                  )}

                  <p className="text-sm text-muted-foreground text-center">
                    Page <strong className="text-foreground">{currentPage}</strong> of {totalPages}
                    {" · "}
                    {total.toLocaleString()} results
                  </p>

                  {currentPage >= totalPages ? (
                    <Button variant="outline" disabled>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link
                        href={buildPageUrl(BASE_PATH, sp, currentPage + 1)}
                        rel="next"
                        aria-label="Next page"
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </nav>
              </>
            )}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}
