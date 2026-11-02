"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import { LaddooKid, type KidMood } from "./LaddooKid";
import { useMediaQuery } from "@/lib/useClient";

export type ProgressSection = { id: string; label: string };

const REST = { x: 43.5, y: 44.5 };
const BITE = { x: 33.5, y: 31 };
const R = 44; // ring radius in a 100×100 viewBox
const C = 2 * Math.PI * R;

/**
 * Circular reading-progress companion (bottom-right). A child eats a laddoo inside the ring
 * while the ring fills with the real document scroll progress:
 * scrollY / (scrollHeight − innerHeight). Visual indicator only — not LMS completion.
 */
export function LaddooRing({ sections }: { sections: ProgressSection[] }) {
  const reduce = useReducedMotion();
  const small = useMediaQuery("(max-width: 639px)");
  const idPrefix = useId().replace(/:/g, "");
  const root = useRef<HTMLButtonElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);

  const progress = useMotionValue(0);
  const [section, setSection] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);
  const [hover, setHover] = useState(false);
  const sectionRef = useRef(0);

  /* scroll → progress, re-measured on scroll, resize and document-height changes */
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      progress.set(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
      const line = y + window.innerHeight * 0.4;
      let idx = 0;
      const m: number[] = [];
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + y;
        if (top <= line) idx = i;
        m.push(max > 0 ? Math.min(1, Math.max(0, (top - window.innerHeight * 0.4) / max)) : 0);
      });
      if (idx !== sectionRef.current) {
        sectionRef.current = idx;
        setSection(idx);
      }
      setMarks((prev) => (prev.length === m.length && prev.every((v, i) => Math.abs(v - m[i]) < 0.002) ? prev : m));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [sections, progress]);

  /* ring geometry — all driven by the same motion value */
  const dash = useTransform(progress, (p) => C * (1 - p));
  const headAngle = useTransform(progress, (p) => p * 360);
  useMotionValueEvent(progress, "change", (v) => {
    const pct = Math.round(v * 100);
    if (pctEl.current) pctEl.current.textContent = `${pct}%`;
    root.current?.setAttribute("aria-valuenow", String(pct));
  });

  /* the child sways with scroll speed */
  const velocity = useMotionValue(0);
  const lean = useSpring(useTransform(velocity, [-2, 0, 2], [-7, 0, 7], { clamp: true }), { stiffness: 140, damping: 18 });
  const bob = useTransform(progress, (p) => (reduce ? 0 : -Math.abs(Math.sin(p * Math.PI * 40)) * 1.8));
  const last = useRef({ p: 0, t: 0 });
  const settle = useRef(0);
  useMotionValueEvent(progress, "change", (p) => {
    if (reduce) return;
    const now = performance.now();
    velocity.set(((p - last.current.p) / Math.max(16, now - last.current.t)) * 8000);
    last.current = { p, t: now };
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => velocity.set(0), 140);
  });
  useEffect(() => () => window.clearTimeout(settle.current), []);

  /* eating */
  const handX = useMotionValue(REST.x);
  const handY = useMotionValue(REST.y);
  const mouth = useMotionValue(0);
  const chew = useMotionValue(0);
  const busy = useRef(false);
  const [mood, setMood] = useState<KidMood>("content");
  const bite = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const ease = [0.33, 1, 0.68, 1] as const;
    await Promise.all([animate(handX, BITE.x, { duration: 0.42, ease }), animate(handY, BITE.y, { duration: 0.42, ease }), animate(mouth, 1, { duration: 0.3, delay: 0.12 })]);
    await animate(mouth, 0, { duration: 0.12 });
    await Promise.all([animate(handX, REST.x, { duration: 0.5, ease }), animate(handY, REST.y, { duration: 0.5, ease }), animate(chew, [0, 1, 0, 1, 0, 1, 0], { duration: 1.1 })]);
    busy.current = false;
  }, [handX, handY, mouth, chew]);
  const biteRef = useRef(bite);
  useEffect(() => {
    biteRef.current = bite;
  }, [bite]);

  useEffect(() => {
    if (reduce) return;
    let alive = true;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(async () => {
        if (!alive) return;
        if (document.visibilityState === "visible") await biteRef.current();
        loop();
      }, 4200 + Math.random() * 2600);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [reduce]);

  // milestone reactions
  const prev = useRef(0);
  const pulse = useMotionValue(1);
  useEffect(() => {
    let t = 0;
    if (section > prev.current) {
      setMood("happy");
      if (!reduce) {
        void biteRef.current();
        void animate(pulse, [1, 1.08, 1], { duration: 0.5 });
      }
      t = window.setTimeout(() => setMood("content"), 1500);
    }
    prev.current = section;
    return () => window.clearTimeout(t);
  }, [section, reduce, pulse]);
  useMotionValueEvent(progress, "change", (p) => {
    if (p > 0.985 && mood !== "done") setMood("done");
    else if (p <= 0.985 && mood === "done") setMood("content");
  });

  const label = sections[section]?.label ?? "";
  const size = small ? 84 : 112;

  return (
    <div
      className="fixed z-50 flex items-center gap-3"
      style={{ bottom: "max(16px, env(safe-area-inset-bottom))", right: "max(16px, env(safe-area-inset-right))" }}
    >
      <AnimatePresence>
        {hover && !small && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="pointer-events-none rounded-xl border border-cocoa bg-cream px-3.5 py-2.5 shadow-[2px_2px_0_0_#2f1c1a]"
          >
            <div className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-cocoa-2">
              Section {section + 1} of {sections.length}
            </div>
            <div className="max-w-[220px] text-[1rem] font-bold leading-snug text-cocoa">{label}</div>
            <div className="mt-0.5 text-[0.82rem] text-cocoa-2/80">Click to go back to the top</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={root}
        onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext={label}
        aria-label="Reading progress. Click to go back to the top."
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.9 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94 }}
        style={{ width: size, height: size, scale: pulse }}
        className="relative shrink-0 rounded-full"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <radialGradient id={`${idPrefix}-disc`} cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#FFF5EE" />
              <stop offset="100%" stopColor="#FEE7D5" />
            </radialGradient>
            <linearGradient id={`${idPrefix}-rim`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#F0C870" />
              <stop offset="100%" stopColor="#B9852F" />
            </linearGradient>
          </defs>
          {/* offset shadow + outline, like the site's buttons */}
          <circle cx="52" cy="52" r="49" fill="#2F1C1A" />
          <circle cx="50" cy="50" r="49" fill={`url(#${idPrefix}-disc)`} stroke="#2F1C1A" strokeWidth="1.2" />
          {/* brass rim + track */}
          <circle cx="50" cy="50" r={R} fill="none" stroke={`url(#${idPrefix}-rim)`} strokeWidth="9" opacity="0.35" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="#F1CDB1" strokeWidth="6.5" />
          {/* progress fill */}
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#FF5C00"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray={C}
            style={{ strokeDashoffset: dash, rotate: -90, transformOrigin: "50px 50px" }}
          />
          {/* section milestones on the rim */}
          {marks.slice(1).map((m, i) => {
            const a = m * Math.PI * 2 - Math.PI / 2;
            const passed = i + 1 <= section;
            return <circle key={i} cx={50 + Math.cos(a) * R} cy={50 + Math.sin(a) * R} r="1.7" fill={passed ? "#FFF5EE" : "#C9A07F"} />;
          })}
          {/* a tiny laddoo riding the leading edge */}
          <motion.g style={{ rotate: headAngle, transformOrigin: "50px 50px" }}>
            <circle cx="50" cy={50 - R} r="4.6" fill="#5A3322" stroke="#2F1C1A" strokeWidth="0.8" />
            <circle cx="48.8" cy={50 - R - 1.2} r="0.8" fill="#E3C49A" />
            <circle cx="51.4" cy={50 - R + 0.6} r="0.6" fill="#C9965F" />
          </motion.g>
        </svg>

        {/* the child inside the ring */}
        <div className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2" style={{ width: size * 0.56, height: size * 0.56 * (64 / 60) }}>
          <motion.div className="size-full" style={{ y: bob, rotate: lean, transformOrigin: "50% 90%" }}>
            <LaddooKid mood={mood} progress={progress} handX={handX} handY={handY} mouth={mouth} chew={chew} idPrefix={idPrefix} />
          </motion.div>
        </div>

        {/* percentage pill */}
        <span
          ref={pctEl}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-cocoa bg-orange px-2.5 py-0.5 font-display text-[0.95rem] font-semibold tabular-nums leading-tight text-white shadow-[1.5px_1.5px_0_0_#2f1c1a] sm:text-[1.02rem]"
        >
          0%
        </span>
      </motion.button>
    </div>
  );
}
