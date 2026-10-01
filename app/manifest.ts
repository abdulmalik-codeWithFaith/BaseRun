import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baserun",
    short_name: "Baserun",
    description: "3D endless bicycle runner",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0ea5e9",
    theme_color: "#0ea5e9",
    icons: [
      { src: "/pwa-icons/192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icons/512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}