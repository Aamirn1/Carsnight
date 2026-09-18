import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cars Night — Global Car Marketplace",
    short_name: "Cars Night",
    description: "Buy, sell, and rent cars worldwide. 2 free listings, crypto + card payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff5a1f",
    icons: [
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/logo.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
    ],
    categories: ["shopping", "auto"],
    lang: "en-US",
  };
}
