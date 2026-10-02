"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useGameStore } from "@/store/useGameStore";
import { runtime } from "@/game/runtime";
import { getRoute, type SceneryKind } from "@/game/routes";
import { resetScenery, scenery, stepScenery } from "@/game/scenery";
import { SCENERY_POOL } from "@/game/constants";
import { SceneryModel } from "./SceneryModels";

function Driver() {
  const route = getRoute(useGameStore((s) => s.selectedRoute));
  const last = useRef("");

  useFrame((_, delta) => {
    if (last.current !== route.id) {
      last.current = route.id;
      resetScenery();
    }
    stepScenery(runtime.speed * Math.min(delta, 0.05), route);
  });

  return null;
}

function Slot({ index, kinds }: { index: number; kinds: SceneryKind[] }) {
  const root = useRef<Group>(null);
  const models = useRef<Partial<Record<SceneryKind, Group | null>>>({});
  const shown = useRef<SceneryKind | null>(null);

  useFrame(() => {
    const g = root.current;
    if (!g) return;
    const it = scenery[index];
    g.visible = it.active;
    if (!it.active) return;

    g.position.set(it.x, 0, it.z);
    g.rotation.y = it.ry;
    g.scale.set(it.s, it.h, it.s);

    if (shown.current !== it.kind) {
      for (const k of kinds) {
        const m = models.current[k];
        if (m) m.visible = k === it.kind;
      }
      shown.current = it.kind;
    }
  });

  return (
    <group ref={root} visible={false}>
      {kinds.map((k) => (
        <group
          key={k}
          ref={(el) => {
            models.current[k] = el;
          }}
          visible={false}
        >
          <SceneryModel kind={k} i={index} />
        </group>
      ))}
    </group>
  );
}

export default function SceneryField() {
  const route = getRoute(useGameStore((s) => s.selectedRoute));
  const kinds = Array.from(new Set(route.scenery));

  return (
    <>
      <Driver />
      {/* keyed by route, so slots rebuild when the route changes */}
      {Array.from({ length: SCENERY_POOL }, (_, i) => (
        <Slot key={`${route.id}-${i}`} index={i} kinds={kinds} />
      ))}
    </>
  );
}