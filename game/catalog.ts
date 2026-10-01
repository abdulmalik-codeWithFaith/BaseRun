export interface BikeDef {
  id: string;
  name: string;
  price: number;
  frame: string;   // frame tubes
  accent: string;  // handlebar + saddle
  rim: string;     // spokes
  tire: number;    // tire thickness
}

export interface CharacterDef {
  id: string;
  name: string;
  price: number;
  shirt: string;
  pants: string;
  helmet: string;
}

export const BIKES: BikeDef[] = [
  { id: "bike-1", name: "Basic Bike",  price: 0,    frame: "#ff5a3c", accent: "#222222", rim: "#c8c8cc", tire: 0.045 },
  { id: "bike-2", name: "Sport Bike",  price: 500,  frame: "#2563eb", accent: "#111111", rim: "#fbbf24", tire: 0.045 },
  { id: "bike-3", name: "Racing Bike", price: 1500, frame: "#111827", accent: "#ef4444", rim: "#ef4444", tire: 0.035 },
  { id: "bike-4", name: "Super Bike",  price: 5000, frame: "#a855f7", accent: "#22d3ee", rim: "#22d3ee", tire: 0.06 },
];

export const CHARACTERS: CharacterDef[] = [
  { id: "character-1", name: "Blue Rider",  price: 0,    shirt: "#2563eb", pants: "#1f2937", helmet: "#facc15" },
  { id: "character-2", name: "Red Rider",   price: 300,  shirt: "#dc2626", pants: "#1f2937", helmet: "#ffffff" },
  { id: "character-3", name: "Green Rider", price: 600,  shirt: "#16a34a", pants: "#1f2937", helmet: "#f97316" },
  { id: "character-4", name: "Gold Rider",  price: 2000, shirt: "#f59e0b", pants: "#111827", helmet: "#111827" },
];

export const getBike = (id: string) => BIKES.find((b) => b.id === id) ?? BIKES[0];
export const getCharacter = (id: string) =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];