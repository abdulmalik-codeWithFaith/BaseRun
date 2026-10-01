"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import ScreenFrame from "./ScreenFrame";

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left active:scale-[0.99]"
    >
      <span>
        <span className="block font-bold">{label}</span>
        {hint && <span className="block text-xs opacity-70">{hint}</span>}
      </span>
      <span
        className={`relative h-7 w-12 flex-none rounded-full transition-colors ${
          on ? "bg-lime-400" : "bg-white/25"
        }`}
      >
        <i
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            on ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function Settings() {
  const settings = useGameStore((s) => s.settings);
  const update = useGameStore((s) => s.updateSettings);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const grantCoins = useGameStore((s) => s.grantCoins);
  const [confirm, setConfirm] = useState(false);

  // the "tap again" confirmation expires after 3 s
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(false), 3000);
    return () => clearTimeout(t);
  }, [confirm]);

  return (
    <ScreenFrame title="SETTINGS">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6">
        <Toggle label="Sound effects" on={settings.sound} onChange={(v) => update({ sound: v })} />
        <Toggle label="Music" on={settings.music} onChange={(v) => update({ music: v })} />
        <Toggle
          label="Vibration"
          hint="Haptic feedback on crashes (Android)"
          on={settings.vibration}
          onChange={(v) => update({ vibration: v })}
        />

        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <div className="font-bold">Graphics quality</div>
          <div className="text-xs opacity-70">Low renders at 1x resolution without antialiasing</div>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-black/25 p-1">
            {(["low", "high"] as const).map((q) => (
              <button
                key={q}
                onClick={() => update({ quality: q })}
                className={`rounded-lg py-2 text-sm font-black uppercase ${
                  settings.quality === q ? "bg-white text-slate-900" : "opacity-70"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-3">
          <div className="font-bold">Controls</div>
          <div className="mt-1 text-sm opacity-80">
            ← → or A D to change lanes · swipe on touch · Esc or P to pause
          </div>
        </div>

        <button
          onClick={() => (confirm ? (resetProgress(), setConfirm(false)) : setConfirm(true))}
          className={`rounded-2xl py-3 font-black active:scale-95 ${
            confirm ? "bg-red-600" : "bg-red-500/30"
          }`}
        >
          {confirm ? "TAP AGAIN TO ERASE EVERYTHING" : "RESET PROGRESS"}
        </button>

        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => grantCoins(1000)}
            className="rounded-2xl border border-dashed border-white/40 py-3 text-sm font-bold active:scale-95"
          >
            +1000 🪙 (dev only, for testing the shop)
          </button>
        )}
      </div>
    </ScreenFrame>
  );
}