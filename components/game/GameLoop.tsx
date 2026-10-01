"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { useGameStore } from "@/store/useGameStore";
import { runtime, resetRuntime } from "@/game/runtime";
import { playSfx } from "@/game/audio";
import {
  BASE_SPEED,
  MAX_SPEED,
  SPEED_RAMP,
  IDLE_SPEED,
  DISTANCE_PER_UNIT,
  JUMP_VELOCITY,
  GRAVITY,
} from "@/game/constants";

export default function GameLoop() {
  const lastRun = useRef(0);
  const lastMeters = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const { status, runId, setDistance } = useGameStore.getState();

    if (runId !== lastRun.current) {
      lastRun.current = runId;
      resetRuntime();
      lastMeters.current = 0;
    }

    switch (status) {
      case "playing": {
        runtime.elapsed += dt;
        const target = Math.min(MAX_SPEED, BASE_SPEED + runtime.elapsed * SPEED_RAMP);
        runtime.speed = MathUtils.damp(runtime.speed, target, 3, dt);
        runtime.distance += runtime.speed * dt * DISTANCE_PER_UNIT;

        // ---- jump physics ----
        runtime.jumpBuffer = Math.max(0, runtime.jumpBuffer - dt);
        const grounded = runtime.playerY <= 0 && runtime.velY <= 0;
        if (grounded && runtime.jumpBuffer > 0) {
          runtime.velY = JUMP_VELOCITY;
          runtime.jumpBuffer = 0;
          playSfx("jump");
        }
        if (runtime.playerY > 0 || runtime.velY > 0) {
          runtime.velY -= GRAVITY * dt;
          runtime.playerY += runtime.velY * dt;
          if (runtime.playerY <= 0) {
            runtime.playerY = 0;
            runtime.velY = 0;
          }
        }

        const meters = Math.floor(runtime.distance);
        if (meters !== lastMeters.current) {
          lastMeters.current = meters;
          setDistance(meters);
        }
        break;
      }
      case "paused":
        runtime.speed = 0;
        break;
      case "menu":
        runtime.speed = MathUtils.damp(runtime.speed, IDLE_SPEED, 3, dt);
        break;
      default: // countdown, gameover
        runtime.speed = MathUtils.damp(runtime.speed, 0, 3, dt);
    }
  });

  return null;
}