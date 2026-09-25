import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { COUNTRIES, citiesOf, isValidEmail, sanitize } from "@/lib/constants";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { getSupabase, hasSupabase } from "@/lib/supabase-server";

// POST /api/register - signup new user
export async function POST(req: Request) {
  const key = `register:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.auth, 60_000);
  if (!rl.ok) return rateLimitResponse();

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const email = sanitize(body.email ?? "", 200).toLowerCase();
  const password = String(body.password ?? "");
  const name = sanitize(body.name ?? "", 100);
  const country = sanitize(body.country ?? "", 60);
  const city = sanitize(body.city ?? "", 60);

  // Simple captcha check (math question, validated client-side)
  if (body.captcha !== body.captchaAnswer) {
    return NextResponse.json({ error: "Captcha answer is incorrect." }, { status: 400 });
  }

  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (password.length > 200) return NextResponse.json({ error: "Password is too long." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!COUNTRIES.includes(country)) return NextResponse.json({ error: "Please select a valid country." }, { status: 400 });
  if (!citiesOf(country).includes(city)) return NextResponse.json({ error: "Please select a valid city for your country." }, { status: 400 });

  // --- Use Supabase if configured, otherwise fall back to Prisma ---
  if (hasSupabase()) {
    try {
      const supabase = getSupabase();

      // Check if user already exists
      const { data: existing } = await supabase
        .from("User")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({ error: "Could not create account. Please try again or sign in." }, { status: 409 });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const { data: user, error } = await supabase
        .from("User")
        .insert({
          email,
          name,
          passwordHash,
          role: "USER",
          country,
          city,
          freePostsUsed: 0,
          listingCredits: 0,
          banned: false,
        })
        .select("id, email, name")
        .single();

      if (error) {
        console.error("Supabase create user error:", error);
        return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 });
      }

      // Log registration (best-effort, ignore RLS errors)
      await supabase.from("AuditLog").insert({
        userId: user.id,
        action: "USER_REGISTER",
        details: country,
      }).catch(() => null);

      return NextResponse.json({ ok: true, user }, { status: 201 });
    } catch (e: any) {
      console.error("Register Supabase error:", e.message);
      return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 });
    }
  }

  // --- Prisma fallback (local dev with SQLite) ---
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Could not create account. Please try again or sign in." }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email, name, passwordHash, country, city, role: "USER" },
    });
    await db.auditLog.create({ data: { userId: user.id, action: "USER_REGISTER", details: country } }).catch(() => null);

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (e: any) {
    console.error("Register Prisma error:", e.message);
    return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 });
  }
}

// GET /api/register/captcha - simple math captcha challenge
export async function GET(req: Request) {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return NextResponse.json({ question: `${a} + ${b} = ?`, answer: (a + b).toString() });
}
