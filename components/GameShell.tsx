"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLaneControls } from "@/game/useLaneControls";
import { useGameStore } from "@/store/useGameStore";
import MainMenu from "@/components/ui/MainMenu";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
});

export default function GameShell() {
  const status = useGameStore((s) => s.status);
  const [ready, setReady] = useState(false);
  useLaneControls();

  useEffect(() => {
    Promise.resolve(useGameStore.persist.rehydrate()).then(() =>
      setReady(true)
    );
  }, []);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-sky-500 text-white">
        Loading…
      </div>
    );
  }

  return (
    <main className="relative h-dvh w-screen overflow-hidden touch-none select-none">
      <GameCanvas />
      {status === "menu" && <MainMenu />}
      {/* Step 4: HUD + GameOver overlays go here */}
    </main>
  );
}