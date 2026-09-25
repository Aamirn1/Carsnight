import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabase, hasSupabase } from "@/lib/supabase-server";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "USER" | "ADMIN";
  country?: string;
  city?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
      id: (session.user as any).id,
      email: session.user.email!,
      name: session.user.name,
      role: (session.user as any).role ?? "USER",
      country: (session.user as any).country,
      city: (session.user as any).city,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") throw new Error("FORBIDDEN");
  return u;
}

export async function getUserWithCredits(userId: string) {
  if (hasSupabase()) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("User")
        .select("id, email, name, role, country, city, freePostsUsed, listingCredits, banned")
        .eq("id", userId)
        .limit(1);
      return data?.[0] ?? null;
    } catch {
      return null;
    }
  }
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, role: true, country: true, city: true,
      freePostsUsed: true, listingCredits: true, banned: true,
    },
  });
}

export async function getUserQuota(userId: string) {
  try {
    if (hasSupabase()) {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("User")
        .select("freePostsUsed, listingCredits")
        .eq("id", userId)
        .limit(1);
      const u = data?.[0];
      if (!u) return { freeRemaining: 0, paidRemaining: 0, total: 0, freeUsed: 0, freeLimit: 2 };
      const FREE_LIMIT = 2;
      const freeRemaining = Math.max(0, FREE_LIMIT - u.freePostsUsed);
      return {
        freeRemaining,
        paidRemaining: u.listingCredits,
        total: freeRemaining + u.listingCredits,
        freeUsed: u.freePostsUsed,
        freeLimit: FREE_LIMIT,
      };
    }

    const u = await db.user.findUnique({
      where: { id: userId },
      select: { freePostsUsed: true, listingCredits: true },
    });
    if (!u) return { freeRemaining: 0, paidRemaining: 0, total: 0, freeUsed: 0, freeLimit: 2 };
    const FREE_LIMIT = 2;
    const freeRemaining = Math.max(0, FREE_LIMIT - u.freePostsUsed);
    return {
      freeRemaining,
      paidRemaining: u.listingCredits,
      total: freeRemaining + u.listingCredits,
      freeUsed: u.freePostsUsed,
      freeLimit: FREE_LIMIT,
    };
  } catch {
    return { freeRemaining: 0, paidRemaining: 0, total: 0, freeUsed: 0, freeLimit: 2 };
  }
}
