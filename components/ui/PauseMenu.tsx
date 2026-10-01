"use client";

import { useGameStore } from "@/store/useGameStore";
import { formatDistance } from "@/game/format";

export default function PauseMenu() {
  const dist = useGameStore((s) => s.runDistance);
  const coins = useGameStore((s) => s.runCoins);
  const resumeRun = useGameStore((s) => s.resumeRun);
  const restartRun = useGameStore((s) => s.restartRun);
  const quitRun = useGameStore((s) => s.quitRun);

  return (
    <div className="anim-fade-in absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
      <div className="anim-rise w-full max-w-xs rounded-3xl bg-white/95 p-6 text-center text-slate-900 shadow-2xl">
        <h2 className="text-3xl font-black tracking-tight">PAUSED</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {formatDistance(dist)} &nbsp;•&nbsp; 🪙 {coins}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={resumeRun}
            className="rounded-2xl bg-orange-500 py-3 text-xl font-black text-white shadow-[0_5px_0_#c2410c] active:translate-y-1 active:shadow-[0_1px_0_#c2410c]"
          >
            RESUME
          </button>
          <button
            onClick={restartRun}
            className="rounded-2xl bg-slate-200 py-3 text-lg font-bold active:scale-95"
          >
            RESTART
          </button>
          <button
            onClick={quitRun}
            className="rounded-2xl bg-slate-200 py-3 text-lg font-bold active:scale-95"
          >
            QUIT TO MENU
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">Esc or P to resume</p>
      </div>
    </div>
  );
}