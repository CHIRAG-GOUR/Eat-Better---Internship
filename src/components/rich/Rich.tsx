"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, ChevronsLeftRight, RotateCw, type LucideIcon } from "lucide-react";

/**
 * Rich, picture-led building blocks for chapter pages (house style: warm, premium, purposeful motion).
 * Use these instead of paragraphs and plain lists. Every component respects reduced motion,
 * stays readable at 320px and only shows the content you pass in (no invented facts).
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── CountUp + StatBand ───────────────────────────────────────── */

/** Number that counts up when scrolled into view. `value` is the final number; prefix/suffix wrap it. */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0, className = "" }: { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const fmt = (n: number) => `${prefix}${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = fmt(value);
      return;
    }
    const c = animate(0, value, { duration: 1.4, ease: EASE, onUpdate: (n) => (el.textContent = fmt(n)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {fmt(reduce ? value : 0)}
    </span>
  );
}

export type Stat = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; icon?: LucideIcon; note?: string };

/** A band of big numbers (from supplied facts only). */
export function StatBand({ stats, tone = "orange" }: { stats: Stat[]; tone?: "orange" | "cocoa" | "cream" }) {
  const bg = tone === "orange" ? "bg-orange text-white" : tone === "cocoa" ? "bg-cocoa text-cream" : "bg-cream text-cocoa";
  const sub = tone === "cream" ? "text-cocoa-2" : "opacity-85";
  return (
    <div className={`grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a] ${stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "sm:grid-cols-3" : ""} ${tone === "cream" ? "bg-cocoa/15" : "bg-black/10"}`}>
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }} className={`min-w-0 p-4 sm:p-6 ${bg}`}>
            {Icon && <Icon className="mb-2 size-6 opacity-90" />}
            <div className="font-display text-[clamp(1.8rem,4.5vw,2.8rem)] font-semibold leading-none">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="mt-2 text-[1rem] font-bold leading-snug">{s.label}</div>
            {s.note && <div className={`mt-0.5 text-[0.82rem] ${sub}`}>{s.note}</div>}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── AutoStepper ──────────────────────────────────────────────── */

export type Step = { title: string; text?: string; img?: string; icon?: LucideIcon };

/** "How it works" stepper: auto-advances while in view (pauses on hover/focus), tap any step. */
export function AutoStepper({ steps, interval = 4200 }: { steps: Step[]; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20%" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const run = inView && !hold && !reduce;
  useEffect(() => {
    if (!run) return;
    const t = setTimeout(() => setI((n) => (n + 1) % steps.length), interval);
    return () => clearTimeout(t);
  }, [run, i, interval, steps.length]);
  const s = steps[i];
  return (
    <div ref={ref} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)} className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-stretch">
      <ol className="grid min-w-0 content-start gap-2">
        {steps.map((st, n) => {
          const on = n === i;
          const Icon = st.icon;
          return (
            <li key={st.title}>
              <button onClick={() => setI(n)} aria-current={on} className={`relative w-full overflow-hidden rounded-2xl border-2 px-4 py-3 text-left transition-colors ${on ? "border-cocoa bg-white shadow-[2px_2px_0_0_#2f1c1a]" : "border-cocoa/10 bg-cream/70 hover:border-cocoa/40"}`}>
                <span className="flex items-center gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full font-display text-[1rem] font-semibold ${on ? "bg-orange text-white" : "bg-white text-cocoa"}`}>{Icon ? <Icon className="size-4" /> : n + 1}</span>
                  <span className="min-w-0 font-display text-[1.08rem] font-semibold leading-tight text-cocoa">{st.title}</span>
                </span>
                {on && run && <motion.span key={`${i}-bar`} className="absolute bottom-0 left-0 h-1 bg-orange" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: interval / 1000, ease: "linear" }} />}
              </button>
            </li>
          );
        })}
      </ol>
      <motion.div key={i} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: EASE }} className="min-w-0 overflow-hidden rounded-[22px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
        {s.img && (
          <div className="relative aspect-[16/10]">
            <Image src={s.img} alt="" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
            <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.85rem] font-extrabold text-cocoa">
              Step {i + 1} of {steps.length}
            </span>
          </div>
        )}
        {s.text && <p className="p-4 text-[1.05rem] leading-relaxed text-cocoa sm:p-5">{s.text}</p>}
      </motion.div>
    </div>
  );
}

/* ── BeforeAfter ──────────────────────────────────────────────── */

/** Drag the handle to compare two images (keyboard: arrow keys). */
export function BeforeAfter({ before, after, beforeLabel, afterLabel, alt, ratio = "16/10" }: { before: string; after: string; beforeLabel: string; afterLabel: string; alt: string; ratio?: string }) {
  const [pct, setPct] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setPct(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="relative w-full touch-none select-none overflow-hidden rounded-[22px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
      style={{ aspectRatio: ratio }}
      onPointerDown={(e) => {
        drag.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => drag.current && move(e.clientX)}
      onPointerUp={() => (drag.current = false)}
    >
      <Image src={after} alt={alt} fill sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <Image src={before} alt="" fill sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-cocoa/90 px-3 py-1 text-[0.85rem] font-bold text-cream">{beforeLabel}</span>
      <span className="absolute right-3 top-3 rounded-full bg-orange px-3 py-1 text-[0.85rem] font-bold text-white">{afterLabel}</span>
      <div className="absolute inset-y-0 w-1 -translate-x-1/2 bg-white shadow" style={{ left: `${pct}%` }}>
        <button
          aria-label={`Compare: ${Math.round(pct)}% ${beforeLabel}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPct((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPct((p) => Math.min(100, p + 5));
          }}
          className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-cocoa bg-white text-cocoa shadow-[2px_2px_0_0_#2f1c1a]"
        >
          <ChevronsLeftRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

/* ── PhotoFan ─────────────────────────────────────────────────── */

export type FanItem = { img: string; caption: string; alt?: string };

/** Fanned stack of photos that spreads out when scrolled into view; hover lifts a card. */
export function PhotoFan({ items }: { items: FanItem[] }) {
  const n = items.length;
  return (
    <motion.ul initial="stack" whileInView="fan" viewport={{ once: true, margin: "-15%" }} className="flex flex-wrap justify-center gap-3 sm:flex-nowrap sm:gap-0">
      {items.map((it, i) => {
        const mid = (n - 1) / 2;
        const rot = (i - mid) * 5;
        return (
          <motion.li
            key={it.img + i}
            variants={{ stack: { rotate: 0, y: 30, opacity: 0 }, fan: { rotate: rot, y: Math.abs(i - mid) * 10, opacity: 1, transition: { delay: i * 0.08, type: "spring", stiffness: 160, damping: 18 } } }}
            whileHover={{ y: -14, rotate: 0, zIndex: 10, scale: 1.04 }}
            className="relative w-[46%] shrink-0 sm:-mx-3 sm:w-[min(240px,22vw)]"
          >
            <figure className="overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-[0_18px_40px_-18px_rgba(74,40,20,0.55)]">
              <div className="relative aspect-[4/5]">
                <Image src={it.img} alt={it.alt ?? ""} fill sizes="240px" className="object-cover" />
              </div>
              <figcaption className="px-1 pb-1 pt-2 text-center text-[0.92rem] font-bold leading-snug text-cocoa">{it.caption}</figcaption>
            </figure>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/* ── IconFlow ─────────────────────────────────────────────────── */

export type FlowNode = { icon: LucideIcon; title: string; text?: string };

/** Process as connected icon nodes; the connecting line draws as you scroll past. */
export function IconFlow({ nodes }: { nodes: FlowNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const line = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 30 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="relative">
      <div className="absolute top-8 hidden h-1.5 rounded-full bg-cocoa/10 md:block" style={{ left: `${50 / nodes.length}%`, right: `${50 / nodes.length}%` }} />
      <motion.div className="absolute top-8 hidden h-1.5 origin-left rounded-full bg-orange md:block" style={{ left: `${50 / nodes.length}%`, right: `${50 / nodes.length}%`, scaleX: reduce ? 1 : line }} />
      <ol className="relative grid grid-cols-1 gap-4 md:grid-flow-col md:auto-cols-fr md:gap-3">
        {nodes.map((nd, i) => {
          const Icon = nd.icon;
          return (
            <motion.li key={nd.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.09, duration: 0.5, ease: EASE }} className="flex min-w-0 items-start gap-3 md:flex-col md:items-center md:text-center">
              <span className="relative grid size-16 shrink-0 place-items-center rounded-full border-2 border-cocoa bg-white text-orange shadow-[2px_2px_0_0_#2f1c1a]">
                <Icon className="size-7" />
                <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-cocoa text-[0.75rem] font-bold text-cream">{i + 1}</span>
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[1.08rem] font-semibold leading-tight text-cocoa">{nd.title}</span>
                {nd.text && <span className="mt-1 block text-[0.95rem] leading-snug text-cocoa-2">{nd.text}</span>}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Marquee ──────────────────────────────────────────────────── */

/** Slow strip of images or chips. Pauses on hover; static when reduced motion is on. */
export function Marquee({ items, speed = 40 }: { items: { img?: string; label: string }[]; speed?: number }) {
  const reduce = useReducedMotion();
  const row = (
    <div className="flex shrink-0 gap-3 pr-3">
      {items.map((it, i) => (
        <div key={it.label + i} className="flex shrink-0 items-center gap-2 rounded-full border border-cocoa/15 bg-white py-1.5 pl-1.5 pr-4 shadow-[0_6px_16px_-10px_rgba(74,40,20,0.5)]">
          {it.img && (
            <span className="relative size-10 overflow-hidden rounded-full bg-peach">
              <Image src={it.img} alt="" fill sizes="40px" className="object-cover" />
            </span>
          )}
          <span className="whitespace-nowrap text-[0.95rem] font-bold text-cocoa">{it.label}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="group relative overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {reduce ? (
        <div className="flex flex-wrap justify-center gap-3">{row}</div>
      ) : (
        <div className="flex w-max group-hover:[animation-play-state:paused]" style={{ animation: `eb-marquee ${speed}s linear infinite` }}>
          {row}
          {row}
        </div>
      )}
      <style>{`@keyframes eb-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ── FlipCards ────────────────────────────────────────────────── */

export type Flip = { front: string; back: string; icon?: LucideIcon; img?: string };

/** Tap-to-flip cards: a short front, the detail on the back. */
export function FlipCards({ cards, cols = 3 }: { cards: Flip[]; cols?: 2 | 3 | 4 }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const grid = cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 gap-3 ${grid}`}>
      {cards.map((c, i) => {
        const on = !!open[i];
        const Icon = c.icon;
        return (
          <button key={c.front} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} aria-pressed={on} className="group relative min-h-[170px] text-left [perspective:1000px]">
            <motion.span className="absolute inset-0 block [transform-style:preserve-3d]" animate={{ rotateY: on ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
              <span className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-cocoa bg-cream p-4 shadow-[2px_2px_0_0_#2f1c1a] [backface-visibility:hidden]">
                {c.img ? (
                  <span className="relative -m-4 mb-0 block h-24">
                    <Image src={c.img} alt="" fill sizes="320px" className="object-cover" />
                  </span>
                ) : (
                  Icon && (
                    <span className="grid size-11 place-items-center rounded-xl bg-orange text-white">
                      <Icon className="size-5" />
                    </span>
                  )
                )}
                <span className="mt-3 font-display text-[1.15rem] font-semibold leading-tight text-cocoa">{c.front}</span>
                <span className="mt-2 flex items-center gap-1 text-[0.82rem] font-bold text-orange">
                  <RotateCw className="size-3.5" /> Tap to flip
                </span>
              </span>
              <span className="absolute inset-0 flex items-center overflow-auto rounded-2xl border border-cocoa bg-cocoa p-4 text-[1rem] leading-relaxed text-cream [backface-visibility:hidden] [transform:rotateY(180deg)]">{c.back}</span>
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}

/* ── VersusCards ──────────────────────────────────────────────── */

export type Versus = { problem: string; answer: string; proof?: string; icon?: LucideIcon };

/** Problem → answer rows: the answer slides in from the problem as you reach it. */
export function VersusCards({ rows, problemLabel = "Problem", answerLabel = "Answer" }: { rows: Versus[]; problemLabel?: string; answerLabel?: string }) {
  return (
    <div className="grid gap-3">
      {rows.map((r, i) => {
        const Icon = r.icon;
        return (
          <motion.div key={r.problem} initial="a" whileInView="b" viewport={{ once: true, margin: "-60px" }} className="grid items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)]">
            <motion.div variants={{ a: { opacity: 0, x: -20 }, b: { opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.45, ease: EASE } } }} className="flex min-w-0 items-center gap-3 rounded-2xl border border-error/30 bg-error/5 p-4">
              {Icon && <Icon className="size-6 shrink-0 text-error" />}
              <span className="min-w-0">
                <span className="block text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-error">{problemLabel}</span>
                <span className="font-display text-[1.08rem] font-semibold leading-tight text-cocoa">{r.problem}</span>
              </span>
            </motion.div>
            <motion.span variants={{ a: { scale: 0, opacity: 0 }, b: { scale: 1, opacity: 1, transition: { delay: i * 0.05 + 0.2, type: "spring", stiffness: 300, damping: 20 } } }} className="mx-auto grid size-10 place-items-center self-center rounded-full bg-orange text-white max-md:rotate-90">
              <ArrowRight className="size-5" />
            </motion.span>
            <motion.div variants={{ a: { opacity: 0, x: 20 }, b: { opacity: 1, x: 0, transition: { delay: i * 0.05 + 0.3, duration: 0.45, ease: EASE } } }} className="min-w-0 rounded-2xl border border-success/40 bg-success/10 p-4">
              <span className="block text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-success">{answerLabel}</span>
              <span className="block text-[1.02rem] font-semibold leading-snug text-cocoa">{r.answer}</span>
              {r.proof && <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-[0.82rem] font-bold text-cocoa-2">{r.proof}</span>}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── SplitStory ───────────────────────────────────────────────── */

/** Editorial split: a big image with gentle scroll parallax next to a short story block. */
export function SplitStory({ img, alt, kicker, title, children, flip = false, badge }: { img: string; alt: string; kicker?: string; title: string; children?: ReactNode; flip?: boolean; badge?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={`grid items-center gap-5 md:grid-cols-2 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
      <div className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-[24px] border border-cocoa shadow-[4px_4px_0_0_#2f1c1a]">
        <motion.div className="absolute inset-[-8%]" style={{ y: reduce ? 0 : y }}>
          <Image src={img} alt={alt} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
        </motion.div>
        {badge && <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.85rem] font-extrabold text-cocoa">{badge}</span>}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, ease: EASE }} className="min-w-0">
        {kicker && <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-orange">{kicker}</div>}
        <h3 className="mt-1 font-display text-[clamp(1.5rem,3.2vw,2.1rem)] font-semibold leading-[1.1] text-cocoa [overflow-wrap:break-word]">{title}</h3>
        {children && <div className="mt-3 text-[1.08rem] leading-relaxed text-cocoa">{children}</div>}
      </motion.div>
    </div>
  );
}
