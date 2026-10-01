"use client";

import { Canvas } from "@react-three/fiber";
import GameLoop from "./GameLoop";
import WorldSystem from "./WorldSystem";
import ObstacleField from "./ObstacleField";
import CoinField from "./CoinField";
import Player from "./Player";
import CameraRig from "./CameraRig";
import Road from "./Road";

export default function GameCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 3.2, 6], fov: 60 }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#8fd3ff"]} />
      <fog attach="fog" args={["#8fd3ff", 25, 85]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} />

      <GameLoop />
      <WorldSystem />
      <ObstacleField />
      <CoinField />
      <Player />
      <CameraRig />
      <Road />
    </Canvas>
  );
}