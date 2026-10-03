"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { SWIPE_THRESHOLD, JUMP_BUFFER } from "@/game/constants";
import { playSfx } from "@/game/audio";

export function useLaneControls() {
  const status = useGameStore((s) => s.status);

  useEffect(() => {
    if (status !== "playing") return;

    const move = (dir: -1 | 1) => {
      const next = Math.min(2, Math.max(0, runtime.lane + dir));
      if (next === runtime.lane) return;
      runtime.lane = next;
      playSfx("swoosh");
    };

    // GameLoop consumes this when the bike is on the ground
    const jump = () => {
      runtime.jumpBuffer = JUMP_BUFFER;
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
        case "ArrowUp":
        case "KeyW":
        case "Space":
          e.preventDefault();
          jump();
          break;
      }
    };

        let startX = 0;
    let startY = 0;
    let active = false;
    let used = false; // one action per swipe

    const onDown = (e: PointerEvent) => {
      active = true;
      used = false;
      startX = e.clientX;
      startY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!active || used) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 1 : -1);
        used = true;
      } else if (dy < -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
        jump(); // swipe up
        used = true;
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