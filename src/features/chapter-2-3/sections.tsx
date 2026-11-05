"use client";

import { MyWork } from "@/components/play/GameFrame";
import { ACTS_23, PersonaLab, PositionMap, UspEvidence, useWork23 } from "./activities";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Briefcase,
  Building2,
  CandyOff,
  Check,
  Circle,
  Cookie,
  Droplets,
  FileCheck2,
  Fingerprint,
  Gift,
  Home,
  Layers,
  Lightbulb,
  Map,
  MessageCircle,
  ShieldAlert,
  Smile,
  Store,
  Target,
  TreePalm,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { IconFlow } from "@/components/rich";
import { LeafBadge } from "@/components/icons/EbIcons";
import { createActivityStore } from "@/lib/activities";
import { AUDIENCE, PERSONA, POSITIONING, USP, VIDEO, type AudienceId } from "./content";

/** Activity ids for this chapter; activities are added separately (see the "activities" section). */
export const ACTIVITY_IDS = ["map", "usp", "persona"] as const;
export const useActivities23 = createActivityStore<string>(ACTIVITY_IDS);

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";

/* ── small shared pieces ──────────────────────────────────────── */

function Concept({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-cocoa p-4 text-cream">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-haldi" />
      <p className="text-[1.02rem] font-semibold leading-snug">
        <span className="mr-1.5 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-haldi">Key concept</span>
        <GlossaryText>{children}</GlossaryText>
      </p>
    </div>
  );
}

function Example({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-orange/40 bg-white p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange/10 text-orange">
        <MessageCircle className="size-5" />
      </span>
      <p className="text-[1rem] leading-snug text-cocoa">
        <span className="mr-1.5 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">Example</span>
        <GlossaryText>{children}</GlossaryText>
      </p>
    </div>
  );
}

function Definition({ children, icon: Icon = Lightbulb }: { children: string; icon?: LucideIcon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-start gap-3 rounded-2xl border border-cocoa bg-white p-4 shadow-[3px_3px_0_0_#2f1c1a]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange text-white">
        <Icon className="size-5" />
      </span>
      <p className="font-display text-[1.15rem] font-semibold leading-snug text-cocoa">
        <GlossaryText>{children}</GlossaryText>
      </p>
    </motion.div>
  );
}

/* ── 1 · Understanding brand positioning ───────────────────────── */

export function Positioning() {
  return (
    <section id="positioning" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Understanding brand positioning" title="A place in the customer’s mind" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="grid min-w-0 gap-4">
            <Definition icon={Map}>{POSITIONING.definition}</Definition>

            {/* the space between */}
            <div className="rounded-[22px] bg-cream p-4 sm:p-5">
              <p className="text-[1.02rem] leading-relaxed text-cocoa">
                <GlossaryText>{POSITIONING.aim}</GlossaryText>
              </p>
              <div className="relative mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-stretch gap-2">
                <div className="absolute inset-x-6 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#B3261E] via-orange to-[#2E7D6B] opacity-40" aria-hidden />
                <div className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-cocoa/20 bg-white p-3 text-center">
                  <Cookie className="size-6 text-[#B3261E]" />
                  <span className="text-[0.92rem] font-bold leading-tight text-cocoa">{POSITIONING.ends.left}</span>
                </div>
                <motion.div initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.2 }} className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-cocoa bg-orange p-3 text-center text-white shadow-[2px_2px_0_0_#2f1c1a]">
                  <LeafBadge className="size-7" />
                  <span className="font-display text-[1.05rem] font-semibold leading-tight">Eat Better</span>
                  <span className="text-[0.88rem] font-bold leading-tight text-white/90">{POSITIONING.ends.middle}</span>
                </motion.div>
                <div className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-cocoa/20 bg-white p-3 text-center">
                  <Target className="size-6 text-[#2E7D6B]" />
                  <span className="text-[0.92rem] font-bold leading-tight text-cocoa">{POSITIONING.ends.right}</span>
                </div>
              </div>
            </div>

            <p className="text-[1.02rem] leading-relaxed text-cocoa">
              <GlossaryText>{POSITIONING.idea}</GlossaryText>
            </p>
            <Example>{POSITIONING.example}</Example>
            <Concept>{POSITIONING.concept}</Concept>
          </div>
          <div className="mx-auto w-full max-w-[300px]">
            <VideoBlock kind="file" portrait av1={VIDEO.av1} h264={VIDEO.h264} poster={VIDEO.poster} title={VIDEO.title} caption="Example · from Eat Better Co's own YouTube channel." />
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Identifying the target audience ──────────────────────── */

const AUD_ICON: Record<AudienceId, LucideIcon> = { families: Home, professionals: Briefcase, gifting: Gift, corporate: Building2 };

export function Audience() {
  return (
    <section id="audience" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Identifying the target audience" title="Who Eat Better is for" />
        <motion.figure initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 overflow-hidden rounded-[18px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
          <Image src="/chapter-2-3/lms-1.png" alt="10 lakh+ hampers delivered pan-India, 500+ corporates and organizations, 25 hamper designs this Diwali" width={1402} height={187} sizes="(max-width: 1280px) 100vw, 1200px" className="h-auto w-full" />
          <figcaption className="border-t border-cocoa/10 bg-cream px-4 py-2 text-[0.85rem] text-cocoa-2">Eat Better&apos;s own figures (brand claims).</figcaption>
        </motion.figure>
        <div className="mt-5">
          <Definition icon={Users}>{AUDIENCE.definition}</Definition>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.rows.map((r, i) => {
            const Icon = AUD_ICON[r.id];
            return (
              <motion.article key={r.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
                <div className="relative aspect-[4/3]">
                  <Image src={r.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-cocoa bg-cream px-2.5 py-1 text-[0.85rem] font-extrabold text-cocoa">
                    <Icon className="size-4 text-orange" /> {i + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h3 className="font-display text-[1.2rem] font-semibold leading-tight text-cocoa">{r.audience}</h3>
                  <div>
                    <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">Customer need</div>
                    <p className="mt-0.5 text-[0.98rem] leading-snug text-cocoa">{r.need}</p>
                  </div>
                  <div className="mt-auto rounded-xl bg-peach/70 p-3">
                    <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-orange">How Eat Better could appeal</div>
                    <p className="mt-0.5 text-[0.98rem] font-semibold leading-snug text-cocoa">
                      <GlossaryText>{r.appeal}</GlossaryText>
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
        <div className="mt-5">
          <Concept>{AUDIENCE.concept}</Concept>
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Understanding Eat Better's USP ───────────────────────── */

const DIFF_ICON: LucideIcon[] = [Smile, TreePalm, CandyOff, Droplets, Layers];
const TEST_ICON: LucideIcon[] = [Target, Users, Fingerprint, FileCheck2];

export function Usp() {
  return (
    <section id="usp" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Understanding Eat Better’s USP" title="A reason to choose it" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Definition icon={Fingerprint}>{USP.definition}</Definition>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-start gap-3 rounded-2xl bg-orange p-4 text-white shadow-[3px_3px_0_0_#2f1c1a]">
            <LeafBadge className="mt-0.5 size-7 shrink-0" />
            <p className="font-display text-[1.15rem] font-semibold leading-snug">
              <GlossaryText>{USP.value}</GlossaryText>
            </p>
          </motion.div>
        </div>

        <div className="mt-6 text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-orange">Its stated differentiators</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {USP.differentiators.map((d, i) => {
            const Icon = DIFF_ICON[i];
            return (
              <motion.div key={d} initial={{ opacity: 0, y: 18, rotate: -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, type: "spring", stiffness: 200, damping: 18 }} className={`flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-[20px] border border-cocoa bg-cream p-4 text-center shadow-[2px_2px_0_0_#2f1c1a] ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                <span className="grid size-14 place-items-center rounded-full bg-cocoa text-haldi">
                  <Icon className="size-7" />
                </span>
                <span className="font-display text-[1.05rem] font-semibold leading-tight text-cocoa">
                  <GlossaryText>{d}</GlossaryText>
                </span>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-haldi bg-haldi/20 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-cocoa" />
          <p className="text-[0.98rem] leading-snug text-cocoa">
            <GlossaryText>{USP.caveat}</GlossaryText>
          </p>
        </div>

        <div className="mt-6">
          <Example>{USP.example}</Example>
        </div>
        <div className="mt-6 text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-orange">A strong USP is…</div>
        <div className="mt-4">
          <IconFlow nodes={USP.tests.map((t, i) => ({ icon: TEST_ICON[i], title: t.title, text: t.text }))} />
        </div>
        <div className="mt-5">
          <Concept>{USP.concept}</Concept>
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Creating a customer persona ──────────────────────────── */

export function Persona() {
  return (
    <section id="persona" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <SectionIntro index="4" kicker="Creating a customer persona" title="Meet a typical customer" />
        <div className="mt-6">
          <Definition icon={UserRound}>{PERSONA.definition}</Definition>
        </div>
        <div className="mt-5 text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-orange">Sample persona</div>
        <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch">
          <motion.figure initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative min-h-[260px] overflow-hidden rounded-[22px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a] lg:min-h-0">
            <Image src={PERSONA.img} alt="A parent with a child in a shopping trolley reading a snack pack in a supermarket aisle" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
            <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-cocoa/90 px-4 py-2.5 text-cream">
              <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-haldi">Persona</div>
              <div className="font-display text-[1.3rem] font-semibold leading-tight">{PERSONA.name}</div>
            </figcaption>
          </motion.figure>
          <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-3 rounded-[22px] border border-cocoa bg-white p-5 shadow-[3px_3px_0_0_#2f1c1a]">
            {PERSONA.fields.map((f) => (
              <div key={f.label} className="border-b border-cocoa/10 pb-3 last:border-0 last:pb-0">
                <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-orange">{f.label}</div>
                {f.label === "Buying considerations" ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PERSONA.considerations.map((c) => (
                      <span key={c} className="rounded-full bg-peach px-3 py-1 text-[0.92rem] font-bold text-cocoa">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`mt-0.5 leading-snug text-cocoa ${f.label === "Possible marketing message" ? "font-display text-[1.15rem] font-semibold" : "text-[1rem]"}`}>{f.text}</p>
                )}
              </div>
            ))}
          </motion.div>
        </div>
        <p className="mt-3 text-[0.9rem] text-cocoa-2">{PERSONA.note}</p>
      </Panel>
    </section>
  );
}

/* ── 5 · Activities ───────────────────────────────────────────── */

function ActivityRun({ id, Comp }: { id: string; Comp: React.ComponentType<{ onDone: (summary: string) => void }> }) {
  const complete = useActivities23((s) => s.complete);
  const save = useWork23((s) => s.save);
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
        <SectionIntro index="5" kicker="Activities" title="Put it into practice" />
        <p className="mt-2 max-w-3xl text-[1.05rem] text-cocoa">Three hands-on tasks. Each one only moves forward when your evidence is right — there is no way to guess past a step.</p>
        <div className="mt-6 grid gap-8">
          <ActivityRun id="map" Comp={PositionMap} />
          <ActivityRun id="usp" Comp={UspEvidence} />
          <ActivityRun id="persona" Comp={PersonaLab} />
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Positioning", text: POSITIONING.concept, icon: Map },
  { title: "Target audience", text: AUDIENCE.concept, icon: Users },
  { title: "USP", text: USP.concept, icon: Fingerprint },
  { title: "Persona", text: PERSONA.definition, icon: UserRound },
];
const ACT: { id: string; label: string }[] = ACTS_23;

export function WrapUp() {
  const done = useActivities23((s) => s.done);
  const work = useWork23((s) => s.work);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 2.3 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">Know where you stand, and who for</h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RECAP.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col gap-2 rounded-2xl border border-cocoa bg-cream p-4 shadow-[2px_2px_0_0_#2f1c1a]">
                <span className="grid size-11 place-items-center rounded-full bg-orange text-white">
                  <Icon className="size-5" />
                </span>
                <span className="font-display text-[1.1rem] font-semibold text-cocoa">{r.title}</span>
                <p className="text-[0.95rem] leading-snug text-cocoa">{r.text}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-6 rounded-[22px] bg-peach/70 p-5">
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 font-display text-[1.2rem] font-semibold text-cocoa">
              <Store className="size-5 text-orange" /> Activities on this page
            </span>
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
        <MyWork chapter="2.3" items={ACT.map((a) => ({ label: a.label, text: work[a.id] }))} />
      </Panel>
    </section>
  );
}
