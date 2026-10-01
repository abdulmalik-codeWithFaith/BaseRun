"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import Bicycle from "./Bicycle";

function Turntable({ bikeId, characterId }: { bikeId: string; characterId: string }) {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    if (g.current) g.current.rotation.y += Math.min(delta, 0.05) * 0.8;
  });
  return (
    <group ref={g}>
      <Bicycle bikeId={bikeId} characterId={characterId} preview />
    </group>
  );
}

export default function BikePreview({
  bikeId,
  characterId,
}: {
  bikeId: string;
  characterId: string;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [3.1, 1.7, 3.1], fov: 32 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.9, 0)}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[1.5, 40]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      <Turntable bikeId={bikeId} characterId={characterId} />
    </Canvas>
  );
}