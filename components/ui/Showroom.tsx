"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { BIKES, CHARACTERS } from "@/game/catalog";
import ScreenFrame from "./ScreenFrame";

const BikePreview = dynamic(() => import("@/components/game/BikePreview"), {
  ssr: false,
});

type Tab = "bikes" | "characters";

export default function Showroom({ mode }: { mode: "garage" | "shop" }) {
  const wallet = useGameStore((s) => s.wallet);
  const selectedBike = useGameStore((s) => s.selectedBike);
  const selectedChar = useGameStore((s) => s.selectedCharacter);
  const unlockedBikes = useGameStore((s) => s.unlockedBikes);
  const unlockedChars = useGameStore((s) => s.unlockedCharacters);
  const selectBike = useGameStore((s) => s.selectBike);
  const selectCharacter = useGameStore((s) => s.selectCharacter);
  const buyBike = useGameStore((s) => s.buyBike);
  const buyCharacter = useGameStore((s) => s.buyCharacter);
  const openScreen = useGameStore((s) => s.openScreen);

  const [tab, setTab] = useState<Tab>("bikes");
  const [pBike, setPBike] = useState(selectedBike);
  const [pChar, setPChar] = useState(selectedChar);

  const isBikes = tab === "bikes";

  const items = isBikes
    ? BIKES.map((b) => ({ id: b.id, name: b.name, price: b.price, colors: [b.frame, b.rim] }))
    : CHARACTERS.map((c) => ({ id: c.id, name: c.name, price: c.price, colors: [c.shirt, c.helmet] }));

  const focusId = isBikes ? pBike : pChar;
  const focus = items.find((i) => i.id === focusId) ?? items[0];
  const unlocked = isBikes ? unlockedBikes : unlockedChars;
  const equippedId = isBikes ? selectedBike : selectedChar;

  const owned = unlocked.includes(focus.id);
  const equipped = equippedId === focus.id;
  const shortfall = focus.price - wallet;

  let label: string;
  let disabled = false;
  if (owned) {
    label = equipped ? "EQUIPPED ✓" : "EQUIP";
    disabled = equipped;
  } else if (mode === "shop") {
    if (shortfall > 0) {
      label = `NEED 🪙 ${shortfall.toLocaleString()} MORE`;
      disabled = true;
    } else {
      label = `BUY • 🪙 ${focus.price.toLocaleString()}`;
    }
  } else {
    label = "🔒 GET IT IN THE SHOP";
  }

  const onAction = () => {
    if (owned) {
      if (isBikes) selectBike(focus.id);
      else selectCharacter(focus.id);
    } else if (mode === "shop") {
      if (isBikes) buyBike(focus.id);
      else buyCharacter(focus.id);
    } else {
      openScreen("shop");
    }
  };

  const pick = (id: string) => (isBikes ? setPBike(id) : setPChar(id));

  return (
    <ScreenFrame
      title={mode === "garage" ? "GARAGE" : "SHOP"}
      right={
        <span className="rounded-full bg-black/30 px-3 py-2 text-sm font-bold">
          🪙 {wallet.toLocaleString()}
        </span>
      }
    >
      {/* live preview */}
      <div className="relative min-h-0 flex-1">
        <BikePreview bikeId={pBike} characterId={pChar} />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
          <div className="text-xl font-black drop-shadow">{focus.name}</div>
        </div>
      </div>

      {/* picker sheet */}
      <div className="rounded-t-3xl bg-white p-4 text-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          {(["bikes", "characters"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl py-2 text-sm font-black uppercase tracking-wide ${
                tab === t ? "bg-white shadow" : "text-slate-500"
              }`}
            >
              {t === "bikes" ? "🚲 Bikes" : "👕 Riders"}
            </button>
          ))}
        </div>

        <div className="-mx-4 flex touch-pan-x gap-3 overflow-x-auto px-4 pb-3">
          {items.map((it) => {
            const isOwned = unlocked.includes(it.id);
            const isEquipped = equippedId === it.id;
            const isFocus = focus.id === it.id;
            return (
              <button
                key={it.id}
                onClick={() => pick(it.id)}
                className={`w-32 flex-none rounded-2xl border-2 p-3 text-left transition active:scale-95 ${
                  isFocus ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white"
                } ${!isOwned && mode === "garage" ? "opacity-60" : ""}`}
              >
                <div className="flex gap-1.5">
                  {it.colors.map((c, i) => (
                    <span
                      key={i}
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm font-black leading-tight">{it.name}</div>
                <div className="mt-0.5 text-xs font-bold text-slate-500">
                  {isEquipped
                    ? "Equipped"
                    : isOwned
                    ? "Owned"
                    : it.price === 0
                    ? "Free"
                    : `${mode === "garage" ? "🔒 " : ""}🪙 ${it.price.toLocaleString()}`}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onAction}
          disabled={disabled}
          className="w-full rounded-2xl bg-orange-500 py-3.5 text-lg font-black text-white shadow-[0_5px_0_#c2410c] enabled:active:translate-y-1 enabled:active:shadow-[0_1px_0_#c2410c] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-[0_5px_0_#94a3b8]"
        >
          {label}
        </button>
      </div>
    </ScreenFrame>
  );
}