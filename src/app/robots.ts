import type { MetadataRoute } from "next";

const BASE = "https://carsnight.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block private/account pages from indexing
        disallow: ["/dashboard", "/admin", "/post-ad", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/post-ad", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
