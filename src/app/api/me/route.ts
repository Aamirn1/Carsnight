import { NextResponse } from "next/server";
import { getSessionUser, getUserQuota } from "@/lib/session";
import { db } from "@/lib/db";

// GET /api/me - current session user with quota info
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, country: true, city: true, phone: true, avatarUrl: true, freePostsUsed: true, listingCredits: true, banned: true, createdAt: true },
  });
  if (!dbUser) return NextResponse.json({ user: null });
  const quota = await getUserQuota(user.id);
  return NextResponse.json({ user: { ...dbUser, quota } });
}
