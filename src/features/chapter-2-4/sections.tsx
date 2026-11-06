"use client";

import { MyWork } from "@/components/play/GameFrame";
import { ACTS_24, DealRoom, Newsroom, TrustJourney, useWork24 } from "./activities";
import Image from "next/image";
import { motion } from "motion/react";
import { Briefcase, Building2, Check, Circle, Divide, Equal, Flame, Gift, Globe, Handshake, Landmark, Megaphone, Newspaper, Percent, ShieldCheck, ShoppingBag, Store, Truck, Tv, Users, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { IconFlow, StatBand } from "@/components/rich";
import { LeafBulb } from "@/components/icons/EbIcons";
import { createActivityStore } from "@/lib/activities";
import { CORPORATE, FESTIVE, FUNDING, PITCH, PRESS, SHARK_TANK_VIDEO, TAKEAWAY } from "./content";

/** Activity ids are added by the lead when the 2.4 activities are built. */
export const ACTIVITY_IDS: readonly string[] = [];
export const useActivities24 = createActivityStore<string>(ACTIVITY_IDS);

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";

/* ── shared pieces ────────────────────────────────────────────── */

/** An image in a fixed-ratio frame with a caption — keeps every row aligned. */
function Frame({ src, alt, caption, ratio, fit = "cover", sizes = "(max-width: 1024px) 100vw, 640px", tone = "light" }: { src: string; alt: string; caption: string; ratio: string; fit?: "cover" | "contain"; sizes?: string; tone?: "light" | "dark" }) {
  return (
    <motion.figure initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
      <div className={`relative w-full ${fit === "contain" ? "bg-cream" : ""}`} style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt} fill sizes={sizes} className={fit === "contain" ? "object-contain" : "object-cover"} />
      </div>
      <figcaption className={`mt-auto border-t border-cocoa/10 px-3.5 py-2 text-[0.88rem] ${tone === "dark" ? "bg-cocoa text-cream/80" : "bg-cream text-cocoa-2"}`}>{caption}</figcaption>
    </motion.figure>
  );
}

/** A point from the chapter, with an icon and a bold lead. */
function Point({ icon: Icon, lead, children, tone = "cream" }: { icon: LucideIcon; lead: string; children: string; tone?: "cream" | "white" | "dark" }) {
  const box = tone === "dark" ? "bg-cocoa text-cream" : tone === "white" ? "border border-cocoa/15 bg-white text-cocoa" : "bg-cream text-cocoa";
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`flex h-full gap-3 rounded-[20px] p-4 sm:p-5 ${box}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone === "dark" ? "bg-haldi text-cocoa" : "bg-orange text-white"}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className={`font-display text-[1.12rem] font-semibold leading-tight ${tone === "dark" ? "text-haldi" : "text-cocoa"}`}>{lead}</div>
        <p className={`mt-1 text-[1rem] leading-relaxed ${tone === "dark" ? "text-cream/90" : "text-cocoa"}`}>
          <GlossaryText>{children}</GlossaryText>
        </p>
      </div>
    </motion.div>
  );
}

function Chips({ items, icon: Icon }: { items: string[]; icon: LucideIcon }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t, i) => (
        <motion.span key={t} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-1.5 rounded-full border border-cocoa bg-white px-3.5 py-1.5 text-[0.95rem] font-bold text-cocoa">
          <Icon className="size-4 text-orange" /> {t}
        </motion.span>
      ))}
    </div>
  );
}

/* ── In the news (the supplied press graphic) ─────────────────── */

export function InTheNews() {
  return (
    <section id="news" className={sectionCls}>
      <Panel tone="dark" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="In the news" title="₹50 lakh on national TV" tone="dark" />
        <div className="mt-6 grid items-stretch gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <Frame src="/chapter-2-4/lms-3.png" alt="Press graphic: Eat Better Co secures ₹50 lakh investment on Shark Tank India Season 4" caption="Press feature (screenshot, ceovine.com)" ratio="1/1" sizes="(max-width: 768px) 100vw, 520px" tone="dark" />
          <div className="flex min-w-0 flex-col justify-center gap-4">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 rounded-[22px] bg-cream p-4 text-center text-cocoa">
              <div>
                <div className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-none">₹50 lakh</div>
                <div className="mt-1 text-[0.85rem] font-bold text-cocoa-2">the ask</div>
              </div>
              <Divide className="size-6 text-orange" />
              <div>
                <div className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-none">0.5%</div>
                <div className="mt-1 text-[0.85rem] font-bold text-cocoa-2">equity</div>
              </div>
              <Equal className="size-6 text-orange" />
              <div>
                <div className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-none text-orange">₹100 crore</div>
                <div className="mt-1 text-[0.85rem] font-bold text-cocoa-2">valuation</div>
              </div>
            </div>
            <p className="text-[1.05rem] leading-relaxed text-cream/90">Shark Tank India, Season 4. The numbers behind the headline, and the attention it earned, are what this chapter unpacks.</p>
            <IconFlowDark />
          </div>
        </div>
      </Panel>
    </section>
  );
}

function IconFlowDark() {
  const items: [LucideIcon, string][] = [
    [Tv, "National TV"],
    [Newspaper, "Funding PR"],
    [Gift, "Festive campaigns"],
    [Briefcase, "Corporate gifting"],
    [Globe, "On-site press"],
  ];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {items.map(([Icon, label], i) => (
        <motion.div key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-1 py-3 text-center">
          <Icon className="size-6 text-haldi" />
          <span className="text-[0.8rem] font-bold leading-tight text-cream sm:text-[0.88rem]">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── 1 · The Shark Tank India advantage ───────────────────────── */

export function SharkTank() {
  return (
    <section id="shark-tank" className={sectionCls}>
      <Panel tone="light" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="The Shark Tank India advantage" title="One pitch, a national audience" />
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <VideoBlock kind="youtube" id={SHARK_TANK_VIDEO.id} poster="/chapter-1-3/shark-tank-thumb.jpg" title={SHARK_TANK_VIDEO.title} caption="Shark Tank India, Season 4 (Sony LIV on YouTube) — plays from YouTube." />
          <div className="grid gap-3">
            <Point icon={Percent} lead="The valuation & pitch structure">
              {PITCH.structure}
            </Point>
            <Point icon={Handshake} lead="The deal execution" tone="dark">
              {PITCH.deal}
            </Point>
          </div>
        </div>
        <div className="mt-6 rounded-[22px] bg-peach/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange text-white">
              <Megaphone className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display text-[1.12rem] font-semibold text-cocoa">Strategic impact</div>
              <p className="mt-1 text-[1rem] leading-relaxed text-cocoa">
                <GlossaryText>{PITCH.impact}</GlossaryText>
              </p>
            </div>
          </div>
          <div className="mt-5">
            <IconFlow
              nodes={[
                { icon: Tv, title: "Prime-time broadcast", text: "High-trust, top-of-funnel" },
                { icon: ShoppingBag, title: "Sales spikes", text: "D2C and quick-commerce" },
                { icon: Truck, title: "Distributors", text: "Conversations accelerated" },
                { icon: Briefcase, title: "Corporate clients", text: "Conversations accelerated" },
                { icon: Store, title: "Modern trade", text: "Conversations accelerated" },
              ]}
            />
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Strategic fundraising as earned PR ───────────────────── */

export function Funding() {
  return (
    <section id="funding" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Strategic fundraising as earned PR" title="Funding news that builds trust" />
        <div className="mt-6">
          <StatBand
            tone="cocoa"
            stats={[
              { value: 17, prefix: "₹", suffix: " crore", label: "Pre-Series A round", icon: Landmark, note: "From the chapter" },
              { value: 2, label: "Co-lead investors", icon: Handshake, note: FUNDING.coLeads.join(" · ") },
              { value: 3, label: "Partner groups reassured", icon: ShieldCheck, note: "Platforms, retailers, suppliers" },
            ]}
          />
        </div>
        <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Frame src="/chapter-2-4/investor-handshake.webp" alt="A founder and an investor shaking hands over a table with snacks and a pitch on a laptop" caption="Illustrative photo" ratio="16/9" />
          <div className="grid gap-3">
            <Point icon={Landmark} lead="Institutional validation" tone="white">
              {FUNDING.validation}
            </Point>
            <Point icon={Newspaper} lead="Building business credibility" tone="white">
              {FUNDING.credibility}
            </Point>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-orange">Publicised backing reassures</div>
          <Chips items={FUNDING.reassures} icon={ShieldCheck} />
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Seasonal campaigns & festive drivers ─────────────────── */

export function Festive() {
  return (
    <section id="festive" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="4" kicker="Seasonal campaigns & festive drivers" title="Rakhi and Diwali, made better" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FESTIVE.hampers.map((h, i) => (
            <motion.figure key={h.img} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="overflow-hidden rounded-[20px] border border-cocoa bg-white shadow-[2px_2px_0_0_#2f1c1a]">
              <div className="relative aspect-square">
                <Image src={h.img} alt={`${h.label} — official Eat Better photo`} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
              </div>
              <figcaption className="px-3 py-2 text-[0.92rem] font-bold text-cocoa">{h.label}</figcaption>
            </motion.figure>
          ))}
        </div>
        <div className="mt-4 grid items-stretch gap-3 md:grid-cols-2">
          <Point icon={Flame} lead="Festive revenue moments">
            {FESTIVE.moments}
          </Point>
          <Point icon={Gift} lead="Healthier Indian gifting">
            {FESTIVE.gifting}
          </Point>
        </div>
        <div className="mt-4">
          <Frame src="/chapter-2-4/web/diwali-hampers.webp" alt="Diwali gift hampers page on eatbetterco.com" caption="Diwali gift hampers page, eatbetterco.com (screenshot)" ratio="1440/520" sizes="(max-width: 1280px) 100vw, 1200px" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Corporate gifting & social proof ─────────────────────── */

export function Corporate() {
  return (
    <section id="corporate" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="5" kicker="Corporate gifting & social proof" title="Big clients, bigger trust" />
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <VideoBlock kind="file" av1="/chapter-1-3/video/diwali-gifting-av1.mp4" h264="/chapter-1-3/video/diwali-gifting-h264.mp4" poster="/chapter-1-3/video/gifting-poster.jpg" title="Diwali Corporate Gifting, Done Thoughtfully | Inside Eat Better Co" caption="From Eat Better Co's own YouTube channel." />
          <div className="grid gap-3">
            <Point icon={Building2} lead="Enterprise client roster" tone="white">
              {CORPORATE.roster}
            </Point>
            <Point icon={Users} lead="B2B social proof" tone="white">
              {CORPORATE.proof}
            </Point>
            <Chips items={CORPORATE.validates} icon={Check} />
          </div>
        </div>
        <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-2">
          <Frame src="/chapter-2-4/web/corporate-gifting.webp" alt="Corporate gifting page on eatbetterco.com" caption="Corporate gifting page, eatbetterco.com (screenshot)" ratio="1440/700" />
          <Frame src="/chapter-2-4/web/corporate-clients.webp" alt="Corporate client logos and gifting numbers on eatbetterco.com" caption="Client roster and figures as shown on eatbetterco.com (brand claims, screenshot)" ratio="1440/700" fit="contain" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 5 · Owned media & on-site press validation ───────────────── */

export function PressSection() {
  return (
    <section id="press" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="6" kicker="Owned media & on-site press validation" title="Proof on the storefront" />
        <div className="mt-6">
          <Frame src="/chapter-2-4/web/featured-in-media.webp" alt="Featured in media section on eatbetterco.com" caption="“Featured in media” section on eatbetterco.com (screenshot)" ratio="1280/300" fit="contain" sizes="(max-width: 1280px) 100vw, 1200px" />
        </div>
        <div className="mt-4 grid items-stretch gap-3 md:grid-cols-2">
          <Point icon={Newspaper} lead="“Featured in” press anchor">
            {PRESS.featured}
          </Point>
          <Point icon={ShoppingBag} lead="Friction reduction">
            {PRESS.friction}
          </Point>
        </div>
        <div className="mt-6">
          <IconFlow
            nodes={[
              { icon: Megaphone, title: "Earned media attention" },
              { icon: Globe, title: "Press section on the website" },
              { icon: ShieldCheck, title: "Lower purchase hesitation" },
              { icon: ShoppingBag, title: "Higher storefront conversion" },
            ]}
          />
        </div>
      </Panel>
    </section>
  );
}

/* ── Activities ───────────────────────────────────────────────── */

function ActivityRun({ id, Comp }: { id: string; Comp: React.ComponentType<{ onDone: (summary: string) => void }> }) {
  const complete = useActivities24((s) => s.complete);
  const save = useWork24((s) => s.save);
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
        <p className="mt-2 max-w-3xl text-[1.05rem] text-cocoa">Three hands-on tasks. Each one moves forward only when your working is right — every number, ranking and line is checked.</p>
        <div className="mt-6 grid gap-8">
          <ActivityRun id="deal" Comp={DealRoom} />
          <ActivityRun id="news" Comp={Newsroom} />
          <ActivityRun id="trust" Comp={TrustJourney} />
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP: { title: string; icon: LucideIcon }[] = [
  { title: "National TV", icon: Tv },
  { title: "Funding as PR", icon: Newspaper },
  { title: "Festive campaigns", icon: Gift },
  { title: "Corporate proof", icon: Briefcase },
  { title: "On-site press", icon: Globe },
];
const ACT: { id: string; label: string }[] = ACTS_24;

export function WrapUp() {
  const done = useActivities24((s) => s.done);
  const work = useWork24((s) => s.work);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 2.4 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">Attention, earned</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {RECAP.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex flex-col items-center gap-2 rounded-2xl border border-cocoa bg-cream p-4 text-center shadow-[2px_2px_0_0_#2f1c1a]">
                <span className="grid size-11 place-items-center rounded-full bg-orange text-white">
                  <Icon className="size-5" />
                </span>
                <span className="text-[0.95rem] font-bold leading-tight text-cocoa">{r.title}</span>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-[22px] bg-cocoa p-5 text-cream">
          <LeafBulb className="mt-0.5 size-6 shrink-0 text-haldi" />
          <p className="font-display text-[1.15rem] leading-snug">
            <GlossaryText>{TAKEAWAY}</GlossaryText>
          </p>
        </div>
        <div className="mt-6 rounded-[22px] bg-peach/70 p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[1.2rem] font-semibold text-cocoa">Activities on this page</span>
            <span className="font-bold text-cocoa-2">
              {n}/{ACT.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ACT.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-[1rem] text-cocoa">
                {done[a.id] ? <Check className="size-5 shrink-0 text-success" strokeWidth={3} /> : <Circle className="size-5 shrink-0 text-cocoa-2/40" />}
                {a.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.9rem] text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
        </div>
        <MyWork chapter="2.4" items={ACT.map((a) => ({ label: a.label, text: work[a.id] }))} />
      </Panel>
    </section>
  );
}
