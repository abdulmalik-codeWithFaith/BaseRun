"use client";

import { useEffect, useState } from "react";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// called once from <PwaRegister />
export function captureInstallPrompt() {
  const onPrompt = (e: Event) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    notify();
  };
  const onInstalled = () => {
    deferred = null;
    notify();
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export function useInstallPrompt() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  // only rendered client-side (after the store rehydrates), so reading window here is safe
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return {
    canInstall: deferred !== null && !standalone,
    showIosHint: isIos && !standalone,
    install: async () => {
      if (!deferred) return;
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      notify();
    },
  };
}