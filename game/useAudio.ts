"use client";

import { useEffect, useState } from "react";
import { useGameStore, type GameStatus } from "@/store/useGameStore";
import { preloadAudio, setMusic } from "@/game/audio";

const MUSIC_VOLUME: Record<GameStatus, number> = {
  menu: 0.22,
  countdown: 0.3,
  playing: 0.3,
  paused: 0.1,
  gameover: 0.12,
};

export function useAudio() {
  const status = useGameStore((s) => s.status);
  const musicOn = useGameStore((s) => s.settings.music);
  const [unlocked, setUnlocked] = useState(false);
  const [hidden, setHidden] = useState(false);

  // first user gesture unlocks audio (pointerup counts as activation on touch)
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      preloadAudio();
      setUnlocked(true);
    };
    window.addEventListener("pointerup", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerup", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlocked]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    setMusic(musicOn && !hidden, MUSIC_VOLUME[status]);
  }, [unlocked, musicOn, hidden, status]);
}