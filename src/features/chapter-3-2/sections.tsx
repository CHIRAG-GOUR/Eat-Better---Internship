"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Building2, Check, Circle, Factory, Globe, Handshake, Landmark, Lightbulb, MessagesSquare, PackageCheck, ShieldCheck, ShoppingCart, Sprout, Truck, Users, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { BizCanvas, IconFlow, MediaRow, StatBand } from "@/components/rich";
import { LeafBulb } from "@/components/icons/EbIcons";
import { MyWork } from "@/components/play/GameFrame";
import { createActivityStore } from "@/lib/activities";
import { ACTIVITIES, INVESTORS, PARTNERS, RESOURCES, TAKEAWAY, THINK } from "./content";
import { ACTS_32, useWork32 } from "./activities";

export const useActivities32 = createActivityStore<string>([...ACTS_32.map((a) => a.id), "reflect"]);

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";
const OFFICIAL = "Official photo, eatbetterco.com";

/* ── 1 · The canvas ───────────────────────────────────────────── */

export function CanvasOverview() {
  return (
    <section id="canvas" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Business Model Canvas" title="The engine room of the business">
          Chapter 3.1 covered the people side of the canvas. This chapter fills in three blocks: what Eat Better needs, what it does, and who it depends on.
        </SectionIntro>
        <div className="mt-6">
          <BizCanvas
            highlight={["partners", "activities", "resources"]}
            items={{
              partners: PARTNERS.map((p) => p.title),
              activities: ACTIVITIES.map((a) => a.title),
              resources: RESOURCES.map((r) => r.title),
            }}
            caption="The nine blocks of the Business Model Canvas. Lit blocks are this chapter's."
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Building2, h: "Key Resources", t: "What the company must HAVE." },
            { icon: Factory, h: "Key Activities", t: "What the company must DO, every day." },
            { icon: Handshake, h: "Key Partners", t: "Who the company DEPENDS ON." },
          ].map(({ icon: Icon, h, t }, i) => (
            <motion.div key={h} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 rounded-[20px] bg-cream p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange text-white">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="font-display text-[1.12rem] font-semibold text-cocoa">{h}</div>
                <div className="text-[0.98rem] text-cocoa-2">{t}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Key Resources ────────────────────────────────────────── */

const RES_ICON: Record<(typeof RESOURCES)[number]["id"], LucideIcon> = { facility: Factory, recipes: BookOpen, brand: ShieldCheck, team: Users, platform: Globe };

export function Resources() {
  return (
    <section id="resources" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Key Resources" title="What Eat Better needs" />
        <div className="mt-6">
          <StatBand
            tone="cocoa"
            stats={[
              { value: 50000, suffix: " sq. ft.", label: "kitchen and production facility", icon: Factory },
              { value: 70, prefix: "~", label: "people in the team (business databases list roughly 70 employees)", icon: Users },
            ]}
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RESOURCES.map((r, i) => {
            const Icon = RES_ICON[r.id];
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex h-full flex-col gap-2 rounded-[20px] border border-cocoa bg-white p-4 shadow-[2px_2px_0_0_#2f1c1a]">
                <span className="grid size-10 place-items-center rounded-xl bg-orange text-white">
                  <Icon className="size-5" />
                </span>
                <div className="font-display text-[1.08rem] font-semibold leading-tight text-cocoa">{r.title}</div>
                <p className="text-[0.95rem] leading-snug text-cocoa-2">
                  <GlossaryText>{r.text}</GlossaryText>
                </p>
              </motion.div>
            );
          })}
        </div>
        <MediaRow
          className="mt-5"
          items={[
            { kind: "image", src: "/chapter-3-2/kitchen-line.webp", alt: "A team member in a hairnet, mask and gloves working on Eat Better's production line", ratio: 828 / 918, caption: `The kitchen at work. ${OFFICIAL}` },
            { kind: "image", src: "/brand/library/site/story-team-preparing.webp", alt: "Team members in hairnets and gloves preparing ingredients on trays", ratio: 1100 / 825, caption: `The team at work. ${OFFICIAL}` },
            { kind: "image", src: "/chapter-3-2/back-fssai.webp", alt: "Back-of-pack panel with the maker's details, FSSAI licence number and allergen advice", ratio: 1, caption: "Brand and trust, printed: maker's details and FSSAI licence on every pack" },
          ]}
        />
      </Panel>
    </section>
  );
}

/* ── 3 · Key Activities ───────────────────────────────────────── */

const ACT_ICON: Record<(typeof ACTIVITIES)[number]["id"], LucideIcon> = { source: Sprout, cook: Factory, pack: PackageCheck, market: MessagesSquare, develop: Lightbulb };

export function KeyActivities() {
  return (
    <section id="key-activities" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Key Activities" title="What Eat Better does, every day" />
        <div className="mt-8">
          <IconFlow nodes={ACTIVITIES.map((a) => ({ icon: ACT_ICON[a.id], title: a.title, text: a.text }))} />
        </div>
        <p className="mt-8 text-[0.9rem] font-bold text-cocoa-2">Inside the kitchen, step by step. Official photos from eatbetterco.com (Our Kitchen).</p>
        <MediaRow
          className="mt-3"
          items={[
            { kind: "image", src: "/brand/library/site/kitchen-sourcing-dates.webp", alt: "Plump dates, a sourced ingredient", ratio: 930 / 850, caption: "Source" },
            { kind: "image", src: "/brand/library/site/kitchen-quality-check-cashews.webp", alt: "A gloved hand checking a tray of cashews", ratio: 930 / 850, caption: "Check the ingredients" },
            { kind: "image", src: "/brand/library/site/kitchen-cooking-millets.webp", alt: "Millets being stirred in a cooking kettle", ratio: 930 / 850, caption: "Cook in small batches" },
            { kind: "image", src: "/brand/library/site/kitchen-batch-testing.webp", alt: "A gloved hand checking a batch of laddoos", ratio: 930 / 850, caption: "Test every batch" },
            { kind: "image", src: "/chapter-3-2/pack-back.webp", alt: "The back of a Better Trail Mix pouch", ratio: 1, caption: "Pack & fulfil" },
          ]}
        />
        <h3 className="mt-10 font-display text-[1.45rem] font-semibold text-cocoa">Developing new products and festive gifting ranges</h3>
        <MediaRow
          className="mt-4"
          items={[
            { kind: "image", src: "/chapter-3-2/new-puffs.webp", alt: "Chickpea Puffs Lime Sriracha pack", ratio: 1, caption: "Chickpea Puffs" },
            { kind: "image", src: "/chapter-3-2/new-chips.webp", alt: "Protein Chips Pudina Punch pack", ratio: 1, caption: "Protein Chips" },
            { kind: "image", src: "/chapter-3-2/festive-hamper.webp", alt: "Happy Diwali gift hamper", ratio: 1, caption: "A festive hamper" },
            { kind: "image", src: "/chapter-3-2/festive-contents.webp", alt: "What's inside the Utsav Diwali hamper: an 8-item list", ratio: 1, caption: "Planned contents of a hamper" },
          ]}
        />
        <p className="mt-2 text-[0.88rem] text-cocoa-2">Product photos: official, eatbetterco.com.</p>
      </Panel>
    </section>
  );
}

/* ── 4 · Key Partners ─────────────────────────────────────────── */

const PARTNER_ICON: Record<(typeof PARTNERS)[number]["id"], LucideIcon> = { suppliers: Sprout, platforms: ShoppingCart, logistics: Truck, investors: Landmark, corporate: Building2 };
// cell centres in a 3×3 grid (viewBox 0..300): top-left, top-centre, top-right, bottom-left, bottom-right
const SPOTS = [
  { col: "1", row: "1", x: 50, y: 50 },
  { col: "2", row: "1", x: 150, y: 50 },
  { col: "3", row: "1", x: 250, y: 50 },
  { col: "1", row: "3", x: 50, y: 250 },
  { col: "3", row: "3", x: 250, y: 250 },
];

function PartnerCard({ p }: { p: (typeof PARTNERS)[number] }) {
  const Icon = PARTNER_ICON[p.id];
  return (
    <div className="flex h-full flex-col gap-2 rounded-[20px] border border-cocoa bg-white p-4 shadow-[2px_2px_0_0_#2f1c1a]">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange text-white">
          <Icon className="size-5" />
        </span>
        <span className="font-display text-[1.08rem] font-semibold leading-tight text-cocoa">{p.title}</span>
      </div>
      {p.id === "investors" ? (
        <div className="flex flex-wrap gap-1.5">
          {INVESTORS.map((n) => (
            <span key={n} className="rounded-full bg-cream px-2.5 py-0.5 text-[0.85rem] font-bold text-cocoa">
              {n}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[0.95rem] leading-snug text-cocoa-2">
          <GlossaryText>{p.text}</GlossaryText>
        </p>
      )}
    </div>
  );
}

export function Partners() {
  return (
    <section id="partners" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="4" kicker="Key Partners" title="Who Eat Better depends on" />
        {/* network: Eat Better in the middle, partners around it */}
        <div className="relative mt-8 hidden md:grid md:grid-cols-3 md:grid-rows-[auto_minmax(7rem,auto)_auto] md:gap-x-6 md:gap-y-4">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden>
            {SPOTS.map((s, i) => (
              <motion.line key={i} x1={150} y1={150} x2={s.x} y2={s.y} stroke="#FF5C00" strokeWidth={1.4} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }} />
            ))}
          </svg>
          {PARTNERS.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative" style={{ gridColumn: SPOTS[i].col, gridRow: SPOTS[i].row }}>
              <PartnerCard p={p} />
            </motion.div>
          ))}
          <div className="relative grid place-items-center" style={{ gridColumn: "2", gridRow: "2 / 4" }}>
            <div className="grid size-40 place-items-center rounded-full border-4 border-orange bg-cocoa p-4 text-center shadow-[0_20px_40px_-20px_rgba(47,28,26,0.8)]">
              <span className="font-display text-[1.35rem] font-semibold leading-tight text-cream">Eat Better Co</span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:hidden">
          <div className="rounded-[20px] bg-cocoa p-4 text-center font-display text-[1.2rem] font-semibold text-cream">Eat Better Co depends on…</div>
          {PARTNERS.map((p) => (
            <PartnerCard key={p.id} p={p} />
          ))}
        </div>
        <MediaRow
          className="mt-6"
          items={[
            { kind: "image", src: "/chapter-3-2/ingredients-nuts.webp", alt: "Ingredient grid for Premium Nut Mix: cashews, almonds, golden raisins, black raisins, pistachios, olive oil", ratio: 1, caption: "What suppliers deliver: the ingredients" },
            { kind: "image", src: "/chapter-3-2/corporate-box.webp", alt: "An opened jumbo Diwali gift hamper box", ratio: 1, caption: "What corporate clients order: gift boxes in bulk" },
          ]}
        />
      </Panel>
    </section>
  );
}

/* ── 5 · Think & discuss ──────────────────────────────────────── */

const KEY = "eb-3.2-think";

export function Think() {
  const [ans, setAns] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const complete = useActivities32((s) => s.complete);
  const save = useWork32((s) => s.save);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (s) setAns(s);
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ans));
    } catch {
      /* ignore */
    }
  }, [ans, restored]);
  const ok = THINK.every((t) => (ans[t.id] ?? "").trim().length >= 15);
  useEffect(() => {
    if (!ok) return;
    complete("reflect");
    save("reflect", THINK.map((t) => `${t.q} ${ans[t.id].trim()}`).join(" | "));
  }, [ok, ans, complete, save]);

  return (
    <section id="think" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="5" kicker="Think & discuss" title="Your turn to think it through" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {THINK.map((t, i) => (
            <label key={t.id} className="flex flex-col gap-2 rounded-[22px] border border-cocoa bg-cream p-5 shadow-[2px_2px_0_0_#2f1c1a]">
              <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">Question {i + 1}</span>
              <span className="font-display text-[1.25rem] font-semibold leading-snug text-cocoa">{t.q}</span>
              <textarea
                value={ans[t.id] ?? ""}
                onChange={(e) => setAns((a) => ({ ...a, [t.id]: e.target.value }))}
                rows={4}
                placeholder="Write your answer…"
                className="mt-1 w-full resize-y rounded-xl border border-cocoa/20 bg-white p-3 text-[1rem] text-cocoa outline-none focus:border-orange"
              />
              <span className="text-[0.85rem] text-cocoa-2">{(ans[t.id] ?? "").trim().length >= 15 ? "Saved on this device." : "Write at least a sentence. Saved on this device."}</span>
            </label>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 6 · Activities ───────────────────────────────────────────── */

function ActivityRun({ id, Comp }: { id: string; Comp: React.ComponentType<{ onDone: (summary: string) => void }> }) {
  const complete = useActivities32((s) => s.complete);
  const save = useWork32((s) => s.save);
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
        <SectionIntro index="6" kicker="Activities" title="Put it into practice" />
        <p className="mt-2 max-w-3xl text-[1.05rem] text-cocoa">Hands-on tasks built from Eat Better&apos;s real packs and this chapter. Each step opens only when your working is right.</p>
        <div className="mt-6 grid gap-8">
          {ACTS_32.length ? ACTS_32.map((a) => <ActivityRun key={a.id} id={a.id} Comp={a.Comp} />) : <div className="h-[420px] animate-pulse rounded-[24px] bg-cocoa/10" aria-label="Activities loading" />}
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP: { title: string; icon: LucideIcon }[] = [
  { title: "50,000 sq. ft. kitchen", icon: Factory },
  { title: "Recipes & trust", icon: ShieldCheck },
  { title: "Small batches, every batch tested", icon: PackageCheck },
  { title: "Suppliers & platforms", icon: Truck },
  { title: "Investors & corporate clients", icon: Landmark },
];

export function WrapUp() {
  const done = useActivities32((s) => s.done);
  const work = useWork32((s) => s.work);
  const list = [...ACTS_32.map((a) => ({ id: a.id, label: a.label })), { id: "reflect", label: "Think & discuss" }];
  const n = list.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 3.2 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">Have it, do it, depend on it</h2>
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
              {n}/{list.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {list.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-[1rem] text-cocoa">
                {done[a.id] ? <Check className="size-5 shrink-0 text-success" strokeWidth={3} /> : <Circle className="size-5 shrink-0 text-cocoa-2/40" />}
                {a.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.9rem] text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
        </div>
        <MyWork chapter="3.2" items={list.map((a) => ({ label: a.label, text: work[a.id] }))} />
      </Panel>
    </section>
  );
}
