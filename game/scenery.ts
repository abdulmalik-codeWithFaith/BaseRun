import {
  ROAD_WIDTH,
  SCENERY_DESPAWN,
  SCENERY_GAP_VAR,
  SCENERY_MIN_GAP,
  SCENERY_POOL,
  SCENERY_SPAWN_Z,
} from "@/game/constants";
import type { RouteDef, SceneryKind } from "@/game/routes";

export interface SceneryItem {
  active: boolean;
  kind: SceneryKind;
  side: -1 | 1;
  x: number;
  z: number;
  s: number;   // width scale
  h: number;   // height scale
  ry: number;  // rotation
}

export const scenery: SceneryItem[] = Array.from(
  { length: SCENERY_POOL },
  (): SceneryItem => ({ active: false, kind: "tree", side: -1, x: 0, z: 0, s: 1, h: 1, ry: 0 })
);

type Range = [number, number];
// off = distance from the road edge, s = width scale, h = extra height scale
const SPEC: Record<SceneryKind, { off: Range; s: Range; h: Range }> = {
  building: { off: [6, 9],     s: [0.9, 1.3], h: [0.8, 1.9] },
  lamp:     { off: [2.7, 2.9], s: [1, 1],     h: [1, 1] },
  tree:     { off: [3.5, 8],   s: [0.8, 1.4], h: [0.9, 1.3] },
  house:    { off: [5, 8],     s: [0.9, 1.2], h: [0.9, 1.1] },
  hay:      { off: [3.5, 6],   s: [0.8, 1.2], h: [0.8, 1.2] },
  cactus:   { off: [3.5, 10],  s: [0.8, 1.3], h: [0.8, 1.5] },
  rock:     { off: [3.5, 9],   s: [0.7, 1.6], h: [0.6, 1.2] },
};

const FACES_ROAD = new Set<SceneryKind>(["building", "house", "lamp"]);
const rand = ([a, b]: Range) => a + Math.random() * (b - a);

export function resetScenery() {
  for (const s of scenery) s.active = false;
}

function spawn(side: -1 | 1, z: number, route: RouteDef): boolean {
  const it = scenery.find((i) => !i.active);
  if (!it) return false;
  const kind = route.scenery[Math.floor(Math.random() * route.scenery.length)];
  const spec = SPEC[kind];
  it.active = true;
  it.kind = kind;
  it.side = side;
  it.x = side * (ROAD_WIDTH / 2 + rand(spec.off));
  it.z = z;
  it.s = rand(spec.s);
  it.h = it.s * rand(spec.h);
  it.ry = FACES_ROAD.has(kind) ? (side < 0 ? 0 : Math.PI) : Math.random() * Math.PI * 2;
  return true;
}

function fill(side: -1 | 1, far: number, route: RouteDef) {
  while (far - SCENERY_MIN_GAP > SCENERY_SPAWN_Z) {
    far -= SCENERY_MIN_GAP + Math.random() * SCENERY_GAP_VAR;
    if (!spawn(side, far, route)) break;
  }
}

// Scrolls everything, recycles what passed the camera, tops up the far end.
export function stepScenery(move: number, route: RouteDef) {
  let farL = SCENERY_DESPAWN;
  let farR = SCENERY_DESPAWN;
  for (const s of scenery) {
    if (!s.active) continue;
    s.z += move;
    if (s.z > SCENERY_DESPAWN) {
      s.active = false;
      continue;
    }
    if (s.side < 0) farL = Math.min(farL, s.z);
    else farR = Math.min(farR, s.z);
  }
  fill(-1, farL, route);
  fill(1, farR, route);
}