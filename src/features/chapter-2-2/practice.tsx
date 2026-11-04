"use client";

import { create } from "zustand";
import { createActivityStore } from "@/lib/activities";

/** Chapter 2.2 activity tracker (wrap-up list) and the results the Growth Plan report reads. */
export const ACTIVITY_IDS = ["rush", "desk", "reflect"] as const;
export const useActivities22 = createActivityStore(ACTIVITY_IDS);

/** What the student achieved in the chapter's games (feeds the Growth Plan). */
export const usePractice22 = create<{ notes: Record<string, string>; note: (k: string, v: string) => void }>((set) => ({
  notes: {},
  note: (k, v) => set((s) => ({ notes: { ...s.notes, [k]: v } })),
}));
