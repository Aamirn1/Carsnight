import { getSupabase, hasSupabase } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { toPublicListing, parseImages, type PublicListing } from "@/lib/constants";

// ============================================================================
// Supabase data layer — mirrors the Prisma API but uses the Supabase JS client.
// Used when hasSupabase() is true (production on Vercel). Falls back to Prisma
// for local dev with SQLite.
// ============================================================================

export interface SbUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  country: string | null;
  city: string | null;
  freePostsUsed: number;
  listingCredits: number;
  banned: boolean;
  createdAt: string;
}

export interface SbListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  make: string;
  model: string;
  year: number | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  bodyType: string | null;
  color: string | null;
  country: string;
  city: string;
  rentalPeriod: string | null;
  images: string;
  status: string;
  paidType: string;
  featured: boolean;
  slug: string;
  userId: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; email: string } | null;
}

export interface SbTransaction {
  id: string;
  userId: string;
  planId: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  cryptoWallet: string | null;
  status: string;
  credits: number;
  createdAt: string;
}

// --- Users ---
export async function getUserByEmail(email: string): Promise<SbUser | null> {
  if (hasSupabase()) {
    const sb = getSupabase();
    const { data } = await sb.from("User").select("*").eq("email", email).limit(1);
    return (data && data[0]) ? data[0] as SbUser : null;
  }
  const u = await db.user.findUnique({ where: { email } });
  return u ? {
    id: u.id, email: u.email, name: u.name, role: u.role, country: u.country, city: u.city,
    freePostsUsed: u.freePostsUsed, listingCredits: u.listingCredits, banned: u.banned,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  } : null;
}

export async function getUserById(id: string): Promise<SbUser | null> {
  if (hasSupabase()) {
    const sb = getSupabase();
    const { data } = await sb.from("User").select("*").eq("id", id).limit(1);
    return (data && data[0]) ? data[0] as SbUser : null;
  }
  const u = await db.user.findUnique({ where: { id } });
  return u ? {
    id: u.id, email: u.email, name: u.name, role: u.role, country: u.country, city: u.city,
    freePostsUsed: u.freePostsUsed, listingCredits: u.listingCredits, banned: u.banned,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  } : null;
}

// --- Listings ---
export async function findListings(opts: {
  userId?: string;
  category?: string;
  status?: string;
  country?: string;
  featured?: boolean;
  limit?: number;
  orderBy?: string;
}): Promise<SbListing[]> {
  if (hasSupabase()) {
    const sb = getSupabase();
    let q = sb.from("Listing").select("*, User:userId(id,name,email)");
    if (opts.userId) q = q.eq("userId", opts.userId);
    if (opts.category) q = q.eq("category", opts.category);
    if (opts.status) q = q.eq("status", opts.status);
    if (opts.country) q = q.eq("country", opts.country);
    if (opts.featured !== undefined) q = q.eq("featured", opts.featured);
    if (opts.limit) q = q.limit(opts.limit);
    if (opts.orderBy === "createdAt_desc") q = q.order("createdAt", { ascending: false });
    const { data, error } = await q;
    if (error) return [];
    return (data || []) as SbListing[];
  }
  const where: any = {};
  if (opts.userId) where.userId = opts.userId;
  if (opts.category) where.category = opts.category;
  if (opts.status) where.status = opts.status;
  if (opts.country) where.country = opts.country;
  if (opts.featured !== undefined) where.featured = opts.featured;
  const items = await db.listing.findMany({
    where,
    orderBy: opts.orderBy === "createdAt_desc" ? { createdAt: "desc" } : undefined,
    take: opts.limit,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return items.map((l: any) => ({
    ...l,
    images: l.images,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
  }));
}

export async function countListings(opts: {
  category?: string;
  status?: string;
  country?: string;
}): Promise<number> {
  if (hasSupabase()) {
    const sb = getSupabase();
    let q = sb.from("Listing").select("id", { count: "exact", head: true });
    if (opts.category) q = q.eq("category", opts.category);
    if (opts.status) q = q.eq("status", opts.status);
    if (opts.country) q = q.eq("country", opts.country);
    const { count } = await q;
    return count || 0;
  }
  const where: any = {};
  if (opts.category) where.category = opts.category;
  if (opts.status) where.status = opts.status;
  if (opts.country) where.country = opts.country;
  return db.listing.count({ where });
}

// --- Transactions ---
export async function findTransactions(userId: string, limit = 10): Promise<SbTransaction[]> {
  if (hasSupabase()) {
    const sb = getSupabase();
    const { data } = await sb.from("Transaction")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(limit);
    return (data || []) as SbTransaction[];
  }
  const items = await db.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map((t: any) => ({
    ...t,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
  }));
}

// --- Plans ---
export async function findPlans(): Promise<any[]> {
  if (hasSupabase()) {
    const sb = getSupabase();
    const { data } = await sb.from("Plan").select("*").eq("active", true).order("price", { ascending: true });
    return data || [];
  }
  return db.plan.findMany({ where: { active: true }, orderBy: { price: "asc" } });
}

// --- Settings ---
export async function findSettings(keys: string[]): Promise<Record<string, string>> {
  if (hasSupabase()) {
    const sb = getSupabase();
    const { data } = await sb.from("Setting").select("key,value").in("key", keys);
    const settings: Record<string, string> = {};
    (data || []).forEach((s: any) => { settings[s.key] = s.value; });
    return settings;
  }
  const rows = await db.setting.findMany({ where: { key: { in: keys } } });
  const settings: Record<string, string> = {};
  rows.forEach((s) => { settings[s.key] = s.value; });
  return settings;
}

// --- Count Users ---
export async function countUsers(): Promise<number> {
  if (hasSupabase()) {
    const sb = getSupabase();
    const { count } = await sb.from("User").select("id", { count: "exact", head: true });
    return count || 0;
  }
  return db.user.count();
}

// --- Convert SbListing to PublicListing ---
export function sbListingToPublic(l: SbListing): PublicListing {
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    category: l.category,
    price: l.price,
    currency: l.currency,
    make: l.make,
    model: l.model,
    year: l.year,
    mileage: l.mileage,
    fuelType: l.fuelType,
    transmission: l.transmission,
    bodyType: l.bodyType,
    color: l.color,
    country: l.country,
    city: l.city,
    rentalPeriod: l.rentalPeriod,
    images: parseImages(l.images),
    status: l.status,
    paidType: l.paidType,
    featured: l.featured,
    slug: l.slug,
    views: l.views,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    user: l.user ? { id: l.user.id, name: l.user.name, email: l.user.email } : null,
  };
}
