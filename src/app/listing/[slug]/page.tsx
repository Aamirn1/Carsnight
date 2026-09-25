import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  toPublicListing,
  formatPrice,
  formatPeriod,
  timeAgo,
  type PublicListing,
} from "@/lib/constants";
import { ListingGallery } from "@/components/listing-gallery";
import { ContactSellerDialog } from "@/components/contact-seller-dialog";
import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  Car,
  Eye,
  Crown,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// Listing detail pages are dynamic (per-request) so views counter increments on each visit.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getListing(slug: string) {
  try {
    return await db.listing.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  } catch {
    return null;
  }
}

const SITE_BASE = "https://carsnight1.vercel.app";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing || listing.status !== "APPROVED") {
    return { title: "Listing not found" };
  }
  const pub = toPublicListing(listing);
  const isRent = pub.category === "RENT";
  const description =
    (listing.description || "").slice(0, 160) ||
    `${listing.title} for ${isRent ? "rent" : "sale"} in ${listing.city}, ${listing.country}.`;
  const image = pub.images[0] || "/cars/porsche-red.png";
  const absoluteTitle = `${listing.title} in ${listing.city} — Cars Night`;

  return {
    title: { absolute: absoluteTitle },
    description,
    alternates: { canonical: `/listing/${listing.slug}` },
    openGraph: {
      type: isRent ? "website" : "article",
      title: absoluteTitle,
      description,
      url: `/listing/${listing.slug}`,
      siteName: "Cars Night",
      images: [{ url: image, width: 1200, height: 900, alt: listing.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: [image],
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing || listing.status !== "APPROVED") notFound();

  // Best-effort views increment (fire and forget, ignore errors)
  db.listing
    .update({
      where: { id: listing.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => null);

  const pub: PublicListing = toPublicListing(listing);
  const isRent = pub.category === "RENT";
  const sellerName = pub.user?.name || "Cars Night Seller";
  const categoryPath = isRent ? "/cars-for-rent" : "/cars-for-sale";
  const categoryLabel = isRent ? "Rent" : "Buy";

  // Related listings: same category, prioritize same country, exclude self.
  let relatedRaw: any[] = [];
  try {
    relatedRaw = await db.listing.findMany({
      where: {
        status: "APPROVED",
        category: pub.category,
        id: { not: pub.id },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  } catch {
    // DB not available — no related listings.
  }
  const sameCountry = relatedRaw.filter((l) => l.country === pub.country);
  const others = relatedRaw.filter((l) => l.country !== pub.country);
  const related: PublicListing[] = [...sameCountry, ...others]
    .slice(0, 4)
    .map(toPublicListing);

  // Attribute grid
  const attributes: { label: string; value: string; icon: typeof Calendar }[] = [];
  if (pub.year) attributes.push({ label: "Year", value: String(pub.year), icon: Calendar });
  if (pub.mileage != null)
    attributes.push({
      label: "Mileage",
      value: `${pub.mileage.toLocaleString()} mi`,
      icon: Gauge,
    });
  if (pub.fuelType) attributes.push({ label: "Fuel", value: pub.fuelType, icon: Fuel });
  if (pub.transmission)
    attributes.push({ label: "Transmission", value: pub.transmission, icon: Settings2 });
  if (pub.bodyType) attributes.push({ label: "Body type", value: pub.bodyType, icon: Car });
  if (pub.color) attributes.push({ label: "Color", value: pub.color, icon: Palette });

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_BASE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `${SITE_BASE}${categoryPath}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pub.title,
        item: `${SITE_BASE}/listing/${pub.slug}`,
      },
    ],
  };

  // JSON-LD: Vehicle schema
  const vehicleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: pub.title,
    image: pub.images.length > 0 ? pub.images : ["/cars/porsche-red.png"],
    brand: { "@type": "Brand", name: pub.make },
    model: pub.model,
    vehicleConfiguration: pub.bodyType ?? undefined,
    fuelType: pub.fuelType ?? undefined,
    vehicleTransmission: pub.transmission ?? undefined,
    mileageFromOdometer:
      pub.mileage != null
        ? { "@type": "QuantitativeValue", value: pub.mileage, unitText: "mi" }
        : undefined,
    url: `${SITE_BASE}/listing/${pub.slug}`,
    offers: {
      "@type": "Offer",
      price: pub.price,
      priceCurrency: pub.currency,
      availability: "https://schema.org/InStock",
      url: `${SITE_BASE}/listing/${pub.slug}`,
    },
  };

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={categoryPath}>{categoryLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[60vw] sm:max-w-md">
                {pub.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main detail */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10">
          {/* Left: gallery */}
          <div className="space-y-4">
            <ListingGallery
              images={pub.images}
              alt={`${[pub.color, pub.make, pub.model].filter(Boolean).join(" ")} for ${
                isRent ? "rent" : "sale"
              } in ${pub.city}`}
              title={pub.title}
            />

            {/* Description below gallery on desktop too */}
            <div className="lg:hidden">
              <Card className="p-4 gap-3">
                <h2 className="text-lg font-semibold">About this {isRent ? "rental" : "car"}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {pub.description}
                </p>
              </Card>
            </div>
          </div>

          {/* Right: details panel */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    isRent
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }
                >
                  {isRent ? "For Rent" : "For Sale"}
                </Badge>
                {pub.featured && (
                  <Badge className="bg-primary/10 text-primary border border-primary/30">
                    <Crown className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{pub.title}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {pub.city}, {pub.country}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> {pub.views.toLocaleString()} views
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-2xl border bg-primary/5 p-4">
              <div className="text-3xl font-bold text-primary leading-tight">
                {formatPrice(pub.price, pub.currency)}
                {isRent && (
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    {formatPeriod(pub.rentalPeriod)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isRent
                  ? `Rental price${
                      pub.rentalPeriod ? ` per ${pub.rentalPeriod}` : ""
                    }. Contact seller for availability.`
                  : "Listing price. Contact seller for offers & financing options."}
              </p>
            </div>

            {/* Attributes grid */}
            {attributes.length > 0 && (
              <Card className="p-4 gap-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Specifications
                </h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {attributes.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <a.icon className="h-4 w-4 text-primary shrink-0" />
                      <dt className="text-muted-foreground">{a.label}:</dt>
                      <dd className="font-medium text-foreground">{a.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            )}

            {/* Seller card */}
            <Card className="p-4 gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-semibold">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Seller</div>
                    <div className="font-semibold leading-tight">{sellerName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Posted {timeAgo(pub.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <ContactSellerDialog sellerName={sellerName} listingTitle={pub.title} />
            </Card>

            {/* Description (desktop) */}
            <div className="hidden lg:block">
              <Separator className="mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                About this {isRent ? "rental" : "car"}
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {pub.description}
              </p>
            </div>
          </div>
        </div>

        {/* Related listings */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                  You may also like
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Related {isRent ? "rentals" : "listings"}
                </h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={categoryPath}>
                  View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 4} />
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}
      />
    </div>
  );
}
