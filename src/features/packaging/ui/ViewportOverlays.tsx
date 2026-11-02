"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Eye, EyeOff, Map as MapIcon, X } from "lucide-react";
import { getProduct } from "@/lib/brand";
import { useStudio, type CameraView } from "../store";
import { uvToFront } from "../art/atlas";
import { elementBox } from "../art/drawArtwork";
import type { Artwork } from "../useArtwork";
import type { PackDesign } from "../types";

const VIEW_BUTTONS: { id: CameraView; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "back", label: "Back" },
  { id: "shelf", label: "Shelf test" },
];

export function ViewBar() {
  const view = useStudio((s) => s.view);
  const setView = useStudio((s) => s.setView);
  const showFlat = useStudio((s) => s.showFlat);
  const setShowFlat = useStudio((s) => s.setShowFlat);
  return (
    <div className="pointer-events-auto flex max-w-[calc(100vw-24px)] items-center gap-1 overflow-x-auto rounded-2xl border border-white/40 bg-cream/95 p-1 shadow-[0_14px_40px_-16px_rgba(30,12,6,0.55)] backdrop-blur-md no-scrollbar">
      {VIEW_BUTTONS.map((v) => {
        const on = v.id === view;
        return (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            aria-pressed={on}
            className={`relative shrink-0 rounded-xl px-3 py-2 text-[0.92rem] font-semibold transition-colors ${on ? "text-cream" : "text-cocoa hover:bg-peach"}`}
          >
            {on && <motion.span layoutId="view-pill" className="absolute inset-0 -z-0 rounded-xl bg-cocoa" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative">{v.label}</span>
          </button>
        );
      })}
      <span className="mx-1 h-6 w-px shrink-0 bg-line-strong" />
      <button
        onClick={() => setShowFlat(!showFlat)}
        aria-pressed={showFlat}
        className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[0.92rem] font-semibold ${showFlat ? "bg-orange text-white" : "text-cocoa hover:bg-peach"}`}
      >
        <MapIcon className="size-4" /> Flat artwork
      </button>
    </div>
  );
}

export function ShelfHint({ legible }: { legible: boolean }) {
  const view = useStudio((s) => s.view);
  return (
    <AnimatePresence>
      {view === "shelf" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-auto max-w-[min(420px,calc(100vw-24px))] rounded-2xl bg-cocoa/90 px-4 py-3 text-[0.98rem] leading-snug text-cream shadow-xl backdrop-blur"
        >
          <strong className="font-semibold">Shelf test:</strong> you&apos;re now about 2 metres away, like a shopper in the aisle.{" "}
          {legible ? "Your product name still reads clearly." : "Can you still read the name? The brief says it isn't clear enough yet."}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ReferenceCard({ design }: { design: PackDesign }) {
  const [open, setOpen] = useState(false);
  const p = getProduct(design.productId);
  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-haldi px-3 py-1.5 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-cocoa shadow">Your concept · design exercise</span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-full border border-white/40 bg-cream/95 px-3 py-1.5 text-[0.88rem] font-semibold text-cocoa shadow backdrop-blur hover:bg-white"
        >
          {open ? <EyeOff className="size-4" /> : <Eye className="size-4" />} Official pack
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.figure
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{ transformOrigin: "top right" }}
            className="w-[min(240px,46vw)] overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
          >
            <div className="relative aspect-square">
              <Image src={p.images[0]} alt={`Official ${p.name} packaging by Eat Better Co`} fill sizes="240px" className="object-cover" />
            </div>
            <figcaption className="space-y-1 px-3 py-2.5">
              <div className="text-[0.8rem] font-bold uppercase tracking-[0.1em] text-orange">Official · reference only</div>
              <div className="text-[0.92rem] font-semibold leading-tight text-cocoa">{p.name} by Eat Better Co</div>
              <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[0.85rem] font-semibold text-cocoa-2 underline-offset-2 hover:underline">
                View on eatbetterco.com <ExternalLink className="size-3.5" />
              </a>
            </figcaption>
          </motion.figure>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The 2D artwork sheet that wraps the 3D pack — draggable too. */
export function FlatView({ art, design }: { art: Artwork; design: PackDesign }) {
  const show = useStudio((s) => s.showFlat);
  const setShowFlat = useStudio((s) => s.setShowFlat);
  const host = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const el = host.current;
    const c = art.canvas;
    if (!show || !el || !c) return;
    // the artwork canvas is a DOM node shared with the 3D texture; we only mount it here
    c.setAttribute("class", "block h-auto w-full rounded-lg");
    c.style.setProperty("touch-action", "none");
    el.appendChild(c);
    return () => {
      if (c.parentElement === el) el.removeChild(c);
    };
  }, [show, art.canvas]);

  const toFront = (e: React.PointerEvent) => {
    const c = art.canvas;
    if (!c || !art.atlas) return null;
    const r = c.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width;
    const v = 1 - (e.clientY - r.top) / r.height;
    return uvToFront(u, v, art.atlas);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="pointer-events-auto w-[min(760px,calc(100vw-24px))] rounded-2xl border border-white/40 bg-cream/95 p-3 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div>
              <div className="font-display text-[1.05rem] font-semibold text-cocoa">Flat artwork</div>
              <p className="text-[0.88rem] leading-snug text-cocoa-2/85">
                This single sheet is wrapped around the 3D {design.format}. Front panel on the left — drag items here or on the pack.
              </p>
            </div>
            <button onClick={() => setShowFlat(false)} className="rounded-lg p-2 hover:bg-peach" aria-label="Close flat artwork">
              <X className="size-5" />
            </button>
          </div>
          <div
            ref={host}
            className="max-h-[38dvh] overflow-auto rounded-lg bg-[repeating-conic-gradient(#efe3d8_0_25%,#f8efe7_0_50%)] bg-[length:16px_16px]"
            onPointerDown={(e) => {
              const hit = toFront(e);
              if (!hit || !art.atlas) return;
              const f = art.atlas.front;
              const px = f.x + hit.x * f.w;
              const py = f.y + hit.y * f.h;
              const els = design.elements;
              for (let i = els.length - 1; i >= 0; i--) {
                const b = elementBox(els[i], f);
                if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
                  useStudio.getState().select(els[i].id);
                  drag.current = { id: els[i].id, dx: hit.x - els[i].x, dy: hit.y - els[i].y };
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  return;
                }
              }
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              const hit = toFront(e);
              if (!hit) return;
              useStudio.getState().patchElement(d.id, { x: hit.x - d.dx, y: hit.y - d.dy }, true);
            }}
            onPointerUp={() => {
              if (drag.current) useStudio.getState().commit();
              drag.current = null;
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
