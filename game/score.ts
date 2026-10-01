import { COIN_SCORE } from "@/game/constants";

export const computeScore = (meters: number, coins: number) =>
  Math.floor(meters) + coins * COIN_SCORE;