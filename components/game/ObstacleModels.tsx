"use client";

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from "three";

type V3 = [number, number, number];

// shared across every model and slot
const boxGeo = new BoxGeometry(1, 1, 1);
const coneGeo = new ConeGeometry(1, 1, 12);
const wheelGeo = new CylinderGeometry(1, 1, 1, 16);
wheelGeo.rotateZ(Math.PI / 2); // axle along x; scale = [width, radius, radius]

const mats = new Map<string, MeshStandardMaterial>();
const mat = (color: string) => {
  let m = mats.get(color);
  if (!m) {
    m = new MeshStandardMaterial({ color });
    mats.set(color, m);
  }
  return m;
};

function Box({ s, p, c }: { s: V3; p: V3; c: string }) {
  return <mesh geometry={boxGeo} material={mat(c)} position={p} scale={s} dispose={null} />;
}

function Wheel({ p, r, w }: { p: V3; r: number; w: number }) {
  return (
    <mesh geometry={wheelGeo} material={mat("#111")} position={p} scale={[w, r, r]} dispose={null} />
  );
}

export function ConeModel() {
  return (
    <group>
      <Box s={[0.55, 0.05, 0.55]} p={[0, 0.025, 0]} c="#222" />
      <mesh
        geometry={coneGeo}
        material={mat("#ff7a1a")}
        position={[0, 0.36, 0]}
        scale={[0.22, 0.62, 0.22]}
        dispose={null}
      />
      <Box s={[0.3, 0.08, 0.3]} p={[0, 0.28, 0]} c="#ffffff" />
    </group>
  );
}

export function BarrierModel() {
  return (
    <group>
      {[-0.7, 0.7].map((x) => (
        <Box key={x} s={[0.08, 0.75, 0.4]} p={[x, 0.375, 0]} c="#555" />
      ))}
      <Box s={[1.8, 0.28, 0.1]} p={[0, 0.75, 0]} c="#ffffff" />
      <Box s={[1.8, 0.22, 0.1]} p={[0, 0.42, 0]} c="#ffffff" />
      {[-0.72, -0.36, 0, 0.36, 0.72].map((x) => (
        <group key={x}>
          <Box s={[0.18, 0.28, 0.11]} p={[x, 0.75, 0]} c="#e11d48" />
          <Box s={[0.18, 0.22, 0.11]} p={[x + 0.18, 0.42, 0]} c="#e11d48" />
        </group>
      ))}
      <Box s={[0.14, 0.14, 0.14]} p={[0, 0.98, 0]} c="#fbbf24" />
    </group>
  );
}

export function CarModel({ color }: { color: string }) {
  return (
    <group>
      <Box s={[1.6, 0.55, 3.4]} p={[0, 0.55, 0]} c={color} />
      <Box s={[1.4, 0.5, 1.7]} p={[0, 1.07, 0.25]} c="#1e2a3a" />
      {[-1, 1].map((sx) =>
        [-1.1, 1.1].map((z) => <Wheel key={`${sx}${z}`} p={[sx * 0.78, 0.32, z]} r={0.32} w={0.25} />)
      )}
      {[-0.55, 0.55].map((x) => (
        <Box key={x} s={[0.3, 0.14, 0.05]} p={[x, 0.6, 1.71]} c="#ef4444" />
      ))}
    </group>
  );
}

export function TruckModel({ color }: { color: string }) {
  return (
    <group>
      <Box s={[1.8, 0.3, 6]} p={[0, 0.45, 0]} c="#333" />
      <Box s={[1.9, 1.5, 1.7]} p={[0, 1.35, -2.15]} c={color} />
      <Box s={[1.5, 0.5, 0.05]} p={[0, 1.7, -3.01]} c="#1e2a3a" />
      <Box s={[2.0, 2.0, 4.2]} p={[0, 1.6, 0.9]} c="#e5e7eb" />
      {[-1, 1].map((sx) =>
        [-2.2, 1.2, 2.3].map((z) => <Wheel key={`${sx}${z}`} p={[sx * 0.95, 0.4, z]} r={0.4} w={0.3} />)
      )}
      {[-0.7, 0.7].map((x) => (
        <Box key={x} s={[0.3, 0.14, 0.05]} p={[x, 0.8, 3.01]} c="#ef4444" />
      ))}
    </group>
  );
}