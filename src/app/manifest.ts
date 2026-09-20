import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cars Night — Global Car Marketplace",
    short_name: "Cars Night",
    description: "Buy, sell, and rent cars worldwide. 2 free listings, crypto + card payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#C98216",
    icons: [
      { src: "/favicon-64.png", sizes: "64x64", type: "image/png", purpose: "any" },
      { src: "/logo-mark.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    categories: ["shopping", "auto"],
    lang: "en-US",
  };
}
