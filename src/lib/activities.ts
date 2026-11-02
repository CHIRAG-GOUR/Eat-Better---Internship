"use client";

import { create } from "zustand";

/** Per-chapter activity completion for THIS page visit only — nothing is sent to the LMS. */
export function createActivityStore<T extends string>(ids: readonly T[]) {
  const initial = Object.fromEntries(ids.map((id) => [id, false])) as Record<T, boolean>;
  return create<{ done: Record<T, boolean>; complete: (id: T) => void }>((set) => ({
    done: initial,
    complete: (id) => set((s) => (s.done[id] ? s : { done: { ...s.done, [id]: true } })),
  }));
}
