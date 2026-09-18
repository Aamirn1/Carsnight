import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/plans - list available subscription plans
export async function GET(req: Request) {
  const key = `plans:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const plans = await db.plan.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });
  return NextResponse.json({ plans });
}
