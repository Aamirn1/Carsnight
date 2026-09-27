import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, getUserQuota, FREE_SALE_LIMIT, FREE_RENT_LIMIT } from "@/lib/session";
import { hasSupabase, getSupabase } from "@/lib/supabase-server";
import {
  buildOrderBy,
  buildWhere,
  FUEL_TYPES,
  MAX_IMAGES,
  parseListingQuery,
  parseImages,
  sanitize,
  slugify,
  toPublicListing,
  BODY_TYPES,
  COUNTRIES,
  citiesOf,
  CATEGORIES,
  TRANSMISSIONS,
} from "@/lib/constants";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/listings - list listings with filters
export async function GET(req: Request) {
  const key = `listings:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const url = new URL(req.url);
  const q = parseListingQuery(url.searchParams);

  const where = buildWhere(q, { approvedOnly: true });
  const orderBy = buildOrderBy(q);
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, q.pageSize ?? 12));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.listing.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map(toPublicListing),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/listings - create new listing (requires auth)
export async function POST(req: Request) {
  const key = `listing-create:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.listingCreate, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to post an ad." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate inputs
  const title = sanitize(body.title, 120);
  const description = sanitize(body.description, 4000);
  const category = body.category;
  const price = Number(body.price);
  const make = sanitize(body.make, 60);
  const model = sanitize(body.model, 60);
  const year = body.year ? Number(body.year) : null;
  const mileage = body.mileage != null ? Number(body.mileage) : null;
  const fuelType = body.fuelType || null;
  const transmission = body.transmission || null;
  const bodyType = body.bodyType || null;
  const color = sanitize(body.color || "", 30);
  const country = sanitize(body.country || "", 60);
  const city = sanitize(body.city || "", 60);
  const rentalPeriod = body.rentalPeriod || null;
  let images: string[] = Array.isArray(body.images) ? body.images.filter((s: any) => typeof s === "string").slice(0, MAX_IMAGES) : [];

  // Validation
  if (title.length < 5) return NextResponse.json({ error: "Title must be at least 5 characters." }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ error: "Description must be at least 20 characters." }, { status: 400 });
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  if (!Number.isFinite(price) || price <= 0 || price > 100_000_000) return NextResponse.json({ error: "Invalid price." }, { status: 400 });
  if (make.length < 2) return NextResponse.json({ error: "Make is required." }, { status: 400 });
  if (model.length < 1) return NextResponse.json({ error: "Model is required." }, { status: 400 });
  if (year !== null && (year < 1900 || year > new Date().getFullYear() + 1)) return NextResponse.json({ error: "Invalid year." }, { status: 400 });
  if (fuelType && !FUEL_TYPES.includes(fuelType)) return NextResponse.json({ error: "Invalid fuel type." }, { status: 400 });
  if (transmission && !TRANSMISSIONS.includes(transmission)) return NextResponse.json({ error: "Invalid transmission." }, { status: 400 });
  if (bodyType && !BODY_TYPES.includes(bodyType)) return NextResponse.json({ error: "Invalid body type." }, { status: 400 });
  if (!COUNTRIES.includes(country)) return NextResponse.json({ error: "Invalid country." }, { status: 400 });
  if (!citiesOf(country).includes(city)) return NextResponse.json({ error: "Invalid city for selected country." }, { status: 400 });
  if (category === "RENT" && rentalPeriod && !["day", "week", "month"].includes(rentalPeriod)) {
    return NextResponse.json({ error: "Invalid rental period." }, { status: 400 });
  }
  if (images.length === 0) return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
  if (images.some((i) => i.length > 2_000_000)) return NextResponse.json({ error: "Image data too large." }, { status: 400 });

  // Validate images are relative URLs or known prefixes (security)
  images = images.filter((u) => u.startsWith("/uploads/") || u.startsWith("/cars/") || u.startsWith("data:image/"));
  if (images.length === 0) return NextResponse.json({ error: "Invalid image format." }, { status: 400 });

  // Check quota (per-category free + paid credits)
  const quota = await getUserQuota(user.id);
  const isSale = category === "SALE";
  if (quota.total <= 0) {
    return NextResponse.json({
      error: "You've reached your free listing limit. Upgrade to a Pro Plan to post more ads.",
      code: "QUOTA_EXCEEDED",
    }, { status: 402 });
  }

  // Determine paidType and decrement quota
  let paidType = "FREE";
  const slug = `${slugify(`${year ?? ""} ${make} ${model} ${city}`)}-${Math.random().toString(36).slice(2, 6)}`;

  // --- Supabase path: per-category free quota with paid-credit fallback ---
  if (hasSupabase()) {
    try {
      const sb = getSupabase();
      const { data: freshRows } = await sb.from("User")
        .select("freeSalePostsUsed, freeRentPostsUsed, listingCredits")
        .eq("id", user.id).limit(1);
      const fresh = freshRows?.[0] as any;
      if (!fresh) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      let saleUsed = Number(fresh.freeSalePostsUsed ?? 0);
      let rentUsed = Number(fresh.freeRentPostsUsed ?? 0);
      let listingCredits = Number(fresh.listingCredits ?? 0);
      // also keep the legacy combined counter in sync
      let freePostsUsed = saleUsed + rentUsed;

      const usedFreeSale = saleUsed >= FREE_SALE_LIMIT;
      const usedFreeRent = rentUsed >= FREE_RENT_LIMIT;
      const freeAvailableForCategory = isSale ? !usedFreeSale : !usedFreeRent;

      if (freeAvailableForCategory) {
        if (isSale) saleUsed += 1; else rentUsed += 1;
        freePostsUsed = saleUsed + rentUsed;
        paidType = "FREE";
      } else if (listingCredits > 0) {
        listingCredits -= 1;
        paidType = "PAID";
      } else {
        return NextResponse.json({
          error: `You've used all ${isSale ? "SALE" : "RENT"} free listings. Upgrade to a Pro Plan to post more ads.`,
          code: "QUOTA_EXCEEDED",
        }, { status: 402 });
      }

      const insertBody = {
        id: undefined, // let DB generate
        title, description, category, price,
        currency: body.currency && typeof body.currency === "string" ? body.currency.slice(0, 8) : "USD",
        make, model,
        year: year && Number.isFinite(year) ? year : null,
        mileage: mileage !== null && Number.isFinite(mileage) ? mileage : null,
        fuelType, transmission, bodyType,
        color: color || null, country, city,
        rentalPeriod: category === "RENT" ? rentalPeriod : null,
        images: JSON.stringify(images),
        status: "APPROVED",
        paidType, featured: false, slug,
        userId: user.id,
        views: 0,
      };
      const { data: created, error: insertErr } = await sb.from("Listing").insert(insertBody).select("*").limit(1).single();
      if (insertErr || !created) {
        return NextResponse.json({ error: "Could not create listing." }, { status: 500 });
      }
      // Update user counters
      await sb.from("User").update({
        freeSalePostsUsed: saleUsed,
        freeRentPostsUsed: rentUsed,
        freePostsUsed: freePostsUsed,
        listingCredits,
      }).eq("id", user.id);
      try { await sb.from("AuditLog").insert({ userId: user.id, action: "LISTING_CREATE", details: title }); } catch {}

      // Return as PublicListing
      const pub: any = {
        id: created.id, title: created.title, description: created.description,
        category: created.category, price: created.price, currency: created.currency,
        make: created.make, model: created.model, year: created.year ?? null,
        mileage: created.mileage ?? null, fuelType: created.fuelType ?? null,
        transmission: created.transmission ?? null, bodyType: created.bodyType ?? null,
        color: created.color ?? null, country: created.country, city: created.city,
        rentalPeriod: created.rentalPeriod ?? null,
        images: parseImages(created.images), status: created.status, paidType: created.paidType,
        featured: created.featured, slug: created.slug, views: created.views ?? 0,
        createdAt: created.createdAt, updatedAt: created.updatedAt,
        user: null,
      };
      return NextResponse.json({ listing: pub }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ error: "Could not create listing. Please try again." }, { status: 500 });
    }
  }

  // --- Prisma fallback (local dev with SQLite) ---
  const listing = await db.$transaction(async (tx) => {
    const fresh = await tx.user.findUnique({ where: { id: user.id }, select: { freePostsUsed: true, freeSalePostsUsed: true, freeRentPostsUsed: true, listingCredits: true } });
    if (!fresh) throw new Error("User not found");
    let freeSalePostsUsed = Number(fresh.freeSalePostsUsed ?? 0);
    let freeRentPostsUsed = Number(fresh.freeRentPostsUsed ?? 0);
    let listingCredits = fresh.listingCredits;
    const usedFreeSale = freeSalePostsUsed >= FREE_SALE_LIMIT;
    const usedFreeRent = freeRentPostsUsed >= FREE_RENT_LIMIT;
    const freeAvailableForCategory = isSale ? !usedFreeSale : !usedFreeRent;
    if (freeAvailableForCategory) {
      if (isSale) freeSalePostsUsed += 1; else freeRentPostsUsed += 1;
      paidType = "FREE";
    } else if (listingCredits > 0) {
      listingCredits -= 1;
      paidType = "PAID";
    } else {
      throw new Error("QUOTA_EXCEEDED");
    }
    const created = await tx.listing.create({
      data: {
        title,
        description,
        category,
        price,
        currency: body.currency && typeof body.currency === "string" ? body.currency.slice(0, 8) : "USD",
        make,
        model,
        year,
        mileage: mileage !== null && Number.isFinite(mileage) ? mileage : null,
        fuelType,
        transmission,
        bodyType,
        color: color || null,
        country,
        city,
        rentalPeriod: category === "RENT" ? rentalPeriod : null,
        images: JSON.stringify(images),
        status: "APPROVED", // auto-approve for demo; admin can change to PENDING for moderation
        paidType,
        featured: false,
        slug,
        userId: user.id,
      },
    });
    await tx.user.update({
      where: { id: user.id },
      data: {
        freePostsUsed: freeSalePostsUsed + freeRentPostsUsed,
        freeSalePostsUsed,
        freeRentPostsUsed,
        listingCredits,
      },
    });
    await tx.auditLog.create({
      data: { userId: user.id, action: "LISTING_CREATE", details: created.title },
    });
    return created;
  }).catch((e) => {
    if (e.message === "QUOTA_EXCEEDED") return null;
    throw e;
  });

  if (!listing) {
    return NextResponse.json({
      error: "You've reached your free listing limit. Upgrade to a Pro Plan to post more ads.",
      code: "QUOTA_EXCEEDED",
    }, { status: 402 });
  }

  return NextResponse.json({ listing: toPublicListing(listing) }, { status: 201 });
}
