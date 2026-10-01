"use client";

import { useGameStore } from "@/store/useGameStore";
import { computeScore } from "@/game/score";

export default function DebugHud() {
  const status = useGameStore((s) => s.status);
  const coins = useGameStore((s) => s.runCoins);
  const dist = useGameStore((s) => s.runDistance);
  const best = useGameStore((s) => s.bestDistance);
  const startRun = useGameStore((s) => s.startRun);
  const goMenu = useGameStore((s) => s.goMenu);

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-white drop-shadow-md">
        <div className="text-3xl font-black">{dist} m</div>
        <div className="text-lg">🪙 {coins}</div>
        <div className="text-sm opacity-80">Score {computeScore(dist, coins)}</div>
      </div>

      {status === "gameover" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/40 text-white">
          <h2 className="text-5xl font-black">GAME OVER</h2>
          <p>
            {dist} m &nbsp;•&nbsp; 🪙 {coins} &nbsp;•&nbsp; Best {best} m
          </p>
          <button
            onClick={startRun}
            className="w-56 rounded-2xl bg-orange-500 py-3 text-xl font-bold active:scale-95"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={goMenu}
            className="w-56 rounded-2xl bg-white/25 py-3 text-lg font-semibold active:scale-95"
          >
            HOME
          </button>
        </div>
      )}
    </>
  );
}