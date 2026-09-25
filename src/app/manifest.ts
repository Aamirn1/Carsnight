import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cars Night — Global Car Marketplace",
    short_name: "Cars Night",
    description: "Buy, sell, and rent cars worldwide. 2 free listings, crypto + card payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B5CF6",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/favicon-16.png", sizes: "16x16", type: "image/png", purpose: "any" },
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/favicon-48.png", sizes: "48x48", type: "image/png", purpose: "any" },
      { src: "/favicon-64.png", sizes: "64x64", type: "image/png", purpose: "any" },
      { src: "/favicon-96.png", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/favicon-128.png", sizes: "128x128", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    categories: ["shopping", "auto"],
    lang: "en-US",
  };
}
