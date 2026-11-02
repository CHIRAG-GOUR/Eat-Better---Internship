"use client";

import { create } from "zustand";
import type { PackFormat } from "@/lib/brand";
import { getProduct } from "@/lib/brand";
import { newId, startingDesign } from "./presets";
import type { ArtElement, ElementKind, PackDesign } from "./types";

export type CameraView = "hero" | "front" | "back" | "side" | "shelf";

export type Snapshot = {
  id: string;
  label: string;
  design: PackDesign;
  thumb: string; // data URL of the flat front panel
};

const HISTORY_LIMIT = 60;
const DEFAULT_PRODUCT = "millet-bhujia";

type StudioState = {
  design: PackDesign;
  past: PackDesign[];
  future: PackDesign[];
  /** design captured at the start of a continuous edit (slider / drag) */
  pendingBase: PackDesign | null;

  selectedId: string | null;
  view: CameraView;
  viewNonce: number;
  lidOpen: boolean;
  snapshots: Snapshot[];
  compareId: string | null;
  showFlat: boolean;
  introSeen: boolean;
  celebrated: boolean;
  celebrateOpen: boolean;

  /** apply a change. `transient` edits are merged into one history step on commit(). */
  update: (recipe: (d: PackDesign) => PackDesign, transient?: boolean) => void;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  resetDesign: () => void;

  selectProduct: (id: string) => void;
  setFormat: (f: PackFormat) => void;
  addElement: (kind: ElementKind) => void;
  removeElement: (id: string) => void;
  patchElement: (id: string, patch: Partial<ArtElement>, transient?: boolean) => void;
  bringForward: (id: string) => void;

  select: (id: string | null) => void;
  setView: (v: CameraView) => void;
  setLidOpen: (open: boolean) => void;
  saveSnapshot: (thumb: string) => void;
  deleteSnapshot: (id: string) => void;
  setCompare: (id: string | null) => void;
  restoreSnapshot: (id: string) => void;
  setShowFlat: (v: boolean) => void;
  setIntroSeen: () => void;
  markCelebrated: () => void;
  closeCelebrate: () => void;
};

const pushPast = (past: PackDesign[], d: PackDesign) => [...past, d].slice(-HISTORY_LIMIT);

export const useStudio = create<StudioState>((set, get) => ({
  design: startingDesign(DEFAULT_PRODUCT),
  past: [],
  future: [],
  pendingBase: null,

  selectedId: null,
  view: "hero",
  viewNonce: 0,
  lidOpen: false,
  snapshots: [],
  compareId: null,
  showFlat: false,
  introSeen: false,
  celebrated: false,
  celebrateOpen: false,

  update: (recipe, transient = false) =>
    set((s) => {
      const next = recipe(s.design);
      if (next === s.design) return s;
      if (transient) {
        return { design: next, pendingBase: s.pendingBase ?? s.design };
      }
      const base = s.pendingBase ?? s.design;
      return { design: next, past: pushPast(s.past, base), future: [], pendingBase: null };
    }),

  commit: () =>
    set((s) => {
      if (!s.pendingBase) return s;
      if (s.pendingBase === s.design) return { pendingBase: null };
      return { past: pushPast(s.past, s.pendingBase), future: [], pendingBase: null };
    }),

  undo: () =>
    set((s) => {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      return { design: prev, past: s.past.slice(0, -1), future: [s.design, ...s.future], pendingBase: null };
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s;
      const [next, ...rest] = s.future;
      return { design: next, past: pushPast(s.past, s.design), future: rest, pendingBase: null };
    }),

  resetDesign: () => {
    const { design, update } = get();
    update(() => startingDesign(design.productId, design.format));
    set({ selectedId: null });
  },

  selectProduct: (id) => {
    const p = getProduct(id);
    get().update(() => startingDesign(p.id, p.officialFormat));
    set({ selectedId: null, lidOpen: false, view: "hero", viewNonce: get().viewNonce + 1 });
  },

  setFormat: (f) => {
    get().update((d) => ({ ...d, format: f }));
    set({ lidOpen: false, view: "hero", viewNonce: get().viewNonce + 1 });
  },

  addElement: (kind) => {
    const el: ArtElement = { id: newId(), kind, x: 0.5 + (Math.random() - 0.5) * 0.2, y: 0.45, scale: 1, rotation: 0 };
    get().update((d) => ({ ...d, elements: [...d.elements, el] }));
    set({ selectedId: el.id });
  },

  removeElement: (id) => {
    get().update((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }));
    if (get().selectedId === id) set({ selectedId: null });
  },

  patchElement: (id, patch, transient = false) =>
    get().update(
      (d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) }),
      transient,
    ),

  bringForward: (id) =>
    get().update((d) => {
      const el = d.elements.find((e) => e.id === id);
      if (!el) return d;
      return { ...d, elements: [...d.elements.filter((e) => e.id !== id), el] };
    }),

  select: (id) => set({ selectedId: id }),
  setView: (v) => set((s) => ({ view: v, viewNonce: s.viewNonce + 1 })),
  setLidOpen: (open) => set({ lidOpen: open }),

  saveSnapshot: (thumb) =>
    set((s) => {
      const n = s.snapshots.length;
      const label = `Version ${String.fromCharCode(65 + (n % 26))}`;
      const snap: Snapshot = { id: newId("v"), label, design: s.design, thumb };
      return { snapshots: [...s.snapshots, snap].slice(-4) };
    }),
  deleteSnapshot: (id) =>
    set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id), compareId: s.compareId === id ? null : s.compareId })),
  setCompare: (id) => set((s) => ({ compareId: id, view: "hero", viewNonce: s.viewNonce + 1 })),
  restoreSnapshot: (id) => {
    const snap = get().snapshots.find((x) => x.id === id);
    if (!snap) return;
    get().update(() => snap.design);
    set({ compareId: null });
  },
  setShowFlat: (v) => set({ showFlat: v }),
  setIntroSeen: () => set({ introSeen: true }),
  markCelebrated: () => set({ celebrated: true, celebrateOpen: true }),
  closeCelebrate: () => set({ celebrateOpen: false }),
}));
