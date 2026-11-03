"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Ban, BadgeCheck, Check, Circle, ClipboardCopy, FlaskConical, Leaf, ListChecks, ScanSearch, ShieldCheck, X } from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { createActivityStore } from "@/lib/activities";
import { detectWebGL, useClientValue } from "@/lib/useClient";
import { CHECKPOINTS, CLEAN_LABEL, CLEAN_LABEL_INTRO, COMPLIANCE, EXCLUSIONS, FRONT_PACKS, LABELS, PACKAGING, PROMISE_INTRO, TAKEAWAY, THINK, VIDEO } from "./content";

export const useActivities16 = createActivityStore(["facility", "labels", "front", "reflect"] as const);

const Facility = dynamic(() => import("./three/Facility"), {
  ssr: false,
  loading: () => <div className="h-[440px] animate-pulse rounded-[24px] bg-[#E9ECEA] sm:h-[520px] lg:h-[620px]" />,
});
const QAReport = dynamic(() => import("./three/facility/Report").then((m) => m.QAReport), {
  ssr: false,
  loading: () => <div className="h-[240px] animate-pulse rounded-[22px] bg-white/60" />,
});

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";

/* ── Official brand badges (as in the source, right after the objective) ── */

export function BrandBadges() {
  return (
    <section id="badges" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Eat Better&apos;s quality promise</div>
        <figure className="mt-4">
          <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
            <div className="min-w-[720px] overflow-hidden rounded-2xl border border-cocoa/15">
              <Image src="/chapter-1-6/quality-promise-badges.png" alt="Made in the Better Kitchen · 10Lac+ happy customers · FSSAI certified · 6 layer quality check · Lab tested nutrition · No palm oil used" width={1536} height={315} className="h-auto w-full" priority />
            </div>
          </div>
          <figcaption className="mt-2 text-[0.88rem] text-cocoa-2">Official Eat Better brand statements, as shown on eatbetterco.com.</figcaption>
        </figure>
      </Panel>
    </section>
  );
}

/* ── 1 · The six checkpoints ─────────────────────────────────── */

export function Promise() {
  return (
    <section id="promise" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="1" kicker="The 6 Layers Quality Promise" title="Six checkpoints for every batch">
          <GlossaryText>{PROMISE_INTRO}</GlossaryText>
        </SectionIntro>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKPOINTS.map((c, i) => (
            <motion.figure
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: (i % 3) * 0.1, type: "spring", stiffness: 130, damping: 18 }}
              whileHover={{ y: -6 }}
              className="flex flex-col overflow-hidden rounded-[22px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[16/10]">
                <Image src={c.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full border border-cocoa bg-haldi font-display text-[1.2rem] font-semibold text-cocoa">{i + 1}</span>
              </div>
              <figcaption className="flex flex-1 flex-col p-4">
                <div className="font-display text-[1.3rem] font-semibold text-cocoa">{c.name}</div>
                <p className="mt-1 flex-1 text-[1rem] leading-snug text-cocoa">
                  <GlossaryText>{c.process}</GlossaryText>
                </p>
                <div className="mt-3 flex gap-2 rounded-xl bg-white px-3 py-2 text-[0.92rem] font-semibold leading-snug text-cocoa">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-orange" />
                  <span>
                    <span className="text-cocoa-2">Key objective:</span> <GlossaryText>{c.objective}</GlossaryText>
                  </span>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Activity: the Virtual Quality & Packaging Facility ───── */

export function FacilitySection() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  const complete = useActivities16((s) => s.complete);
  return (
    <section id="facility" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="2" kicker="3D simulation · Role: Quality Assurance Specialist" title="The Virtual Quality & Packaging Facility">
          Walk a simulated production facility and take one batch through all six checkpoints. At each station, inspect, find the problem, and make the call — the batch can&apos;t move on until your decision is right.
        </SectionIntro>
        <div className="mt-6">
          <Facility three={webgl !== false} onComplete={() => complete("facility")} />
        </div>
        <p className="mt-3 text-[0.85rem] text-cocoa-2">All batches, faults, readings and criteria in this facility are simulated for training. They are not real Eat Better batches or settings.</p>
      </Panel>
    </section>
  );
}

/* ── 3 · Deliverable: Quality Assurance Report ───────────────── */

export function ReportSection() {
  return (
    <section id="qa-report" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-5xl">
        <SectionIntro index="3" kicker="Interactive Dispatch Terminal" title="Quality Assurance Command Center">
          Review station telemetry cards, endorse certified quality parameters, and apply your official verification stamp to issue the batch passport.
        </SectionIntro>
        <div className="mt-6">
          <QAReport />
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Clean label + label detective ───────────────────────── */

const CLEAN_ICONS = [ListChecks, Ban, Leaf];

function LabelDetective() {
  const complete = useActivities16((s) => s.complete);
  const [idx, setIdx] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [okTap, setOkTap] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"clean" | "not" | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const done = results.length === LABELS.length;
  const l = LABELS[Math.min(idx, LABELS.length - 1)];
  const excluded = l.ingredients.filter((x) => x.excluded);
  const isClean = excluded.length === 0;
  const verdictRight = verdict !== null && (verdict === "clean") === isClean;
  const missed = excluded.filter((x) => !found.includes(x.text));

  useEffect(() => {
    if (done) complete("labels");
  }, [done, complete]);

  const tap = (text: string, ex?: string) => {
    if (verdict) return;
    if (ex) {
      setFound((f) => (f.includes(text) ? f : [...f, text]));
      setOkTap(null);
    } else setOkTap(text);
  };
  const decide = (v: "clean" | "not") => {
    if (verdict) return;
    setVerdict(v);
    setResults((r) => [...r, (v === "clean") === isClean && missed.length === 0]);
  };
  const next = () => {
    setIdx((i) => i + 1);
    setFound([]);
    setOkTap(null);
    setVerdict(null);
  };
  const reset = () => {
    setIdx(0);
    setFound([]);
    setOkTap(null);
    setVerdict(null);
    setResults([]);
  };

  return (
    <div className="mt-8 rounded-[22px] bg-cream p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ActivityLabel done={done}>Activity · Label detective</ActivityLabel>
        <span className="text-[0.95rem] font-bold text-cocoa-2">{done ? "All labels checked" : `Label ${idx + 1} of ${LABELS.length}`}</span>
      </div>
      <p className="mt-2 max-w-3xl text-[1.05rem] text-cocoa">Read each ingredient list. Tap anything on Eat Better&apos;s exclusion list, then decide: clean label or not?</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border-2 border-cocoa bg-white p-4">
          <div className="flex items-center gap-2 text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-cocoa">
            <Ban className="size-4 text-error" /> Never used by Eat Better
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {EXCLUSIONS.map((e) => (
              <li key={e} className="rounded-xl bg-error/10 px-3 py-2 text-[0.95rem] font-bold text-cocoa">
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.85rem] text-cocoa-2">From the Clean Label Commitment: strict ingredient exclusions.</p>
        </div>

        {!done ? (
          <AnimatePresence mode="popLayout">
            <motion.div key={l.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="rounded-2xl border border-cocoa/20 bg-[#FFFDF9] p-4 shadow-[3px_3px_0_0_rgba(47,28,26,0.15)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-display text-[1.3rem] font-semibold text-cocoa">{l.name}</div>
                <span className={`rounded-full px-3 py-1 text-[0.8rem] font-extrabold uppercase tracking-[0.08em] ${l.real ? "bg-success/15 text-success" : "bg-cocoa/10 text-cocoa-2"}`}>{l.real ? "Real Eat Better list" : "Practice label"}</span>
              </div>
              <div className="text-[0.88rem] text-cocoa-2">{l.source}</div>
              <div className="mt-4 border-t-2 border-dashed border-cocoa/20 pt-3 text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-cocoa">Ingredients</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {l.ingredients.map((g) => {
                  const isFound = found.includes(g.text);
                  const reveal = verdict && g.excluded && !isFound;
                  return (
                    <motion.button
                      key={g.text}
                      onClick={() => tap(g.text, g.excluded)}
                      disabled={!!verdict}
                      animate={okTap === g.text ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
                      className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-[0.98rem] font-bold ${isFound ? "border-error bg-error/10 text-error" : reveal ? "border-orange bg-orange/10 text-cocoa" : okTap === g.text ? "border-success/50 bg-success/5 text-cocoa" : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}
                    >
                      {isFound && <Ban className="size-4" />}
                      {g.text}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-2 min-h-[1.5em] text-[0.92rem] text-cocoa-2">{okTap && !verdict ? `“${okTap}” isn't on the exclusion list.` : found.length ? `${found.length} excluded ingredient${found.length > 1 ? "s" : ""} spotted.` : ""}</div>

              {!verdict ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => decide("clean")} className="eb-btn eb-btn-secondary !normal-case">
                    <BadgeCheck className="size-4" /> Clean label
                  </button>
                  <button onClick={() => decide("not")} className="eb-btn eb-btn-dark !normal-case">
                    <X className="size-4" /> Not clean label
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-3">
                  <p className={`rounded-xl px-3 py-2 text-[0.98rem] leading-snug text-cocoa ${verdictRight ? "bg-success/10" : "bg-error/10"}`}>
                    <strong className={verdictRight ? "text-success" : "text-error"}>{verdictRight ? "Right call. " : "Not quite. "}</strong>
                    {isClean
                      ? "Nothing on this list is on Eat Better's exclusion list — it passes the clean-label check."
                      : `This list contains ${excluded.map((x) => x.text.toLowerCase()).join(" and ")}, so it fails Eat Better's clean-label check.`}
                    {!isClean && missed.length > 0 && verdict && ` You missed: ${missed.map((m) => m.text).join(", ")}.`}
                  </p>
                  <button onClick={next} className="eb-btn eb-btn-primary !normal-case">
                    {idx + 1 < LABELS.length ? "Next label" : "See my results"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-cocoa/20 bg-white p-5">
            <div className="font-display text-[1.4rem] font-semibold text-cocoa">
              {results.filter(Boolean).length} of {LABELS.length} labels checked perfectly
            </div>
            <ul className="mt-3 space-y-2">
              {LABELS.map((x, i) => (
                <li key={x.id} className="flex items-center gap-2 text-[1rem] text-cocoa">
                  {results[i] ? <Check className="size-5 text-success" strokeWidth={3} /> : <X className="size-5 text-error" strokeWidth={3} />}
                  {x.name} <span className="text-[0.85rem] text-cocoa-2">({x.real ? "real" : "practice"})</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[1rem] leading-relaxed text-cocoa">A short list you can read in seconds is the point of a clean label.</p>
            <button onClick={reset} className="eb-btn eb-btn-secondary mt-4 !normal-case">
              Check them again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function CleanLabel() {
  return (
    <section id="clean-label" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="4" kicker="Clean Label Strategy" title="A label you can actually read">
          <GlossaryText>{CLEAN_LABEL_INTRO}</GlossaryText>
        </SectionIntro>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative min-h-[240px] overflow-hidden rounded-[22px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
          >
            <Image src="/chapter-1-2/better-ingredients.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
          </motion.div>
          <div className="grid gap-3">
            {CLEAN_LABEL.map((c, i) => {
              const Icon = CLEAN_ICONS[i];
              return (
                <motion.div key={c.title} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 rounded-2xl bg-cream p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange text-white">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="font-display text-[1.15rem] font-semibold text-cocoa">{c.title}</div>
                    <p className="mt-0.5 text-[1rem] leading-snug text-cocoa">
                      <GlossaryText>{c.text}</GlossaryText>
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <LabelDetective />
      </Panel>
    </section>
  );
}

/* ── 4 · Compliance & certifications ─────────────────────────── */

const COMPLIANCE_ICONS = [ShieldCheck, FlaskConical];

export function Compliance() {
  return (
    <section id="compliance" className={sectionCls}>
      <Panel tone="dark" reveal="up" width="max-w-7xl">
        <SectionIntro index="5" kicker="Regulatory Compliance & Quality Certifications" title="Rules, tests and trust" tone="dark" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {COMPLIANCE.map((c, i) => {
            const Icon = COMPLIANCE_ICONS[i];
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 120, damping: 18 }}
                className="rounded-[20px] bg-cream p-5 text-cocoa"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange text-white">
                    <Icon className="size-5" />
                  </span>
                  <div className="font-display text-[1.3rem] font-semibold leading-tight">{c.title}</div>
                </div>
                <p className="mt-3 text-[1.02rem] leading-relaxed">
                  <GlossaryText>{c.text}</GlossaryText>
                </p>
                <div className="mt-3 text-[0.85rem] font-bold text-cocoa-2">Brand statement from Eat Better.</div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <VideoBlock kind="youtube" id={VIDEO.id} poster={VIDEO.poster} title={VIDEO.title} caption={VIDEO.caption} />
          <div className="rounded-[22px] bg-cream/10 p-5 text-cream">
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Watch for</div>
            <p className="mt-2 text-[1.08rem] leading-relaxed">
              The Sharks had doubts about the product. As you watch, notice which questions are really about <strong>trust</strong> — and how quality checks, tests and clear labels could answer them.
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 5 · Packaging + front-of-pack check ─────────────────────── */

function FrontOfPack() {
  const complete = useActivities16((s) => s.complete);
  const [pi, setPi] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [doneList, setDoneList] = useState<Record<string, boolean>>({});
  const p = FRONT_PACKS[pi];
  const options = useMemo(() => [...p.claims, ...p.decoys].sort((a, b) => a.localeCompare(b)), [p]);
  const perfect = checked && picked.length === p.claims.length && p.claims.every((c) => picked.includes(c));
  const allDone = FRONT_PACKS.every((x) => x.id in doneList);

  useEffect(() => {
    if (allDone) complete("front");
  }, [allDone, complete]);

  const choosePack = (i: number) => {
    setPi(i);
    setPicked([]);
    setChecked(false);
  };
  const toggle = (o: string) => {
    if (checked) return;
    setPicked((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  };
  const check = () => {
    setChecked(true);
    const ok = picked.length === p.claims.length && p.claims.every((c) => picked.includes(c));
    setDoneList((d) => ({ ...d, [p.id]: ok }));
  };

  return (
    <div className="mt-8 rounded-[22px] bg-cream p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ActivityLabel done={allDone}>Activity · Front-of-pack check</ActivityLabel>
        <span className="text-[0.95rem] font-bold text-cocoa-2">
          {Object.keys(doneList).length}/{FRONT_PACKS.length} packs checked
        </span>
      </div>
      <p className="mt-2 max-w-3xl text-[1.05rem] text-cocoa">A shopper glances at a pack for a few seconds. Look closely at each real pack and pick the claims printed on its front.</p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a pack">
        {FRONT_PACKS.map((x, i) => (
          <button
            key={x.id}
            onClick={() => choosePack(i)}
            aria-pressed={i === pi}
            className={`flex items-center gap-2 rounded-2xl border-2 py-1.5 pl-1.5 pr-3 text-left text-[0.92rem] font-bold ${i === pi ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}
          >
            <span className="relative size-10 overflow-hidden rounded-xl bg-peach">
              <Image src={x.img} alt="" fill sizes="40px" className="object-cover" />
            </span>
            {x.name}
            {x.id in doneList && (doneList[x.id] ? <Check className="size-4 text-success" strokeWidth={3} /> : <Circle className="size-4 text-orange" />)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,420px)_1fr]">
        <motion.figure key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-[22px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
          <div className="relative aspect-square">
            <Image src={p.img} alt={`${p.name} — official Eat Better pack`} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
          </div>
          <figcaption className="px-3 py-2 text-[0.85rem] text-cocoa-2">{p.name} · official Eat Better photo</figcaption>
        </motion.figure>
        <div>
          <div className="flex items-center gap-2 font-display text-[1.2rem] font-semibold text-cocoa">
            <ScanSearch className="size-5 text-orange" /> Which claims are on the front of this pack?
          </div>
          <div className="mt-3 grid gap-2">
            {options.map((o) => {
              const on = picked.includes(o);
              const isClaim = p.claims.includes(o);
              const cls = !checked
                ? on
                  ? "border-orange bg-orange/10"
                  : "border-cocoa/15 bg-white hover:border-cocoa"
                : isClaim
                  ? on
                    ? "border-success bg-success/10"
                    : "border-orange bg-orange/5"
                  : on
                    ? "border-error bg-error/10"
                    : "border-cocoa/10 bg-white/60 text-cocoa-2/70";
              return (
                <button key={o} onClick={() => toggle(o)} aria-pressed={on} disabled={checked} className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-[1rem] font-bold text-cocoa ${cls}`}>
                  {o}
                  {checked && isClaim && <span className="text-[0.8rem] font-extrabold uppercase text-success">{on ? "On the pack" : "Missed — it's on the pack"}</span>}
                  {checked && !isClaim && on && <span className="text-[0.8rem] font-extrabold uppercase text-error">Not on this pack</span>}
                </button>
              );
            })}
          </div>
          {!checked ? (
            <button onClick={check} disabled={!picked.length} className="eb-btn eb-btn-primary mt-3 !normal-case">
              Check my answer
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-3">
              <p className={`rounded-xl px-3 py-2 text-[0.98rem] leading-snug text-cocoa ${perfect ? "bg-success/10" : "bg-haldi/25"}`}>
                <strong>{perfect ? "Spot on. " : "Look again. "}</strong>
                {p.note}
              </p>
              {pi + 1 < FRONT_PACKS.length ? (
                <button onClick={() => choosePack(pi + 1)} className="eb-btn eb-btn-primary !normal-case">
                  Next pack
                </button>
              ) : (
                <button onClick={() => choosePack(pi)} className="eb-btn eb-btn-secondary !normal-case">
                  Try this pack again
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Packaging() {
  return (
    <section id="packaging" className={sectionCls}>
      <Panel tone="light" reveal="left" width="max-w-7xl">
        <SectionIntro index="6" kicker="Packaging Strategy & Design Execution" title="The pack does three jobs" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PACKAGING.map((c, i) => (
            <motion.figure
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 130, damping: 18 }}
              whileHover={{ y: -6 }}
              className="flex flex-col overflow-hidden rounded-[22px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[4/3]">
                <Image src={c.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.85rem] font-extrabold text-cocoa">Job {i + 1}</span>
              </div>
              <figcaption className="flex-1 p-5">
                <div className="font-display text-[1.25rem] font-semibold text-cocoa">{c.title}</div>
                <p className="mt-1.5 text-[1rem] leading-relaxed text-cocoa">
                  <GlossaryText>{c.text}</GlossaryText>
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <FrontOfPack />
      </Panel>
    </section>
  );
}

/* ── Think & discuss ──────────────────────────────────────────── */

const KEY = "ebc-1.6-reflection";
type Saved = { cp: string | null; why: string; q2: string };
const EMPTY: Saved = { cp: null, why: "", q2: "" };

export function Think() {
  const [s, setS] = useState<Saved>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities16((x) => x.complete);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (v) setS({ ...EMPTY, ...v });
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s, restored]);

  const q1ok = !!s.cp && s.why.trim().length >= 15;
  const q2ok = s.q2.trim().length >= 15;
  useEffect(() => {
    if (q1ok && q2ok) complete("reflect");
  }, [q1ok, q2ok, complete]);
  const set = (patch: Partial<Saved>) => setS((p) => ({ ...p, ...patch }));
  const summary = `Eat Better Co — Chapter 1.6 · Think & Discuss\n\n1. ${THINK.q1}\n   Checkpoint: ${s.cp ?? "—"}\n   Why: ${s.why.trim() || "—"}\n\n2. ${THINK.q2}\n   ${s.q2.trim() || "—"}`;

  return (
    <section id="think" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="7" kicker="Think & Discuss" title="Think like a quality lead" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
            <ActivityLabel done={q1ok}>Question 1</ActivityLabel>
            <h3 className="mt-2 font-display text-[1.3rem] font-semibold leading-snug text-cocoa">
              <GlossaryText>{THINK.q1}</GlossaryText>
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CHECKPOINTS.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => set({ cp: c.name })}
                  aria-pressed={s.cp === c.name}
                  className={`overflow-hidden rounded-2xl border-2 text-left ${s.cp === c.name ? "border-orange" : "border-cocoa/15 hover:border-cocoa"}`}
                >
                  <span className="relative block aspect-[16/10]">
                    <Image src={c.img} alt="" fill sizes="160px" className="object-cover" />
                    <span className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-haldi text-[0.8rem] font-extrabold text-cocoa">{i + 1}</span>
                  </span>
                  <span className="block px-2 py-1.5 text-[0.9rem] font-bold leading-tight text-cocoa">{c.name}</span>
                </button>
              ))}
            </div>
            <textarea
              value={s.why}
              onChange={(e) => set({ why: e.target.value })}
              rows={3}
              aria-label="Why this checkpoint is the hardest to maintain"
              placeholder={s.cp ? `${s.cp} gets harder as the brand grows because…` : "Pick a checkpoint first…"}
              className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
            />
          </div>
          <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
            <ActivityLabel done={q2ok}>Question 2</ActivityLabel>
            <h3 className="mt-2 font-display text-[1.3rem] font-semibold leading-snug text-cocoa">
              <GlossaryText>{THINK.q2}</GlossaryText>
            </h3>
            <textarea
              value={s.q2}
              onChange={(e) => set({ q2: e.target.value })}
              rows={6}
              aria-label="Your answer to question 2"
              placeholder="Because…"
              className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
            />
            <p className="mt-2 text-[0.92rem] text-cocoa-2">Tip: think back to the label detective — what did the short list tell you that the front of a pack might not?</p>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] bg-cocoa p-5 text-cream sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Your answers</div>
              <p className="text-[0.95rem] text-cream/80">Saved on this device only. Copy them into your discussion or LMS submission.</p>
            </div>
            <button
              disabled={!(q1ok && q2ok)}
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
          <pre className="mt-4 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/25 p-4 font-sans text-[1rem] leading-relaxed">{summary}</pre>
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP = [
  { title: "Six checkpoints", text: "Sourcing · Quality Check · Prepping · Cooking · Batch Testing · Packaging — for every batch.", img: "/chapter-1-6/frames/roasting.webp" },
  { title: "Clean label", text: "Zero palm oil, refined sugar, artificial preservatives or hydrogenated fats.", img: "/chapter-1-2/better-ingredients.webp" },
  { title: "Compliance", text: "FSSAI accreditation and lab-tested nutrition (brand statements).", img: "/chapter-1-6/frames/facility-aerial.webp" },
  { title: "Packaging", text: TAKEAWAY, img: "/chapter-1-6/frames/sealed-boxes.webp" },
];
const ACT: { id: "facility" | "labels" | "front" | "reflect"; label: string }[] = [
  { id: "facility", label: "Quality & Packaging Facility" },
  { id: "labels", label: "Label detective" },
  { id: "front", label: "Front-of-pack check" },
  { id: "reflect", label: "Think & Discuss" },
];

export function WrapUp() {
  const done = useActivities16((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.6 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">Trust is the product</h2>
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
              <div className="relative aspect-[16/10]">
                <Image src={r.img} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
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
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
