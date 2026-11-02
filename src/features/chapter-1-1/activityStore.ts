"use client";

import { create } from "zustand";

export type ActivityId = "keepChange" | "routes" | "shelf" | "reflect";

/** Activity completion for THIS page visit only — nothing is sent to the LMS or saved. */
export const useActivities = create<{ done: Record<ActivityId, boolean>; complete: (id: ActivityId) => void }>((set) => ({
  done: { keepChange: false, routes: false, shelf: false, reflect: false },
  complete: (id) => set((s) => (s.done[id] ? s : { done: { ...s.done, [id]: true } })),
}));
