import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ORDER, type StationId } from "./data";

export type View = StationId | "overview" | "review";
export type LogEntry = { station: StationId; decision: string; correct: boolean; note: string; t: number };

export type Inspect = { kind: "lot" | "tray" | "sample" | "seal"; id: string } | null;

type State = {
  view: View;
  inspect: Inspect;
  passed: number; // stations passed, in order (0..6)
  log: LogEntry[];
  alarmAt: number;
  toast: string | null;

  src: { inspected: string[]; selected: string | null; decisions: Record<string, "accept" | "reject"> };
  qc: { seen: string[]; flags: Record<string, boolean> };
  prep: { seq: string[]; ran: boolean; found: number[] };
  cook: { heat: number; time: number; size: number };
  test: { selected: string | null; tested: string[]; runs: number };
  pack: { material: string | null; sealFound: boolean; labelPick: string | null; leak: "none" | "fail" | "pass"; repacked: boolean };
  final: { decision: string | null; justification: string };

  go: (v: View) => void;
  setInspect: (i: Inspect) => void;
  say: (msg: string | null) => void;
  /** record a decision; a wrong one raises the alarm (consequence) */
  record: (station: StationId, decision: string, correct: boolean, note: string) => void;
  pass: (station: StationId) => void;
  patch: <K extends "src" | "qc" | "prep" | "cook" | "test" | "pack" | "final">(k: K, v: Partial<State[K]>) => void;
  reset: () => void;
};

const fresh = () => ({
  view: "overview" as View,
  inspect: null as Inspect,
  passed: 0,
  log: [] as LogEntry[],
  alarmAt: 0,
  toast: null,
  src: { inspected: [], selected: null, decisions: {} },
  qc: { seen: [], flags: {} },
  prep: { seq: [], ran: false, found: [] },
  cook: { heat: 2, time: 2, size: 1 },
  test: { selected: null, tested: [], runs: 0 },
  pack: { material: null, sealFound: false, labelPick: null, leak: "none" as const, repacked: false },
  final: { decision: null, justification: "" },
});

export const useFacility = create<State>()(
  persist(
    (set, get) => ({
      ...fresh(),
      setInspect: (inspect) => set({ inspect }),
      go: (view) => {
        const s = get();
        if (view !== "overview") {
          const idx = view === "review" ? ORDER.length : ORDER.indexOf(view);
          if (idx > s.passed) {
            set({ toast: idx === ORDER.length ? "Finish all six checkpoints to open the review room." : `The batch is still at checkpoint ${s.passed + 1}. Finish it first.` });
            return;
          }
        }
        set({ view, toast: null, inspect: null });
      },
      say: (toast) => set({ toast }),
      record: (station, decision, correct, note) =>
        set((s) => ({ log: [...s.log, { station, decision, correct, note, t: Date.now() }], alarmAt: correct ? s.alarmAt : Date.now() })),
      pass: (station) =>
        set((s) => {
          const idx = ORDER.indexOf(station);
          return idx === s.passed ? { passed: s.passed + 1 } : {};
        }),
      patch: (k, v) => set((s) => ({ [k]: { ...s[k], ...v } }) as Partial<State>),
      reset: () => set({ ...fresh() }),
    }),
    {
      name: "ebc-1.6-qa-facility",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ passed: s.passed, log: s.log, src: s.src, qc: s.qc, prep: s.prep, cook: s.cook, test: s.test, pack: s.pack, final: s.final }),
    },
  ),
);

/** mistakes made at a station (decisions recorded as incorrect) */
export const mistakesAt = (log: LogEntry[], st: StationId) => log.filter((l) => l.station === st && !l.correct).length;
