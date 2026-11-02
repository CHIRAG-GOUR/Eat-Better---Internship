"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Consistent section opener: number, kicker and heading with a choreographed reveal. */
export function SectionIntro({
  index,
  kicker,
  title,
  children,
  tone = "light",
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      className="max-w-3xl"
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
        className={`flex items-center gap-3 text-[0.85rem] font-extrabold uppercase tracking-[0.16em] ${dark ? "text-haldi" : "text-orange"}`}
      >
        <span className={`grid size-8 place-items-center rounded-full border-2 text-[0.85rem] ${dark ? "border-haldi/60" : "border-orange/50"}`}>{index}</span>
        {kicker}
      </motion.div>
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 170, damping: 22 } } }}
        className={`mt-3 font-display text-[clamp(1.9rem,4.2vw,2.6rem)] font-medium uppercase leading-[1.08] ${dark ? "text-cream" : "text-cocoa"}`}
      >
        {title}
      </motion.h2>
      <motion.span variants={{ hidden: { opacity: 0, scaleX: 0 }, show: { opacity: 1, scaleX: 1 } }} style={{ originX: 0 }} className="eb-squiggle" aria-hidden />
      {children && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
          className={`mt-4 text-[1.15rem] leading-relaxed ${dark ? "text-cream/85" : "text-cocoa-2"}`}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

export function ActivityLabel({ children, done }: { children: ReactNode; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-cocoa-2">
      <span className={`inline-block size-2.5 rounded-full ${done ? "bg-success" : "bg-orange"}`} />
      {children}
    </div>
  );
}
