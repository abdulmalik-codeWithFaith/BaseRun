import { COIN_POOL, OBSTACLE_POOL } from "@/game/constants";
import type { ObstacleKind } from "@/game/obstacles";

export interface Obstacle {
  active: boolean;
  kind: ObstacleKind;
  x: number;
  z: number;
}

export interface Coin {
  active: boolean;
  x: number;
  y: number;
  z: number;
}

export const runtime = {
  speed: 0,     // current world speed (units/s)
  distance: 0,  // meters this run
  elapsed: 0,   // seconds this run
  lane: 1,      // 0 = left, 1 = center, 2 = right
  playerX: 0,   // smoothed world x of the player
  crashSide: 1, // which way the bike tips over (-1 / 1)

  // pooled entities (z is negative ahead of the player, 0 = player)
  obstacles: Array.from({ length: OBSTACLE_POOL }, (): Obstacle => ({
    active: false,
    kind: "cone",
    x: 0,
    z: 0,
  })),
  coins: Array.from({ length: COIN_POOL }, (): Coin => ({
    active: false,
    x: 0,
    y: 0.9,
    z: 0,
  })),

  // spawner bookkeeping
  sinceRow: 0, // distance the most recent row has travelled from SPAWN_Z
  prevBlocked: [false, false, false] as boolean[],
};

export function resetRuntime() {
  runtime.distance = 0;
  runtime.elapsed = 0;
  runtime.lane = 1;
  runtime.playerX = 0;
  // speed is kept so the road doesn't jump when the run starts
  // entities are reset by seedWorld() in spawner.ts
}