import { runtime } from "@/game/runtime";
import {
  LANES,
  SPAWN_Z,
  START_ROW_Z,
  START_ROW_GAP,
  COIN_SPACING,
  DIFFICULTY_DISTANCE,
} from "@/game/constants";
import type { ObstacleKind } from "@/game/obstacles";

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clearWorld() {
  for (const o of runtime.obstacles) o.active = false;
  for (const c of runtime.coins) c.active = false;
  runtime.prevBlocked = [false, false, false];
  runtime.sinceRow = 0;
}

function pickKind(diff: number): ObstacleKind {
  const r = Math.random();
  if (r < 0.3) return "cone";
  if (r < 0.55) return "barrier";
  if (r < 0.85 || diff < 0.25) return "car"; // trucks only appear after ~600 m
  return "truck";
}

function addObstacle(kind: ObstacleKind, lane: number, z: number) {
  const o = runtime.obstacles.find((o) => !o.active);
  if (!o) return; // pool exhausted: skip rather than allocate
  o.active = true;
  o.kind = kind;
  o.x = LANES[lane];
  o.z = z;
}

function addCoin(lane: number, z: number, y: number) {
  const c = runtime.coins.find((c) => !c.active);
  if (!c) return;
  c.active = true;
  c.x = LANES[lane];
  c.y = y;
  c.z = z;
}

// Picks which lanes to block, guaranteeing a reachable open lane.
function chooseBlocked(count: number): boolean[] {
  const prevFree = [0, 1, 2].filter((l) => !runtime.prevBlocked[l]);

  for (let attempt = 0; attempt < 8; attempt++) {
    const n = attempt < 6 ? count : 1; // a single blocked lane is always reachable
    const order = shuffle([0, 1, 2]);
    const blocked = [false, false, false];
    for (let i = 0; i < n; i++) blocked[order[i]] = true;

    const free = [0, 1, 2].filter((l) => !blocked[l]);
    const reachable = free.some((f) => prevFree.some((p) => Math.abs(f - p) <= 1));
    if (reachable) return blocked;
  }
  return [false, true, false]; // unreachable in practice
}

// gap = distance to the previous (closer) row, used to center the coins between them
export function spawnRow(z: number, gap: number) {
  const diff = Math.min(1, runtime.distance / DIFFICULTY_DISTANCE);
  const count = Math.random() < 0.2 + diff * 0.35 ? 2 : 1;
  const blocked = chooseBlocked(count);

  blocked.forEach((isBlocked, lane) => {
    if (isBlocked) addObstacle(pickKind(diff), lane, z);
  });

  // Coins: a line or arc of 5, in a lane that is open in BOTH neighbouring rows
  if (Math.random() < 0.75) {
    const open = [0, 1, 2].filter((l) => !blocked[l] && !runtime.prevBlocked[l]);
    if (open.length) {
      const lane = open[Math.floor(Math.random() * open.length)];
      const arc = Math.random() < 0.4;
      const mid = z + gap / 2;
      for (let i = -2; i <= 2; i++) {
        const y = arc ? 0.9 + 0.6 * (1 - (i / 2) ** 2) : 0.9;
        addCoin(lane, mid + i * COIN_SPACING, y);
      }
    }
  }

  runtime.prevBlocked = blocked;
}

// Pre-places three rows so the first obstacle arrives after ~4 s instead of ~8 s.
export function seedWorld() {
  clearWorld();
  let lastZ = START_ROW_Z;
  for (let k = 0; k < 3; k++) {
    lastZ = START_ROW_Z - k * START_ROW_GAP;
    spawnRow(lastZ, START_ROW_GAP);
  }
  runtime.sinceRow = lastZ - SPAWN_Z; // how far the last row is from the spawn line
}