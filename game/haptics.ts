import { useGameStore } from "@/store/useGameStore";

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!useGameStore.getState().settings.vibration) return;
  navigator.vibrate(pattern);
}