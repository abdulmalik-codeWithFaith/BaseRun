"use client";

import { useGameStore } from "@/store/useGameStore";
import { computeScore } from "@/game/score";
import { formatDistance } from "@/game/format";

export default function Hud() {
  const dist = useGameStore((s) => s.runDistance);
  const coins = useGameStore((s) => s.runCoins);
  const pauseRun = useGameStore((s) => s.pauseRun);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="drop-shadow-md">
        <div className="text-4xl font-black leading-none tabular-nums">
          {formatDistance(dist)}
        </div>
        <div className="mt-1 text-sm font-semibold tabular-nums opacity-90">
          SCORE {computeScore(dist, coins).toLocaleString()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-lg font-bold backdrop-blur">
          <span>🪙</span>
          {/* key remounts the span on each change, replaying the pop animation */}
          <span key={coins} className="anim-pop inline-block tabular-nums">
            {coins}
          </span>
        </div>

        <button
          aria-label="Pause"
          onClick={pauseRun}
          className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-black/35 backdrop-blur active:scale-90"
        >
          <span className="flex gap-1">
            <i className="h-4 w-1.5 rounded-sm bg-white" />
            <i className="h-4 w-1.5 rounded-sm bg-white" />
          </span>
        </button>
      </div>
    </div>
  );
}