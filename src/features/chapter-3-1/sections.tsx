"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Building2, Check, Circle, Eye, FileCheck2, Gift, Globe, Heart, Home, Laptop, Lightbulb, MessageCircle, ShieldAlert, Smartphone, Smile, Store, Tag, TreePalm, Users, Zap, type LucideIcon } from "lucide-react";
import { MyWork } from "@/components/play/GameFrame";
import { Panel } from "@/components/chapter/Panel";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { MediaRow } from "@/components/rich";
import { createActivityStore } from "@/lib/activities";
import { ACTS_31, ChannelDesk, FitLab, ThirtyDays, useWork31 } from "./activities";
import { CHANNELS, LMS_IMG, RELATIONSHIPS, SEGMENTS, THINK, VALUE_PROPS } from "./content";

export const ACTIVITY_IDS = ["fit", "channels", "days"] as const;
export const useActivities31 = createActivityStore<string>(ACTIVITY_IDS);

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";
const card = "rounded-[22px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]";

function Explainer({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-orange/40 bg-white p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange/10 text-orange">
        <Lightbulb className="size-5" />
      </span>
      <p className="text-[1rem] leading-snug text-cocoa">
        <span className="mr-1.5 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">In plain words</span>
        <GlossaryText>{children}</GlossaryText>
      </p>
    </div>
  );
}

/* ── the canvas graphic ───────────────────────────────────────── */

type Block = { id: string; label: string; area: string; focus?: string };
const BLOCKS: Block[] = [
  { id: "partners", label: "Key Partners", area: "1 / 1 / 3 / 3" },
  { id: "activities", label: "Key Activities", area: "1 / 3 / 2 / 5" },
  { id: "resources", label: "Key Resources", area: "2 / 3 / 3 / 5" },
  { id: "value", label: "Value Propositions", area: "1 / 5 / 3 / 7", focus: "value" },
  { id: "relationships", label: "Customer Relationships", area: "1 / 7 / 2 / 9", focus: "relationships" },
  { id: "channels", label: "Channels", area: "2 / 7 / 3 / 9", focus: "channels" },
  { id: "segments", label: "Customer Segments", area: "1 / 9 / 3 / 11", focus: "segments" },
  { id: "costs", label: "Cost Structure", area: "3 / 1 / 4 / 6" },
  { id: "revenue", label: "Revenue Streams", area: "3 / 6 / 4 / 11" },
];

function Canvas() {
  const focus = BLOCKS.filter((b) => b.focus);
  const rest = BLOCKS.filter((b) => !b.focus);
  return (
    <div>
      <div className="hidden grid-cols-10 gap-1.5 sm:grid" style={{ gridTemplateRows: "repeat(3, minmax(78px, auto))" }} role="img" aria-label="Business Model Canvas with four people-side blocks highlighted">
        {BLOCKS.map((b) =>
          b.focus ? (
            <a key={b.id} href={`#${b.focus}`} style={{ gridArea: b.area }} className="flex items-center justify-center rounded-xl border-2 border-cocoa bg-orange p-2 text-center font-display text-[1rem] font-semibold leading-tight text-white shadow-[2px_2px_0_0_#2f1c1a] hover:bg-[#e04f00]">
              {b.label}
            </a>
          ) : (
            <div key={b.id} style={{ gridArea: b.area }} className="flex items-center justify-center rounded-xl border border-cocoa/20 bg-cream p-2 text-center text-[0.9rem] font-bold leading-tight text-cocoa-2">
              {b.label}
            </div>
          ),
        )}
      </div>
      <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          {focus.map((b) => (
            <a key={b.id} href={`#${b.focus}`} className="flex min-h-[84px] items-center justify-center rounded-xl border-2 border-cocoa bg-orange p-2 text-center font-display text-[1.02rem] font-semibold leading-tight text-white shadow-[2px_2px_0_0_#2f1c1a]">
              {b.label}
            </a>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {rest.map((b) => (
            <span key={b.id} className="rounded-full border border-cocoa/20 bg-cream px-2.5 py-1 text-[0.82rem] font-bold text-cocoa-2">
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CanvasOverview() {
  return (
    <section id="canvas" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="The Business Model Canvas" title="The people side of the canvas" />
        <div className="mx-auto mt-5 max-w-5xl">
          <MediaRow items={[{ kind: "image", src: LMS_IMG.src, alt: LMS_IMG.alt, ratio: 16 / 9, fit: "contain", caption: LMS_IMG.credit }]} />
        </div>
        <div className="mt-5 rounded-2xl border border-cocoa bg-peach/70 p-4 shadow-[3px_3px_0_0_#2f1c1a]">
          <div className="mb-2 text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">This chapter: the four orange blocks</div>
          <Canvas />
        </div>
        <div className="mt-5">
          <Explainer>The Business Model Canvas is a one-page map of how a business works. The right-hand blocks, customers, promise, reach and relationship, are all about people. Tap an orange block to jump to it.</Explainer>
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Customer segments ────────────────────────────────────── */

const SEG_ICON = { home: Home, laptop: Laptop, gift: Gift, building: Building2 } as const;

export function Segments() {
  return (
    <section id="segments" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Customer Segments" title="Who Eat Better serves" />
        <div className="mt-5">
          <Explainer>A customer segment is a group of people with similar needs. A business serves each group a little differently.</Explainer>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEGMENTS.map((s, i) => {
            const Icon = SEG_ICON[s.icon];
            return (
              <motion.article key={s.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`${card} flex min-w-0 flex-col overflow-hidden`}>
                <div className="relative aspect-[4/3]">
                  <Image src={s.img} alt={s.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover object-top" />
                  <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full border border-cocoa bg-cream text-orange">
                    <Icon className="size-5" />
                  </span>
                </div>
                <h3 className="p-4 font-display text-[1.2rem] font-semibold leading-tight text-cocoa">
                  <GlossaryText>{s.name}</GlossaryText>
                </h3>
              </motion.article>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Value propositions ───────────────────────────────────── */

const VP_ICON: LucideIcon[] = [Smile, TreePalm, FileCheck2, Smartphone, Gift];

export function ValueProps() {
  return (
    <section id="value" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Value Propositions" title="What Eat Better promises" />
        <div className="mt-5">
          <Explainer>A value proposition is the promise: the reason a customer picks you over another option.</Explainer>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {VALUE_PROPS.map((v, i) => {
            const Icon = VP_ICON[i];
            return (
              <motion.li key={v.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col items-center gap-3 rounded-[20px] border border-cocoa bg-cream p-4 text-center shadow-[2px_2px_0_0_#2f1c1a]">
                <span className="grid size-14 place-items-center rounded-full bg-cocoa text-haldi">
                  <Icon className="size-7" />
                </span>
                <span className="font-display text-[1.08rem] font-semibold leading-tight text-cocoa">
                  <GlossaryText>{v.text}</GlossaryText>
                </span>
                {v.brand && <span className="rounded-full bg-haldi/50 px-2.5 py-0.5 text-[0.78rem] font-extrabold text-cocoa">Brand claim</span>}
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-haldi bg-haldi/20 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-cocoa" />
          <p className="text-[0.98rem] leading-snug text-cocoa">The ingredient promise is a brand claim. Always check it against the label of the exact pack.</p>
        </div>
        <div className="mt-5">
          <MediaRow
            items={[
              { kind: "image", src: "/chapter-3-1/claim-quinoa.webp", alt: "Quinoa Namkeen card listing roasted not fried, no palm oil, no cholesterol, no transfat, made with quinoa", ratio: 1, caption: "Brand claim card: Quinoa Namkeen, from Eat Better." },
              { kind: "image", src: "/chapter-3-1/compare-protein.webp", alt: "Comparison card of Eat Better Protein Chips against ordinary bhujia and fried chips", ratio: 1, caption: "Brand comparison card: Protein Chips against ordinary bhujia and fried chips." },
              { kind: "image", src: "/chapter-3-1/gift-hamper.webp", alt: "A Diwali gift hamper with a printed box and snack packs", ratio: 1, caption: "A ready-made gift hamper." },
            ]}
          />
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Channels ─────────────────────────────────────────────── */

const CH_ICON: LucideIcon[] = [Globe, Store, Zap, Building2];

export function Channels() {
  return (
    <section id="channels" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <SectionIntro index="4" kicker="Channels" title="How Eat Better reaches people" />
        <div className="mt-5">
          <Explainer>A channel is the route a product takes to reach a customer: where they find it and where they buy it.</Explainer>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c, i) => {
            const Icon = CH_ICON[i];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className={`${card} flex flex-col gap-2 p-4`}>
                <span className="grid size-11 place-items-center rounded-full bg-orange text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display text-[1.2rem] font-semibold leading-tight text-cocoa">
                  <GlossaryText>{c.name}</GlossaryText>
                </h3>
                <p className="text-[0.98rem] font-bold text-orange">{c.detail}</p>
                <p className="text-[0.95rem] leading-snug text-cocoa-2">
                  <GlossaryText>{c.note}</GlossaryText>
                </p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-5">
          <MediaRow
            items={[
              { kind: "image", src: "/chapter-3-1/web-channels.webp", alt: "eatbetterco.com: Also available on Blinkit, Zepto, Instamart, Amazon and BigBasket", ratio: 1376 / 225, fit: "contain", caption: "From eatbetterco.com: “Also available on”." },
              { kind: "image", src: "/chapter-3-1/seg-corp.webp", alt: "A large corporate-size Ultimate Snack Box", ratio: 1, caption: "Bulk and corporate orders start as a request." },
            ]}
          />
        </div>
      </Panel>
    </section>
  );
}

/* ── 5 · Customer relationships ───────────────────────────────── */

const REL_ICON: LucideIcon[] = [MessageCircle, Tag, Eye];

export function Relationships() {
  return (
    <section id="relationships" className={sectionCls}>
      <Panel tone="light" reveal="left" width="max-w-7xl">
        <SectionIntro index="5" kicker="Customer Relationships" title="How Eat Better stays in touch" />
        <div className="mt-5">
          <Explainer>Customer relationships are everything a business does to keep customers coming back after the first order.</Explainer>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {RELATIONSHIPS.map((r, i) => {
            const Icon = REL_ICON[i];
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`${card} flex items-start gap-3 p-4`}>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cocoa text-haldi">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display text-[1.15rem] font-semibold leading-snug text-cocoa">
                  <GlossaryText>{r.title}</GlossaryText>
                </h3>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-5">
          <MediaRow
            items={[
              { kind: "image", src: "/chapter-3-1/web-reviews.webp", alt: "Happy customer reviews on eatbetterco.com", ratio: 1376 / 479, fit: "contain", caption: "Customer reviews on eatbetterco.com." },
              { kind: "image", src: "/chapter-3-1/web-kitchen.webp", alt: "Made in the Better Kitchen section of eatbetterco.com", ratio: 1200 / 511, fit: "contain", caption: "“Made in the Better Kitchen”: transparency on the website." },
            ]}
          />
        </div>
      </Panel>
    </section>
  );
}

/* ── Think & discuss ──────────────────────────────────────────── */

const KEY = "ebc-3.1-think";
const SEG_NAMES = SEGMENTS.map((s) => ("short" in s ? s.short : s.name));

export function Think() {
  const [a1, setA1] = useState("");
  const [seg, setSeg] = useState("");
  const [a2, setA2] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (v) {
        setA1(v.a1 ?? "");
        setSeg(v.seg ?? "");
        setA2(v.a2 ?? "");
      }
    } catch {
      /* storage unavailable */
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ a1, seg, a2 }));
    } catch {
      /* ignore */
    }
  }, [a1, seg, a2, ready]);
  const area = "mt-2 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange";
  return (
    <section id="think" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="6" kicker="Think & discuss" title="Your turn to think" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[22px] border border-line bg-white p-4 sm:p-5">
            <h3 className="font-display text-[1.3rem] font-semibold leading-snug text-cocoa">1. {THINK.q1}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Segment you picked">
              {SEG_NAMES.map((n) => (
                <button key={n} aria-pressed={seg === n} onClick={() => setSeg(n)} className={`rounded-full border-2 px-3 py-1 text-[0.88rem] font-bold ${seg === n ? "border-orange bg-orange text-white" : "border-cocoa/15 bg-white text-cocoa-2"}`}>
                  {n}
                </button>
              ))}
            </div>
            <textarea value={a1} onChange={(e) => setA1(e.target.value)} rows={3} aria-label="One sentence about what this segment wants" placeholder="They want …" className={area} />
          </div>
          <div className="rounded-[22px] border border-line bg-white p-4 sm:p-5">
            <h3 className="font-display text-[1.3rem] font-semibold leading-snug text-cocoa">2. {THINK.q2}</h3>
            <textarea value={a2} onChange={(e) => setA2(e.target.value)} rows={5} aria-label="Best channel for first-time and loyal buyers" placeholder="For first-time buyers … For loyal buyers …" className={area} />
          </div>
        </div>
        <p className="mt-3 text-[0.9rem] text-cocoa-2">Saved on this device only. Try the Channel Data Desk below to test your answer to question 2 with numbers.</p>
      </Panel>
    </section>
  );
}

/* ── Activities ───────────────────────────────────────────────── */

function ActivityRun({ id, Comp }: { id: string; Comp: React.ComponentType<{ onDone: (summary: string) => void }> }) {
  const complete = useActivities31((s) => s.complete);
  const save = useWork31((s) => s.save);
  return (
    <Comp
      onDone={(summary) => {
        save(id, summary);
        complete(id);
      }}
    />
  );
}

export function Activities() {
  return (
    <section id="activities" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="7" kicker="Activities" title="Put it into practice" />
        <p className="mt-2 max-w-3xl text-[1.05rem] text-cocoa">Three hands-on tasks. Each one only moves forward when your evidence is right, so there is no way to guess past a step.</p>
        <div className="mt-6 grid gap-8">
          <ActivityRun id="fit" Comp={FitLab} />
          <ActivityRun id="channels" Comp={ChannelDesk} />
          <ActivityRun id="days" Comp={ThirtyDays} />
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Customer Segments", text: "Families, young professionals and students, gift buyers and corporate buyers.", icon: Users },
  { title: "Value Propositions", text: "Familiar taste, cleaner ingredients, quality checks, convenience and ready-made gifts.", icon: Heart },
  { title: "Channels", text: "Own website, marketplaces, quick-commerce apps and bulk orders.", icon: Store },
  { title: "Customer Relationships", text: "Reviews, care, community, content, offers and transparency.", icon: MessageCircle },
];

export function WrapUp() {
  const done = useActivities31((s) => s.done);
  const work = useWork31((s) => s.work);
  const n = ACTS_31.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 3.1 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">The people side of the canvas</h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RECAP.map((r, i) => (
            <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col gap-2 rounded-2xl border border-cocoa bg-cream p-4 shadow-[2px_2px_0_0_#2f1c1a]">
              <span className="grid size-11 place-items-center rounded-full bg-orange text-white">
                <r.icon className="size-5" />
              </span>
              <span className="font-display text-[1.1rem] font-semibold text-cocoa">{r.title}</span>
              <p className="text-[0.95rem] leading-snug text-cocoa">{r.text}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 rounded-[22px] bg-peach/70 p-5">
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 font-display text-[1.2rem] font-semibold text-cocoa">
              <Store className="size-5 text-orange" /> Activities on this page
            </span>
            <span className="font-bold text-cocoa-2">
              {n}/{ACTS_31.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ACTS_31.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-[1rem] text-cocoa">
                {done[a.id] ? <Check className="size-5 shrink-0 text-success" strokeWidth={3} /> : <Circle className="size-5 shrink-0 text-cocoa-2/40" />}
                {a.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.9rem] text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
        </div>
        <MyWork chapter="3.1" items={ACTS_31.map((a) => ({ label: a.label, text: work[a.id] }))} />
      </Panel>
    </section>
  );
}
