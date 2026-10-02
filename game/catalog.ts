export type BikeExtra = "none" | "basket" | "spoiler" | "aero";
export type HeadStyle = "helmet" | "cap" | "hood";

export interface BikeDef {
  id: string;
  name: string;
  price: number;
  // colors
  frame: string;
  accent: string;
  rim: string;
  // structure
  wheelR: number;   // wheel radius
  tire: number;     // tire thickness (fat tires = bigger)
  base: number;     // half wheelbase
  seatH: number;    // saddle height
  barH: number;     // handlebar height
  barW: number;     // handlebar width
  crouch: number;   // 0 = upright, 1 = racing tuck
  tube: number;     // frame tube radius
  disc?: boolean;   // solid rear disc wheel
  extra: BikeExtra;
  // optional real model (see "Using real 3D models")
  model?: string;        // e.g. "/models/bike-1.glb"
  modelScale?: number;
  modelRotY?: number;
    riderOffset?: [number, number, number]; // nudge the rider [x, y, z] to fit the model
  noRider?: boolean;                      // true if the GLB already includes a rider
}

export interface CharacterDef {
  id: string;
  name: string;
  price: number;
  shirt: string;
  pants: string;
  helmet: string;   // helmet / cap / hood color
  skin: string;
  style: HeadStyle;
}

export const BIKES: BikeDef[] = [
  {
    id: "bike-1", name: "City Bike", price: 0,
    model: "/models/bike-1.glb",
    modelScale: 1,
    modelRotY: 0,
    frame: "#ff5a3c", accent: "#222222", rim: "#c8c8cc",
    wheelR: 0.35, tire: 0.045, base: 0.55, seatH: 0.92, barH: 1.0, barW: 0.55,
    crouch: 0, tube: 0.025, extra: "basket",
  },
  {
    id: "bike-2", name: "Stunt BMX", price: 500,
    model: "/models/bike-2.glb", modelScale: 1, modelRotY: 0,
    frame: "#2563eb", accent: "#111111", rim: "#fbbf24",
    wheelR: 0.28, tire: 0.06, base: 0.46, seatH: 0.78, barH: 0.98, barW: 0.72,
    crouch: 0.1, tube: 0.035, extra: "none",
  },
  {
    id: "bike-3", name: "Road Racer", price: 1500,
    model: "/models/bike-3.glb", modelScale: 1, modelRotY: 0,
    frame: "#111827", accent: "#ef4444", rim: "#ef4444",
    wheelR: 0.37, tire: 0.03, base: 0.62, seatH: 1.0, barH: 0.9, barW: 0.42,
    crouch: 1, tube: 0.022, disc: true, extra: "aero",
  },
  {
    id: "bike-4", name: "Super Cruiser", price: 5000,
    model: "/models/bike-4.glb", modelScale: 1, modelRotY: 0,
    frame: "#a855f7", accent: "#22d3ee", rim: "#22d3ee",
    wheelR: 0.4, tire: 0.1, base: 0.7, seatH: 0.95, barH: 1.12, barW: 0.6,
    crouch: 0.35, tube: 0.05, extra: "spoiler",
  },
];

export const CHARACTERS: CharacterDef[] = [
  { id: "character-1", name: "Blue Rider",  price: 0,    shirt: "#2563eb", pants: "#1f2937", helmet: "#facc15", skin: "#f1c27d", style: "helmet" },
  { id: "character-2", name: "Red Rider",   price: 300,  shirt: "#dc2626", pants: "#1f2937", helmet: "#ffffff", skin: "#c68642", style: "cap" },
  { id: "character-3", name: "Green Rider", price: 600,  shirt: "#16a34a", pants: "#374151", helmet: "#f97316", skin: "#8d5524", style: "helmet" },
  { id: "character-4", name: "Gold Rider",  price: 2000, shirt: "#f59e0b", pants: "#111827", helmet: "#111827", skin: "#e0ac69", style: "hood" },
];

export const getBike = (id: string) => BIKES.find((b) => b.id === id) ?? BIKES[0];
export const getCharacter = (id: string) =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];