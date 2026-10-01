"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { computeScore } from "@/game/score";
import { formatDistance } from "@/game/format";

function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - (1 - p) ** 3))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-2 py-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-black tabular-nums">{value}</div>
    </div>
  );
}

function Panel() {
  const dist = useGameStore((s) => s.runDistance);
  const coins = useGameStore((s) => s.runCoins);
  const best = useGameStore((s) => s.bestDistance);
  const isNewBest = useGameStore((s) => s.isNewBest);
  const startRun = useGameStore((s) => s.startRun);
  const goMenu = useGameStore((s) => s.goMenu);

  const shownDist = useCountUp(dist);
  const shownScore = useCountUp(computeScore(dist, coins));

  return (
    <div className="anim-fade-in absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm">
      <div className="anim-rise w-full max-w-sm rounded-3xl bg-white/95 p-6 text-center text-slate-900 shadow-2xl">
        <h2 className="text-3xl font-black tracking-tight">GAME OVER</h2>

        {isNewBest && (
          <div className="anim-pop mx-auto mt-2 w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider">
            🏆 New best
          </div>
        )}

        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-500">
          Distance
        </p>
        <p className="text-5xl font-black tabular-nums">{formatDistance(shownDist)}</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Coins" value={`🪙 ${coins}`} />
          <Stat label="Score" value={shownScore.toLocaleString()} />
          <Stat label="Best" value={formatDistance(best)} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={startRun}
            className="rounded-2xl bg-orange-500 py-3 text-xl font-black text-white shadow-[0_5px_0_#c2410c] active:translate-y-1 active:shadow-[0_1px_0_#c2410c]"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={goMenu}
            className="rounded-2xl bg-slate-200 py-3 text-lg font-bold active:scale-95"
          >
            HOME
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GameOver() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 700); // let the crash animation play
    return () => clearTimeout(t);
  }, []);

  return show ? <Panel /> : null;
}