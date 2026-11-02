"use client";

import { Panel } from "@/components/chapter/Panel";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { ChefHat, Globe2, MapPinned } from "lucide-react";
import { TAKEAWAY } from "../content";

const STEPS = [
  { icon: ChefHat, label: "A family kitchen" },
  { icon: Globe2, label: "Selling online" },
  { icon: MapPinned, label: "A national brand" },
];

function Word({ word, i, total, progress, emphasis }: { word: string; i: number; total: number; progress: MotionValue<number>; emphasis: boolean }) {
  const start = (i / total) * 0.7;
  const opacity = useTransform(progress, [start, start + 0.08], [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={emphasis ? "text-haldi" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

function Step({ i, progress, icon: Icon, label }: { i: number; progress: MotionValue<number>; icon: typeof ChefHat; label: string }) {
  const at = 0.15 + i * 0.25;
  const bg = useTransform(progress, [at, at + 0.05], ["rgba(255,245,238,0.08)", "rgba(255,92,0,1)"]);
  const scale = useTransform(progress, [at, at + 0.05], [0.9, 1]);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <motion.span style={{ backgroundColor: bg, scale }} className="grid size-16 place-items-center rounded-2xl text-cream ring-1 ring-cream/20 sm:size-20">
        <Icon className="size-7 sm:size-8" />
      </motion.span>
      <span className="text-[1rem] font-bold text-cream/90 sm:text-[1.1rem]">{label}</span>
    </div>
  );
}

export function Takeaway() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const line = useTransform(progress, [0.15, 0.7], ["0%", "100%"]);
  const words = TAKEAWAY.split(" ");
  const emph = new Set(words.map((w, i) => (/internet-first/.test(w) ? i : -1)).concat(words.map((w, i) => (w === "brand." && i === words.length - 1 ? i : -1))));

  return (
    <section id="takeaway" ref={ref} className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="maroon" reveal="up" width="max-w-5xl">
        <div className="text-center text-[0.85rem] font-extrabold uppercase tracking-[0.18em] text-haldi">Key takeaway</div>
        <blockquote className="mx-auto mt-8 max-w-4xl text-center font-display text-[clamp(1.9rem,4.4vw,3.3rem)] font-semibold leading-[1.18] text-cream">
          <span className="sr-only">{TAKEAWAY}</span>
          <span aria-hidden>
            {words.map((w, i) => (
              <Word key={i} word={w} i={i} total={words.length} progress={progress} emphasis={emph.has(i) || w.startsWith("internet-first")} />
            ))}
          </span>
        </blockquote>

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute left-[16%] right-[16%] top-8 h-1 rounded-full bg-cream/15 sm:top-10" />
          <motion.div style={{ width: line }} className="absolute left-[16%] top-8 h-1 max-w-[68%] rounded-full bg-orange sm:top-10" />
          <div className="relative grid grid-cols-3">
            {STEPS.map((s, i) => (
              <Step key={s.label} i={i} progress={progress} icon={s.icon} label={s.label} />
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}
