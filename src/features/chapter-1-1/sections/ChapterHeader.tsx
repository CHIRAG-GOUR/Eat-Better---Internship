"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { CHAPTER, CATEGORIES, type CategoryId } from "../content";

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
export function ChapterHeader({ onPickCategory }: { onPickCategory: (id: CategoryId) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // the header gently drifts and fades as the chapter begins
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);

  return (
    <header id="intro" ref={ref} className="relative flex min-h-[100svh] items-center px-4 pb-16 pt-24 sm:px-8 lg:pt-20">
      <motion.div style={{ y, opacity: fade }} className="relative mx-auto w-full max-w-6xl">
        <div className="max-w-[44rem]">
          {/* internship identity */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="inline-flex items-center gap-3 rounded-full border border-cocoa/15 bg-cream/85 py-1.5 pl-2 pr-4 shadow-[0_10px_30px_-18px_rgba(47,28,26,0.6)] backdrop-blur-sm"
          >
            <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co" width={66} height={32} priority className="h-8 w-auto" />
            <span className="h-5 w-px bg-cocoa/20" />
            <span className="text-[0.9rem] font-bold uppercase tracking-[0.12em] text-cocoa">360° Internship</span>
          </motion.div>

          {/* module / chapter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-2.5"
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
            {CHAPTER.theme}
          </motion.p>

          {/* objective */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.8, ease: EASE }}
            className="mt-8 max-w-[38rem] rounded-2xl border border-cocoa bg-cream/95 p-5 shadow-[3px_3px_0_0_#2f1c1a] sm:p-6"
          >
            <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.14em] text-orange">Learning objective</div>
            <p className="mt-1.5 text-[1.05rem] leading-relaxed text-cocoa">{CHAPTER.objective}</p>
          </motion.div>

          {/* start + explore by category */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => document.getElementById("glance")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })} className="group eb-btn eb-btn-primary">
              Begin the chapter <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" />
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.95rem] font-bold text-cocoa-2">Jump to a category:</span>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => onPickCategory(c.id)}
                className="rounded-full border border-cocoa/25 bg-cream/90 px-3.5 py-1.5 text-[0.95rem] font-bold text-cocoa transition-colors hover:border-cocoa hover:bg-white"
              >
                {c.title}
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-cocoa-2 sm:flex"
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
