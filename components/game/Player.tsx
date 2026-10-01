"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import Bicycle from "./Bicycle";
import { runtime } from "@/game/runtime";
import { LANES, LANE_DAMP } from "@/game/constants";

export default function Player() {
  const root = useRef<Group>(null);
  const lean = useRef<Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = LANES[runtime.lane];
    runtime.playerX = MathUtils.damp(runtime.playerX, target, LANE_DAMP, dt);

    const diff = target - runtime.playerX; // negative when moving left
    if (root.current) root.current.position.x = runtime.playerX;
    if (lean.current) {
      lean.current.rotation.z = MathUtils.clamp(-diff * 0.18, -0.35, 0.35); // lean into turn
      lean.current.rotation.y = MathUtils.clamp(-diff * 0.12, -0.3, 0.3);   // point toward turn
    }
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