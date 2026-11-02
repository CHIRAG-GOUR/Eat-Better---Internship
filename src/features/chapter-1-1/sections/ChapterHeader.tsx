"use client";

import { GlossaryText } from "@/components/chapter/Glossary";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { CHAPTER } from "../content";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Masked line reveal for the chapter title. */
function TitleLine({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay }}>
        {text}
      </motion.span>
    </span>
  );
}

/**
 * Chapter opener (replaces the website-style navbar): internship identity → module/chapter →
 * the chapter title → subtitle → objective. Sits over the persistent 3D kitchen table.
 */
export function ChapterHeader() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // the header gently drifts and fades as the chapter begins
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);

  return (
    <header id="intro" ref={ref} className="relative flex min-h-[100svh] items-center px-4 pb-16 pt-24 sm:px-8 lg:pt-20">
      <motion.div style={{ y, opacity: fade }} className="relative mx-auto w-full max-w-7xl">
        <div className="pointer-events-auto max-w-[44rem]">
          {/* module / chapter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            <span className="rounded-lg border border-cocoa bg-cream px-3 py-1.5 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-cocoa shadow-[2px_2px_0_0_#2f1c1a]">{CHAPTER.module}</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
              className="h-[2px] w-8 origin-left bg-cocoa/40"
            />
            <span className="rounded-lg border border-cocoa bg-orange px-3 py-1.5 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-white shadow-[2px_2px_0_0_#2f1c1a]">
              Chapter {CHAPTER.number}
            </span>
          </motion.div>

          {/* chapter title */}
          <h1 className="mt-6 font-display text-[clamp(3.4rem,10vw,7.6rem)] font-semibold uppercase leading-[0.9] tracking-[-0.01em] text-cocoa [text-shadow:0_2px_0_rgba(255,245,238,0.6)]">
            <TitleLine text="About the" delay={0.45} />
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block text-orange" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay: 0.6 }}>
                Company
              </motion.span>
            </span>
          </h1>
          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
            style={{ originX: 0 }}
            className="eb-squiggle !mt-4 !w-48"
            aria-hidden
          />

          {/* subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.8, ease: EASE }}
            className="mt-6 max-w-[38rem] text-[clamp(1.12rem,2vw,1.35rem)] font-medium leading-relaxed text-cocoa"
          >
            <GlossaryText>{CHAPTER.theme}</GlossaryText>
          </motion.p>

          {/* objective */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.8, ease: EASE }}
            className="mt-8 max-w-[38rem] rounded-2xl border border-cocoa bg-cream/95 p-5 shadow-[3px_3px_0_0_#2f1c1a] sm:p-6"
          >
            <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.14em] text-orange">Learning objective</div>
            <p className="mt-1.5 text-[1.05rem] leading-relaxed text-cocoa"><GlossaryText>{CHAPTER.objective}</GlossaryText></p>
          </motion.div>

        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-cocoa-2"
        aria-hidden
      >
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.18em]">Scroll</span>
        <motion.span animate={reduce ? {} : { y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
          <ArrowDown className="size-5" />
        </motion.span>
      </motion.div>
    </header>
  );
}
