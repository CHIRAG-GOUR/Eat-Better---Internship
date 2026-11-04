import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LabResult } from "@/components/learn/LearnLab";

/** Results of the 2.1 learning labs (and older mini activities) — read by the Brand Identity Audit. */
type State = {
  labs: Record<string, LabResult>;
  names: Record<string, string[]>; // name id → promise chips
  memorable: string | null;
  logoFound: string[]; // "<touchpoint>:<element>"
  set: (p: Partial<Omit<State, "set">>) => void;
};

export const useBrand21 = create<State>()(
  persist((set) => ({ labs: {}, names: {}, memorable: null, logoFound: [], set: (p) => set(p) }), {
    name: "ebc-2.1-mini",
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({ labs: s.labs, names: s.names, memorable: s.memorable, logoFound: s.logoFound }),
  }),
);
