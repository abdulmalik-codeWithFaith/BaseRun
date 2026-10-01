"use client";

import { useEffect } from "react";
import { captureInstallPrompt } from "@/game/pwa";

export default function PwaRegister() {
  useEffect(() => {
    const stop = captureInstallPrompt();

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return stop;
  }, []);

  return null;
}