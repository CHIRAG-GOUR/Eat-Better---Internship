"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import { LaddooKid, type KidMood } from "./LaddooKid";

export type ProgressSection = { id: string; label: string };

/** Hand positions (SVG units) — resting on the lap vs. at the mouth. */
const REST = { x: 43.5, y: 44.5 };
const BITE = { x: 33.5, y: 31 };

/**
 * Signature chapter progress: a child on a brass thali rides along a track built into the
 * header, eating a laddoo as the student reads. Position = real document scroll progress
 * (scrollY / (scrollHeight - innerHeight)); it is a reading indicator only, not LMS completion.
 */
export function LaddooProgress({ sections }: { sections: ProgressSection[] }) {
  const reduce = useReducedMotion();
  const idPrefix = useId().replace(/:/g, "");
  const lane = useRef<HTMLDivElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);

  /* ── scroll → progress (no React re-render per frame) ── */
  const progress = useMotionValue(0);
  const laneW = useMotionValue(0);
  const [kidW, setKidW] = useState(48);
  const [section, setSection] = useState(0);
  const [milestones, setMilestones] = useState<number[]>([]);
  const sectionRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      progress.set(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
      // section the reader is in (reading line 40% down the viewport)
      const line = y + window.innerHeight * 0.4;
      let idx = 0;
      const marks: number[] = [];
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + y;
        if (top <= line) idx = i;
        marks.push(max > 0 ? Math.min(1, Math.max(0, (top - window.innerHeight * 0.4) / max)) : 0);
      });
      if (idx !== sectionRef.current) {
        sectionRef.current = idx;
        setSection(idx);
      }
      setMilestones((prev) => (prev.length === marks.length && prev.every((m, i) => Math.abs(m - marks[i]) < 0.002) ? prev : marks));
      if (lane.current) laneW.set(lane.current.clientWidth);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // document height changes (accordions, images, activities) and lane width changes
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    if (lane.current) ro.observe(lane.current);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [sections, progress, laneW]);

  // kid size follows the breakpoint (separate mobile treatment)
  useEffect(() => {
    // phone 38px · tablet 50px · desktop 62px (header lane is taller on desktop)
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const on = () => setKidW(lg.matches ? 62 : sm.matches ? 50 : 38);
    on();
    sm.addEventListener("change", on);
    lg.addEventListener("change", on);
    return () => {
      sm.removeEventListener("change", on);
      lg.removeEventListener("change", on);
    };
  }, []);

  /* ── geometry: kid x and track fill follow the same value ── */
  const x = useTransform([progress, laneW], ([p, w]: number[]) => p * Math.max(0, w - kidW));
  const fill = useTransform([progress, laneW], ([p, w]: number[]) => (w > 0 ? (p * Math.max(0, w - kidW) + kidW / 2) / w : 0));
  useMotionValueEvent(progress, "change", (v) => {
    const pct = Math.round(v * 100);
    if (pctEl.current) pctEl.current.textContent = `${pct}%`;
    lane.current?.setAttribute("aria-valuenow", String(pct));
  });

  // scoot bob + lean with scroll speed (purely cosmetic, still tied to scroll)
  const bob = useTransform(progress, (p) => (reduce ? 0 : -Math.abs(Math.sin(p * Math.PI * 46)) * 2.2));
  const velocity = useMotionValue(0);
  const lean = useSpring(useTransform(velocity, [-2, 0, 2], [-9, 0, 9], { clamp: true }), { stiffness: 140, damping: 18 });
  const last = useRef({ p: 0, t: 0 });
  const settle = useRef(0);
  useMotionValueEvent(progress, "change", (p) => {
    if (reduce) return;
    const now = performance.now();
    const dt = Math.max(16, now - last.current.t);
    velocity.set(((p - last.current.p) / dt) * 1000 * 8);
    last.current = { p, t: now };
    // straighten up once scrolling stops
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => velocity.set(0), 140);
  });
  useEffect(() => () => window.clearTimeout(settle.current), []);

  /* ── eating animation ── */
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
  const takeBite = useRef(bite);
  useEffect(() => {
    takeBite.current = bite;
  }, [bite]);

  // idle nibbling every few seconds
  useEffect(() => {
    if (reduce) return;
    let alive = true;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(async () => {
        if (!alive) return;
        if (document.visibilityState === "visible") await takeBite.current();
        loop();
      }, 4200 + Math.random() * 2600);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [reduce]);

  // milestone reactions: new section → happy + a bite; end → satisfied
  const prevSection = useRef(0);
  useEffect(() => {
    let t = 0;
    if (section > prevSection.current) {
      setMood("happy");
      if (!reduce) void takeBite.current();
      t = window.setTimeout(() => setMood("content"), 1500);
    }
    prevSection.current = section;
    return () => window.clearTimeout(t);
  }, [section, reduce]);
  useMotionValueEvent(progress, "change", (p) => {
    if (p > 0.985 && mood !== "done") setMood("done");
    else if (p <= 0.985 && mood === "done") setMood("content");
  });

  const label = sections[section]?.label ?? "";

  return (
    <div className="flex h-full min-w-0 flex-1 items-end gap-3 sm:gap-4">
      <div ref={lane} className="relative h-full min-w-0 flex-1" role="progressbar" aria-label={`Reading progress — ${label}`} aria-valuemin={0} aria-valuemax={100} aria-valuetext={label}>
        {/* track */}
        <div className="absolute inset-x-0 bottom-[12px] h-[7px] rounded-full bg-[#F1CDB1] shadow-[inset_0_1px_2px_rgba(47,28,26,0.25)] sm:bottom-[8px] sm:h-2">
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-orange"
            style={{
              scaleX: fill,
              backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 4px, transparent 4px 9px)",
            }}
          />
        </div>
        {/* section milestones: little laddoos that get 'eaten' (filled) as you pass */}
        {milestones.slice(1).map((m, i) => {
          const passed = i + 1 <= section;
          return (
            <span
              key={sections[i + 1]?.id ?? i}
              className="pointer-events-none absolute bottom-[7px] hidden size-[11px] -translate-x-1/2 rounded-full border-2 transition-colors duration-300 sm:block"
              style={{
                left: `calc(${kidW / 2}px + ${m} * (100% - ${kidW}px))`,
                borderColor: passed ? "#2F1C1A" : "#C9A07F",
                background: passed ? "radial-gradient(circle at 35% 30%, #9a6440, #5a3322 60%, #2e170e)" : "#FEE7D5",
              }}
              title={sections[i + 1]?.label}
            />
          );
        })}
        {/* the companion */}
        <motion.div className="absolute bottom-[6px] left-0 sm:bottom-[1px]" style={{ x, width: kidW, height: kidW * (64 / 60) }}>
          <motion.div className="size-full" style={{ y: bob, rotate: lean, transformOrigin: "50% 92%" }}>
            <LaddooKid mood={mood} progress={progress} handX={handX} handY={handY} mouth={mouth} chew={chew} idPrefix={idPrefix} />
          </motion.div>
        </motion.div>
      </div>

      {/* readout */}
      <div className="flex shrink-0 flex-col items-end justify-center self-center leading-tight">
        <span ref={pctEl} className="font-display text-[1.05rem] font-semibold tabular-nums text-cocoa sm:text-[1.25rem]">
          0%
        </span>
        <span className="hidden max-w-[150px] truncate text-[0.82rem] font-bold text-cocoa-2 md:block" aria-live="polite">
          {label}
        </span>
      </div>
    </div>
  );
}
