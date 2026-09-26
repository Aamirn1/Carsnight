import type { MetadataRoute } from "next";

const BASE = "https://carsnight1.vercel.app";

export const revalidate = 3600; // hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/cars-for-sale`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/cars-for-rent`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/signin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic listing pages — use dynamic import so that if the database is
  // unavailable (e.g. during build without DATABASE_URL configured), the
  // module load doesn't crash the build; the try/catch handles it gracefully.
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import("@/lib/db");
    const listings = await db.listing.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    });
    listingRoutes = listings.map((l) => ({
      url: `${BASE}/listing/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not available (missing DATABASE_URL, build-time, etc.) — return
    // the static routes only so the sitemap still works.
  }

  return [...staticRoutes, ...listingRoutes];
}
