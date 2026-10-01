import { Howl } from "howler";
import { useGameStore } from "@/store/useGameStore";
import { SFX_NAMES, synthMusic, synthSfx, type SfxName } from "@/game/synth";

const SFX_VOLUME: Record<SfxName, number> = {
  coin: 0.5,
  crash: 0.9,
  click: 0.5,
  swoosh: 0.35,
  tick: 0.5,
  go: 0.6,
jump: 0.5,
};

const sfx: Partial<Record<SfxName, Howl>> = {};
let music: Howl | null = null;
let musicId: number | null = null;

function getSfx(name: SfxName): Howl | null {
  if (typeof window === "undefined") return null;
  let h = sfx[name];
  if (!h) {
    h = new Howl({ src: [synthSfx(name)], format: ["wav"], volume: SFX_VOLUME[name] });
    sfx[name] = h;
  }
  return h;
}

// Builds and decodes every sound effect up front so the first crash isn't delayed.
export function preloadAudio() {
  for (const n of SFX_NAMES) getSfx(n);
}

export function playSfx(name: SfxName) {
  if (!useGameStore.getState().settings.sound) return;
  getSfx(name)?.play();
}

export function setMusic(play: boolean, volume: number) {
  if (typeof window === "undefined") return;

  if (!play) {
    music?.pause();
    return;
  }
  if (!music) {
    music = new Howl({ src: [synthMusic()], format: ["wav"], loop: true, volume });
  }
  music.volume(volume);

  if (musicId === null) musicId = music.play();
  else if (!music.playing(musicId)) music.play(musicId); // resume the same sound, never a second copy
}