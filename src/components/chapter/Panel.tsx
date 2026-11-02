"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type Tone = "light" | "peach" | "dark" | "maroon";
const TONES: Record<Tone, string> = {
  light: "bg-cream/[0.94] text-cocoa",
  peach: "bg-peach/[0.95] text-cocoa",
  dark: "bg-cocoa/[0.94] text-cream",
  maroon: "bg-[#3a0b0d]/[0.95] text-cream",
};

/**
 * A chapter section floating over the persistent 3D world. Each panel unveils with a
 * clip-path wipe and drifts slightly for depth.
 *
 * The in-view check watches the UNCLIPPED outer frame: a fully clipped element never
 * reports as intersecting, which would leave the panel hidden forever.
 */
export function Panel({ children, tone = "light", width = "max-w-6xl", reveal = "up" }: { children: ReactNode; tone?: Tone; width?: string; reveal?: "up" | "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [24, -24]);
  const hidden =
    reveal === "left" ? "inset(0% 35% 0% 0% round 36px)" : reveal === "right" ? "inset(0% 0% 0% 35% round 36px)" : "inset(8% 4% 0% 4% round 36px)";
  const shown = "inset(0% 0% 0% 0% round 36px)";

  return (
    <motion.div ref={ref} style={{ y: drift }} className={`relative mx-auto ${width}`}>
      <motion.div
        initial={false}
        animate={reduce || inView ? { clipPath: shown, opacity: 1 } : { clipPath: hidden, opacity: 0.6 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-auto rounded-[22px] border border-cocoa/15 px-4 py-8 shadow-[0_30px_70px_-40px_rgba(47,28,26,0.75)] sm:rounded-[36px] sm:px-10 sm:py-14 ${TONES[tone]}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
