"use client";

import dynamic from "next/dynamic";
import { create } from "zustand";

const Loading = () => <div className="h-[520px] animate-pulse rounded-[24px] bg-[#2A2240]/20" />;
export const DealRoom = dynamic(() => import("./DealRoom"), { ssr: false, loading: Loading });
export const Newsroom = dynamic(() => import("./Newsroom"), { ssr: false, loading: Loading });
export const TrustJourney = dynamic(() => import("./TrustJourney"), { ssr: false, loading: Loading });

export const ACTS_24 = [
  { id: "deal", label: "Deal Room" },
  { id: "news", label: "Newsroom" },
  { id: "trust", label: "Trust Journey" },
];

export const useWork24 = create<{ work: Record<string, string>; save: (k: string, v: string) => void }>((set) => ({
  work: {},
  save: (k, v) => set((s) => ({ work: { ...s.work, [k]: v } })),
}));
