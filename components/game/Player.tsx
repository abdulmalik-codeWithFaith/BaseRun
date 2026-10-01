"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import Bicycle from "./Bicycle";
import { useGameStore } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { LANES, LANE_DAMP } from "@/game/constants";

export default function Player() {
  const root = useRef<Group>(null);
  const lean = useRef<Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const crashed = useGameStore.getState().status === "gameover";
    const l = lean.current;
    if (!l) return;

    if (crashed) {
      // freeze lateral motion and tip over to the side we were hit from
      l.rotation.z = MathUtils.damp(l.rotation.z, runtime.crashSide * 1.45, 8, dt);
      l.rotation.y = MathUtils.damp(l.rotation.y, runtime.crashSide * 0.5, 6, dt);
      l.position.y = MathUtils.damp(l.position.y, 0.35, 8, dt);
      return;
    }

    const target = LANES[runtime.lane];
    runtime.playerX = MathUtils.damp(runtime.playerX, target, LANE_DAMP, dt);
    const diff = target - runtime.playerX; // negative when moving left

    if (root.current) root.current.position.x = runtime.playerX;
    l.position.y = 0;
    l.rotation.z = MathUtils.clamp(-diff * 0.18, -0.35, 0.35); // lean into turn
    l.rotation.y = MathUtils.clamp(-diff * 0.12, -0.3, 0.3);   // point toward turn
  });

  return (
    <group ref={root}>
      {/* blob shadow stays flat on the road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[0.5, 1.1, 1]}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="black" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <group ref={lean}>
        <Bicycle />
      </group>
    </group>
  );
}