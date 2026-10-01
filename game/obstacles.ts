export type ObstacleKind = "cone" | "barrier" | "car" | "truck";

export const OBSTACLE_KINDS: ObstacleKind[] = ["cone", "barrier", "car", "truck"];

// w/d = hitbox footprint, h = height the player must be above to clear it
export const OBSTACLE_SPECS: Record<ObstacleKind, { w: number; d: number; h: number }> = {
  cone: { w: 0.55, d: 0.55, h: 0.6 },
  barrier: { w: 1.8, d: 0.4, h: 0.95 },
  car: { w: 1.6, d: 3.4, h: 9 },     // not jumpable: dodge it
  truck: { w: 2.0, d: 6.0, h: 9 },   // not jumpable: dodge it
};