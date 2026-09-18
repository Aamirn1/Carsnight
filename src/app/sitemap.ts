import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = "https://carsnight.example.com";

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

  // Dynamic listing pages
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
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
    // ignore DB errors in sitemap generation
  }

  return [...staticRoutes, ...listingRoutes];
}
