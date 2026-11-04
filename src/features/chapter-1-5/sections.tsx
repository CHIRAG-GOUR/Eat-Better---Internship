"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CalendarHeart, Check, Circle, ClipboardCopy, Gift, Hand, Layers, RefreshCw, Sun } from "lucide-react";
import { LeafBadge } from "@/components/icons/EbIcons";
import { Panel } from "@/components/chapter/Panel";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { createActivityStore } from "@/lib/activities";
import { detectWebGL, useClientValue } from "@/lib/useClient";
import { CATEGORIES, DATES_NOTE, FAMILY_EVENTS, HABITS, MONTHS, OCCASIONS, TAKEAWAY, THINK, VIDEO } from "./content";

export const useActivities15 = createActivityStore(["studio", "year", "reflect"] as const);

const InnovationStudio = dynamic(() => import("./three/InnovationStudio"), {
  ssr: false,
  loading: () => <div className="h-[380px] animate-pulse rounded-[24px] bg-[#FBEFE3] sm:h-[500px] lg:h-[640px]" />,
});

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";

/* ── 1 · Four categories ──────────────────────────────────────── */

function CategoryCard({ c, i }: { c: (typeof CATEGORIES)[number]; i: number }) {
  const [shot, setShot] = useState(0);
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotate: i % 2 ? 1.5 : -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ delay: (i % 2) * 0.1, type: "spring", stiffness: 120, damping: 18 }}
      className="flex flex-col overflow-hidden rounded-[22px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
    >
      <div className="relative aspect-[16/11]" style={{ background: c.color }}>
        <AnimatePresence initial={false}>
          <motion.div key={shot} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
            <Image src={c.imgs[shot]} alt={`${c.name} — official Eat Better product photo`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.85rem] font-extrabold text-cocoa">Category {i + 1}</span>
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {c.imgs.map((src, k) => (
            <button
              key={src}
              onClick={() => setShot(k)}
              aria-label={`Show photo ${k + 1} of ${c.imgs.length}`}
              aria-pressed={shot === k}
              className={`relative size-11 overflow-hidden rounded-lg border-2 transition-transform sm:size-12 ${shot === k ? "scale-110 border-white" : "border-white/50 opacity-80 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.45rem] font-semibold leading-tight" style={{ color: c.color }}>
          {c.name}
        </h3>
        <p className="mt-1.5 text-[1.05rem] leading-relaxed text-cocoa">
          <GlossaryText>{c.includes}</GlossaryText>
        </p>
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cocoa px-3 py-1.5 text-[0.9rem] font-bold text-cream">
            <LeafBadge className="size-4 text-haldi" /> {c.positioning}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export function Categories() {
  return (
    <section id="categories" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="What Eat Better makes" title="Four categories, one brand">
          Every product sits in one of four categories. Each category has its own health positioning — the promise printed on the pack.
        </SectionIntro>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.id} c={c} i={i} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Occasions ────────────────────────────────────────────── */

const OCC_ICONS = [Sun, CalendarHeart, Gift, Layers];

export function Occasions() {
  return (
    <section id="occasions" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Occasions the portfolio serves" title="A snack for every moment" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <VideoBlock kind="file" av1={VIDEO.av1} h264={VIDEO.h264} poster={VIDEO.poster} title={VIDEO.title} caption={VIDEO.caption} />
          <p className="rounded-[22px] bg-cream p-5 text-[1.08rem] leading-relaxed text-cocoa">
            Watch how festive and corporate gifting work at Eat Better. Then look at the four occasions below: each one has its own example products — and its own reason why it works.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OCCASIONS.map((o, i) => {
            const Icon = OCC_ICONS[i];
            return (
              <motion.figure
                key={o.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 130, damping: 18 }}
                whileHover={{ y: -5 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
              >
                <div className="relative aspect-[4/3]">
                  <Image src={o.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full border border-cocoa bg-orange text-white">
                    <Icon className="size-5" />
                  </span>
                </div>
                <figcaption className="flex flex-1 flex-col p-4">
                  <div className="font-display text-[1.25rem] font-semibold text-cocoa">{o.name}</div>
                  <p className="mt-1 text-[0.98rem] leading-snug text-cocoa">
                    <GlossaryText>{o.example}</GlossaryText>
                  </p>
                  <p className="mt-auto pt-3 text-[0.95rem] font-bold leading-snug text-orange">
                    Why it works: <GlossaryText>{o.why}</GlossaryText>
                  </p>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
        <motion.figure initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 overflow-hidden rounded-[22px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
          <Image src="/chapter-1-5/all-products-collection.png" alt="Eat Better's All Products Collection page, with shop filters for Diwali gift hampers, gift sets, namkeen, combos, nut mixes, sweets & laddoos and value packs" width={1650} height={932} sizes="(max-width: 1280px) 100vw, 1200px" className="h-auto w-full" />
          <figcaption className="bg-cream px-4 py-3 text-[0.95rem] text-cocoa-2">The All Products Collection on the official Eat Better website. Notice how the shop is organised by category and by occasion.</figcaption>
        </motion.figure>
      </Panel>
    </section>
  );
}

/* ── 3 · Activity: Product Innovation Studio ──────────────────── */

export function StudioSection() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  const complete = useActivities15((s) => s.complete);
  return (
    <section id="studio" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="3" kicker="Activity · The Eat Better Product Innovation Studio" title="Develop a new snack concept">
          You are a Junior Product Developer. Turn a customer need into a product idea: explore the portfolio, pick ingredients, shape the concept, design its pack and test it at a real occasion.
        </SectionIntro>
        <div className="mt-6">
          <InnovationStudio onComplete={() => complete("studio")} three={webgl !== false} />
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Activity: Three habits, one family year ──────────────── */

type EventId = (typeof FAMILY_EVENTS)[number]["id"];

export function FamilyYear() {
  const [placed, setPlaced] = useState<Partial<Record<EventId, number>>>({});
  const [sel, setSel] = useState<EventId | null>("rakhi");
  const complete = useActivities15((s) => s.complete);
  const allPlaced = FAMILY_EVENTS.every((e) => placed[e.id] !== undefined);
  useEffect(() => {
    if (allPlaced) complete("year");
  }, [allPlaced, complete]);

  const festive = new Set(FAMILY_EVENTS.filter((e) => e.habit === "festive" && placed[e.id] !== undefined).map((e) => placed[e.id]));
  const gifting = new Set(FAMILY_EVENTS.filter((e) => e.habit === "gifting" && placed[e.id] !== undefined).map((e) => placed[e.id]));
  const unusual = (placed.rakhi !== undefined && placed.rakhi !== 7) || (placed.diwali !== undefined && placed.diwali !== 9 && placed.diwali !== 10);

  const putIn = (m: number) => {
    if (!sel) return;
    const next = { ...placed, [sel]: m };
    setPlaced(next);
    const nextSel = FAMILY_EVENTS.find((e) => next[e.id] === undefined)?.id ?? null;
    setSel(nextSel);
  };

  return (
    <section id="year" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="4" kicker="Activity · Three habits, one family year" title="Plan a family's snacking year">
          Pick an event, then tap the month it falls in. Watch which Eat Better products the family needs across the whole year.
        </SectionIntro>

        <div className="mt-6 rounded-[22px] bg-cream p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ActivityLabel done={allPlaced}>Activity · Plan the year</ActivityLabel>
            <button onClick={() => (setPlaced({}), setSel("rakhi"))} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.9rem] font-bold text-cocoa-2 hover:bg-peach">
              <RefreshCw className="size-4" /> Start again
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Family events">
            {FAMILY_EVENTS.map((e) => {
              const on = sel === e.id;
              const done = placed[e.id] !== undefined;
              return (
                <button
                  key={e.id}
                  onClick={() => setSel(e.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-[0.95rem] font-bold transition-colors ${on ? "border-orange bg-orange text-white" : done ? "border-success/50 bg-success/10 text-cocoa" : "border-cocoa/20 bg-white text-cocoa hover:border-cocoa"}`}
                >
                  <span className="relative size-8 overflow-hidden rounded-full">
                    <Image src={e.img} alt="" fill sizes="32px" className="object-cover" />
                  </span>
                  {e.label}
                  {done && <span className="text-[0.82rem] opacity-80">· {MONTHS[placed[e.id]!]}</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[0.95rem] text-cocoa-2">
            <Hand className="size-4 text-orange" /> {sel ? `Now tap the month for “${FAMILY_EVENTS.find((e) => e.id === sel)!.label}”.` : "All events placed — tap an event to move it."}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {MONTHS.map((m, i) => {
              const evs = FAMILY_EVENTS.filter((e) => placed[e.id] === i);
              return (
                <motion.button
                  key={m}
                  layout
                  onClick={() => putIn(i)}
                  disabled={!sel}
                  aria-label={`${m}${evs.length ? `: ${evs.map((e) => e.label).join(", ")}` : ""}`}
                  className={`flex min-h-[132px] flex-col rounded-2xl border-2 bg-white p-2 text-left transition-colors ${sel ? "hover:border-orange" : ""} ${evs.length ? "border-cocoa/40" : "border-cocoa/10"}`}
                >
                  <span className="font-display text-[1.05rem] font-semibold text-cocoa">{m}</span>
                  <span className="mt-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.7rem] font-bold text-white" style={{ background: HABITS[0].color }}>
                    <Sun className="size-3" /> Everyday
                  </span>
                  <AnimatePresence>
                    {evs.map((e) => (
                      <motion.span key={e.id} initial={{ opacity: 0, scale: 0.6, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 flex items-center gap-1 rounded-md px-1 py-0.5 text-[0.7rem] font-bold text-white" style={{ background: e.habit === "festive" ? HABITS[1].color : HABITS[2].color }}>
                        <span className="relative size-5 shrink-0 overflow-hidden rounded">
                          <Image src={e.img} alt="" fill sizes="20px" className="object-cover" />
                        </span>
                        <span className="truncate">{e.product}</span>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
          {unusual && <p className="mt-3 rounded-xl bg-haldi/25 px-3 py-2 text-[0.92rem] text-cocoa">{DATES_NOTE}</p>}
        </div>

        {/* habit meters */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {HABITS.map((h, i) => {
            const months = i === 0 ? 12 : i === 1 ? festive.size : gifting.size;
            const covered = months > 0;
            return (
              <div key={h.id} className={`flex items-center gap-3 rounded-2xl border-2 bg-cream p-3 transition-colors ${covered ? "border-success/60" : "border-cocoa/10"}`}>
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={h.img} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[1.05rem] font-semibold" style={{ color: h.color }}>
                    {h.name}
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-cocoa/10">
                    <motion.div className="h-full rounded-full" style={{ background: h.color }} animate={{ width: `${(months / 12) * 100}%` }} />
                  </div>
                  <div className="mt-0.5 text-[0.82rem] font-bold text-cocoa-2">
                    {months} of 12 months
                  </div>
                </div>
                {covered && <Check className="size-5 shrink-0 text-success" strokeWidth={3} />}
              </div>
            );
          })}
        </div>
        <AnimatePresence>
          {allPlaced && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-cocoa px-5 py-4 text-[1.08rem] font-semibold leading-relaxed text-cream">
              Everyday snacking in all 12 months, festive sweets for Rakhi and Diwali, and gifts for two birthdays — all three habits, from one brand, all year.
            </motion.p>
          )}
        </AnimatePresence>
      </Panel>
    </section>
  );
}

/* ── Think & discuss ──────────────────────────────────────────── */

const KEY = "ebc-1.5-reflection";
type Saved = { q1: string; q2: string };
const EMPTY: Saved = { q1: "", q2: "" };

export function Think() {
  const [s, setS] = useState<Saved>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities15((x) => x.complete);

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

  const q1ok = s.q1.trim().length >= 15;
  const q2ok = s.q2.trim().length >= 15;
  useEffect(() => {
    if (q1ok && q2ok) complete("reflect");
  }, [q1ok, q2ok, complete]);

  const summary = `Eat Better Co — Chapter 1.5 · Think & Discuss\n\n1. ${THINK.q1}\n   ${s.q1.trim() || "—"}\n\n2. ${THINK.q2}\n   ${s.q2.trim() || "—"}`;
  const qs: { k: keyof Saved; q: string; ok: boolean; ph: string }[] = [
    { k: "q1", q: THINK.q1, ok: q1ok, ph: "I would launch… It would be better because…" },
    { k: "q2", q: THINK.q2, ok: q2ok, ph: "I think gift boxes help because…" },
  ];

  return (
    <section id="think" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="5" kicker="Think & Discuss" title="Think like a product developer">
          Your studio concept can be your answer to question 1 — or choose a different idea.
        </SectionIntro>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {qs.map((x, i) => (
            <div key={x.k} className="flex flex-col rounded-[22px] border border-line bg-white p-5 sm:p-6">
              <ActivityLabel done={x.ok}>Question {i + 1}</ActivityLabel>
              <h3 className="mt-2 font-display text-[1.3rem] font-semibold leading-snug text-cocoa">
                <GlossaryText>{x.q}</GlossaryText>
              </h3>
              <textarea
                value={s[x.k]}
                onChange={(e) => setS((p) => ({ ...p, [x.k]: e.target.value }))}
                rows={5}
                aria-label={`Your answer to question ${i + 1}`}
                placeholder={x.ph}
                className="mt-3 w-full flex-1 rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
              />
            </div>
          ))}
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
  { title: "Four categories", text: CATEGORIES.map((c) => c.name).join(" · "), img: "/brand/products/namkeen-combo-0.webp" },
  { title: "Health positioning", text: "Sweetened with dates · Roasted, no palm oil · Real ingredients · Convenience and variety", img: "/brand/products/hazelnut-laddoo-1.webp" },
  { title: "Four occasions", text: OCCASIONS.map((o) => o.name).join(" · "), img: "/brand/products/diwali-hamper-0.webp" },
  { title: "One brand, all year", text: TAKEAWAY, img: "/chapter-1-5/frames/jar-hamper.webp" },
];
const ACT: { id: "studio" | "year" | "reflect"; label: string }[] = [
  { id: "studio", label: "Product Innovation Studio" },
  { id: "year", label: "Plan a family's snacking year" },
  { id: "reflect", label: "Think & Discuss" },
];

export function WrapUp() {
  const done = useActivities15((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.5 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">A portfolio for every moment</h2>
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
