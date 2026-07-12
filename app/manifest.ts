import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Snapcost",
    short_name: "Snapcost",
    // англійською як нейтральний дефолт (маніфест статичний, мову юзера не знає)
    description: "Snap a receipt — see your spending in your currency",
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
