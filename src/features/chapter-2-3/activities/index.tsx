"use client";

import dynamic from "next/dynamic";
import { create } from "zustand";

const Loading = () => <div className="h-[520px] animate-pulse rounded-[24px] bg-[#F6E3CF]" />;
export const PositionMap = dynamic(() => import("./PositionMap"), { ssr: false, loading: Loading });
export const UspEvidence = dynamic(() => import("./UspEvidence"), { ssr: false, loading: Loading });
export const PersonaLab = dynamic(() => import("./PersonaLab"), { ssr: false, loading: Loading });

export const ACTS_23 = [
  { id: "map", label: "Positioning Map" },
  { id: "usp", label: "USP Evidence Desk" },
  { id: "persona", label: "Persona Lab" },
];

/** What the student produced in each activity (shown and copyable in the wrap-up). */
export const useWork23 = create<{ work: Record<string, string>; save: (k: string, v: string) => void }>((set) => ({
  work: {},
  save: (k, v) => set((s) => ({ work: { ...s.work, [k]: v } })),
}));
