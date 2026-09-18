import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  FUEL_TYPES,
  MAX_IMAGES,
  parseImages,
  sanitize,
  toPublicListing,
  BODY_TYPES,
  COUNTRIES,
  citiesOf,
  CATEGORIES,
  TRANSMISSIONS,
} from "@/lib/constants";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

interface RouteCtx { params: Promise<{ id: string }> }

// GET /api/listings/[id] - get single listing by id (or slug)
export async function GET(req: Request, ctx: RouteCtx) {
  const key = `listing-get:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const { id } = await ctx.params;
  const listing = await db.listing.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  // Only show approved to public, drafts/rejected only to owner/admin
  const viewer = await getSessionUser();
  if (listing.status !== "APPROVED" && viewer?.id !== listing.userId && viewer?.role !== "ADMIN") {
    return NextResponse.json({ error: "Listing not available." }, { status: 404 });
  }
  // Increment views (best-effort, non-blocking)
  db.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } }).catch(() => null);
  return NextResponse.json({ listing: toPublicListing(listing) });
}

// PUT /api/listings/[id] - update own listing
export async function PUT(req: Request, ctx: RouteCtx) {
  const key = `listing-edit:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.listingCreate, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await db.listing.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (existing.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const title = sanitize(body.title ?? existing.title, 120);
  const description = sanitize(body.description ?? existing.description, 4000);
  const category = body.category ?? existing.category;
  const price = body.price != null ? Number(body.price) : existing.price;
  const make = sanitize(body.make ?? existing.make, 60);
  const model = sanitize(body.model ?? existing.model, 60);
  const year = body.year != null ? Number(body.year) : existing.year;
  const mileage = body.mileage != null ? Number(body.mileage) : existing.mileage;
  const fuelType = body.fuelType ?? existing.fuelType;
  const transmission = body.transmission ?? existing.transmission;
  const bodyType = body.bodyType ?? existing.bodyType;
  const color = sanitize(body.color ?? existing.color ?? "", 30);
  const country = sanitize(body.country ?? existing.country, 60);
  const city = sanitize(body.city ?? existing.city, 60);
  const rentalPeriod = body.rentalPeriod ?? existing.rentalPeriod;
  let images: string[] = Array.isArray(body.images) ? body.images.filter((s: any) => typeof s === "string").slice(0, MAX_IMAGES) : parseImages(existing.images);

  // Re-validate
  if (title.length < 5) return NextResponse.json({ error: "Title too short." }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ error: "Description too short." }, { status: 400 });
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Invalid price." }, { status: 400 });
  if (fuelType && !FUEL_TYPES.includes(fuelType)) return NextResponse.json({ error: "Invalid fuel type." }, { status: 400 });
  if (transmission && !TRANSMISSIONS.includes(transmission)) return NextResponse.json({ error: "Invalid transmission." }, { status: 400 });
  if (bodyType && !BODY_TYPES.includes(bodyType)) return NextResponse.json({ error: "Invalid body type." }, { status: 400 });
  if (!COUNTRIES.includes(country)) return NextResponse.json({ error: "Invalid country." }, { status: 400 });
  if (!citiesOf(country).includes(city)) return NextResponse.json({ error: "Invalid city for selected country." }, { status: 400 });
  images = images.filter((u) => u.startsWith("/uploads/") || u.startsWith("/cars/") || u.startsWith("data:image/"));
  if (images.length === 0) return NextResponse.json({ error: "At least one image required." }, { status: 400 });

  const updated = await db.listing.update({
    where: { id },
    data: {
      title, description, category, price,
      make, model,
      year: year && Number.isFinite(year) ? year : null,
      mileage: mileage != null && Number.isFinite(mileage) ? mileage : null,
      fuelType, transmission, bodyType,
      color: color || null, country, city,
      rentalPeriod: category === "RENT" ? rentalPeriod : null,
      images: JSON.stringify(images),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  await db.auditLog.create({ data: { userId: user.id, action: "LISTING_EDIT", details: updated.title } }).catch(() => null);
  return NextResponse.json({ listing: toPublicListing(updated) });
}

// DELETE /api/listings/[id] - delete own listing
export async function DELETE(req: Request, ctx: RouteCtx) {
  const key = `listing-delete:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.listingCreate, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await db.listing.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (existing.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  await db.listing.delete({ where: { id } });
  await db.auditLog.create({ data: { userId: user.id, action: "LISTING_DELETE", details: existing.title } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
