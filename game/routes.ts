export type SceneryKind =
  | "building" | "lamp"          // city
  | "tree" | "house" | "hay"     // village
  | "cactus" | "rock";           // desert

export interface RouteDef {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  unlockAt: number;   // best distance (m) needed
  sky: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  ground: string;
  road: string;
  ambient: number;
  sun: number;
  sunColor: string;
  scenery: SceneryKind[]; // repeats = more likely
}

export const ROUTES: RouteDef[] = [
  {
    id: "city", name: "City", emoji: "🏙️", blurb: "Skyscrapers and street lamps.",
    unlockAt: 0,
    sky: "#8fd3ff", fog: "#8fd3ff", fogNear: 25, fogFar: 85,
    ground: "#8b9099", road: "#3a3a3f",
    ambient: 0.9, sun: 1.3, sunColor: "#ffffff",
    scenery: ["building", "building", "lamp"],
  },
  {
    id: "village", name: "Village", emoji: "🏡", blurb: "Green fields, farms and trees.",
    unlockAt: 500,
    sky: "#bfe8ff", fog: "#bfe8ff", fogNear: 25, fogFar: 85,
    ground: "#6cbf5c", road: "#5a5650",
    ambient: 1.0, sun: 1.3, sunColor: "#fff6dd",
    scenery: ["tree", "tree", "house", "hay"],
  },
  {
    id: "desert", name: "Desert", emoji: "🏜️", blurb: "Hot sand, cacti and rocks.",
    unlockAt: 1500,
    sky: "#f7d9a4", fog: "#f3d6a0", fogNear: 20, fogFar: 80,
    ground: "#e2b46f", road: "#46403d",
    ambient: 0.95, sun: 1.5, sunColor: "#ffe2a8",
    scenery: ["cactus", "rock", "rock", "cactus"],
  },
];

export const getRoute = (id: string) => ROUTES.find((r) => r.id === id) ?? ROUTES[0];