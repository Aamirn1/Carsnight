import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/settings - public site settings (site_name, tagline, announcement, contact_email)
export async function GET(req: Request) {
  const key = `settings:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const rows = await db.setting.findMany({
    where: { key: { in: ["site_name", "tagline", "announcement", "contact_email", "hero_video_url"] } },
  });
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}
