"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Clone, useAnimations, useGLTF } from "@react-three/drei";
import { Group, Object3D, Quaternion, Vector3 } from "three";
import { runtime } from "@/game/runtime";
import { useGameStore } from "@/store/useGameStore";
import { getBike, getCharacter, type BikeDef, type CharacterDef } from "@/game/catalog";

type V3 = [number, number, number];
const PREVIEW_SPEED = 5;

// ---------------------------------------------------------------- loading helpers
// Checks that a model file exists before trying to load it.
// A missing file means "use the built-in version", with no error overlay.
const fileExists = new Map<string, boolean>();

function useFileExists(url?: string): boolean | null {
  const [ok, setOk] = useState<boolean | null>(
    url ? fileExists.get(url) ?? null : false
  );

  useEffect(() => {
    if (!url) {
      setOk(false);
      return;
    }
    const cached = fileExists.get(url);
    if (cached !== undefined) {
      setOk(cached);
      return;
    }
    let live = true;
    fetch(url)
      .then((r) => {
        const type = r.headers.get("content-type") ?? "";
        const good = r.ok && !type.includes("text/html");
        r.body?.cancel(); // we only wanted the status; useGLTF downloads it properly
        fileExists.set(url, good);
        if (live) setOk(good);
      })
      .catch(() => {
        fileExists.set(url, false);
        if (live) setOk(false);
      });
    return () => {
      live = false;
    };
  }, [url]);

  return ok;
}

// Last line of defence for a file that exists but is corrupt.
class Boundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// ---------------------------------------------------------------- shape helpers
function Bar({
  from,
  to,
  radius = 0.025,
  color,
}: {
  from: V3;
  to: V3;
  radius?: number;
  color: string;
}) {
  const { pos, quat, len } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [from, to]);

  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Wheel({
  z,
  r,
  tire,
  rim,
  disc,
  spinRef,
}: {
  z: number;
  r: number;
  tire: number;
  rim: string;
  disc?: boolean;
  spinRef: RefObject<Group | null>;
}) {
  const inner = r - tire;
  return (
    <group position={[0, r, z]}>
      <group ref={spinRef}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[inner, tire, 8, 24]} />
          <meshStandardMaterial color="#1b1b1f" />
        </mesh>
        {disc ? (
          <>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[inner, inner, 0.035, 24]} />
              <meshStandardMaterial color={rim} />
            </mesh>
            <mesh position={[0, inner * 0.7, 0]}>
              <boxGeometry args={[0.045, 0.09, 0.045]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </>
        ) : (
          <>
            <mesh>
              <boxGeometry args={[0.02, inner * 2, 0.02]} />
              <meshStandardMaterial color={rim} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.02, 0.02, inner * 2]} />
              <meshStandardMaterial color={rim} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

// key points of a bike, derived from the catalog numbers (bike faces -z)
function keyPoints(bike: BikeDef) {
  const b = bike.base;
  const BB: V3 = [0, bike.wheelR + 0.03, b * 0.15];
  const REAR: V3 = [0, bike.wheelR, b];
  const FRONT: V3 = [0, bike.wheelR, -b];
  const SEAT: V3 = [0, bike.seatH, b * 0.4];
  const HEAD: V3 = [0, bike.barH - 0.05, -b * 0.7];
  const HIP: V3 = [0, bike.seatH + 0.08, b * 0.44];
  const SHOULDER: V3 = [
    0,
    bike.seatH + 0.63 - bike.crouch * 0.28,
    -0.15 * (b / 0.55) - bike.crouch * 0.3,
  ];
  return { BB, REAR, FRONT, SEAT, HEAD, HIP, SHOULDER, legLen: HIP[1] - BB[1] };
}

// ---------------------------------------------------------------- riders
function ProceduralRider({
  bike,
  rider,
  preview,
}: {
  bike: BikeDef;
  rider: CharacterDef;
  preview?: boolean;
}) {
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const pedal = useRef(0);
  const k = useMemo(() => keyPoints(bike), [bike]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const speed = preview ? PREVIEW_SPEED : runtime.speed;
    pedal.current += speed * 0.6 * dt;
    if (legL.current) legL.current.rotation.x = Math.sin(pedal.current) * 0.55;
    if (legR.current) legR.current.rotation.x = Math.sin(pedal.current + Math.PI) * 0.55;
  });

  const { HEAD, HIP, SHOULDER, legLen } = k;
  const headY = SHOULDER[1] + 0.23 - bike.crouch * 0.04;
  const headZ = SHOULDER[2] - 0.07;

  return (
    <group position={bike.riderOffset ?? [0, 0, 0]}>
      {/* torso */}
      <Bar from={HIP} to={SHOULDER} radius={0.14} color={rider.shirt} />

      {/* head */}
      <mesh position={[0, headY, headZ]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color={rider.skin} />
      </mesh>

      {rider.style === "helmet" && (
        <mesh position={[0, headY + 0.02, headZ]}>
          <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={rider.helmet} />
        </mesh>
      )}
      {rider.style === "cap" && (
        <>
          <mesh position={[0, headY + 0.03, headZ]}>
            <sphereGeometry args={[0.145, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={rider.helmet} />
          </mesh>
          <mesh position={[0, headY + 0.04, headZ - 0.14]}>
            <boxGeometry args={[0.22, 0.02, 0.14]} />
            <meshStandardMaterial color={rider.helmet} />
          </mesh>
        </>
      )}
      {rider.style === "hood" && (
        <>
          <mesh position={[0, headY, headZ + 0.03]}>
            <sphereGeometry args={[0.17, 16, 12]} />
            <meshStandardMaterial color={rider.helmet} />
          </mesh>
          <mesh position={[0, headY - 0.01, headZ - 0.06]}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshStandardMaterial color={rider.skin} />
          </mesh>
        </>
      )}

      {/* arms to the handlebar */}
      {[-1, 1].map((s) => (
        <Bar
          key={s}
          from={[s * 0.18, SHOULDER[1] - 0.05, SHOULDER[2]]}
          to={[s * (bike.barW / 2 - 0.01), bike.barH, HEAD[2]]}
          radius={0.045}
          color={rider.shirt}
        />
      ))}

      {/* legs pivot at the hips */}
      {(
        [
          { s: -1, ref: legL },
          { s: 1, ref: legR },
        ] as const
      ).map(({ s, ref }) => (
        <group key={s} ref={ref} position={[s * 0.1, HIP[1] - 0.02, HIP[2]]}>
          <Bar from={[0, 0, 0]} to={[0, -legLen, 0]} radius={0.06} color={rider.pants} />
          <mesh position={[0, -legLen - 0.01, -0.06]}>
            <boxGeometry args={[0.1, 0.05, 0.22]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GlbRider({ bike, rider }: { bike: BikeDef; rider: CharacterDef }) {
  const { scene, animations } = useGLTF(rider.model as string);
  const root = useRef<Group>(null);
  const { actions, names } = useAnimations(animations, root);
  const k = useMemo(() => keyPoints(bike), [bike]);

  useEffect(() => {
    const name = rider.anim && names.includes(rider.anim) ? rider.anim : names[0];
    const a = name ? actions[name] : null;
    a?.reset().play();
    return () => {
      a?.stop();
    };
  }, [actions, names, rider.anim]);

  // origin of the model = the saddle of the current bike
  const [ox, oy, oz] = rider.offset ?? [0, 0, 0];
  const base = bike.riderOffset ?? [0, 0, 0];

  return (
    <group
      position={[base[0] + ox, base[1] + k.SEAT[1] + oy, base[2] + k.SEAT[2] + oz]}
      rotation={[0, rider.modelRotY ?? 0, 0]}
      scale={rider.modelScale ?? 1}
    >
      <group ref={root}>
        <Clone object={scene} />
      </group>
    </group>
  );
}

// Uses the GLB rider if its file exists, otherwise the built-in one.
function RiderSwitch({
  bike,
  rider,
  preview,
}: {
  bike: BikeDef;
  rider: CharacterDef;
  preview?: boolean;
}) {
  const ok = useFileExists(rider.model);
  const fallback = <ProceduralRider bike={bike} rider={rider} preview={preview} />;
  if (!rider.model || !ok) return fallback;

  return (
    <Boundary key={rider.id} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbRider bike={bike} rider={rider} />
      </Suspense>
    </Boundary>
  );
}

// ---------------------------------------------------------------- built-in bike
function ProceduralBike({
  bike,
  rider,
  preview,
}: {
  bike: BikeDef;
  rider: CharacterDef;
  preview?: boolean;
}) {
  const r = bike.wheelR;
  const front = useRef<Group>(null);
  const rear = useRef<Group>(null);
  const k = useMemo(() => keyPoints(bike), [bike]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const speed = preview ? PREVIEW_SPEED : runtime.speed;
    const spin = (speed * dt) / r;
    if (front.current) front.current.rotation.x -= spin;
    if (rear.current) rear.current.rotation.x -= spin;
  });

  const { BB, REAR, FRONT, SEAT, HEAD } = k;
  const topY = (SEAT[1] + HEAD[1]) / 2;
  const topZ = (SEAT[2] + HEAD[2]) / 2;

  return (
    <group>
      <Wheel z={FRONT[2]} r={r} tire={bike.tire} rim={bike.rim} spinRef={front} />
      <Wheel z={REAR[2]} r={r} tire={bike.tire} rim={bike.rim} disc={bike.disc} spinRef={rear} />

      {/* frame */}
      <Bar from={BB} to={SEAT} radius={bike.tube} color={bike.frame} />
      <Bar from={SEAT} to={HEAD} radius={bike.tube} color={bike.frame} />
      <Bar from={BB} to={HEAD} radius={bike.tube * 1.2} color={bike.frame} />
      <Bar from={REAR} to={SEAT} radius={bike.tube} color={bike.frame} />
      <Bar from={REAR} to={BB} radius={bike.tube} color={bike.frame} />
      <Bar from={HEAD} to={FRONT} radius={bike.tube} color="#555" />

      {/* handlebar + saddle */}
      <mesh position={[0, bike.barH, HEAD[2]]}>
        <boxGeometry args={[bike.barW, 0.04, 0.04]} />
        <meshStandardMaterial color={bike.accent} />
      </mesh>
      <mesh position={[0, bike.seatH + 0.03, SEAT[2] + 0.02]}>
        <boxGeometry args={[0.14, 0.05, 0.28]} />
        <meshStandardMaterial color={bike.accent} />
      </mesh>

      {/* extras */}
      {bike.extra === "basket" && (
        <mesh position={[0, bike.barH - 0.18, HEAD[2] - 0.2]}>
          <boxGeometry args={[0.34, 0.2, 0.3]} />
          <meshStandardMaterial color={bike.accent} />
        </mesh>
      )}
      {bike.extra === "spoiler" && (
        <>
          <mesh position={[0, bike.seatH - 0.02, REAR[2] + 0.12]}>
            <boxGeometry args={[0.5, 0.04, 0.2]} />
            <meshStandardMaterial color={bike.accent} />
          </mesh>
          <mesh position={[0, bike.seatH - 0.1, REAR[2] + 0.05]}>
            <boxGeometry args={[0.04, 0.16, 0.04]} />
            <meshStandardMaterial color={bike.accent} />
          </mesh>
          <mesh position={[0, bike.seatH - 0.14, REAR[2] + 0.24]}>
            <boxGeometry args={[0.12, 0.06, 0.04]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
          </mesh>
        </>
      )}
      {bike.extra === "aero" && (
        <mesh position={[0, topY + 0.05, topZ]}>
          <boxGeometry args={[0.05, 0.05, 0.36]} />
          <meshStandardMaterial color={bike.accent} />
        </mesh>
      )}

      <RiderSwitch bike={bike} rider={rider} preview={preview} />
    </group>
  );
}

// ---------------------------------------------------------------- real bike model
function GlbBike({
  bike,
  rider,
  preview,
}: {
  bike: BikeDef;
  rider: CharacterDef;
  preview?: boolean;
}) {
  const { scene, animations } = useGLTF(bike.model as string);
  const root = useRef<Group>(null);
  const wheels = useRef<Object3D[]>([]);
  const { actions, names } = useAnimations(animations, root);

  // spin every top-level node whose name contains "wheel"
  useEffect(() => {
    const found: Object3D[] = [];
    root.current?.traverse((o) => {
      if (/wheel/i.test(o.name) && !(o.parent && /wheel/i.test(o.parent.name))) found.push(o);
    });
    wheels.current = found;
  }, [scene]);

  useEffect(() => {
    const a = names.length ? actions[names[0]] : null;
    a?.reset().play();
    return () => {
      a?.stop();
    };
  }, [actions, names]);

  useFrame((_, delta) => {
    const speed = preview ? PREVIEW_SPEED : runtime.speed;
    const spin = (Math.min(delta, 0.05) * speed) / bike.wheelR;
    for (const w of wheels.current) w.rotation.x -= spin; // change the axis here if wheels spin wrong
  });

  return (
    <group>
      <group rotation={[0, bike.modelRotY ?? 0, 0]} scale={bike.modelScale ?? 1}>
        <group ref={root}>
          <Clone object={scene} />
        </group>
      </group>

      {/* the rider sits on top, in world units (not affected by the bike's modelScale) */}
      {!bike.noRider && <RiderSwitch bike={bike} rider={rider} preview={preview} />}
    </group>
  );
}

// ---------------------------------------------------------------- public
interface BicycleProps {
  bikeId?: string;
  characterId?: string;
  preview?: boolean;
}

export default function Bicycle({ bikeId, characterId, preview }: BicycleProps) {
  const selBike = useGameStore((s) => s.selectedBike);
  const selChar = useGameStore((s) => s.selectedCharacter);
  const bike = getBike(bikeId ?? selBike);
  const rider = getCharacter(characterId ?? selChar);

  const modelOk = useFileExists(bike.model);
  const procedural = <ProceduralBike bike={bike} rider={rider} preview={preview} />;

  // no model, still checking, or file missing: built-in bike
  if (!bike.model || !modelOk) return procedural;

  return (
    <Boundary key={bike.id} fallback={procedural}>
      <Suspense fallback={procedural}>
        <GlbBike bike={bike} rider={rider} preview={preview} />
      </Suspense>
    </Boundary>
  );
}