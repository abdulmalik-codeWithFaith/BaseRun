"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Object3D,
  type InstancedMesh,
} from "three";
import { runtime } from "@/game/runtime";
import { COIN_POOL } from "@/game/constants";

export default function CoinField() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const geo = useMemo(() => {
    const g = new CylinderGeometry(0.32, 0.32, 0.07, 20);
    g.rotateX(Math.PI / 2); // disc faces the camera
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#ffc61a",
        metalness: 0.6,
        roughness: 0.3,
        emissive: "#7a5200",
        emissiveIntensity: 0.5,
      }),
    []
  );

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < COIN_POOL; i++) {
      const c = runtime.coins[i];
      if (c.active) {
        dummy.position.set(c.x, c.y, c.z);
        dummy.rotation.set(0, t * 3 + i, 0);
        dummy.scale.setScalar(1);
      } else {
        dummy.position.set(0, -10, 0);
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geo, mat, COIN_POOL]} frustumCulled={false} />;
}