"use client";

import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { fredoka, figtree } from "@/lib/fonts";
import { drawPackArtwork, loadLogo, setFontFamilies } from "./art/drawArtwork";
import type { AtlasLayout } from "./art/atlas";
import type { ArtworkMetrics, PackDesign } from "./types";

/** Bumps when fonts / logo finish loading so every artwork redraws with real assets. */
export const useAssets = create<{ version: number; ready: boolean; bump: () => void }>((set) => ({
  version: 0,
  ready: false,
  bump: () => set((s) => ({ version: s.version + 1, ready: true })),
}));

let loading: Promise<void> | null = null;
export function ensureArtworkAssets() {
  if (loading) return loading;
  setFontFamilies({ rounded: fredoka.style.fontFamily, clean: figtree.style.fontFamily });
  const fontLoads = [
    `700 64px ${fredoka.style.fontFamily}`,
    `800 64px ${figtree.style.fontFamily}`,
    `700 64px ${figtree.style.fontFamily}`,
    `600 64px ${figtree.style.fontFamily}`,
    `500 64px ${figtree.style.fontFamily}`,
  ].map((f) => document.fonts.load(f).catch(() => undefined));
  loading = Promise.all([loadLogo(), ...fontLoads]).then(() => useAssets.getState().bump());
  return loading;
}

export type Artwork = {
  canvas: HTMLCanvasElement | null;
  atlas: AtlasLayout | null;
  metrics: ArtworkMetrics | null;
  /** increments on every redraw — 3D textures watch this */
  version: number;
};

/**
 * Owns an offscreen canvas and redraws the full pack artwork whenever the design changes.
 * Redraws are coalesced to one per animation frame (dragging stays smooth).
 */
export function useArtwork(design: PackDesign | null, selectedId: string | null = null): Artwork {
  const [canvas] = useState(() => (typeof document !== "undefined" ? document.createElement("canvas") : null));
  const assetsVersion = useAssets((s) => s.version);
  const [state, setState] = useState<Omit<Artwork, "canvas">>({ atlas: null, metrics: null, version: 0 });
  const raf = useRef(0);

  useEffect(() => {
    void ensureArtworkAssets();
  }, []);

  useEffect(() => {
    if (!canvas || !design) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const { atlas, metrics } = drawPackArtwork(canvas, design, { selectedId });
      setState((s) => ({ atlas, metrics, version: s.version + 1 }));
    });
    return () => cancelAnimationFrame(raf.current);
  }, [canvas, design, selectedId, assetsVersion]);

  return { canvas, ...state };
}
