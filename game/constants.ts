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

// ---- Step 3: world entities ----
export const SPAWN_Z = -90;            // rows appear here (fully fogged, so no pop-in)
export const DESPAWN_Z = 8;            // recycled once behind the camera
export const MIN_ROW_GAP = 16;         // meters between rows at low speed
export const ROW_TIME = 1.35;          // seconds of reaction time between rows at high speed
export const START_ROW_Z = -45;        // nearest pre-placed row when a run starts
export const START_ROW_GAP = 18;
export const DIFFICULTY_DISTANCE = 2500; // meters until difficulty is maxed

export const OBSTACLE_POOL = 16;
export const COIN_POOL = 64;
export const COIN_SPACING = 2;
export const COIN_SCORE = 10;          // score points per coin

export const PLAYER_HALF_W = 0.3;
export const PLAYER_HALF_D = 0.7;
export const HIT_FORGIVENESS = 0.85;   // shrinks obstacle hitboxes slightly (feels fairer)
export const COIN_REACH_X = 0.75;
export const COIN_REACH_Z = 0.9;
export const CRASH_SPEED_KEEP = 0.15;  // speed multiplier on impact