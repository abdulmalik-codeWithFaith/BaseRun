"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore, type GameStatus } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { OBSTACLE_SPECS } from "@/game/obstacles";
import { clearWorld, seedWorld, spawnRow } from "@/game/spawner";
import { vibrate } from "@/game/haptics";
import { playSfx } from "@/game/audio";
import {
  DESPAWN_Z,
  SPAWN_Z,
  MIN_ROW_GAP,
  ROW_TIME,
  PLAYER_HALF_W,
  PLAYER_HALF_D,
  HIT_FORGIVENESS,
  COIN_REACH_X,
  COIN_REACH_Z,
  CRASH_SPEED_KEEP,
} from "@/game/constants";

export default function WorldSystem() {
  const prev = useRef<GameStatus>("menu");
  const lastRun = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const store = useGameStore.getState();
    const status = store.status;

    // new run (start or restart) seeds the world; resuming from pause does not
    if (store.runId !== lastRun.current) {
      lastRun.current = store.runId;
      if (status === "countdown" || status === "paused") seedWorld();
    }
    if (status !== prev.current) {
      if (status === "menu") clearWorld();
      prev.current = status;
    }

    // scroll everything toward the player (also while crashing, so it slides to a stop)
    const move = runtime.speed * dt;
    for (const o of runtime.obstacles) {
      if (!o.active) continue;
      o.z += move;
      if (o.z > DESPAWN_Z) o.active = false;
    }
    for (const c of runtime.coins) {
      if (!c.active) continue;
      c.z += move;
      if (c.z > DESPAWN_Z) c.active = false;
    }

    if (status !== "playing") return;

    // ---- spawn ----
    runtime.sinceRow += move;
    const gap = Math.max(MIN_ROW_GAP, runtime.speed * ROW_TIME);
    if (runtime.sinceRow >= gap) {
      const over = runtime.sinceRow - gap;
      spawnRow(SPAWN_Z + over, gap);
      runtime.sinceRow = over;
    }

    // ---- collisions ----
    const px = runtime.playerX;

    for (const o of runtime.obstacles) {
      if (!o.active) continue;
      const spec = OBSTACLE_SPECS[o.kind];
      const halfW = (spec.w / 2) * HIT_FORGIVENESS + PLAYER_HALF_W;
      const halfD = (spec.d / 2) * HIT_FORGIVENESS;

      if (
        Math.abs(o.x - px) < halfW &&
        o.z - move - halfD <= PLAYER_HALF_D &&
        o.z + halfD >= -PLAYER_HALF_D
      ) {
        runtime.crashSide = px >= o.x ? 1 : -1;
        runtime.speed *= CRASH_SPEED_KEEP;
        vibrate(150);
        store.endRun();
        playSfx("crash");
        return;
      }
    }

    // ---- coin pickup ----
    let picked = 0;
    for (const c of runtime.coins) {
      if (!c.active) continue;
      if (
        Math.abs(c.x - px) < COIN_REACH_X &&
        c.z - move <= COIN_REACH_Z &&
        c.z >= -COIN_REACH_Z
      ) {
        c.active = false;
        picked++;
      }
    }
        if (picked) {
      store.addCoin(picked);
      playSfx("coin");
    } // Step 6: coin sound / vibration goes here
  });

  return null;
}