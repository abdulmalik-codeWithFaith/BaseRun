"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { runtime } from "@/game/runtime";
import { OBSTACLE_KINDS, type ObstacleKind } from "@/game/obstacles";
import { OBSTACLE_POOL } from "@/game/constants";
import { BarrierModel, CarModel, ConeModel, TruckModel } from "./ObstacleModels";

const COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#a855f7"];

function ObstacleSlot({ index }: { index: number }) {
  const root = useRef<Group>(null);
  const models = useRef<Partial<Record<ObstacleKind, Group | null>>>({});
  const shown = useRef<ObstacleKind | null>(null);
  const color = COLORS[index % COLORS.length];

  useFrame(() => {
    const g = root.current;
    if (!g) return;
    const o = runtime.obstacles[index];
    g.visible = o.active;
    if (!o.active) return;

    g.position.set(o.x, 0, o.z);

    if (shown.current !== o.kind) {
      for (const k of OBSTACLE_KINDS) {
        const m = models.current[k];
        if (m) m.visible = k === o.kind;
      }
      shown.current = o.kind;
    }
  });

  return (
    <group ref={root} visible={false}>
      <group ref={(el) => { models.current.cone = el; }} visible={false}>
        <ConeModel />
      </group>
      <group ref={(el) => { models.current.barrier = el; }} visible={false}>
        <BarrierModel />
      </group>
      <group ref={(el) => { models.current.car = el; }} visible={false}>
        <CarModel color={color} />
      </group>
      <group ref={(el) => { models.current.truck = el; }} visible={false}>
        <TruckModel color={color} />
      </group>
    </group>
  );
}

export default function ObstacleField() {
  return (
    <>
      {Array.from({ length: OBSTACLE_POOL }, (_, i) => (
        <ObstacleSlot key={i} index={i} />
      ))}
    </>
  );
}