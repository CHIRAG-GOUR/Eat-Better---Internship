"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Check, Circle, ClipboardCopy, Hand, Megaphone, RefreshCw, RotateCcw } from "lucide-react";
import { Sprout } from "@/components/icons/EbIcons";
import { Panel } from "@/components/chapter/Panel";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { createActivityStore } from "@/lib/activities";
import { detectWebGL, useClientValue, useMediaQuery } from "@/lib/useClient";
import { DEFINITION, FIT_PARTS, FIT_TABLE, MARKET, SIGNALS, SWITCHES, TAKEAWAY, THINK, VIDEO } from "./content";

export const useActivities14 = createActivityStore(["expedition", "signals", "interviews"] as const);

const Expedition = dynamic(() => import("./expedition/Expedition"), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-[24px] bg-[#F6D7B8] sm:h-[600px] lg:h-[660px]" />,
});

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";

/* ── 1 · What is problem–solution fit? ────────────────────────── */

export function WhatIsFit() {
  return (
    <section id="fit" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Problem–Solution Fit" title="Does the product really solve the problem?" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr] lg:items-start">
          <motion.figure
            initial={{ opacity: 0, y: 24, rotate: -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="mx-auto w-full max-w-[400px] overflow-hidden rounded-[22px] border border-cocoa bg-white shadow-[4px_4px_0_0_#2f1c1a]"
          >
            <div className="relative aspect-square">
              <Image src="/chapter-1-4/what-makes-it-better.png" alt="Eat Better Co's Ultimate Snack Box with the words: What makes it better — No Cholesterol, No Transfat; No Palm Oil; Made with Millets and Dry Fruits" fill sizes="400px" className="object-contain" />
            </div>
            <figcaption className="border-t border-cocoa/15 bg-cream px-4 py-2.5 text-[0.88rem] text-cocoa-2">Official Eat Better Co image: “What makes it better”.</figcaption>
          </motion.figure>
          <div>
            <VideoBlock kind="file" h264={VIDEO.h264} poster={VIDEO.poster} title={VIDEO.title} caption={VIDEO.caption} />
          </div>
        </div>

        <div className="mt-10 rounded-[24px] bg-cocoa p-5 text-cream sm:p-7">
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">The definition</div>
          <p className="mt-2 font-display text-[clamp(1.25rem,2.4vw,1.7rem)] font-medium leading-snug">
            <GlossaryText>{DEFINITION}</GlossaryText>
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FIT_PARTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 130, damping: 18 }}
              className="relative overflow-hidden rounded-[20px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[16/10]">
                <Image src={p.img} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.82rem] font-extrabold uppercase text-cocoa">{p.label}</span>
              </div>
              <p className="p-4 text-[1.05rem] font-semibold leading-snug text-cocoa">
                <GlossaryText>{p.text}</GlossaryText>
              </p>
              {i < FIT_PARTS.length - 1 && <ArrowRight className="absolute -right-3 top-1/3 z-10 hidden size-6 rounded-full bg-orange p-1 text-white lg:block" />}
            </motion.div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Core market dynamics + re-engineer it ────────────────── */

export function Market() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const all = SWITCHES.every((s) => on[s.id]);
  return (
    <section id="market" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Core market dynamics" title="The problem — and the answer" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            { k: "The problem", text: MARKET.problem, img: "/chapter-1-1/art/balance.webp", tone: "bg-white" },
            { k: "The solution", text: MARKET.solution, img: "/chapter-1-4/frames/natural-laddoos.webp", tone: "bg-cream" },
          ].map((c, i) => (
            <motion.figure
              key={c.k}
              initial={{ opacity: 0, x: i ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 110, damping: 18 }}
              className={`overflow-hidden rounded-[22px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a] ${c.tone}`}
            >
              <div className="relative aspect-[16/9]">
                <Image src={c.img} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[0.85rem] font-extrabold uppercase tracking-[0.08em] ${i ? "bg-success text-white" : "bg-error text-white"}`}>{c.k}</span>
              </div>
              <figcaption className="p-5 text-[1.08rem] leading-relaxed text-cocoa">
                <GlossaryText>{c.text}</GlossaryText>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-8 rounded-[22px] bg-cream p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-cocoa-2">Try it · Re-engineer a snack</div>
            {all && (
              <button onClick={() => setOn({})} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.9rem] font-bold text-cocoa-2 hover:bg-peach">
                <RotateCcw className="size-4" /> Reset
              </button>
            )}
          </div>
          <p className="mt-1 text-[1rem] text-cocoa">Flip each switch to swap the old way for Eat Better&apos;s way. The flavour stays — the method changes.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {SWITCHES.map((s) => {
              const v = !!on[s.id];
              return (
                <button
                  key={s.id}
                  role="switch"
                  aria-checked={v}
                  onClick={() => setOn((o) => ({ ...o, [s.id]: !o[s.id] }))}
                  className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-colors ${v ? "border-success bg-success/10" : "border-cocoa/20 bg-white hover:border-cocoa"}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${v ? "bg-success" : "bg-cocoa/25"}`}>
                      <motion.span layout className={`absolute top-1 size-5 rounded-full bg-white shadow ${v ? "right-1" : "left-1"}`} />
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={String(v)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex-1 font-display text-[1.15rem] font-semibold leading-tight ${v ? "text-success" : "text-cocoa line-through decoration-error decoration-2"}`}
                      >
                        {v ? s.to : s.from}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {all && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-start gap-2 font-bold text-success">
                <Sprout className="mt-0.5 size-5 shrink-0" /> Same nostalgic flavours — made with cleaner ingredients, natural sweetening and oil-free processing.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Activity: the Consumer Insight Expedition ────────────── */

export function ExpeditionSection() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  const complete = useActivities14((s) => s.complete);
  return (
    <section id="expedition" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="3" kicker="Activity · The Consumer Insight Expedition" title="Find the problem with evidence">
          You are a Junior Consumer Researcher. Walk the neighbourhood, interview fictional consumers, inspect what they snack on — and work out what really drives their choices, not just what they say they want.
        </SectionIntro>
        <div className="mt-6">
          {webgl === false ? (
            <p className="rounded-2xl bg-cream p-4 text-[1rem] text-cocoa">This expedition needs 3D graphics, which this device doesn&apos;t support. You can still do the signal sorter and the interview log below.</p>
          ) : (
            <Expedition onComplete={() => complete("expedition")} />
          )}
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · The fit at a glance (flip cards) ─────────────────────── */

export function FitTable() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  return (
    <section id="table" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="4" kicker="Problem → answer → proof" title="The fit, at a glance">
          Tap each problem to turn it over.
        </SectionIntro>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FIT_TABLE.map((r, i) => {
            const f = !!flipped[r.id];
            return (
              <button
                key={r.id}
                onClick={() => setFlipped((x) => ({ ...x, [r.id]: !x[r.id] }))}
                aria-pressed={f}
                aria-label={f ? `${r.problem}. Eat Better's answer: ${r.answer}. Proof point: ${r.proof}` : `Problem: ${r.problem}. Tap to see Eat Better's answer.`}
                className="group h-[280px] text-left [perspective:1200px]"
              >
                <motion.span
                  animate={{ rotateY: f ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  className="relative block size-full [transform-style:preserve-3d]"
                >
                  <span className="absolute inset-0 flex flex-col justify-between rounded-[22px] border border-cocoa bg-white p-5 shadow-[3px_3px_0_0_#2f1c1a] [backface-visibility:hidden]">
                    <span className="flex items-center justify-between">
                      <span className="rounded-full bg-error px-3 py-1 text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-white">Problem {i + 1}</span>
                      <RefreshCw className="size-5 text-cocoa/40 transition-transform group-hover:rotate-90" />
                    </span>
                    <span className="font-display text-[1.45rem] font-semibold leading-tight text-cocoa">{r.problem}</span>
                    <span className="text-[0.9rem] font-bold text-cocoa-2">Tap to see the answer</span>
                  </span>
                  <span className="absolute inset-0 flex flex-col gap-3 rounded-[22px] border border-cocoa bg-cocoa p-5 text-cream shadow-[3px_3px_0_0_#ff5c00] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-haldi">Eat Better&apos;s answer</span>
                    <span className="text-[1.05rem] font-semibold leading-snug">{r.answer}</span>
                    <span className="mt-auto rounded-xl bg-white/10 p-3">
                      <span className="flex items-center gap-1.5 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-haldi">
                        <BadgeCheck className="size-4" /> Proof point
                      </span>
                      <span className="mt-1 block text-[0.98rem] leading-snug">{r.proof}</span>
                    </span>
                  </span>
                </motion.span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[0.92rem] text-cocoa-2">“(brand claim)” means the fact comes from Eat Better itself. “Reported” means it was stated in public reports.</p>
      </Panel>
    </section>
  );
}

/* ── 5 · Activity: is it fit? ─────────────────────────────────── */

type Bin = "real" | "not";

export function Signals() {
  const [placed, setPlaced] = useState<Record<string, Bin>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [over, setOver] = useState<Bin | null>(null);
  const bins = useRef<Partial<Record<Bin, HTMLDivElement | null>>>({});
  const canDrag = useMediaQuery("(hover: hover) and (pointer: fine)");
  const complete = useActivities14((s) => s.complete);
  const left = SIGNALS.filter((s) => !placed[s.id]);
  const realCount = SIGNALS.filter((s) => s.real).length;
  const realPlaced = SIGNALS.filter((s) => s.real && placed[s.id]).length;
  useEffect(() => {
    if (left.length === 0) complete("signals");
  }, [left.length, complete]);

  const place = (id: string, bin: Bin) => {
    const s = SIGNALS.find((x) => x.id === id)!;
    if ((bin === "real") === s.real) {
      setPlaced((p) => ({ ...p, [id]: bin }));
      setSel(null);
      setMiss(null);
      setLast(id);
    } else {
      setSel(id);
      setMiss(id);
    }
  };
  const binAt = (x: number, y: number): Bin | null => {
    for (const b of ["real", "not"] as Bin[]) {
      const r = bins.current[b]?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return b;
    }
    return null;
  };
  const lastSig = SIGNALS.find((s) => s.id === last);
  const missSig = SIGNALS.find((s) => s.id === miss);
  const selSig = SIGNALS.find((s) => s.id === sel);

  const bin = (b: Bin) => {
    const real = b === "real";
    const its = SIGNALS.filter((s) => placed[s.id] === b);
    return (
      <div
        ref={(el) => {
          bins.current[b] = el;
        }}
        onClick={() => sel && place(sel, b)}
        className={`flex min-h-[240px] flex-col rounded-[22px] border-2 p-4 transition-[transform,border-color] ${over === b ? "scale-[1.01] border-orange" : real ? "border-success/40 bg-success/5" : "border-cocoa/15 bg-white"} ${sel ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-center gap-2 font-display text-[1.3rem] font-semibold text-cocoa">
          {real ? <RefreshCw className="size-5 text-success" /> : <Megaphone className="size-5 text-cocoa-2" />}
          {real ? "Real signal of fit" : "Not proof on its own"}
        </div>
        <div className="mt-3 flex flex-1 flex-col gap-2">
          <AnimatePresence>
            {its.map((s) => (
              <motion.div key={s.id} layoutId={`sig-${s.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[1rem] font-bold ${real ? "bg-success/15 text-cocoa" : "bg-cocoa/5 text-cocoa"}`}>
                <Check className={`size-4 ${real ? "text-success" : "text-cocoa-2"}`} strokeWidth={3} /> {s.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {selSig && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                place(selSig.id, b);
              }}
              className="eb-btn eb-btn-primary mt-auto self-start !py-2 !text-[0.9rem] !normal-case"
            >
              Put it here
            </button>
          )}
          {!its.length && !selSig && <span className="m-auto text-[0.95rem] text-cocoa-2/70">{canDrag ? "Drop cards here" : "Tap a card, then this box"}</span>}
        </div>
      </div>
    );
  };

  return (
    <section id="signals" className={sectionCls}>
      <Panel tone="light" reveal="left" width="max-w-7xl">
        <SectionIntro index="5" kicker="Activity · Is it fit?" title="Which signals really prove fit?">
          A product can be famous without solving anyone&apos;s problem. Sort each signal: does it prove customers keep coming back?
        </SectionIntro>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="rounded-[22px] bg-cream p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ActivityLabel done={left.length === 0}>Activity · Signal sorter</ActivityLabel>
              <span className="text-[0.98rem] font-bold text-cocoa-2">{left.length ? `${left.length} signals left` : "All sorted!"}</span>
            </div>
            <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
              <AnimatePresence>
                {left.map((s) => {
                  const on = sel === s.id;
                  return (
                    <motion.button
                      key={s.id}
                      layoutId={`sig-${s.id}`}
                      drag={canDrag}
                      dragSnapToOrigin
                      whileDrag={{ scale: 1.05, zIndex: 50, rotate: -2 }}
                      onDragStart={() => setSel(s.id)}
                      onDrag={(e) => setOver(binAt((e as PointerEvent).clientX, (e as PointerEvent).clientY))}
                      onDragEnd={(e) => {
                        const b = binAt((e as PointerEvent).clientX, (e as PointerEvent).clientY);
                        setOver(null);
                        if (b) place(s.id, b);
                      }}
                      onTap={() => {
                        setSel(on ? null : s.id);
                        setMiss(null);
                      }}
                      animate={miss === s.id ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      aria-pressed={on}
                      className={`w-[210px] shrink-0 snap-start rounded-2xl border bg-white px-3.5 py-3 text-left font-display text-[1.08rem] font-semibold text-cocoa ${canDrag ? "cursor-grab touch-none" : ""} ${on ? "border-orange shadow-[0_0_0_3px_rgba(255,92,0,0.3)]" : "border-cocoa/20 hover:border-cocoa"}`}
                    >
                      {s.text}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="mt-2 min-h-[3em] text-[0.98rem]" aria-live="polite">
              {missSig ? (
                <span className="font-bold text-error">Not quite. Does “{missSig.text}” show that customers come back — or just that people heard about the brand?</span>
              ) : lastSig ? (
                <span className={lastSig.real ? "text-success" : "text-cocoa"}>
                  <strong>{lastSig.text}:</strong> {lastSig.note}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-cocoa-2">
                  <Hand className="size-4" /> {canDrag ? "Drag a card into a box — or tap it, then tap a box." : "Tap a card, then tap a box."}
                </span>
              )}
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {bin("real")}
              {bin("not")}
            </div>
          </div>

          {/* fit meter */}
          <div className="flex flex-col items-center rounded-[22px] bg-cocoa p-5 text-cream">
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Fit meter</div>
            <div className="relative mt-4 h-56 w-16 overflow-hidden rounded-full border-2 border-cream/40 bg-black/25">
              <motion.div className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-orange to-haldi" animate={{ height: `${(realPlaced / realCount) * 100}%` }} transition={{ type: "spring", stiffness: 90, damping: 16 }} />
            </div>
            <div className="mt-3 font-display text-[1.6rem] font-semibold tabular-nums">
              {realPlaced} / {realCount}
            </div>
            <p className="mt-1 text-center text-[0.92rem] text-cream/80">real signals found</p>
            {left.length === 0 && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center text-[0.95rem] font-bold text-haldi">
                <GlossaryText>{TAKEAWAY}</GlossaryText>
              </motion.p>
            )}
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── Think & discuss: interview logger ────────────────────────── */

const KEY = "ebc-1.4-reflection";
const OTHER = "other";
type Row = { name: string; snack: string; problem: string; other: string };
const EMPTY_ROW: Row = { name: "", snack: "", problem: "", other: "" };
const PROBLEMS = [...FIT_TABLE.map((r) => ({ id: r.id, label: r.problem })), { id: OTHER, label: "Something else" }];

export function Think() {
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: 5 }, () => ({ ...EMPTY_ROW })));
  const [q2, setQ2] = useState("");
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities14((s) => s.complete);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (v?.rows?.length === 5) setRows(v.rows);
      if (typeof v?.q2 === "string") setQ2(v.q2);
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ rows, q2 }));
    } catch {
      /* ignore */
    }
  }, [rows, q2, restored]);

  const done = (r: Row) => r.snack.trim().length > 1 && !!r.problem && (r.problem !== OTHER || r.other.trim().length > 2);
  const logged = rows.filter(done).length;
  useEffect(() => {
    if (logged === 5) complete("interviews");
  }, [logged, complete]);

  const tally = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) if (done(r)) m[r.problem] = (m[r.problem] ?? 0) + 1;
    return m;
  }, [rows]);
  const max = Math.max(0, ...Object.values(tally));
  const top = PROBLEMS.filter((p) => max > 0 && tally[p.id] === max);
  const label = (r: Row) => (r.problem === OTHER ? `Something else: ${r.other.trim()}` : PROBLEMS.find((p) => p.id === r.problem)?.label ?? "—");
  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const summary =
    `Eat Better Co — Chapter 1.4 · Think & Discuss\n\n1. ${THINK.q1}\n` +
    rows.map((r, i) => `   Person ${i + 1}${r.name.trim() ? ` (${r.name.trim()})` : ""}: snack — ${r.snack.trim() || "—"}; problem — ${r.problem ? label(r) : "—"}`).join("\n") +
    `\n   Mentioned most: ${top.length ? top.map((t) => t.label).join(" / ") : "—"}\n\n2. ${THINK.q2}\n   ${q2.trim() || "—"}`;

  return (
    <section id="think" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="6" kicker="Think & Discuss" title="Find the problem yourself" />

        <div className="mt-8 rounded-[22px] border border-line bg-white p-4 sm:p-6">
          <ActivityLabel done={logged === 5}>Question 1 · Interview log</ActivityLabel>
          <h3 className="mt-2 font-display text-[1.35rem] font-semibold leading-snug text-cocoa">
            <GlossaryText>{THINK.q1}</GlossaryText>
          </h3>
          <p className="mt-1 text-[0.95rem] text-cocoa-2">Ask in real life, then log each answer here. Names are optional.</p>

          <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <ol className="space-y-3">
              {rows.map((r, i) => (
                <li key={i} className={`rounded-2xl border-2 p-3 ${done(r) ? "border-success/40 bg-success/5" : "border-cocoa/10 bg-cream/60"}`}>
                  <div className="flex items-center gap-2 text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">
                    {done(r) ? <Check className="size-4 text-success" strokeWidth={3} /> : <Circle className="size-4 text-cocoa/30" />} Person {i + 1}
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[0.8fr_1.2fr]">
                    <input value={r.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Name (optional)" aria-label={`Person ${i + 1} name (optional)`} className="rounded-xl border border-line-strong bg-white px-3 py-2 text-[1rem] text-cocoa outline-none focus:border-orange" />
                    <input value={r.snack} onChange={(e) => set(i, { snack: e.target.value })} placeholder="Snack they usually choose" aria-label={`Person ${i + 1} snack choice`} className="rounded-xl border border-line-strong bg-white px-3 py-2 text-[1rem] text-cocoa outline-none focus:border-orange" />
                  </div>
                  <select value={r.problem} onChange={(e) => set(i, { problem: e.target.value })} aria-label={`Problem person ${i + 1} mentioned`} className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2 text-[1rem] text-cocoa outline-none focus:border-orange">
                    <option value="">Problem they mentioned…</option>
                    {PROBLEMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {r.problem === OTHER && <input value={r.other} onChange={(e) => set(i, { other: e.target.value })} placeholder="What problem did they mention?" aria-label={`Person ${i + 1} other problem`} className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2 text-[1rem] text-cocoa outline-none focus:border-orange" />}
                </li>
              ))}
            </ol>

            {/* tally */}
            <div className="self-start rounded-[20px] bg-cream p-4 lg:sticky lg:top-6">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[1.15rem] font-semibold text-cocoa">Problems mentioned</span>
                <span className="text-[0.9rem] font-bold text-cocoa-2">{logged}/5 logged</span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {PROBLEMS.map((p) => {
                  const n = tally[p.id] ?? 0;
                  const isTop = max > 0 && n === max;
                  return (
                    <li key={p.id}>
                      <div className="flex justify-between gap-2 text-[0.92rem] text-cocoa">
                        <span className={isTop ? "font-bold" : ""}>{p.label}</span>
                        <span className="font-bold tabular-nums">{n}</span>
                      </div>
                      <div className="mt-1 h-3 overflow-hidden rounded-full bg-cocoa/10">
                        <motion.div className={`h-full rounded-full ${isTop ? "bg-orange" : "bg-cocoa/35"}`} animate={{ width: `${(n / 5) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 rounded-xl bg-white p-3 text-[0.98rem] text-cocoa">
                {top.length ? (
                  <>
                    <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">Mentioned most</span>
                    <div className="mt-0.5 font-bold">{top.map((t) => t.label).join(" · ")}</div>
                    {top.some((t) => t.id !== OTHER) && <div className="mt-1 text-[0.9rem] text-cocoa-2">Compare it with the table above: what is Eat Better&apos;s answer to this problem?</div>}
                  </>
                ) : (
                  <span className="text-cocoa-2">Your tally appears as you log interviews.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-line bg-white p-5 sm:p-6">
          <ActivityLabel done={q2.trim().length >= 15}>Question 2</ActivityLabel>
          <h3 className="mt-2 font-display text-[1.35rem] font-semibold leading-snug text-cocoa">{THINK.q2}</h3>
          <textarea value={q2} onChange={(e) => setQ2(e.target.value)} rows={4} aria-label="Your answer to question 2" placeholder="One group could be… because…" className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
        </div>

        <div className="mt-6 rounded-[22px] bg-cocoa p-5 text-cream sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Your answers</div>
              <p className="text-[0.95rem] text-cream/80">Saved on this device only. Copy them into your discussion or LMS submission.</p>
            </div>
            <button
              disabled={logged < 5}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard blocked */
                }
              }}
              className="eb-btn eb-btn-primary"
            >
              {copied ? <Check className="size-5" /> : <ClipboardCopy className="size-5" />} {copied ? "Copied" : "Copy my answers"}
            </button>
          </div>
          <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/25 p-4 font-sans text-[1rem] leading-relaxed">{summary}</pre>
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP = [
  { title: "The problem", text: "Snacks that force a choice between taste and health.", img: "/chapter-1-1/art/balance.webp" },
  { title: "The answer", text: MARKET.solution, img: "/chapter-1-4/frames/natural-laddoos.webp" },
  { title: "The evidence", text: "Customers say what they want; their buying decisions show the problem that keeps coming back.", img: "/chapter-1-4/what-makes-it-better.png" },
  { title: "The signal", text: TAKEAWAY, img: "/chapter-1-2/frames/shipping-box.webp" },
];
const ACT: { id: "expedition" | "signals" | "interviews"; label: string }[] = [
  { id: "expedition", label: "Consumer Insight Report" },
  { id: "signals", label: "Is it fit? Signal sorter" },
  { id: "interviews", label: "Interview log (5 people)" },
];

export function WrapUp() {
  const done = useActivities14((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.4 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">A real problem, a real fit</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECAP.map((r, i) => (
            <motion.figure
              key={r.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 140, damping: 18 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[16/10] bg-white">
                <Image src={r.img} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className={r.img.endsWith(".png") ? "object-contain" : "object-cover"} />
                <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full border border-cocoa bg-orange font-display font-semibold text-white">{i + 1}</span>
              </div>
              <figcaption className="p-4">
                <div className="font-display text-[1.15rem] font-semibold text-cocoa">{r.title}</div>
                <p className="mt-1 text-[0.98rem] leading-snug text-cocoa">
                  <GlossaryText>{r.text}</GlossaryText>
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <div className="mt-6 rounded-[22px] bg-cream p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[1.2rem] font-semibold text-cocoa">Activities on this page</span>
            <span className="font-bold text-cocoa-2">
              {n}/{ACT.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {ACT.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-[1rem] text-cocoa">
                {done[a.id] ? <Check className="size-5 shrink-0 text-success" strokeWidth={3} /> : <Circle className="size-5 shrink-0 text-cocoa-2/40" />}
                {a.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.9rem] text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
        </div>
      </Panel>
    </section>
  );
}

