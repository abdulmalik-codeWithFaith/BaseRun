"use client";

import { useGameStore } from "@/store/useGameStore";

export default function MainMenu() {
  const startRun = useGameStore((s) => s.startRun);
  const wallet = useGameStore((s) => s.wallet);
  const best = useGameStore((s) => s.bestDistance);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-sky-400/90 to-sky-600/90 text-white">
      <h1 className="text-6xl font-black tracking-tight drop-shadow">
        🚴 BASERUN
      </h1>
      <p className="text-sm opacity-90">
        🪙 {wallet} &nbsp;•&nbsp; Best {(best / 1000).toFixed(2)} km
      </p>

      <button
        onClick={startRun}
        className="w-64 rounded-2xl bg-orange-500 py-4 text-2xl font-bold shadow-lg active:scale-95"
      >
        PLAY GAME
      </button>
      {["GARAGE", "SHOP", "SETTINGS"].map((label) => (
        <button
          key={label}
          disabled
          className="w-64 rounded-2xl bg-white/20 py-3 text-lg font-semibold opacity-60"
        >
          {label}
        </button>
      ))}
    </div>
  );
}