"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowRight, MousePointer2, Pause, Play } from "lucide-react";
import { WorldShell } from "@/components/world/WorldShell";
import { ValleyDrive, type Chapter3 } from "@/components/world3/ValleyWorld";

const World31 = dynamic(() => import("@/features/chapter-3-1/three/World"), { ssr: false });
const World32 = dynamic(() => import("@/features/chapter-3-2/three/World"), { ssr: false });

const STOPS: { ch: Chapter3; time: string; district: string; what: string; from: string; to: string; sky: string }[] = [
  {
    ch: "3.1",
    time: "Late morning",
    district: "The customer town",
    what: "The canvas terrace with the people-side blocks lit, the dispatch bays, a channel gantry over the road, then homes, a college and co-working block, a festive market, an office tower, a dark store and a review billboard.",
    from: "Canvas terrace",
    to: "Review billboard",
    sky: "from-[#5B9FDA] to-[#D9ECF2]",
  },
  {
    ch: "3.2",
    time: "Early morning",
    district: "Fields to facility",
    what: "Millet and ragi fields, a collection centre and bullock cart, trucks over the river bridge, the glass-walled kitchen with kettles, quality lab and packing line, the warehouse, then the canvas terrace with the partner-side blocks lit.",
    from: "Supplier fields",
    to: "Canvas terrace",
    sky: "from-[#7FA2CC] to-[#FFD8A3]",
  },
];

export default function WorldPreview() {
  const [ch, setCh] = useState<Chapter3>("3.1");
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
        const n = p + dt / 45; // ~45 s for the whole journey
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
    <ValleyDrive.Provider value={drive}>
      <WorldShell>{ch === "3.1" ? <World31 key="31" /> : <World32 key="32" />}</WorldShell>

      <main className="pointer-events-none relative z-10 flex min-h-dvh flex-col justify-between p-3 sm:p-6">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }} className="pointer-events-auto max-w-md rounded-[22px] border border-cocoa bg-cream/95 p-4 shadow-[3px_3px_0_0_#2f1c1a] sm:p-5">
          <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-orange">Module 3 · world preview</div>
          <h1 className="mt-1 font-display text-[clamp(1.6rem,4vw,2.2rem)] font-semibold leading-tight text-cocoa">Value Chain Valley</h1>
          <p className="mt-1 text-[0.98rem] leading-snug text-cocoa-2">A green valley that follows the business model, from the farms that grow the grain to the people who buy the snacks. Pick a chapter, then travel the valley.</p>
          <p className="mt-2 hidden items-center gap-1.5 text-[0.85rem] font-bold text-cocoa-2 sm:flex">
            <MousePointer2 className="size-4 text-orange" /> Hover places in the valley to see what they are.
          </p>
        </motion.header>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6, delay: 0.1 }} className="pointer-events-auto mx-auto w-full max-w-3xl rounded-[24px] border border-cocoa bg-cream/95 p-3 shadow-[3px_3px_0_0_#2f1c1a] sm:p-4">
          <LayoutGroup>
            <div className="grid grid-cols-2 gap-1.5" role="tablist" aria-label="Chapter">
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
                    {on && <motion.span layoutId="chip3" className="absolute inset-0 rounded-2xl bg-cocoa" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                    <span className="relative flex items-center gap-2">
                      <span className={`size-7 shrink-0 rounded-full bg-gradient-to-b ${s.sky} ring-2 ${on ? "ring-cream" : "ring-cocoa/15"}`} />
                      <span className="min-w-0">
                        <span className={`block font-display text-[1rem] font-semibold leading-tight ${on ? "text-cream" : "text-cocoa"}`}>{s.ch}</span>
                        <span className={`block text-[0.78rem] font-bold leading-tight ${on ? "text-cream/80" : "text-cocoa-2"}`}>{s.time}</span>
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
                <span className="font-display text-[1.1rem] font-semibold text-cocoa">{stop.district}</span>
                <p className="mt-0.5 hidden text-[0.92rem] leading-snug text-cocoa-2 sm:block">{stop.what}</p>
              </div>
              <Link href={`/${ch}`} className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case">
                Open chapter {ch} <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => (pos >= 1 ? (setPos(0), setPlaying(true)) : setPlaying(!playing))} aria-label={playing ? "Pause the journey" : "Travel the valley"} className="eb-btn eb-btn-primary !px-3 !py-2">
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <label className="flex min-w-0 flex-1 flex-col">
              <span className="flex justify-between text-[0.8rem] font-bold text-cocoa-2">
                <span>{stop.from}</span>
                <span>{stop.to}</span>
              </span>
              <input type="range" min={0} max={1} step={0.001} value={pos} onChange={(e) => (setPlaying(false), setPos(+e.target.value))} aria-label="Position along the journey" className="mt-1 w-full accent-[#ff5c00]" />
            </label>
          </div>
        </motion.div>
      </main>
    </ValleyDrive.Provider>
  );
}
