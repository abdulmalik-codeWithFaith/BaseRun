# 🚴 Baserun

A 3D endless bicycle runner for the browser. Ride down a three-lane road, dodge traffic, jump hurdles, collect coins, and unlock new bikes and riders. Installable as a PWA and playable offline.

Built with **Next.js (App Router)**, **React Three Fiber**, **Zustand**, **Howler** and **Tailwind CSS**.

## Features

- Infinite 3-lane road with recycled tiles
- Cones, barriers, cars and trucks, with a fairness rule so a survivable path always exists
- Jumping: cones and barriers can be cleared, cars and trucks must be dodged, and hurdle rows (3 barriers) require a jump
- Coin lines and arcs, rising speed and difficulty
- HUD, countdown, pause (with auto-pause on tab blur) and animated Game Over screen
- Garage and Shop with a live 3D turntable preview, bikes and riders to unlock
- Settings: sound, music, vibration, graphics quality
- Progress saved to `localStorage` (coins, best distance, unlocks, settings)
- Synthesized sound effects and music (no audio files needed)
- Installable PWA with offline support

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move left / right | `←` `→` or `A` `D` | Swipe left / right |
| Jump | `↑`, `W` or `Space` | Swipe up |
| Pause / resume | `Esc` or `P` | Pause button |

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

In development, **Settings → "+1000 🪙"** gives test coins for trying the shop.

### Production build (needed to test the PWA)

```bash
npm run build
npm start
```

The service worker is only registered in production builds.

## Project structure

```text
baserun/
├── app/
│   ├── layout.tsx              # metadata, viewport, PWA registration
│   ├── page.tsx
│   ├── globals.css             # Tailwind + UI animations
│   ├── manifest.ts             # web app manifest
│   └── pwa-icons/[file]/route.tsx   # icons generated at build time
├── components/
│   ├── GameShell.tsx           # client root, switches between screens
│   ├── PwaRegister.tsx
│   ├── game/                   # R3F scene
│   │   ├── GameCanvas.tsx
│   │   ├── GameLoop.tsx        # speed, distance, jump physics
│   │   ├── WorldSystem.tsx     # scrolling, spawning, collisions, pickups
│   │   ├── Player.tsx
│   │   ├── Bicycle.tsx
│   │   ├── BikePreview.tsx     # garage turntable
│   │   ├── CameraRig.tsx
│   │   ├── Road.tsx
│   │   ├── ObstacleField.tsx
│   │   ├── ObstacleModels.tsx
│   │   └── CoinField.tsx
│   └── ui/                     # HUD, menus, Garage/Shop, Settings, etc.
├── game/                       # plain TypeScript, no React
│   ├── constants.ts            # all tuning values
│   ├── runtime.ts              # per-frame mutable state
│   ├── spawner.ts
│   ├── obstacles.ts
│   ├── catalog.ts              # bikes and riders
│   ├── score.ts, format.ts, haptics.ts
│   ├── synth.ts, audio.ts      # generated sounds + Howler
│   ├── pwa.ts
│   ├── useLaneControls.ts      # steering and jump input
│   ├── usePauseControls.ts
│   └── useAudio.ts
├── store/
│   └── useGameStore.ts         # Zustand store + persistence
└── public/
    └── sw.js                   # service worker
```

## Architecture notes

- **Per-frame state is not React state.** Speed, position, obstacles and coins live in the plain `runtime` object, so nothing re-renders 60 times a second. Zustand holds only what the UI needs.
- **The world moves, the player doesn't.** The bike stays at z = 0 and everything scrolls toward it.
- **Object pools.** Obstacles and coins are fixed-size pools, so nothing is allocated mid-run.
- **System order matters.** `useFrame` callbacks run in mount order: `GameLoop` → `WorldSystem` → visuals → `Player` → `CameraRig`.
- **Persistence.** Zustand `persist` uses manual rehydration (avoids SSR mismatches) and skips writes when the saved data hasn't changed.

## Tuning

Everything lives in `game/constants.ts`.

| Want | Change |
|---|---|
| Easier / harder | `ROW_TIME`, `HIT_FORGIVENESS`, `DIFFICULTY_DISTANCE` |
| Faster / slower | `BASE_SPEED`, `MAX_SPEED`, `SPEED_RAMP` |
| Floaty / snappy jump | `GRAVITY`, `JUMP_VELOCITY` |
| More / fewer hurdles | `HURDLE_CHANCE`, `HURDLE_START` |

New bikes and riders are added in `game/catalog.ts`.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import it at <https://vercel.com/new>. Next.js is auto-detected.
3. Click **Deploy**. No environment variables or backend are required.

Vercel serves HTTPS, which service workers and installation require. Bump `VERSION` in `public/sw.js` after releases to purge old caches.

## Replacing placeholder assets

- **Models:** swap `Bicycle.tsx` and `ObstacleModels.tsx` for GLB models. Game logic doesn't change.
- **Audio:** put MP3s in `public/audio/` and point the `Howl` `src` in `game/audio.ts` at them.

## Troubleshooting

- **"has no exported member" errors:** a hook was pasted into the wrong file. `useLaneControls.ts` must export `useLaneControls`, and `usePauseControls.ts` must export `usePauseControls`.
- **JSX errors in a `.ts` file:** files containing JSX must use `.tsx` (e.g. `pwa-icons/[file]/route.tsx`).
- **Stale code in production mode:** DevTools → Application → Storage → **Clear site data**.
- **No sound:** browsers block audio until the first click or key press.
- **Vibration does nothing:** it only works on Android Chrome.

## Roadmap

- Slide under overhead barriers
- Power-ups (coin magnet, shield)
- Themed environments (city, village, desert)
- Real GLB models
- Accounts and online leaderboards

## Author
Abdulrosheed Abdulmalik(codeWithFaith001)