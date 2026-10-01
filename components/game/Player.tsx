"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Mesh } from "three";
import Bicycle from "./Bicycle";
import { useGameStore } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { LANES, LANE_DAMP } from "@/game/constants";

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
      l.rotation.z = MathUtils.damp(l.rotation.z, runtime.crashSide * 1.45, 8, dt);
      l.rotation.y = MathUtils.damp(l.rotation.y, runtime.crashSide * 0.5, 6, dt);
      l.rotation.x = MathUtils.damp(l.rotation.x, 0, 8, dt);
      l.position.y = MathUtils.damp(l.position.y, 0.35, 8, dt);
      return;
    }

    const target = LANES[runtime.lane];
    runtime.playerX = MathUtils.damp(runtime.playerX, target, LANE_DAMP, dt);
    const diff = target - runtime.playerX;

    if (root.current) root.current.position.x = runtime.playerX;

    l.position.y = runtime.playerY;
    l.rotation.z = MathUtils.clamp(-diff * 0.18, -0.35, 0.35);
    l.rotation.y = MathUtils.clamp(-diff * 0.12, -0.3, 0.3);
    l.rotation.x = MathUtils.clamp(runtime.velY * 0.025, -0.3, 0.3); // nose up / down

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