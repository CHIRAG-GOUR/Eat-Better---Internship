"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Close-up turntable of the Module 2 street cast (people, scooter, auto) for visual checks. */
export default function Cast() {
  return (
    <main className="h-screen w-screen bg-[#e9e2d8]">
      <Scene />
    </main>
  );
}
