"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { SWIPE_THRESHOLD } from "@/game/constants";

export function useLaneControls() {
  const status = useGameStore((s) => s.status);

  useEffect(() => {
    if (status !== "playing") return;

    const move = (dir: -1 | 1) => {
      runtime.lane = Math.min(2, Math.max(0, runtime.lane + dir));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          move(-1);
          break;
        case "ArrowRight":
        case "KeyD":
          move(1);
          break;
        case "Escape": // TEMP until Step 4's pause screen
          useGameStore.getState().endRun();
          break;
      }
    };

    let startX = 0;
    let startY = 0;
    let active = false;

    const onDown = (e: PointerEvent) => {
      active = true;
      startX = e.clientX;
      startY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 1 : -1);
        // reset origin so one long swipe can change two lanes
        startX = e.clientX;
        startY = e.clientY;
      }
    };
    const onUp = () => {
      active = false;
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [status]);
}