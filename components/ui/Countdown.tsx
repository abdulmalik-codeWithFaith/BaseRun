"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { playSfx } from "@/game/audio";

const STEPS = ["3", "2", "1", "GO!"];
const STEP_MS = 750;

export default function Countdown() {
  const beginPlay = useGameStore((s) => s.beginPlay);
  const firstTime = useGameStore((s) => s.bestDistance === 0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) return;
    const last = step === STEPS.length - 1;
    playSfx(last ? "go" : "tick");
    if (last) beginPlay(); // controls go live on "GO!"
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, beginPlay]);

  if (step >= STEPS.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
      <div
        key={step}
        className={`anim-count text-9xl font-black drop-shadow-[0_6px_0_rgba(0,0,0,0.25)] ${
          step === STEPS.length - 1 ? "text-lime-300" : "text-white"
        }`}
      >
        {STEPS[step]}
      </div>
      {firstTime && step < 3 && (
        <p className="mt-4 rounded-full bg-black/40 px-4 py-2 text-sm font-semibold text-white">
          Swipe or use ← → / A D to change lanes
        </p>
      )}
    </div>
  );
}