"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { ArrowUp } from "lucide-react";

export type ProgressSection = { id: string; label: string };

const R = 26;
const C = 2 * Math.PI * R;

/**
 * Round reading-progress indicator, bottom-right. Tracks real scroll position on this page
 * (not saved, not LMS completion). Shows the current section; click scrolls back to the top.
 */
export function ProgressRing({ sections }: { sections: ProgressSection[] }) {
  const [pct, setPct] = useState(0);
  const [current, setCurrent] = useState(0);
  const [hover, setHover] = useState(false);
  const spring = useSpring(0, { stiffness: 180, damping: 30 });
  const raf = useRef(0);

  useEffect(() => {
    const measure = () => {
      raf.current = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setPct(p);
      spring.set(p);
      const line = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= line) idx = i;
      });
      setCurrent(idx);
    };
    const on = () => {
      if (!raf.current) raf.current = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    const ro = new ResizeObserver(on);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [sections, spring]);

  const offset = useTransform(spring, (v) => C * (1 - v));
  const label = sections[current]?.label ?? "";
  const shown = Math.round(pct * 100);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="pointer-events-none hidden rounded-lg border border-cocoa bg-cream px-3 py-2 shadow-[2px_2px_0_0_#2f1c1a] sm:block"
          >
            <div className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-cocoa-2">
              Section {current + 1} of {sections.length}
            </div>
            <div className="text-[0.98rem] font-bold text-cocoa">{label}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={shown}
        aria-label={`Reading progress ${shown}% — ${label}. Click to go back to the top.`}
        className="group relative grid size-[68px] place-items-center rounded-full border border-cocoa bg-cream shadow-[2px_2px_0_0_#2f1c1a] transition-transform hover:-translate-x-px hover:-translate-y-px"
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r={R} fill="none" stroke="#FEE7D5" strokeWidth="6" />
          <motion.circle cx="32" cy="32" r={R} fill="none" stroke="#FF5C00" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: offset }} />
        </svg>
        <span className="relative text-[0.95rem] font-extrabold tabular-nums text-cocoa transition-opacity group-hover:opacity-0">{shown}%</span>
        <ArrowUp className="absolute size-5 text-orange opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </div>
  );
}
