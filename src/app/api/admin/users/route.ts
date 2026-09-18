import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/admin/users - list all users (admin only)
export async function GET(req: Request) {
  const key = `admin-users:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 24)));
  const skip = (page - 1) * pageSize;

  const where = q
    ? { OR: [{ email: { contains: q } }, { name: { contains: q } }, { country: { contains: q } }, { city: { contains: q } }] }
    : {};

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true, email: true, name: true, role: true, country: true, city: true,
        freePostsUsed: true, listingCredits: true, banned: true, createdAt: true,
      },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

// PATCH /api/admin/users - ban / unban / change role
export async function PATCH(req: Request) {
  const key = `admin-users-patch:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.listingCreate, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "User id required." }, { status: 400 });

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  // Prevent self-ban or admin demotion of self
  if (target.id === user.id) {
    return NextResponse.json({ error: "You cannot modify your own account." }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.banned === "boolean") data.banned = body.banned;
  if (body.role === "USER" || body.role === "ADMIN") data.role = body.role;
  if (typeof body.listingCredits === "number" && body.listingCredits >= 0 && body.listingCredits <= 1000) {
    data.listingCredits = Math.floor(body.listingCredits);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const updated = await db.user.update({ where: { id }, data });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_MODIFY",
      details: `${updated.email} -> ${JSON.stringify(data)}`,
    },
  }).catch(() => null);

  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id, email: updated.email, name: updated.name, role: updated.role,
      country: updated.country, city: updated.city, banned: updated.banned,
      listingCredits: updated.listingCredits,
    },
  });
}
