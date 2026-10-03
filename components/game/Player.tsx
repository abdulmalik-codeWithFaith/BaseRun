"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Mesh } from "three";
import Bicycle from "./Bicycle";
import { useGameStore } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { LANES, LANE_STIFFNESS, LANE_DAMPING } from "@/game/constants";

export default function Player() {
  const root = useRef<Group>(null);
  const lean = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const crashed = useGameStore.getState().status === "gameover";
    const l = lean.current;
    if (!l) return;

    if (crashed) {
      runtime.velX = 0;
          l.rotation.z = MathUtils.damp(l.rotation.z, MathUtils.clamp(-runtime.velX * 0.07, -0.35, 0.35), 8, dt);
    l.rotation.y = MathUtils.damp(l.rotation.y, MathUtils.clamp(-runtime.velX * 0.045, -0.25, 0.25), 8, dt);
      l.rotation.x = MathUtils.damp(l.rotation.x, 0, 8, dt);
      l.position.y = MathUtils.damp(l.position.y, 0.35, 8, dt);
      return;
    }

    // critically damped spring: eases in AND out, no sudden jerk
    const err = LANES[runtime.lane] - runtime.playerX;
    runtime.velX += (LANE_STIFFNESS * err - LANE_DAMPING * runtime.velX) * dt;
    runtime.playerX += runtime.velX * dt;

    if (root.current) root.current.position.x = runtime.playerX;

    l.position.y = runtime.playerY;
    // lean and yaw follow sideways speed, smoothed
    l.rotation.z = MathUtils.damp(l.rotation.z, MathUtils.clamp(-runtime.velX * 0.045, -0.35, 0.35), 10, dt);
    l.rotation.y = MathUtils.damp(l.rotation.y, MathUtils.clamp(-runtime.velX * 0.03, -0.25, 0.25), 10, dt);
    l.rotation.x = MathUtils.clamp(runtime.velY * 0.025, -0.3, 0.3);

    if (shadow.current) {
      const s = 1 / (1 + runtime.playerY * 0.8);
      shadow.current.scale.set(0.5 * s, 1.1 * s, 1);
    }
  });

  return (
    <group ref={root}>
      <mesh
        ref={shadow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[0.5, 1.1, 1]}
      >
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="black" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <group ref={lean}>
        <Bicycle />
      </group>
    </group>
  );
}