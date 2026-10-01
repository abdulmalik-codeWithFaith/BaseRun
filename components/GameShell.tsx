"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useLaneControls } from "@/game/useLaneControls";
import { usePauseControls } from "@/game/usePauseControls";
import { useAudio } from "@/game/useAudio";
import { playSfx } from "@/game/audio";
import MainMenu from "@/components/ui/MainMenu";
import Showroom from "@/components/ui/Showroom";
import Settings from "@/components/ui/Settings";
import Hud from "@/components/ui/Hud";
import Countdown from "@/components/ui/Countdown";
import PauseMenu from "@/components/ui/PauseMenu";
import GameOver from "@/components/ui/GameOver";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
});

export default function GameShell() {
  const status = useGameStore((s) => s.status);
  const screen = useGameStore((s) => s.screen);
  const [ready, setReady] = useState(false);

  useLaneControls();
  usePauseControls();
  useAudio();

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

  const inRun =
    status === "countdown" || status === "playing" || status === "paused";
  const onMenu = status === "menu";

  return (
    <main
      className="relative h-dvh w-screen touch-none select-none overflow-hidden"
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("button")) playSfx("click");
      }}
    >
      <GameCanvas />

      {onMenu && screen === "home" && <MainMenu />}
      {onMenu && screen === "garage" && <Showroom mode="garage" />}
      {onMenu && screen === "shop" && <Showroom mode="shop" />}
      {onMenu && screen === "settings" && <Settings />}

      {inRun && <Hud />}
      {(status === "countdown" || status === "playing") && <Countdown />}
      {status === "paused" && <PauseMenu />}
      {status === "gameover" && <GameOver />}
    </main>
  );
}