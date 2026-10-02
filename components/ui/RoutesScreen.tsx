"use client";

import { useGameStore } from "@/store/useGameStore";
import { ROUTES } from "@/game/routes";
import { formatDistance } from "@/game/format";
import ScreenFrame from "./ScreenFrame";

const DEV = process.env.NODE_ENV === "development";

export default function RoutesScreen() {
  const best = useGameStore((s) => s.bestDistance);
  const selected = useGameStore((s) => s.selectedRoute);
  const selectRoute = useGameStore((s) => s.selectRoute);

  return (
    <ScreenFrame
      title="ROUTES"
      right={
        <span className="rounded-full bg-black/30 px-3 py-2 text-sm font-bold">
          🏆 {formatDistance(best)}
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
        {DEV && (
          <p className="text-center text-xs opacity-70">Dev build: all routes are unlocked</p>
        )}

        {ROUTES.map((r) => {
          const open = DEV || best >= r.unlockAt;
          const active = selected === r.id;
          return (
            <button
              key={r.id}
              disabled={!open}
              onClick={() => selectRoute(r.id)}
              className={`overflow-hidden rounded-3xl border-4 text-left transition enabled:active:scale-[0.98] ${
                active ? "border-orange-400" : "border-transparent"
              }`}
            >
              <div
                className="relative h-28"
                style={{
                  background: `linear-gradient(to bottom, ${r.sky} 55%, ${r.ground} 55%)`,
                }}
              >
                <span className="absolute left-3 top-2 text-4xl">{r.emoji}</span>
                <div
                  className="absolute bottom-0 left-1/2 h-[45%] w-28 -translate-x-1/2"
                  style={{
                    background: r.road,
                    clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)",
                  }}
                />
                {!open && (
                  <div className="absolute inset-0 grid place-items-center bg-black/55 text-3xl">
                    🔒
                  </div>
                )}
              </div>
              <div className="bg-white p-3 text-slate-900">
                <div className="text-lg font-black">{r.name}</div>
                <div className="text-sm text-slate-500">{r.blurb}</div>
                <div className="mt-1 text-xs font-bold text-slate-600">
                  {active
                    ? "Selected ✓"
                    : open
                    ? "Tap to select"
                    : `Reach ${formatDistance(r.unlockAt)} to unlock (best: ${formatDistance(best)})`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScreenFrame>
  );
}