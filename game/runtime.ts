export const runtime = {
  speed: 0,     // current world speed (units/s)
  distance: 0,  // meters this run
  elapsed: 0,   // seconds this run
  lane: 1,      // 0 = left, 1 = center, 2 = right
  playerX: 0,   // smoothed world x of the player
};

export function resetRuntime() {
  runtime.distance = 0;
  runtime.elapsed = 0;
  runtime.lane = 1;
  runtime.playerX = 0;
  // speed is kept so the road doesn't jump when the run starts
}