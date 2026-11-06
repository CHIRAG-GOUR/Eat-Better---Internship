"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Stamp } from "lucide-react";

/** Shared pieces for the Chapter 3.2 activities: tappable evidence images and number inputs. */

/** [left, top, right, bottom] as fractions of the image. */
export type Rect = [number, number, number, number];
export const inside = (r: Rect, x: number, y: number) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];

export type Doc = { id: string; src: string; title: string; alt: string };
export type Flash = { x: number; y: number; k: number; ok: boolean } | null;

/** A real pack image the student taps; found proof is stamped in green. */
export function TapImage({ doc, marks = [], flash, onTap, disabled }: { doc: Doc; marks?: Rect[]; flash?: Flash; onTap?: (x: number, y: number) => void; disabled?: boolean }) {
  return (
    <figure className="min-w-0">
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[2px_2px_0_0_#2f1c1a] ${onTap && !disabled ? "cursor-crosshair" : ""}`}
        onClick={(e) => {
          if (!onTap || disabled) return;
          const r = e.currentTarget.getBoundingClientRect();
          onTap((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}
      >
        <Image src={doc.src} alt={doc.alt} fill sizes="(max-width: 640px) 100vw, 560px" className="pointer-events-none object-cover" />
        {marks.map((m, i) => (
          <motion.span key={i} initial={{ scale: 1.25, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="pointer-events-none absolute rounded-md border-[3px] border-success bg-success/15" style={{ left: `${m[0] * 100}%`, top: `${m[1] * 100}%`, width: `${(m[2] - m[0]) * 100}%`, height: `${(m[3] - m[1]) * 100}%` }}>
            <Stamp className="absolute -right-2 -top-2 size-6 rounded-full bg-success p-1 text-white" />
          </motion.span>
        ))}
        {flash && (
          <motion.span key={flash.k} initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.6 }} className={`pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] ${flash.ok ? "border-success" : "border-error"}`} style={{ left: `${flash.x * 100}%`, top: `${flash.y * 100}%` }} />
        )}
      </div>
      <figcaption className="mt-1.5 text-[0.85rem] font-bold text-cocoa">{doc.title}</figcaption>
    </figure>
  );
}

/** Tabs to switch between several real pack images (one large image keeps label text readable on phones). */
export function DocTabs({ docs, active, onChange }: { docs: Doc[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Pack images">
      {docs.map((d) => (
        <button key={d.id} role="tab" aria-selected={active === d.id} onClick={() => onChange(d.id)} className={`rounded-full border-2 px-3 py-1 text-[0.85rem] font-bold ${active === d.id ? "border-cocoa bg-cocoa text-cream" : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa/40"}`}>
          {d.title}
        </button>
      ))}
    </div>
  );
}

export function NumIn({ value, onChange, unit, label, disabled, w = "w-24" }: { value: string; onChange: (v: string) => void; unit?: string; label: string; disabled?: boolean; w?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <input inputMode="decimal" aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder="?" className={`${w} rounded-xl border-2 border-cocoa/20 bg-white px-3 py-2 text-right font-display text-[1.15rem] font-semibold tabular-nums text-cocoa outline-none focus:border-orange disabled:bg-success/10`} />
      {unit && <span className="text-[0.95rem] font-bold text-cocoa-2">{unit}</span>}
    </span>
  );
}

export const num = (s: string) => Number(String(s).replace(/[,\s]/g, "").replace(/kg|days?|%|batch(es)?/gi, ""));
export const near = (a: number, b: number) => Number.isFinite(a) && Math.abs(a - b) < 0.011 * Math.max(1, Math.abs(b));
export const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
