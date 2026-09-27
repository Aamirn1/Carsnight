/**
 * AI Search Tools — server-side listing search functions for the Cars Night AI Assistant.
 *
 * These functions query the live Supabase (or local Prisma fallback) database for
 * APPROVED listings only. They return sanitized PublicListing objects (no private
 * seller email). The AI assistant calls these via the /api/ai/chat endpoint.
 *
 * CRITICAL: never invent listings. Every listing returned here must come from the DB.
 */
import { getSupabase, hasSupabase } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { parseImages, type PublicListing } from "@/lib/constants";
import { sbListingToPublic, type SbListing } from "@/lib/sb";

export interface SearchCarsParams {
  listingType?: "SALE" | "RENT" | "ANY";
  minPrice?: number | null;
  maxPrice?: number | null;
  make?: string | null;
  model?: string | null;
  yearMin?: number | null;
  yearMax?: number | null;
  transmission?: string | null;
  fuelType?: string | null;
  city?: string | null;
  country?: string | null;
  mileageMax?: number | null;
  bodyType?: string | null;
  limit?: number | null;
}

export interface SearchRentalsParams {
  minDailyPrice?: number | null;
  maxDailyPrice?: number | null;
  make?: string | null;
  model?: string | null;
  city?: string | null;
  country?: string | null;
  limit?: number | null;
}

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 10;

function sanitizeLimit(n: number | null | undefined): number {
  if (!n || !Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(n));
}

function toPublic(l: SbListing | any): PublicListing {
  // sbListingToPublic already returns PublicListing; for Prisma rows we go through toPublicListing
  // but to keep imports simple we do a minimal conversion here.
  return sbListingToPublic(l as SbListing);
}

/**
 * Search approved Cars Night listings. Used for both SALE and RENT (controlled by
 * listingType). Returns PublicListing[] sorted by featured desc, then createdAt desc.
 */
export async function searchCars(params: SearchCarsParams): Promise<PublicListing[]> {
  const limit = sanitizeLimit(params.limit);
  const listingType = params.listingType ?? "ANY";

  if (hasSupabase()) {
    const sb = getSupabase();
    let q = sb
      .from("Listing")
      .select("*, User:userId(id,name,email)")
      .eq("status", "APPROVED");
    if (listingType === "SALE") q = q.eq("category", "SALE");
    else if (listingType === "RENT") q = q.eq("category", "RENT");
    if (params.minPrice != null && Number.isFinite(params.minPrice)) q = q.gte("price", params.minPrice);
    if (params.maxPrice != null && Number.isFinite(params.maxPrice)) q = q.lte("price", params.maxPrice);
    if (params.make) q = q.ilike("make", `%${params.make}%`);
    if (params.model) q = q.ilike("model", `%${params.model}%`);
    if (params.yearMin != null) q = q.gte("year", params.yearMin);
    if (params.yearMax != null) q = q.lte("year", params.yearMax);
    if (params.transmission) q = q.ilike("transmission", params.transmission);
    if (params.fuelType) q = q.ilike("fuelType", params.fuelType);
    if (params.bodyType) q = q.ilike("bodyType", params.bodyType);
    if (params.city) q = q.ilike("city", params.city);
    if (params.country) q = q.ilike("country", params.country);
    if (params.mileageMax != null) q = q.lte("mileage", params.mileageMax);
    q = q.order("featured", { ascending: false }).order("createdAt", { ascending: false }).limit(limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as SbListing[]).map(toPublic);
  }

  // Prisma fallback (local dev)
  const where: any = { status: "APPROVED" };
  if (listingType === "SALE" || listingType === "RENT") where.category = listingType;
  if (params.minPrice != null) where.price = { ...where.price, gte: params.minPrice };
  if (params.maxPrice != null) where.price = { ...where.price, lte: params.maxPrice };
  if (params.make) where.make = { contains: params.make };
  if (params.model) where.model = { contains: params.model };
  if (params.yearMin != null || params.yearMax != null) {
    where.year = {};
    if (params.yearMin != null) where.year.gte = params.yearMin;
    if (params.yearMax != null) where.year.lte = params.yearMax;
  }
  if (params.transmission) where.transmission = params.transmission;
  if (params.fuelType) where.fuelType = params.fuelType;
  if (params.bodyType) where.bodyType = params.bodyType;
  if (params.city) where.city = { contains: params.city };
  if (params.country) where.country = { contains: params.country };
  if (params.mileageMax != null) where.mileage = { lte: params.mileageMax };

  const items = await db.listing.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return items.map((l: any) => ({
    id: l.id, title: l.title, description: l.description, category: l.category,
    price: l.price, currency: l.currency, make: l.make, model: l.model,
    year: l.year ?? null, mileage: l.mileage ?? null, fuelType: l.fuelType ?? null,
    transmission: l.transmission ?? null, bodyType: l.bodyType ?? null, color: l.color ?? null,
    country: l.country, city: l.city, rentalPeriod: l.rentalPeriod ?? null,
    images: parseImages(l.images), status: l.status, paidType: l.paidType, featured: l.featured,
    slug: l.slug, views: l.views,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
    user: l.user ? { id: l.user.id, name: l.user.name, email: l.user.email } : null,
  }));
}

/**
 * Search rental listings only (category = RENT) with optional daily/weekly/monthly price range.
 */
export async function searchRentals(params: SearchRentalsParams): Promise<PublicListing[]> {
  return searchCars({
    listingType: "RENT",
    minPrice: params.minDailyPrice,
    maxPrice: params.maxDailyPrice,
    make: params.make,
    model: params.model,
    city: params.city,
    country: params.country,
    limit: params.limit,
  });
}

/**
 * Fetch a single approved listing by id OR slug. Returns null if not found or not approved.
 */
export async function getCarListing(idOrSlug: string): Promise<PublicListing | null> {
  if (!idOrSlug) return null;
  if (hasSupabase()) {
    const sb = getSupabase();
    // try by id first, then by slug
    const byId = await sb.from("Listing").select("*, User:userId(id,name,email)").eq("id", idOrSlug).eq("status", "APPROVED").limit(1);
    if (byId.data && byId.data.length > 0) return toPublic(byId.data[0]);
    const bySlug = await sb.from("Listing").select("*, User:userId(id,name,email)").eq("slug", idOrSlug).eq("status", "APPROVED").limit(1);
    if (bySlug.data && bySlug.data.length > 0) return toPublic(bySlug.data[0]);
    return null;
  }
  const existing = await db.listing.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: "APPROVED" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!existing) return null;
  return {
    id: existing.id, title: existing.title, description: existing.description, category: existing.category,
    price: existing.price, currency: existing.currency, make: existing.make, model: existing.model,
    year: existing.year ?? null, mileage: existing.mileage ?? null, fuelType: existing.fuelType ?? null,
    transmission: existing.transmission ?? null, bodyType: existing.bodyType ?? null, color: existing.color ?? null,
    country: existing.country, city: existing.city, rentalPeriod: existing.rentalPeriod ?? null,
    images: parseImages(existing.images), status: existing.status, paidType: existing.paidType, featured: existing.featured,
    slug: existing.slug, views: existing.views,
    createdAt: existing.createdAt instanceof Date ? existing.createdAt.toISOString() : existing.createdAt,
    updatedAt: existing.updatedAt instanceof Date ? existing.updatedAt.toISOString() : existing.updatedAt,
    user: existing.user ? { id: existing.user.id, name: existing.user.name, email: existing.user.email } : null,
  };
}

/**
 * Fetch multiple approved listings by id (for comparison). Returns up to 4 listings.
 */
export async function compareListings(ids: string[]): Promise<PublicListing[]> {
  const unique = Array.from(new Set((ids || []).filter(Boolean))).slice(0, 4);
  if (unique.length === 0) return [];
  if (hasSupabase()) {
    const sb = getSupabase();
    const { data } = await sb.from("Listing").select("*, User:userId(id,name,email)").in("id", unique).eq("status", "APPROVED");
    if (!data) return [];
    // preserve the order of `unique`
    const map = new Map<string, PublicListing>();
    for (const l of data as SbListing[]) map.set(l.id, toPublic(l));
    return unique.map((id) => map.get(id)).filter(Boolean) as PublicListing[];
  }
  const items = await db.listing.findMany({
    where: { id: { in: unique }, status: "APPROVED" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  const map = new Map<string, PublicListing>();
  for (const l of items) {
    map.set(l.id, {
      id: l.id, title: l.title, description: l.description, category: l.category,
      price: l.price, currency: l.currency, make: l.make, model: l.model,
      year: l.year ?? null, mileage: l.mileage ?? null, fuelType: l.fuelType ?? null,
      transmission: l.transmission ?? null, bodyType: l.bodyType ?? null, color: l.color ?? null,
      country: l.country, city: l.city, rentalPeriod: l.rentalPeriod ?? null,
      images: parseImages(l.images), status: l.status, paidType: l.paidType, featured: l.featured,
      slug: l.slug, views: l.views,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
      updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
      user: l.user ? { id: l.user.id, name: l.user.name, email: l.user.email } : null,
    });
  }
  return unique.map((id) => map.get(id)).filter(Boolean) as PublicListing[];
}

/**
 * Strip private seller email from a listing before sending to the AI / client.
 * The AI assistant only sees the seller's display name (when present).
 */
export function publicListingForAI(l: PublicListing) {
  return {
    id: l.id,
    title: l.title,
    category: l.category,
    price: l.price,
    currency: l.currency,
    make: l.make,
    model: l.model,
    year: l.year,
    mileage: l.mileage,
    fuelType: l.fuelType,
    transmission: l.transmission,
    bodyType: l.bodyType,
    color: l.color,
    country: l.country,
    city: l.city,
    rentalPeriod: l.rentalPeriod,
    featured: l.featured,
    slug: l.slug,
    views: l.views,
    imageUrl: l.images?.[0] || null,
    sellerName: l.user?.name || null,
    url: `/listing/${l.slug || l.id}`,
  };
}
