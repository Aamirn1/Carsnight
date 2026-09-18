import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { buildOrderBy, buildWhere, parseListingQuery, toPublicListing } from "@/lib/constants";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/my-listings - current user's listings (any status)
export async function GET(req: Request) {
  const key = `my-listings:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(req.url);
  const q = parseListingQuery(url.searchParams);

  // Force userId filter
  const where = { ...buildWhere(q, { userId: user.id }) };
  // For my-listings, include all statuses (override default)
  delete where.status;
  where.status = undefined as any;
  // Re-apply status only if explicitly provided
  if (q.status) (where as any).status = q.status;

  const orderBy = buildOrderBy(q);
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, q.pageSize ?? 24));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    db.listing.findMany({
      where: { userId: user.id, ...(q.category ? { category: q.category } : {}), ...(q.status ? { status: q.status } : {}) },
      orderBy,
      skip,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.listing.count({ where: { userId: user.id, ...(q.category ? { category: q.category } : {}), ...(q.status ? { status: q.status } : {}) } }),
  ]);

  return NextResponse.json({
    items: items.map(toPublicListing),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
