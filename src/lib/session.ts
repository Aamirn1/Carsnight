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

// Per-category free listing limits. Each user gets 2 free SALE posts and
// 2 free RENT posts. Paid credits can be used for either category.
export const FREE_SALE_LIMIT = 2;
export const FREE_RENT_LIMIT = 2;

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
        .select("id, email, name, role, country, city, freePostsUsed, freeSalePostsUsed, freeRentPostsUsed, listingCredits, banned")
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
      freePostsUsed: true, freeSalePostsUsed: true, freeRentPostsUsed: true, listingCredits: true, banned: true,
    },
  });
}

export interface UserQuota {
  // Per-category free-quota breakdown
  freeSaleRemaining: number;
  freeRentRemaining: number;
  freeSaleUsed: number;
  freeRentUsed: number;
  freeSaleLimit: number;
  freeRentLimit: number;
  // Aggregate values for backwards compatibility with older callers
  freeRemaining: number; // total remaining free across both categories
  paidRemaining: number;
  total: number; // total remaining (free + paid)
  freeUsed: number; // total free used across both categories
  freeLimit: number; // total free limit (sale + rent = 4)
}

export async function getUserQuota(userId: string): Promise<UserQuota> {
  try {
    if (hasSupabase()) {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("User")
        .select("freePostsUsed, freeSalePostsUsed, freeRentPostsUsed, listingCredits")
        .eq("id", userId)
        .limit(1);
      const u = data?.[0] as any;
      if (!u) {
        return zeroQuota();
      }
      return computeQuota(u);
    }

    const u = await db.user.findUnique({
      where: { id: userId },
      select: { freePostsUsed: true, freeSalePostsUsed: true, freeRentPostsUsed: true, listingCredits: true },
    });
    if (!u) return zeroQuota();
    return computeQuota(u);
  } catch {
    return zeroQuota();
  }
}

function zeroQuota(): UserQuota {
  return {
    freeSaleRemaining: FREE_SALE_LIMIT,
    freeRentRemaining: FREE_RENT_LIMIT,
    freeSaleUsed: 0,
    freeRentUsed: 0,
    freeSaleLimit: FREE_SALE_LIMIT,
    freeRentLimit: FREE_RENT_LIMIT,
    freeRemaining: FREE_SALE_LIMIT + FREE_RENT_LIMIT,
    paidRemaining: 0,
    total: FREE_SALE_LIMIT + FREE_RENT_LIMIT,
    freeUsed: 0,
    freeLimit: FREE_SALE_LIMIT + FREE_RENT_LIMIT,
  };
}

function computeQuota(u: any): UserQuota {
  // If the per-category columns don't exist yet in Supabase (migration not run),
  // fall back to using the legacy freePostsUsed counter split across both categories.
  const hasPerCategory = typeof u.freeSalePostsUsed === "number" || typeof u.freeRentPostsUsed === "number";
  let saleUsed: number;
  let rentUsed: number;
  if (hasPerCategory) {
    saleUsed = Number(u.freeSalePostsUsed ?? 0);
    rentUsed = Number(u.freeRentPostsUsed ?? 0);
  } else {
    // Legacy: split the combined counter evenly, capped at each category limit.
    const combined = Number(u.freePostsUsed ?? 0);
    saleUsed = Math.min(FREE_SALE_LIMIT, combined);
    rentUsed = Math.min(FREE_RENT_LIMIT, Math.max(0, combined - FREE_SALE_LIMIT));
  }
  const saleRemaining = Math.max(0, FREE_SALE_LIMIT - saleUsed);
  const rentRemaining = Math.max(0, FREE_RENT_LIMIT - rentUsed);
  const paidRemaining = Number(u.listingCredits ?? 0);
  return {
    freeSaleRemaining: saleRemaining,
    freeRentRemaining: rentRemaining,
    freeSaleUsed: saleUsed,
    freeRentUsed: rentUsed,
    freeSaleLimit: FREE_SALE_LIMIT,
    freeRentLimit: FREE_RENT_LIMIT,
    freeRemaining: saleRemaining + rentRemaining,
    paidRemaining,
    total: saleRemaining + rentRemaining + paidRemaining,
    freeUsed: saleUsed + rentUsed,
    freeLimit: FREE_SALE_LIMIT + FREE_RENT_LIMIT,
  };
}
