export type ObstacleKind = "cone" | "barrier" | "car" | "truck";

export const OBSTACLE_KINDS: ObstacleKind[] = ["cone", "barrier", "car", "truck"];

// Hitbox footprint (width along x, depth along z), in world units
export const OBSTACLE_SPECS: Record<ObstacleKind, { w: number; d: number }> = {
  cone: { w: 0.55, d: 0.55 },
  barrier: { w: 1.8, d: 0.4 },
  car: { w: 1.6, d: 3.4 },
  truck: { w: 2.0, d: 6.0 },
};