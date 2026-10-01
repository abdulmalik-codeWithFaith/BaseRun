import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Baserun",
  description: "3D endless bicycle runner",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0ea5e9",
};