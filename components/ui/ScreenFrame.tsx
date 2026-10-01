"use client";

import type { ReactNode } from "react";
import { useGameStore } from "@/store/useGameStore";

export default function ScreenFrame({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const openScreen = useGameStore((s) => s.openScreen);

  return (
    <div className="anim-fade-in absolute inset-0 z-10 flex flex-col bg-gradient-to-b from-sky-900 to-sky-700 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-white">
      <header className="flex items-center justify-between gap-3 p-4">
        <button
          onClick={() => openScreen("home")}
          aria-label="Back"
          className="grid h-11 w-11 place-items-center rounded-full bg-black/30 text-xl font-black active:scale-90"
        >
          ←
        </button>
        <h2 className="text-2xl font-black tracking-wide">{title}</h2>
        <div className="flex min-w-11 justify-end">{right}</div>
      </header>
      {children}
    </div>
  );
}