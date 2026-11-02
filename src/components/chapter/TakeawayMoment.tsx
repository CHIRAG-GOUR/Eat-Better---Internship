"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Panel } from "./Panel";

function Word({ word, i, total, progress, emphasis }: { word: string; i: number; total: number; progress: MotionValue<number>; emphasis: boolean }) {
  const start = (i / total) * 0.7;
  const opacity = useTransform(progress, [start, start + 0.08], [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={emphasis ? "text-haldi" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

function Step({ i, progress, img, label }: { i: number; progress: MotionValue<number>; img: string; label: string }) {
  const at = 0.15 + i * 0.22;
  const filter = useTransform(progress, [at, at + 0.06], ["grayscale(1) brightness(0.55)", "grayscale(0) brightness(1)"]);
  const border = useTransform(progress, [at, at + 0.06], ["rgba(255,245,238,0.18)", "rgba(255,92,0,1)"]);
  const scale = useTransform(progress, [at, at + 0.06], [0.94, 1]);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <motion.div style={{ borderColor: border, scale }} className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-[3px]">
        <motion.div style={{ filter }} className="absolute inset-0">
          <Image src={img} alt="" fill sizes="(max-width: 640px) 33vw, 300px" className="object-cover" />
        </motion.div>
        <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-orange text-[0.9rem] font-bold text-white">{i + 1}</span>
      </motion.div>
      <span className="text-[0.98rem] font-bold text-cream/90 sm:text-[1.1rem]">{label}</span>
    </div>
  );
}

/**
 * The key-takeaway moment used by every chapter: the sentence lights up word by word as the
 * student scrolls, with optional illustrated steps underneath.
 */
export function TakeawayMoment({ id = "takeaway", text, emphasise = [], steps = [] }: { id?: string; text: string; emphasise?: string[]; steps?: { img: string; label: string }[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const line = useTransform(progress, [0.15, 0.75], ["0%", "100%"]);
  const words = text.split(" ");
  const em = emphasise.map((e) => e.toLowerCase());
  const isEm = (w: string) => em.some((e) => w.toLowerCase().replace(/[^\w-]/g, "").startsWith(e));

  return (
    <section id={id} ref={ref} className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="maroon" reveal="up" width="max-w-6xl">
        <div className="text-center text-[0.85rem] font-extrabold uppercase tracking-[0.18em] text-haldi">Key takeaway</div>
        <blockquote className="mx-auto mt-6 max-w-4xl text-center font-display text-[clamp(1.75rem,4.2vw,3.1rem)] font-semibold leading-[1.18] text-cream">
          <span className="sr-only">{text}</span>
          <span aria-hidden>
            {words.map((w, i) => (
              <Word key={i} word={w} i={i} total={words.length} progress={progress} emphasis={isEm(w)} />
            ))}
          </span>
        </blockquote>
        {steps.length > 0 && (
          <div className="relative mx-auto mt-10 max-w-4xl">
            <div className="absolute left-[16%] right-[16%] top-[30%] h-1 rounded-full bg-cream/15" />
            <motion.div style={{ width: line }} className="absolute left-[16%] top-[30%] h-1 max-w-[68%] rounded-full bg-orange" />
            <div className="relative grid gap-3 sm:gap-6" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
              {steps.map((s, i) => (
                <Step key={s.label} i={i} progress={progress} img={s.img} label={s.label} />
              ))}
            </div>
          </div>
        )}
      </Panel>
    </section>
  );
}
