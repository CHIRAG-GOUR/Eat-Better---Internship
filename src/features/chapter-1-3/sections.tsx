"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Circle, ClipboardCopy, Compass, Megaphone, MessageCircle, Rocket, Star, TrendingUp, Users } from "lucide-react";
import { LeafBulb, Sprout } from "@/components/icons/EbIcons";
import { Panel } from "@/components/chapter/Panel";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { createActivityStore } from "@/lib/activities";
import { detectWebGL, useClientValue } from "@/lib/useClient";
import { EVOLUTION, EXHIBITIONS, LEADERS, LEADERS_NOTE, NATIONAL, STORY, TAKEAWAY, THINK, TIMELINE, VIDEOS } from "./content";

export const useActivities13 = createActivityStore(["stall", "roles", "valuation", "reflect"] as const);

const StallDay = dynamic(() => import("./three/StallDay"), {
  ssr: false,
  loading: () => <div className="h-[380px] animate-pulse rounded-[24px] bg-[#F6D7B8] sm:h-[480px] lg:h-[580px]" />,
});

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";

/* ── 1 · The origin story ─────────────────────────────────────── */

export function Story() {
  return (
    <section id="story" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Where it all began" title="A family snack problem" />
        <div className="mt-8 space-y-6">
          {STORY.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ type: "spring", stiffness: 110, damping: 20 }}
              className={`grid items-center gap-5 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <motion.div
                initial={{ rotate: i % 2 ? 2 : -2, scale: 0.96 }}
                whileInView={{ rotate: i % 2 ? 1 : -1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-cocoa shadow-[4px_4px_0_0_#2f1c1a]"
              >
                <Image src={s.img} alt="" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
                <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full border border-cocoa bg-haldi font-display text-[1.2rem] font-semibold text-cocoa">{i + 1}</span>
              </motion.div>
              <div>
                <div className="text-[0.88rem] font-extrabold uppercase tracking-[0.14em] text-orange">{s.kicker.replace(/^\d · /, "")}</div>
                <p className="mt-2 text-[1.12rem] leading-relaxed text-cocoa">
                  <GlossaryText>{s.text}</GlossaryText>
                </p>
                {"lesson" in s && s.lesson && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-cocoa p-4 text-cream">
                    <LeafBulb className="mt-0.5 size-5 shrink-0 text-haldi" />
                    <p className="text-[1.05rem] font-semibold leading-snug">{s.lesson}</p>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Exhibitions & direct selling ─────────────────────────── */

const POINT_ICONS = [Users, MessageCircle, Star];

export function Exhibitions() {
  return (
    <section id="exhibitions" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Exhibitions & direct selling" title="Before the internet: a stall" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
          >
            <Image src="/chapter-1-3/exhibition-stall.webp" alt="A snack stall at an exhibition with visitors tasting" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
          </motion.div>
          <ul className="space-y-3">
            {EXHIBITIONS.points.map((p, i) => {
              const Icon = POINT_ICONS[i];
              return (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 rounded-2xl bg-cream p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange text-white">
                    <Icon className="size-5" />
                  </span>
                  <p className="text-[1.05rem] leading-snug text-cocoa">
                    <GlossaryText>{p}</GlossaryText>
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Activity: Stall Day (game) ───────────────────────────── */

export function StallDaySection() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  const complete = useActivities13((s) => s.complete);
  return (
    <section id="stall-day" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="3" kicker="Activity · Stall Day" title="Run the Eat Better stall">
          It&apos;s exhibition day and you are the seller. Five customers will walk up with questions. Read the pack, give the answer that makes each one happy — and win the day.
        </SectionIntro>
        <div className="mt-6">
          <StallDay onComplete={() => complete("stall")} three={webgl !== false} />
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Going national ───────────────────────────────────────── */

export function National() {
  return (
    <section id="national" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="4" kicker="Going national" title="From one city to all of India" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NATIONAL.map((n, i) => (
            <motion.figure
              key={n.text}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 130, damping: 18 }}
              whileHover={{ y: -6 }}
              className="relative flex flex-col overflow-hidden rounded-[22px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[4/3]">
                <Image src={n.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.85rem] font-extrabold text-cocoa">Step {i + 1}</span>
              </div>
              <figcaption className="flex-1 p-4 text-[1.05rem] font-semibold leading-snug text-cocoa">
                <GlossaryText>{n.text}</GlossaryText>
              </figcaption>
              {i < NATIONAL.length - 1 && <ArrowRight className="absolute -right-3 top-1/3 z-10 hidden size-6 rounded-full bg-orange p-1 text-white lg:block" />}
            </motion.figure>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <VideoBlock kind="file" av1={VIDEOS.gifting.av1} h264={VIDEOS.gifting.h264} poster={VIDEOS.gifting.poster} title={VIDEOS.gifting.title} caption={VIDEOS.gifting.caption} />
          <div className="rounded-[22px] bg-peach/70 p-5">
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-orange">Watch for</div>
            <p className="mt-2 text-[1.08rem] leading-relaxed text-cocoa">
              The kitchen that started with dates, millets and masalas now packs festive gifts at scale. As you watch, spot how many people it now takes to do what the founders once did by themselves.
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Leadership team ──────────────────────────────────────── */

const LEADER_ICONS = [Sprout, Compass, Megaphone, TrendingUp];

export function Leaders() {
  return (
    <section id="leaders" className={sectionCls}>
      <Panel tone="dark" reveal="up" width="max-w-7xl">
        <SectionIntro index="5" kicker="Who leads Eat Better" title="The leadership team" tone="dark" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-start">
          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[22px] border border-cream/30"
          >
            <div className="relative aspect-[4/3]">
              <Image src="/chapter-1-1/founders.webp" alt="Eat Better Co's founders" fill sizes="(max-width: 1024px) 100vw, 460px" className="object-cover" />
            </div>
            <figcaption className="bg-black/30 px-4 py-2.5 text-[0.9rem] text-cream/80">Eat Better Co&apos;s founders · official photo</figcaption>
          </motion.figure>
          <div className="grid gap-3 sm:grid-cols-2">
            {LEADERS.map((l, i) => {
              const Icon = LEADER_ICONS[i];
              return (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, y: 24, rotateX: -20 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09, type: "spring", stiffness: 120, damping: 18 }}
                  className="rounded-[20px] bg-cream p-5 text-cocoa"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange text-white">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-display text-[1.25rem] font-semibold leading-tight">{l.name}</div>
                      <div className="text-[0.92rem] font-bold leading-snug text-orange">
                        <GlossaryText>{l.role}</GlossaryText>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[1.02rem] leading-snug">
                    <GlossaryText>{l.does}</GlossaryText>
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
        <p className="mt-4 text-[0.92rem] text-cream/75">{LEADERS_NOTE}</p>
      </Panel>
    </section>
  );
}

/* ── 5 · How roles evolved ────────────────────────────────────── */

export function Roles() {
  const [grown, setGrown] = useState(false);
  const complete = useActivities13((s) => s.complete);
  useEffect(() => {
    if (grown) complete("roles");
  }, [grown, complete]);

  return (
    <section id="roles" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="6" kicker="How roles evolved" title="Doing everything → doing one thing well">
          Switch between the two stages and watch the work reorganise.
        </SectionIntro>

        <div className="mt-6 inline-flex rounded-full border border-cocoa bg-cream p-1" role="group" aria-label="Choose a stage">
          {[false, true].map((g) => (
            <button
              key={String(g)}
              onClick={() => setGrown(g)}
              aria-pressed={grown === g}
              className={`relative rounded-full px-4 py-2 text-[0.98rem] font-bold transition-colors sm:px-5 ${grown === g ? "text-white" : "text-cocoa hover:text-orange"}`}
            >
              {grown === g && <motion.span layoutId="stage-pill" className="absolute inset-0 rounded-full bg-orange" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
              <span className="relative">{g ? EVOLUTION.later.title : EVOLUTION.early.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 min-h-[300px] rounded-[22px] bg-cream p-4 sm:p-6">
          <p className="text-[1.08rem] font-semibold text-cocoa">{grown ? EVOLUTION.later.text : EVOLUTION.early.text}</p>
          <LayoutGroup>
            {!grown ? (
              <motion.div layout className="mt-4 grid items-center gap-5 md:grid-cols-[minmax(0,320px)_1fr]">
                <motion.div layoutId="roles-img" className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-cocoa">
                  <Image src="/chapter-1-3/early-days.webp" alt="" fill sizes="320px" className="object-cover" />
                </motion.div>
                <div>
                  <div className="font-display text-[1.3rem] font-semibold text-cocoa">The founders</div>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {EVOLUTION.early.tasks.map((t, i) => (
                      <motion.span
                        key={t}
                        layoutId={`task-${i}`}
                        className="rounded-2xl border-2 border-cocoa bg-white px-4 py-2.5 font-display text-[1.15rem] font-semibold text-cocoa shadow-[2px_2px_0_0_#2f1c1a]"
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>
                  <p className="mt-3 text-[1rem] text-cocoa-2">Same few people, every job.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div layout className="mt-4 grid gap-3 md:grid-cols-3">
                {EVOLUTION.later.roles.map((r, i) => (
                  <motion.div
                    key={r.role}
                    layoutId={`task-${i}`}
                    className="rounded-2xl border-2 border-cocoa bg-white p-4 shadow-[2px_2px_0_0_#2f1c1a]"
                  >
                    <div className="font-display text-[1.5rem] font-semibold text-orange">{r.role}</div>
                    <div className="mt-1 text-[1.08rem] font-semibold text-cocoa">{r.task}</div>
                  </motion.div>
                ))}
                <motion.div layoutId="roles-img" className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-cocoa md:col-span-3">
                  <Image src="/chapter-1-3/frames/warehouse.webp" alt="" fill sizes="(max-width: 768px) 100vw, 1100px" className="object-cover" />
                </motion.div>
              </motion.div>
            )}
          </LayoutGroup>
          <AnimatePresence>
            {grown && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 font-bold text-success">
                {EVOLUTION.note}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </section>
  );
}

/* ── 6 · Journey timeline + Shark Tank + valuation ────────────── */

const TL_IMG = [
  "/chapter-1-3/exhibition-stall.webp",
  "/chapter-1-3/funding.webp",
  "/chapter-1-2/frames/facility-li.webp",
  "/chapter-1-3/pitch-stage.webp",
  "/chapter-1-3/frames/warehouse.webp",
];

const GUESSES = [
  { id: "a", text: "Rs 50 lakh", right: false },
  { id: "b", text: "Rs 10 crore", right: false },
  { id: "c", text: "Rs 100 crore", right: true },
  { id: "d", text: "Rs 1,000 crore", right: false },
];

function fmtLakh(lakh: number) {
  if (lakh >= 100) {
    const cr = lakh / 100;
    return `Rs ${cr.toLocaleString("en-IN", { maximumFractionDigits: cr < 10 ? 2 : 1 })} crore`;
  }
  return `Rs ${lakh.toLocaleString("en-IN", { maximumFractionDigits: 1 })} lakh`;
}

function Valuation() {
  const [guess, setGuess] = useState<string | null>(null);
  const [amount, setAmount] = useState(50);
  const [equity, setEquity] = useState(0.5);
  const complete = useActivities13((s) => s.complete);
  const g = GUESSES.find((x) => x.id === guess);
  useEffect(() => {
    if (g?.right) complete("valuation");
  }, [g, complete]);
  const value = (amount * 100) / equity;
  const isAsk = amount === 50 && equity === 0.5;

  return (
    <div className="rounded-[22px] bg-cream p-4 sm:p-6">
      <ActivityLabel done={!!g?.right}>Activity · What was the company worth?</ActivityLabel>
      <p className="mt-2 text-[1.08rem] leading-relaxed text-cocoa">
        <GlossaryText>The founders asked for Rs 50 lakh in return for 0.5% equity. If 0.5% of the company is worth Rs 50 lakh, what is the whole company worth? Guess first.</GlossaryText>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GUESSES.map((x) => {
          const on = guess === x.id;
          return (
            <motion.button
              key={x.id}
              onClick={() => setGuess(x.id)}
              aria-pressed={on}
              animate={on && !x.right ? { x: [0, -6, 6, -3, 3, 0] } : { x: 0 }}
              className={`rounded-2xl border-2 px-3 py-3 font-display text-[1.1rem] font-semibold transition-colors ${on ? (x.right ? "border-success bg-success/10 text-cocoa" : "border-error bg-error/10 text-cocoa") : "border-cocoa/20 bg-white text-cocoa hover:border-cocoa"}`}
            >
              {x.text}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-2 min-h-[1.6em] text-[1rem]">
        {g && !g.right && <span className="font-bold text-error">Not quite. 0.5% is half of 1%. How many 0.5% slices make 100%?</span>}
        {g?.right && <span className="font-bold text-success">Yes! 100% ÷ 0.5% = 200 slices. 200 × Rs 50 lakh = Rs 100 crore.</span>}
      </div>

      <AnimatePresence>
        {g?.right && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div className="mt-4 rounded-2xl border border-cocoa/15 bg-white p-4 sm:p-5">
              <div className="font-display text-[1.2rem] font-semibold text-cocoa">Try your own deal</div>
              <p className="text-[0.95rem] text-cocoa-2">Move the sliders. Valuation = money asked ÷ share offered. (General explanation; these are not real offers.)</p>
              <div className="mt-4 grid gap-4">
                <label className="block">
                  <span className="flex justify-between text-[0.98rem] font-bold text-cocoa">
                    Money asked <span className="tabular-nums text-orange">{fmtLakh(amount)}</span>
                  </span>
                  <input type="range" min={10} max={200} step={5} value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-2 w-full accent-[#ff5c00]" />
                </label>
                <label className="block">
                  <span className="flex justify-between text-[0.98rem] font-bold text-cocoa">
                    Share offered <span className="tabular-nums text-orange">{equity}%</span>
                  </span>
                  <input type="range" min={0.25} max={10} step={0.25} value={equity} onChange={(e) => setEquity(+e.target.value)} className="mt-2 w-full accent-[#ff5c00]" />
                </label>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-cocoa px-5 py-3 text-cream">
                  <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-haldi">Company value</div>
                  <motion.div key={value} initial={{ scale: 0.9, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-[1.6rem] font-semibold tabular-nums">
                    {fmtLakh(value)}
                  </motion.div>
                </div>
              </div>
              {!isAsk && (
                <button onClick={() => (setAmount(50), setEquity(0.5))} className="eb-btn eb-btn-secondary mt-4 !py-1.5 !text-[0.9rem] !normal-case">
                  Back to the founders&apos; ask
                </button>
              )}
              <div className="mt-4 rounded-2xl bg-peach/70 p-4 text-[1.02rem] leading-relaxed text-cocoa">
                <strong>Equity or royalty?</strong>{" "}
                <GlossaryText>
                  With equity, an investor owns a share of the company. With a royalty, the investor gets a small share of sales until their money has been paid back. The founders chose Namita Thapar’s offer, which included a 1% royalty until her investment was recouped.
                </GlossaryText>{" "}
                <span className="text-cocoa-2">(general explanation)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Timeline() {
  const [at, setAt] = useState(0);
  const m = TIMELINE[at];
  return (
    <section id="timeline" className={sectionCls}>
      <Panel tone="light" reveal="left" width="max-w-7xl">
        <SectionIntro index="7" kicker="Journey timeline" title="Five moments that built the brand">
          Tap each moment on the line.
        </SectionIntro>

        <div className="relative mt-8">
          <div className="absolute left-0 right-0 top-[22px] h-1 rounded-full bg-cocoa/15" />
          <motion.div className="absolute left-0 top-[22px] h-1 rounded-full bg-orange" animate={{ width: `${(at / (TIMELINE.length - 1)) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 22 }} />
          <ol className="relative grid grid-cols-5 gap-1">
            {TIMELINE.map((t, i) => {
              const on = i === at;
              const past = i <= at;
              return (
                <li key={t.when} className="flex flex-col items-center text-center">
                  <button
                    onClick={() => setAt(i)}
                    aria-pressed={on}
                    aria-label={`Moment ${i + 1}: ${t.when}`}
                    className={`grid size-12 place-items-center rounded-full border-2 font-display text-[1.1rem] font-semibold transition-colors ${on ? "scale-110 border-cocoa bg-orange text-white shadow-[2px_2px_0_0_#2f1c1a]" : past ? "border-orange bg-orange/15 text-cocoa" : "border-cocoa/25 bg-white text-cocoa hover:border-cocoa"}`}
                  >
                    {"shark" in t && t.shark ? <Rocket className="size-5" /> : i + 1}
                  </button>
                  <span className={`mt-2 text-[0.82rem] font-bold leading-tight sm:text-[0.95rem] ${on ? "text-orange" : "text-cocoa-2"}`}>{t.when}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <motion.div key={at} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid overflow-hidden rounded-[22px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a] md:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[240px]">
            <Image src={TL_IMG[at]} alt="" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
          </div>
          <div className="p-5 sm:p-6">
            <div className="text-[0.88rem] font-extrabold uppercase tracking-[0.14em] text-orange">{m.when}</div>
            <p className="mt-2 text-[1.15rem] leading-relaxed text-cocoa">
              <GlossaryText>{m.what}</GlossaryText>
            </p>
            {at < TIMELINE.length - 1 && (
              <button onClick={() => setAt(at + 1)} className="eb-btn eb-btn-primary mt-4 !py-2 !text-[0.95rem] !normal-case">
                Next moment <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
          <VideoBlock kind="youtube" id={VIDEOS.sharkTank.id} poster="/chapter-1-3/shark-tank-thumb.jpg" title={VIDEOS.sharkTank.title} caption={VIDEOS.sharkTank.caption} />
          <Valuation />
        </div>
      </Panel>
    </section>
  );
}

/* ── Think & discuss ──────────────────────────────────────────── */

const KEY = "ebc-1.3-reflection";
type Saved = { answers: string[]; qs: string[]; best: number | null; why: string };
const EMPTY: Saved = { answers: ["", "", ""], qs: ["", "", "", "", ""], best: null, why: "" };

export function Think() {
  const [s, setS] = useState<Saved>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities13((x) => x.complete);

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

  const answered = s.answers.filter((a) => a.trim().length >= 15).length;
  const filledQs = s.qs.filter((q) => q.trim().length >= 5).length;
  const miniOk = filledQs === 5 && s.best !== null && s.why.trim().length >= 15;
  useEffect(() => {
    if (answered === 3) complete("reflect");
  }, [answered, complete]);

  const set = (patch: Partial<Saved>) => setS((p) => ({ ...p, ...patch }));
  const summary =
    `Eat Better Co — Chapter 1.3 · Think & Discuss\n\n` +
    THINK.questions.map((q, i) => `${i + 1}. ${q}\n   ${s.answers[i].trim() || "—"}`).join("\n\n") +
    `\n\nMini activity — my 5 interview questions for the founders:\n` +
    s.qs.map((q, i) => `   ${i + 1}. ${q.trim() || "—"}${s.best === i ? "  ← best question" : ""}`).join("\n") +
    `\n   Why it would teach me the most: ${s.why.trim() || "—"}`;

  return (
    <section id="think" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="8" kicker="Think & Discuss" title="Think like a founder" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {THINK.questions.map((q, i) => {
            const ok = s.answers[i].trim().length >= 15;
            return (
              <div key={q} className="flex flex-col rounded-[22px] border border-line bg-white p-5">
                <ActivityLabel done={ok}>Question {i + 1}</ActivityLabel>
                <h3 className="mt-2 font-display text-[1.25rem] font-semibold leading-snug text-cocoa">
                  <GlossaryText>{q}</GlossaryText>
                </h3>
                <textarea
                  value={s.answers[i]}
                  onChange={(e) => set({ answers: s.answers.map((a, j) => (j === i ? e.target.value : a)) })}
                  rows={4}
                  aria-label={`Your answer to question ${i + 1}`}
                  placeholder="I think…"
                  className="mt-3 w-full flex-1 rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[22px] bg-peach/70 p-5 sm:p-6">
          <ActivityLabel done={miniOk}>Mini activity · Interview the founders (optional)</ActivityLabel>
          <p className="mt-2 max-w-4xl text-[1.08rem] leading-relaxed text-cocoa">{THINK.mini}</p>
          <ol className="mt-4 space-y-2.5">
            {s.qs.map((q, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <button
                  onClick={() => set({ best: s.best === i ? null : i })}
                  disabled={q.trim().length < 5}
                  aria-pressed={s.best === i}
                  aria-label={`Mark question ${i + 1} as my best question`}
                  title="Mark as my best question"
                  className={`grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors disabled:opacity-35 ${s.best === i ? "border-cocoa bg-haldi text-cocoa" : "border-cocoa/25 bg-white text-cocoa-2 hover:border-cocoa"}`}
                >
                  <Star className="size-5" fill={s.best === i ? "currentColor" : "none"} />
                </button>
                <input
                  value={q}
                  onChange={(e) => set({ qs: s.qs.map((x, j) => (j === i ? e.target.value : x)) })}
                  aria-label={`Interview question ${i + 1}`}
                  placeholder={`Question ${i + 1}…`}
                  className="w-full rounded-2xl border border-line-strong bg-white px-4 py-2.5 text-[1.05rem] text-cocoa outline-none focus:border-orange"
                />
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[0.95rem] text-cocoa-2">{filledQs < 5 ? `${filledQs}/5 questions written.` : "Tap the star next to your best question."}</p>
          {s.best !== null && (
            <textarea
              value={s.why}
              onChange={(e) => set({ why: e.target.value })}
              rows={3}
              aria-label="Why your best question would teach you the most"
              placeholder="This question would teach me the most because…"
              className="mt-3 w-full rounded-2xl border border-line-strong bg-white px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
            />
          )}
        </div>

        <div className="mt-6 rounded-[22px] bg-cocoa p-5 text-cream sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Your answers</div>
              <p className="text-[0.95rem] text-cream/80">Saved on this device only. Copy them into your discussion, share with your mentor, or paste into your LMS submission.</p>
            </div>
            <button
              disabled={answered < 3}
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
  { title: "A real problem", text: STORY[0].lesson ?? "", img: "/chapter-1-3/home-kitchen.webp" },
  { title: "Listen first", text: EXHIBITIONS.why, img: "/chapter-1-3/exhibition-stall.webp" },
  { title: "Roles specialise", text: `${EVOLUTION.later.text} ${EVOLUTION.later.roles.map((r) => r.role).join(", ")}.`, img: "/chapter-1-3/frames/designing.webp" },
  { title: "Step by step", text: TAKEAWAY, img: "/chapter-1-3/frames/warehouse.webp" },
];
const ACT: { id: "stall" | "roles" | "valuation" | "reflect"; label: string }[] = [
  { id: "stall", label: "Stall Day: 5 happy customers" },
  { id: "roles", label: "How roles evolved" },
  { id: "valuation", label: "What was the company worth?" },
  { id: "reflect", label: "Think & Discuss" },
];

export function WrapUp() {
  const done = useActivities13((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.3 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">From a family kitchen to a national brand</h2>
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
