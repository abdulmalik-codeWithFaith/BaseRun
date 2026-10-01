"use client";

import { useInstallPrompt } from "@/game/pwa";

export default function InstallButton() {
  const { canInstall, showIosHint, install } = useInstallPrompt();

  if (canInstall) {
    return (
      <button
        onClick={install}
        className="w-full rounded-xl border border-white/40 bg-white/10 py-2 text-xs font-bold tracking-wide backdrop-blur active:scale-95"
      >
        📲 INSTALL APP
      </button>
    );
  }
  if (showIosHint) {
    return (
      <p className="text-center text-xs opacity-80">
        To install: tap Share, then “Add to Home Screen”
      </p>
    );
  }
  return null;
}