import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Results of the small 2.1 activities (Name test, Spot the consistency) — read by the Brand Identity Audit. */
type State = {
  names: Record<string, string[]>; // name id → promise chips
  memorable: string | null;
  logoFound: string[]; // "<touchpoint>:<element>"
  set: (p: Partial<Omit<State, "set">>) => void;
};

export const useBrand21 = create<State>()(
  persist((set) => ({ names: {}, memorable: null, logoFound: [], set: (p) => set(p) }), {
    name: "ebc-2.1-mini",
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({ names: s.names, memorable: s.memorable, logoFound: s.logoFound }),
  }),
);
