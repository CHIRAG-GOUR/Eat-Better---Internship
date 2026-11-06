"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowRight, MousePointer2, Pause, Play } from "lucide-react";
import { WorldShell } from "@/components/world/WorldShell";
import { BoulevardDrive, type Chapter2 } from "@/components/world2/BoulevardWorld";

const World21 = dynamic(() => import("@/features/chapter-2-1/three/World"), { ssr: false });
const World22 = dynamic(() => import("@/features/chapter-2-2/three/World"), { ssr: false });
const World23 = dynamic(() => import("@/features/chapter-2-3/three/World"), { ssr: false });
const World24 = dynamic(() => import("@/features/chapter-2-4/three/World"), { ssr: false });

const STOPS: { ch: Chapter2; time: string; district: string; what: string; built: boolean; sky: string }[] = [
  { ch: "2.1", time: "Golden hour", district: "Design studio storefronts", what: "Brand-colour columns, the website header banner, packs on plinths, logo standees and a giant tone-of-voice speaker.", built: true, sky: "from-[#F2A86B] to-[#FFE6C4]" },
  { ch: "2.2", time: "Sunset", district: "Phone-screen skyline", what: "Phone-shaped towers with feeds, rising like and comment shapes, linked customer groups and a delivery scooter.", built: true, sky: "from-[#C9768A] to-[#FFC9A1]" },
  { ch: "2.3", time: "Dusk", district: "Market square", what: "A positioning-map plaza, shopper groups for each target audience, competitor-type stalls beside an Eat Better stall and the persona board.", built: true, sky: "from-[#5E4A86] to-[#F09A86]" },
  { ch: "2.4", time: "Neon night", district: "Pitch & media district", what: "A generic pitch studio, press flashes, a newspaper kiosk and festive hamper billboards, with silent fireworks over the city.", built: true, sky: "from-[#141530] to-[#4A2F63]" },
];

export default function WorldPreview() {
  const [ch, setCh] = useState<Chapter2>("2.1");
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const drive = useRef(0);
  const stop = STOPS.find((s) => s.ch === ch)!;

  useEffect(() => {
    drive.current = pos;
  }, [pos]);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPos((p) => {
        const n = p + dt / 40; // ~40 s for the whole street
        if (n >= 1) {
          setPlaying(false);
          return 1;
        }
        return n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <BoulevardDrive.Provider value={drive}>
      <WorldShell>{ch === "2.1" ? <World21 key="21" /> : ch === "2.2" ? <World22 key="22" /> : ch === "2.3" ? <World23 key="23" /> : <World24 key="24" />}</WorldShell>

      <main className="pointer-events-none relative z-10 flex min-h-dvh flex-col justify-between p-3 sm:p-6">
        {/* title */}
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }} className="pointer-events-auto max-w-md rounded-[22px] border border-cocoa bg-cream/95 p-4 shadow-[3px_3px_0_0_#2f1c1a] sm:p-5">
          <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-orange">Module 2 · world preview</div>
          <h1 className="mt-1 font-display text-[clamp(1.6rem,4vw,2.2rem)] font-semibold leading-tight text-cocoa">Brand Boulevard</h1>
          <p className="mt-1 text-[0.98rem] leading-snug text-cocoa-2">An Indian high street that gets later in the day with every chapter. Pick a chapter, then walk the street.</p>
          <p className="mt-2 hidden items-center gap-1.5 text-[0.85rem] font-bold text-cocoa-2 sm:flex">
            <MousePointer2 className="size-4 text-orange" /> Hover objects in the street to see their names.
          </p>
        </motion.header>

        {/* dock */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6, delay: 0.1 }} className="pointer-events-auto mx-auto w-full max-w-3xl rounded-[24px] border border-cocoa bg-cream/95 p-3 shadow-[3px_3px_0_0_#2f1c1a] sm:p-4">
          <LayoutGroup>
            <div className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="Chapter">
              {STOPS.map((s) => {
                const on = s.ch === ch;
                return (
                  <button
                    key={s.ch}
                    role="tab"
                    aria-selected={on}
                    onClick={() => {
                      setCh(s.ch);
                      setPos(0);
                      setPlaying(false);
                    }}
                    className="relative min-w-0 rounded-2xl px-2 py-2 text-left"
                  >
                    {on && <motion.span layoutId="chip" className="absolute inset-0 rounded-2xl bg-cocoa" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                    <span className="relative flex items-center gap-2">
                      <span className={`size-7 shrink-0 rounded-full bg-gradient-to-b ${s.sky} ring-2 ${on ? "ring-cream" : "ring-cocoa/15"}`} />
                      <span className="min-w-0">
                        <span className={`block font-display text-[1rem] font-semibold leading-tight ${on ? "text-cream" : "text-cocoa"}`}>{s.ch}</span>
                        <span className={`hidden text-[0.78rem] font-bold leading-tight sm:block ${on ? "text-cream/80" : "text-cocoa-2"}`}>{s.time}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <AnimatePresence mode="popLayout">
            <motion.div key={ch} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex flex-wrap items-start justify-between gap-2 rounded-2xl bg-white px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[1.1rem] font-semibold text-cocoa">{stop.district}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${stop.built ? "bg-success/15 text-success" : "bg-haldi/40 text-cocoa"}`}>{stop.built ? "Built" : "Street only"}</span>
                </div>
                <p className="mt-0.5 text-[0.92rem] leading-snug text-cocoa-2">{stop.what}</p>
              </div>
              {stop.built && (
                <Link href={`/${ch}`} className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case">
                  Open chapter {ch} <ArrowRight className="size-4" />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => (pos >= 1 ? (setPos(0), setPlaying(true)) : setPlaying(!playing))} aria-label={playing ? "Pause the walk" : "Walk the street"} className="eb-btn eb-btn-primary !px-3 !py-2">
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <label className="flex min-w-0 flex-1 flex-col">
              <span className="flex justify-between text-[0.8rem] font-bold text-cocoa-2">
                <span>Start of the street</span>
                <span>End</span>
              </span>
              <input type="range" min={0} max={1} step={0.001} value={pos} onChange={(e) => (setPlaying(false), setPos(+e.target.value))} aria-label="Position along the street" className="mt-1 w-full accent-[#ff5c00]" />
            </label>
          </div>
        </motion.div>
      </main>
    </BoulevardDrive.Provider>
  );
}
