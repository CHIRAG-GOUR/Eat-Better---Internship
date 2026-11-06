"use client";

import dynamic from "next/dynamic";
import { create } from "zustand";

const Loading = () => <div className="h-[520px] animate-pulse rounded-[24px] bg-[#F6E3CF]" />;
export const FitLab = dynamic(() => import("./FitLab"), { ssr: false, loading: Loading });
export const ChannelDesk = dynamic(() => import("./ChannelDesk"), { ssr: false, loading: Loading });
export const ThirtyDays = dynamic(() => import("./ThirtyDays"), { ssr: false, loading: Loading });

export const ACTS_31 = [
  { id: "fit", label: "Fit Lab" },
  { id: "channels", label: "Channel Data Desk" },
  { id: "days", label: "First 30 Days" },
];

/** What the student produced in each activity (shown and copyable in the wrap-up). */
export const useWork31 = create<{ work: Record<string, string>; save: (k: string, v: string) => void }>((set) => ({
  work: {},
  save: (k, v) => set((s) => ({ work: { ...s.work, [k]: v } })),
}));
