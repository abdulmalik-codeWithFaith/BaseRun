"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

export function usePauseControls() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.code !== "Escape" && e.code !== "KeyP")) return;
      const s = useGameStore.getState();

      if (s.status === "menu") {
        if (e.code === "Escape" && s.screen !== "home") s.openScreen("home");
        return;
      }
      if (s.status === "playing" || s.status === "countdown") s.pauseRun();
      else if (s.status === "paused") s.resumeRun();
    };

    const autoPause = () => useGameStore.getState().pauseRun();
    const onVisibility = () => {
      if (document.hidden) autoPause();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", autoPause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", autoPause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}