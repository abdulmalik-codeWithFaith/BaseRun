"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { useGameStore, type GameStatus } from "@/store/useGameStore";
import { runtime, resetRuntime } from "@/game/runtime";
import {
  BASE_SPEED,
  MAX_SPEED,
  SPEED_RAMP,
  IDLE_SPEED,
  DISTANCE_PER_UNIT,
} from "@/game/constants";

export default function GameLoop() {
  const prevStatus = useRef<GameStatus>("menu");
  const lastMeters = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // clamp so tab-switching doesn't teleport
    const { status, setDistance } = useGameStore.getState();

    if (status !== prevStatus.current) {
      if (status === "playing") {
        resetRuntime();
        lastMeters.current = 0;
      }
      prevStatus.current = status;
    }

    if (status === "playing") {
      runtime.elapsed += dt;
      const target = Math.min(MAX_SPEED, BASE_SPEED + runtime.elapsed * SPEED_RAMP);
      runtime.speed = MathUtils.damp(runtime.speed, target, 3, dt);
      runtime.distance += runtime.speed * dt * DISTANCE_PER_UNIT;

      const meters = Math.floor(runtime.distance);
      if (meters !== lastMeters.current) {
        lastMeters.current = meters;
        setDistance(meters);
      }
    } else {
      const target = status === "menu" ? IDLE_SPEED : 0;
      runtime.speed = MathUtils.damp(runtime.speed, target, 3, dt);
    }
  });

  return null;
}