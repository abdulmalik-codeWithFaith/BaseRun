"use client";

import { Canvas } from "@react-three/fiber";
import { useGameStore } from "@/store/useGameStore";
import { getRoute } from "@/game/routes";
import GameLoop from "./GameLoop";
import WorldSystem from "./WorldSystem";
import ObstacleField from "./ObstacleField";
import CoinField from "./CoinField";
import SceneryField from "./SceneryField";
import Player from "./Player";
import CameraRig from "./CameraRig";
import Road from "./Road";

export default function GameCanvas() {
  const quality = useGameStore((s) => s.settings.quality);
  const covered = useGameStore((s) => s.status === "menu" && s.screen !== "home");
  const route = getRoute(useGameStore((s) => s.selectedRoute));

  return (
    <Canvas
      key={quality}
      frameloop={covered ? "never" : "always"}
      dpr={quality === "low" ? 1 : [1, 2]}
      gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
      camera={{ position: [0, 3.2, 6], fov: 60 }}
      className="!absolute inset-0"
    >
      <color attach="background" args={[route.sky]} />
      <fog attach="fog" args={[route.fog, route.fogNear, route.fogFar]} />
      <ambientLight intensity={route.ambient} />
      <directionalLight position={[5, 10, 5]} intensity={route.sun} color={route.sunColor} />

      <GameLoop />
      <WorldSystem />
      <ObstacleField />
      <CoinField />
      <SceneryField />
      <Player />
      <CameraRig />
      <Road />
    </Canvas>
  );
}