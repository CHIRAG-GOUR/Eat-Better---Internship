"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Stamp } from "lucide-react";

/** Seeded random helpers so each attempt gets different practice data. */
export const rnd = (seed: number) => {
  let s = seed % 2147483647 || 7;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
export const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
export const shuffle = <T,>(r: () => number, a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

export type Rect = [number, number, number, number];
export const inside = (r: Rect, x: number, y: number) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];

export function NumIn({ value, onChange, unit, label, disabled, ok }: { value: string; onChange: (v: string) => void; unit?: string; label: string; disabled?: boolean; ok?: boolean }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <input inputMode="decimal" aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder="?" className={`w-24 rounded-xl border-2 px-2.5 py-1.5 text-right font-display text-[1.1rem] font-semibold tabular-nums text-cocoa outline-none focus:border-orange ${ok ? "border-success bg-success/10" : "border-cocoa/20 bg-white"}`} />
      {unit && <span className="text-[0.9rem] font-bold text-cocoa-2">{unit}</span>}
    </label>
  );
}
export const toNum = (s: string) => Number(s.replace(/[,%\s]/g, ""));

export type Flash = { x: number; y: number; k: number; ok: boolean } | null;

/** A real image the student taps on. Stamped rectangles mark proof already found. */
export function EvidenceImage({ src, w, h, title, stamped = [], flash, onTap, sizes = "(max-width: 640px) 100vw, 420px" }: { src: string; w: number; h: number; title: string; stamped?: Rect[]; flash?: Flash; onTap: (x: number, y: number) => void; sizes?: string }) {
  return (
    <figure className="min-w-0">
      <div
        className="relative w-full cursor-crosshair overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[2px_2px_0_0_#2f1c1a]"
        style={{ aspectRatio: w / h }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onTap((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}
      >
        <Image src={src} alt={title} fill sizes={sizes} className="pointer-events-none object-cover" />
        {stamped.map((r, i) => (
          <motion.span key={i} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="pointer-events-none absolute rounded-lg border-[3px] border-success bg-success/15" style={{ left: `${r[0] * 100}%`, top: `${r[1] * 100}%`, width: `${(r[2] - r[0]) * 100}%`, height: `${(r[3] - r[1]) * 100}%` }}>
            <Stamp className="absolute -right-2 -top-2 size-6 rounded-full bg-success p-1 text-white" />
          </motion.span>
        ))}
        {flash && <motion.span key={flash.k} initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.6 }} className={`pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] ${flash.ok ? "border-success" : "border-error"}`} style={{ left: `${flash.x * 100}%`, top: `${flash.y * 100}%` }} />}
      </div>
      <figcaption className="mt-1.5 text-[0.85rem] font-bold text-cocoa">{title}</figcaption>
    </figure>
  );
}
