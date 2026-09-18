import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { sanitize } from "@/lib/constants";

// GET /api/admin/settings - get all site settings (admin only)
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const rows = await db.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}

// PUT /api/admin/settings - update site settings (admin only)
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const allowedKeys = ["site_name", "tagline", "contact_email", "hero_video_url", "announcement"];
  const updates: Record<string, string> = {};
  for (const k of allowedKeys) {
    if (typeof body[k] === "string") {
      updates[k] = sanitize(body[k], 500);
    }
  }

  for (const [k, v] of Object.entries(updates)) {
    const existing = await db.setting.findUnique({ where: { key: k } });
    if (existing) {
      await db.setting.update({ where: { id: existing.id }, data: { value: v } });
    } else {
      await db.setting.create({ data: { key: k, value: v } });
    }
  }

  await db.auditLog.create({
    data: { userId: user.id, action: "SETTINGS_UPDATE", details: Object.keys(updates).join(",") },
  }).catch(() => null);

  return NextResponse.json({ ok: true, settings: updates });
}
