import type { PackFormat } from "@/lib/brand";
import type { Rect } from "../types";

/** Physical dimensions (scene units ≈ decimetres) of each pack. */
export const PACK_DIMS = {
  pouch: { w: 1.0, h: 1.45, depth: 0.2 },
  sachet: { w: 0.62, h: 1.4, depth: 0.11 },
  carton: { w: 1.05, h: 1.4, d: 0.42 },
  tin: { r: 0.5, h: 1.05 },
} as const;

export type AtlasLayout = {
  width: number;
  height: number;
  front: Rect;
  back: Rect;
  left?: Rect;
  right?: Rect;
  top?: Rect;
  bottom?: Rect;
  /** tin only: full wrap-around label band (front & back are slices of it) */
  band?: Rect;
  lid?: Rect;
};

/**
 * Texture-atlas layout per format. Every 3D face samples one region of a single
 * canvas, so the student's design is drawn once and wraps the whole pack.
 */
export function getAtlas(format: PackFormat): AtlasLayout {
  switch (format) {
    case "pouch": {
      const fw = 1024;
      const fh = Math.round(fw * (PACK_DIMS.pouch.h / PACK_DIMS.pouch.w));
      return { width: fw * 2, height: fh, front: { x: 0, y: 0, w: fw, h: fh }, back: { x: fw, y: 0, w: fw, h: fh } };
    }
    case "sachet": {
      const fw = 720;
      const fh = Math.round(fw * (PACK_DIMS.sachet.h / PACK_DIMS.sachet.w));
      return { width: fw * 2, height: fh, front: { x: 0, y: 0, w: fw, h: fh }, back: { x: fw, y: 0, w: fw, h: fh } };
    }
    case "carton": {
      const s = 760; // px per unit
      const { w, h, d } = PACK_DIMS.carton;
      const fw = Math.round(w * s);
      const fh = Math.round(h * s);
      const dd = Math.round(d * s);
      return {
        width: fw * 2 + dd * 2,
        height: fh + dd,
        front: { x: 0, y: 0, w: fw, h: fh },
        back: { x: fw, y: 0, w: fw, h: fh },
        left: { x: fw * 2, y: 0, w: dd, h: fh },
        right: { x: fw * 2 + dd, y: 0, w: dd, h: fh },
        top: { x: 0, y: fh, w: fw, h: dd },
        bottom: { x: fw, y: fh, w: fw, h: dd },
      };
    }
    case "tin": {
      const bw = 2048;
      const circumference = Math.PI * 2 * PACK_DIMS.tin.r;
      const bh = Math.round(bw * (PACK_DIMS.tin.h / circumference));
      const fw = bh; // square front window
      return {
        width: bw,
        height: bh * 2,
        band: { x: 0, y: 0, w: bw, h: bh },
        front: { x: Math.round(bw / 2 - fw / 2), y: 0, w: fw, h: bh },
        back: { x: Math.round(bw * 0.04), y: 0, w: Math.round(fw * 0.95), h: bh },
        lid: { x: 0, y: bh, w: bh, h: bh },
      };
    }
  }
}

/** Convert an atlas pixel rect to UV space (three.js: v=0 at bottom, canvas flipY). */
export function rectToUV(r: Rect, atlas: AtlasLayout) {
  return {
    u0: r.x / atlas.width,
    u1: (r.x + r.w) / atlas.width,
    v0: 1 - (r.y + r.h) / atlas.height,
    v1: 1 - r.y / atlas.height,
  };
}

/** Map a UV hit on the 3D pack back to normalised front-panel coordinates (or null). */
export function uvToFront(u: number, v: number, atlas: AtlasLayout): { x: number; y: number } | null {
  const px = u * atlas.width;
  const py = (1 - v) * atlas.height;
  const f = atlas.front;
  const x = (px - f.x) / f.w;
  const y = (py - f.y) / f.h;
  if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) return null;
  return { x, y };
}
