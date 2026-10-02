"use client";

import {
  BoxGeometry,
  ConeGeometry,
  IcosahedronGeometry,
  MeshStandardMaterial,
} from "three";
import type { SceneryKind } from "@/game/routes";

type V3 = [number, number, number];

const boxGeo = new BoxGeometry(1, 1, 1);
const coneGeo = new ConeGeometry(1, 1, 10);
const roofGeo = new ConeGeometry(1, 1, 4);
roofGeo.rotateY(Math.PI / 4);
const rockGeo = new IcosahedronGeometry(1, 0);

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
function Cone({ s, p, c }: { s: V3; p: V3; c: string }) {
  return <mesh geometry={coneGeo} material={mat(c)} position={p} scale={s} dispose={null} />;
}

const BUILDING = ["#9aa5b1", "#c4b5a0", "#7f8ea3", "#b0897a"];
const HOUSE = ["#f5e6c8", "#f3c9a8", "#e8d9b5", "#d9e4c8"];

// All models face +x (toward the road when placed on the left side).
function Building({ color }: { color: string }) {
  return (
    <group>
      <Box s={[4, 8, 4]} p={[0, 4, 0]} c={color} />
      <Box s={[4.2, 0.3, 4.2]} p={[0, 8.15, 0]} c="#444" />
      {[0, 1, 2, 3, 4].flatMap((row) =>
        [-1.1, 1.1].map((z) => (
          <Box key={`${row}${z}`} s={[0.06, 0.9, 0.9]} p={[2.02, 1.4 + row * 1.4, z]} c="#bfe3ff" />
        ))
      )}
    </group>
  );
}

function Lamp() {
  return (
    <group>
      <Box s={[0.12, 4, 0.12]} p={[0, 2, 0]} c="#3b3b40" />
      <Box s={[1, 0.1, 0.1]} p={[0.5, 4, 0]} c="#3b3b40" />
      <Box s={[0.5, 0.12, 0.3]} p={[0.95, 3.93, 0]} c="#fde68a" />
    </group>
  );
}

function Tree() {
  return (
    <group>
      <Box s={[0.3, 1.4, 0.3]} p={[0, 0.7, 0]} c="#6b4423" />
      <Cone s={[1.4, 2.2, 1.4]} p={[0, 2.4, 0]} c="#2f8f3a" />
      <Cone s={[1.0, 1.6, 1.0]} p={[0, 3.6, 0]} c="#3aa047" />
    </group>
  );
}

function House({ color }: { color: string }) {
  return (
    <group>
      <Box s={[3.4, 2.2, 3.4]} p={[0, 1.1, 0]} c={color} />
      <mesh geometry={roofGeo} material={mat("#b45309")} position={[0, 2.9, 0]} scale={[2.6, 1.4, 2.6]} dispose={null} />
      <Box s={[0.06, 1.2, 0.7]} p={[1.72, 0.6, 0]} c="#6b3f1d" />
      {[-1, 1].map((z) => (
        <Box key={z} s={[0.06, 0.6, 0.6]} p={[1.72, 1.4, z]} c="#bfe3ff" />
      ))}
    </group>
  );
}

function Hay() {
  return (
    <group>
      <Box s={[1.3, 0.95, 1.3]} p={[0, 0.48, 0]} c="#e0b23c" />
      <Box s={[1.34, 0.08, 1.34]} p={[0, 0.5, 0]} c="#c99a2a" />
    </group>
  );
}

function Cactus() {
  return (
    <group>
      <Box s={[0.45, 2.2, 0.45]} p={[0, 1.1, 0]} c="#3f8f4f" />
      <Box s={[0.9, 0.3, 0.3]} p={[0.5, 1.3, 0]} c="#3f8f4f" />
      <Box s={[0.3, 0.8, 0.3]} p={[0.85, 1.65, 0]} c="#3f8f4f" />
      <Box s={[0.7, 0.28, 0.28]} p={[-0.4, 0.9, 0]} c="#3f8f4f" />
      <Box s={[0.28, 0.6, 0.28]} p={[-0.7, 1.2, 0]} c="#3f8f4f" />
    </group>
  );
}

function Rock({ color }: { color: string }) {
  return (
    <mesh
      geometry={rockGeo}
      material={mat(color)}
      position={[0, 0.45, 0]}
      scale={[1.1, 0.7, 0.9]}
      dispose={null}
    />
  );
}

const ROCKS = ["#9c8467", "#a8896a", "#8a7358"];

export function SceneryModel({ kind, i }: { kind: SceneryKind; i: number }) {
  switch (kind) {
    case "building": return <Building color={BUILDING[i % BUILDING.length]} />;
    case "lamp":     return <Lamp />;
    case "tree":     return <Tree />;
    case "house":    return <House color={HOUSE[i % HOUSE.length]} />;
    case "hay":      return <Hay />;
    case "cactus":   return <Cactus />;
    case "rock":     return <Rock color={ROCKS[i % ROCKS.length]} />;
  }
}