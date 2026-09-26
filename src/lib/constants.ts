// Shared constants and validation helpers for Cars Night

export const CATEGORIES = ["SALE", "RENT"] as const;
export type Category = (typeof CATEGORIES)[number];

export const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "CNG"] as const;
export const TRANSMISSIONS = ["Manual", "Automatic", "Semi-Automatic"] as const;
export const BODY_TYPES = ["Sedan", "SUV", "Coupe", "Hatchback", "Truck", "Van", "Convertible", "Wagon", "Pickup"] as const;
export const RENTAL_PERIODS = ["day", "week", "month"] as const;
export const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "JPY"] as const;

export const FREE_LISTING_LIMIT = 2;
export const MAX_IMAGES = 4;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Countries -> cities (a curated subset for the demo; production would use a full dataset)
export const COUNTRY_CITIES: Record<string, string[]> = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco", "Seattle", "Boston", "Dallas", "Las Vegas"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Edinburgh", "Glasgow", "Cardiff", "Belfast"],
  "Pakistan": ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad", "Sialkot"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Hiroshima", "Sendai"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Hobart"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice", "Bologna", "Genoa"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Xian"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju"],
  "Singapore": ["Singapore"],
  "Malaysia": ["Kuala Lumpur", "Penang", "Johor Bahru", "Malacca", "Ipoh", "Kuching"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya"],
  "Brazil": ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Porto Alegre"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancun"],
  "Nigeria": ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City"],
};

export const COUNTRIES = Object.keys(COUNTRY_CITIES).sort();

export function citiesOf(country: string): string[] {
  return COUNTRY_CITIES[country] ?? [];
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitize(str: string, max = 200): string {
  return String(str).trim().slice(0, max);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function formatPrice(price: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function formatPeriod(period?: string | null): string {
  if (!period) return "";
  if (period === "day") return "/day";
  if (period === "week") return "/week";
  if (period === "month") return "/month";
  return `/${period}`;
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

// Shared listing list filters
export interface ListingQuery {
  category?: string;
  country?: string;
  city?: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: string; // newest | price_asc | price_desc | popular
  page?: number;
  pageSize?: number;
  status?: string;
}

export function parseListingQuery(params: URLSearchParams): ListingQuery {
  const num = (k: string) => {
    const v = params.get(k);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    category: params.get("category") || undefined,
    country: params.get("country") || undefined,
    city: params.get("city") || undefined,
    make: params.get("make") || undefined,
    model: params.get("model") || undefined,
    fuelType: params.get("fuelType") || undefined,
    transmission: params.get("transmission") || undefined,
    bodyType: params.get("bodyType") || undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    q: params.get("q") || undefined,
    sort: params.get("sort") || "newest",
    page: num("page") ?? 1,
    pageSize: num("pageSize") ?? 12,
    status: params.get("status") || undefined,
  };
}

// Build Prisma where clause from ListingQuery
import { Prisma } from "@prisma/client";
export function buildWhere(q: ListingQuery, opts?: { approvedOnly?: boolean; userId?: string }): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {};
  if (opts?.userId) where.userId = opts.userId;
  else if (opts?.approvedOnly) where.status = "APPROVED";
  else if (q.status) where.status = q.status;
  else where.status = "APPROVED";

  if (q.category && (q.category === "SALE" || q.category === "RENT")) where.category = q.category;
  if (q.country) where.country = q.country;
  if (q.city) where.city = q.city;
  if (q.make) where.make = { contains: q.make };
  if (q.model) where.model = { contains: q.model };
  if (q.fuelType) where.fuelType = q.fuelType;
  if (q.transmission) where.transmission = q.transmission;
  if (q.bodyType) where.bodyType = q.bodyType;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = {};
    if (q.minPrice !== undefined) where.price.gte = q.minPrice;
    if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
  }
  if (q.q) {
    where.OR = [
      { title: { contains: q.q } },
      { description: { contains: q.q } },
      { make: { contains: q.q } },
      { model: { contains: q.q } },
    ];
  }
  return where;
}

export function buildOrderBy(q: ListingQuery): Prisma.ListingOrderByWithRelationInput[] {
  switch (q.sort) {
    case "price_asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "popular":
      return [{ featured: "desc" }, { views: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export function parseImages(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string").slice(0, MAX_IMAGES);
    return [];
  } catch {
    return [];
  }
}

export type PublicListing = {
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
  images: string[];
  status: string;
  paidType: string;
  featured: boolean;
  slug: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string } | null;
};

export function toPublicListing(l: any): PublicListing {
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    category: l.category,
    price: l.price,
    currency: l.currency,
    make: l.make,
    model: l.model,
    year: l.year ?? null,
    mileage: l.mileage ?? null,
    fuelType: l.fuelType ?? null,
    transmission: l.transmission ?? null,
    bodyType: l.bodyType ?? null,
    color: l.color ?? null,
    country: l.country,
    city: l.city,
    rentalPeriod: l.rentalPeriod ?? null,
    images: parseImages(l.images),
    status: l.status,
    paidType: l.paidType,
    featured: l.featured,
    slug: l.slug,
    views: l.views,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
    user: l.user
      ? { id: l.user.id, name: l.user.name, email: l.user.email }
      : null,
  };
}
