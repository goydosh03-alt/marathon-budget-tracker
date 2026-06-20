import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Snapcost",
    short_name: "Snapcost",
    description: "Трекер витрат по фото чеків — бачиш витрати у своїй валюті",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05090b",
    theme_color: "#05090b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
