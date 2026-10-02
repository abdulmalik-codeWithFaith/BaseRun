import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { BIKES, CHARACTERS } from "@/game/catalog";

export type GameStatus = "menu" | "countdown" | "playing" | "paused" | "gameover";
   export type Screen = "home" | "garage" | "shop" | "settings" | "routes";

export interface Settings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  quality: "low" | "high";
}

interface GameState {
  // ---- persisted ----
  wallet: number;
  bestDistance: number;
  selectedBike: string;
  selectedCharacter: string;
  unlockedBikes: string[];
  unlockedCharacters: string[];
  settings: Settings;
  selectedRoute: string;
  selectRoute: (id: string) => void;
  // ---- session (not persisted) ----
  status: GameStatus;
  screen: Screen;
  runId: number;
  runCoins: number;
  runDistance: number;
  isNewBest: boolean;

  // ---- run actions ----
  startRun: () => void;
  beginPlay: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  restartRun: () => void;
  endRun: () => void;
  quitRun: () => void;
  goMenu: () => void;
  addCoin: (n?: number) => void;
  setDistance: (m: number) => void;

  // ---- Step 5 actions ----
  openScreen: (s: Screen) => void;
  buyBike: (id: string) => boolean;
  buyCharacter: (id: string) => boolean;
  selectBike: (id: string) => void;
  selectCharacter: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  grantCoins: (n: number) => void;
  resetProgress: () => void;
}

const DEFAULT_SAVE = {
  wallet: 0,
  bestDistance: 0,
  
  selectedBike: "bike-1",
  selectedCharacter: "character-1",
  unlockedBikes: ["bike-1"],
  unlockedCharacters: ["character-1"],
  selectedRoute: "city",
};
const DEFAULT_SETTINGS: Settings = {
  sound: true,
  music: true,
  vibration: true,
  quality: "high",
};

// Only writes to localStorage when the saved JSON actually changed.
let lastWritten: string | null = null;
const dedupedLocalStorage: StateStorage = {
  getItem: (name) => {
    lastWritten = localStorage.getItem(name);
    return lastWritten;
  },
  setItem: (name, value) => {
    if (value === lastWritten) return;
    lastWritten = value;
    localStorage.setItem(name, value);
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      const bank = () => {
        const { runCoins, runDistance, wallet, bestDistance } = get();
        const isNewBest = runDistance > bestDistance;
        return {
          wallet: wallet + runCoins,
          bestDistance: isNewBest ? runDistance : bestDistance,
          isNewBest,
        };
      };

      const freshRun = () => ({
        status: "countdown" as const,
        screen: "home" as const,
        runId: get().runId + 1,
        runCoins: 0,
        runDistance: 0,
        isNewBest: false,
      });

      return {
        ...DEFAULT_SAVE,
        settings: DEFAULT_SETTINGS,

        status: "menu",
        screen: "home",
        runId: 0,
        runCoins: 0,
        runDistance: 0,
        isNewBest: false,

        startRun: () => set(freshRun()),

        beginPlay: () => {
          if (get().status === "countdown") set({ status: "playing" });
        },

        pauseRun: () => {
          const s = get().status;
          if (s === "playing" || s === "countdown") set({ status: "paused" });
        },

        resumeRun: () => {
          if (get().status === "paused") set({ status: "countdown" });
        },

        restartRun: () => {
          if (get().status !== "paused") return;
          set({ ...bank(), ...freshRun() });
        },

        endRun: () => {
          if (get().status !== "playing") return;
          set({ ...bank(), status: "gameover" });
        },

        quitRun: () => {
          if (get().status !== "paused") return;
          set({ ...bank(), isNewBest: false, status: "menu", screen: "home" });
        },

        goMenu: () => set({ status: "menu", screen: "home" }),
        addCoin: (n = 1) => set((s) => ({ runCoins: s.runCoins + n })),
        setDistance: (m) => set({ runDistance: m }),

        // ---- Step 5 ----
        openScreen: (screen) => set({ screen }),

        buyBike: (id) => {
          const def = BIKES.find((b) => b.id === id);
          const s = get();
          if (!def || s.unlockedBikes.includes(id) || s.wallet < def.price) return false;
          set({
            wallet: s.wallet - def.price,
            unlockedBikes: [...s.unlockedBikes, id],
            selectedBike: id, // buying equips
          });
          return true;
        },

        buyCharacter: (id) => {
          const def = CHARACTERS.find((c) => c.id === id);
          const s = get();
          if (!def || s.unlockedCharacters.includes(id) || s.wallet < def.price) return false;
          set({
            wallet: s.wallet - def.price,
            unlockedCharacters: [...s.unlockedCharacters, id],
            selectedCharacter: id,
          });
          return true;
        },

        selectBike: (id) => {
          if (get().unlockedBikes.includes(id)) set({ selectedBike: id });
        },
        selectRoute: (id) => set({ selectedRoute: id }),
        selectCharacter: (id) => {
          if (get().unlockedCharacters.includes(id)) set({ selectedCharacter: id });
        },

        updateSettings: (s) =>
          set((st) => ({ settings: { ...st.settings, ...s } })),

        grantCoins: (n) => set((s) => ({ wallet: s.wallet + n })),

        resetProgress: () => set({ ...DEFAULT_SAVE, settings: DEFAULT_SETTINGS }),
      };
    },
    {
      name: "baserun-save-v1",
      storage: createJSONStorage(() => dedupedLocalStorage),
      skipHydration: true,
      partialize: (s) => ({
        wallet: s.wallet,
        bestDistance: s.bestDistance,
        selectedBike: s.selectedBike,
        selectedCharacter: s.selectedCharacter,
        unlockedBikes: s.unlockedBikes,
        unlockedCharacters: s.unlockedCharacters,
        settings: s.settings,
        selectedRoute: s.selectedRoute,
      }),
    }
  )
);