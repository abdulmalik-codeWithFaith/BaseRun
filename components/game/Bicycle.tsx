"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Quaternion, Vector3 } from "three";
import { runtime } from "@/game/runtime";

type V3 = [number, number, number];
const WHEEL_R = 0.35;

// A cylinder stretched between two points (frame tubes, limbs, torso)
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
    const quat = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      dir.normalize()
    );
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [from, to]);

  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Wheel({ z, spinRef }: { z: number; spinRef: RefObject<Group | null> }) {
  return (
    <group position={[0, WHEEL_R, z]}>
      <group ref={spinRef}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[WHEEL_R - 0.045, 0.045, 8, 24]} />
          <meshStandardMaterial color="#1b1b1f" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.02, 0.62, 0.02]} />
          <meshStandardMaterial color="#c8c8cc" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.02, 0.02, 0.62]} />
          <meshStandardMaterial color="#c8c8cc" />
        </mesh>
      </group>
    </group>
  );
}

// Frame key points (bike faces -z)
const REAR: V3 = [0, 0.35, 0.55];
const FRONT: V3 = [0, 0.35, -0.55];
const BB: V3 = [0, 0.38, 0.08];     // bottom bracket (pedals)
const SEAT: V3 = [0, 0.92, 0.22];
const HEAD: V3 = [0, 0.95, -0.38];
const HIP: V3 = [0, 1.0, 0.24];
const SHOULDER: V3 = [0, 1.55, -0.15];
const LEG_END: V3 = [0, -0.62, 0];
const ORIGIN: V3 = [0, 0, 0];

const FRAME = "#ff5a3c";
const SHIRT = "#2563eb";
const PANTS = "#1f2937";
const SKIN = "#f1c27d";

export default function Bicycle() {
  const front = useRef<Group>(null);
  const rear = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const pedal = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const spin = (runtime.speed * dt) / WHEEL_R;
    if (front.current) front.current.rotation.x -= spin;
    if (rear.current) rear.current.rotation.x -= spin;

    pedal.current += runtime.speed * 0.6 * dt;
    if (legL.current) legL.current.rotation.x = Math.sin(pedal.current) * 0.55;
    if (legR.current) legR.current.rotation.x = Math.sin(pedal.current + Math.PI) * 0.55;
  });

  return (
    <group>
      <Wheel z={FRONT[2]} spinRef={front} />
      <Wheel z={REAR[2]} spinRef={rear} />

      {/* frame */}
      <Bar from={BB} to={SEAT} color={FRAME} />
      <Bar from={SEAT} to={HEAD} color={FRAME} />
      <Bar from={BB} to={HEAD} radius={0.03} color={FRAME} />
      <Bar from={REAR} to={SEAT} color={FRAME} />
      <Bar from={REAR} to={BB} color={FRAME} />
      <Bar from={HEAD} to={FRONT} color="#555" />

      {/* handlebar + seat */}
      <mesh position={[0, 1.0, -0.38]}>
        <boxGeometry args={[0.55, 0.04, 0.04]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.95, 0.24]}>
        <boxGeometry args={[0.14, 0.05, 0.28]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* rider */}
      <Bar from={HIP} to={SHOULDER} radius={0.14} color={SHIRT} />
      <mesh position={[0, 1.78, -0.22]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh position={[0, 1.8, -0.22]}>
        <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      {[-1, 1].map((s) => (
        <Bar
          key={s}
          from={[s * 0.18, 1.5, -0.15]}
          to={[s * 0.26, 1.0, -0.38]}
          radius={0.045}
          color={SHIRT}
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
          <Bar from={ORIGIN} to={LEG_END} radius={0.06} color={PANTS} />
          <mesh position={[0, -0.64, -0.06]}>
            <boxGeometry args={[0.1, 0.05, 0.22]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      ))}
    </group>
  );
}