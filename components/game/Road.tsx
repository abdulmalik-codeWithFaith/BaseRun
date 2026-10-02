"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Group, MeshStandardMaterial } from "three";
import { runtime } from "@/game/runtime";
import { useGameStore } from "@/store/useGameStore";
import { getRoute } from "@/game/routes";
import { LANE_WIDTH, ROAD_WIDTH, TILE_COUNT, TILE_LENGTH } from "@/game/constants";

const DASH_Z = [-7.5, -2.5, 2.5, 7.5]; // 4 dashes per tile, evenly spaced
const POST_Z = [-5, 5];
const WRAP = TILE_LENGTH * TILE_COUNT;

export default function Road() {
  const route = getRoute(useGameStore((s) => s.selectedRoute));
  const tiles = useRef<(Group | null)[]>([]);

  const shared = useMemo(
    () => ({
      dash: new BoxGeometry(0.12, 0.01, 2),
      edge: new BoxGeometry(0.14, 0.01, TILE_LENGTH),
      curb: new BoxGeometry(0.3, 0.15, TILE_LENGTH),
      post: new BoxGeometry(0.15, 1.4, 0.15),
      white: new MeshStandardMaterial({ color: "#f5f5f5" }),
      curbMat: new MeshStandardMaterial({ color: "#9a9aa0" }),
      postMat: new MeshStandardMaterial({ color: "#d9534f" }),
    }),
    []
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const move = runtime.speed * dt;
    for (const t of tiles.current) {
      if (!t) continue;
      t.position.z += move;
      if (t.position.z > TILE_LENGTH) t.position.z -= WRAP; // recycle to the back
    }
  });

  const half = LANE_WIDTH / 2;
  const edgeX = ROAD_WIDTH / 2 - 0.2;
  const curbX = ROAD_WIDTH / 2 + 0.15;
  const postX = ROAD_WIDTH / 2 + 1.6;

  return (
    <group>
      {Array.from({ length: TILE_COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            tiles.current[i] = el;
          }}
          position={[0, 0, TILE_LENGTH / 2 - i * TILE_LENGTH]}
        >
          {/* grass */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
            <planeGeometry args={[80, TILE_LENGTH]} />
            <meshStandardMaterial color="#6cbf5c" />
          </mesh>

          {/* asphalt */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROAD_WIDTH, TILE_LENGTH]} />
            <meshStandardMaterial color="#3a3a3f" />
          </mesh>

          {/* solid edge lines + curbs */}
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh geometry={shared.edge} material={shared.white} position={[s * edgeX, 0.008, 0]} />
              <mesh geometry={shared.curb} material={shared.curbMat} position={[s * curbX, 0.075, 0]} />
              {POST_Z.map((z) => (
                <mesh key={z} geometry={shared.post} material={shared.postMat} position={[s * postX, 0.7, z]} />
              ))}
            </group>
          ))}

          {/* dashed lane dividers */}
          {[-half, half].map((x) =>
            DASH_Z.map((z) => (
              <mesh key={`${x}-${z}`} geometry={shared.dash} material={shared.white} position={[x, 0.008, z]} />
            ))
          )}
        </group>
      ))}
    </group>
  );
}