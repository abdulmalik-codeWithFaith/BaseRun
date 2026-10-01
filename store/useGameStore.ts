import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GameStatus = "menu" | "playing" | "gameover";

interface Settings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  quality: "low" | "high";
}

interface GameState {
  // ---- persisted ----
  wallet: number;                 // total coins owned
  bestDistance: number;           // meters
  selectedBike: string;
  selectedCharacter: string;
  unlockedBikes: string[];
  unlockedCharacters: string[];
  settings: Settings;

  // ---- session (not persisted) ----
  status: GameStatus;
  runCoins: number;
  runDistance: number;

  // ---- actions ----
  startRun: () => void;
  endRun: () => void;
  goMenu: () => void;
  addCoin: (n?: number) => void;
  setDistance: (m: number) => void;
  updateSettings: (s: Partial<Settings>) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      wallet: 0,
      bestDistance: 0,
      selectedBike: "bike-1",
      selectedCharacter: "character-1",
      unlockedBikes: ["bike-1"],
      unlockedCharacters: ["character-1"],
      settings: { sound: true, music: true, vibration: true, quality: "high" },

      status: "menu",
      runCoins: 0,
      runDistance: 0,

      startRun: () => set({ status: "playing", runCoins: 0, runDistance: 0 }),

      endRun: () => {
        const { runCoins, runDistance, wallet, bestDistance } = get();
        set({
          status: "gameover",
          wallet: wallet + runCoins,
          bestDistance: Math.max(bestDistance, runDistance),
        });
      },

      goMenu: () => set({ status: "menu" }),
      addCoin: (n = 1) => set((s) => ({ runCoins: s.runCoins + n })),
      setDistance: (m) => set({ runDistance: m }),
      updateSettings: (s) =>
        set((st) => ({ settings: { ...st.settings, ...s } })),
    }),
    {
      name: "baserun-save-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // we rehydrate manually after mount (avoids SSR mismatch)
      partialize: (s) => ({
        wallet: s.wallet,
        bestDistance: s.bestDistance,
        selectedBike: s.selectedBike,
        selectedCharacter: s.selectedCharacter,
        unlockedBikes: s.unlockedBikes,
        unlockedCharacters: s.unlockedCharacters,
        settings: s.settings,
      }),
    }
  )
);