import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { parseListingQuery, buildOrderBy, buildWhere, toPublicListing } from "@/lib/constants";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/admin/listings - list all listings (admin only) for moderation
export async function GET(req: Request) {
  const key = `admin-listings:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const url = new URL(req.url);
  const q = parseListingQuery(url.searchParams);

  // For admin: do not force approved-only; allow status filter
  const where = buildWhere(q);
  if (q.status) (where as any).status = q.status;
  else (where as any).status = undefined; // show all
  delete (where as any).status;
  if (q.status) (where as any).status = q.status;

  const orderBy = buildOrderBy(q);
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, q.pageSize ?? 24));
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

// PATCH /api/admin/listings - approve / reject / feature a listing
export async function PATCH(req: Request) {
  const key = `admin-listings-patch:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.listingCreate, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Listing id required." }, { status: 400 });

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const data: any = {};
  if (body.status === "APPROVED" || body.status === "REJECTED" || body.status === "EXPIRED" || body.status === "PENDING") {
    data.status = body.status;
  }
  if (typeof body.featured === "boolean") data.featured = body.featured;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const updated = await db.listing.update({ where: { id }, data, include: { user: { select: { id: true, name: true, email: true } } } });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "LISTING_MODERATE",
      details: `${updated.title} -> ${data.status || (data.featured ? "featured" : "unfeatured")}`,
    },
  }).catch(() => null);

  return NextResponse.json({ ok: true, listing: toPublicListing(updated) });
}
