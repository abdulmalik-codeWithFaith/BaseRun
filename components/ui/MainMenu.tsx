"use client";

import { useGameStore } from "@/store/useGameStore";
import { formatDistance } from "@/game/format";
import InstallButton from "@/components/ui/InstallButton";
import { getRoute } from "@/game/routes";

const TITLE = "BASERUN".split("");

export default function MainMenu() {
  const startRun = useGameStore((s) => s.startRun);
  const wallet = useGameStore((s) => s.wallet);
  const best = useGameStore((s) => s.bestDistance);
  const openScreen = useGameStore((s) => s.openScreen);
  const route = getRoute(useGameStore((s) => s.selectedRoute));

  return (
    <div className="anim-fade-in absolute inset-0 z-10 flex flex-col items-center justify-between bg-gradient-to-b from-sky-950/60 via-transparent to-sky-950/70 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] text-white">
      {/* title block */}
      <div className="mt-6 flex flex-col items-center">
        <div className="anim-float text-6xl">🚴</div>

        <h1
          aria-label="Baserun"
          className="mt-2 flex text-6xl font-black tracking-tight sm:text-7xl"
        >
          {TITLE.map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className="anim-wave inline-block [text-shadow:0_4px_0_rgba(0,0,0,0.25)]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {ch}
            </span>
          ))}
        </h1>

        <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] opacity-90">
          Endless bicycle runner
        </p>

        <div className="mt-5 flex gap-2 text-sm font-bold">
          <span className="rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">
            🪙 {wallet.toLocaleString()}
          </span>
          <span className="rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">
            🏆 {formatDistance(best)}
          </span>
        </div>
      </div>

      {/* actions */}
      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <button
          onClick={startRun}
          className="w-full rounded-2xl bg-orange-500 py-4 text-2xl font-black shadow-[0_6px_0_#c2410c] active:translate-y-1 active:shadow-[0_2px_0_#c2410c]"
        >
          PLAY GAME
        </button>
                <button
          onClick={() => openScreen("routes")}
          className="w-full rounded-2xl bg-white/25 py-2.5 text-sm font-bold backdrop-blur active:scale-95"
        >
          {route.emoji} ROUTE: {route.name.toUpperCase()} ›
        </button>

        {/* wired up in Step 5 */}
                <div className="grid w-full grid-cols-3 gap-2">
          {(
            [
              ["GARAGE", "garage"],
              ["SHOP", "shop"],
              ["SETTINGS", "settings"],
            ] as const
          ).map(([label, screen]) => (
            <button
              key={screen}
              onClick={() => openScreen(screen)}
              className="rounded-xl bg-white/25 py-2.5 text-[11px] font-bold tracking-wide backdrop-blur active:scale-95"
            >
              {label}
            </button>
          ))}
        </div>
                  <InstallButton />
        <p className="mt-1 text-xs opacity-75">← → / A D or swipe to steer</p>
        <p className="mt-1 text-xs opacity-75">← → / A D or swipe to steer</p>
      </div>
    </div>
  );
}