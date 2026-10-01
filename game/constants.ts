export const LANE_WIDTH = 2.2;
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH] as const; // left, center, right
export const ROAD_WIDTH = LANE_WIDTH * 3 + 1;

export const BASE_SPEED = 12;      // units per second
export const MAX_SPEED = 30;
export const SPEED_RAMP = 0.15;    // speed gained per second

export const DISTANCE_PER_UNIT = 1; // 1 world unit = 1 meter

export const IDLE_SPEED = 4;        // slow scroll behind the main menu
export const LANE_DAMP = 12;        // higher = snappier lane change
export const SWIPE_THRESHOLD = 28;  // px before a swipe counts

export const TILE_LENGTH = 20;
export const TILE_COUNT = 7;        // 140 units total, hidden by fog past ~80