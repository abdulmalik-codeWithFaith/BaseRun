"use client";

import { useFrame } from "@react-three/fiber";
import { MathUtils, type PerspectiveCamera } from "three";
import { runtime } from "@/game/runtime";
import { LANES, MAX_SPEED } from "@/game/constants";

export default function CameraRig() {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const cam = state.camera as PerspectiveCamera;
    const x = runtime.playerX;
    const diff = LANES[runtime.lane] - x;

    cam.position.x = MathUtils.damp(cam.position.x, x * 0.6, 5, dt);
        cam.position.y = 3.2 + runtime.playerY * 0.4;
    cam.position.z = 6;
    cam.lookAt(x * 0.4, 1.0 + runtime.playerY * 0.5, -8);
    cam.rotateZ(-diff * 0.02); // slight bank in lane changes

    const fov = 60 + (runtime.speed / MAX_SPEED) * 12;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = MathUtils.damp(cam.fov, fov, 3, dt);
      cam.updateProjectionMatrix();
    }
  });

  return null;
}