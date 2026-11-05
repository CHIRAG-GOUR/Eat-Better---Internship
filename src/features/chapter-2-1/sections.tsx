"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, Circle, ClipboardCopy, Megaphone, Package, Palette, RotateCcw, Type, Users } from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { createActivityStore } from "@/lib/activities";
import { IconFlow, MediaRow } from "@/components/rich";
import { LearnLab } from "@/components/learn/LearnLab";
import { LeafBulb } from "@/components/icons/EbIcons";
import { LABS_21 } from "./labs";
import { AREAS, OFFICIAL_LINES, PALETTE, TAGLINE, TOUCHPOINTS, type AreaId } from "./content";
import { useBrand21 } from "./store";

export const ACTIVITY_IDS = ["name", "logo", "colour", "pack", "tone", "perception", "lab", "reflect"] as const;
export type ActivityId21 = (typeof ACTIVITY_IDS)[number];
export const useActivities21 = createActivityStore(ACTIVITY_IDS);

const IdentityLab = dynamic(() => import("./three/IdentityLab"), {
  ssr: false,
  loading: () => <div className="h-[360px] animate-pulse rounded-[24px] bg-[#F6E3CF] sm:h-[460px] lg:h-[560px]" />,
});

const sectionCls = "relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10";
const ICONS: Record<AreaId, typeof Type> = { name: Type, logo: BadgeCheck, colour: Palette, pack: Package, tone: Megaphone, perception: Users };

/* ── 1 · Six parts of an identity (flip cards) ────────────────── */

function AreaCard({ a, i }: { a: (typeof AREAS)[number]; i: number }) {
  const [flip, setFlip] = useState(false);
  const Icon = ICONS[a.id];
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }} className="[perspective:1000px]">
      <button onClick={() => setFlip((f) => !f)} aria-pressed={flip} aria-label={`${a.area}: ${flip ? "show icon" : "show what we analyse"}`} className="relative block h-[210px] w-full text-left sm:h-[230px]">
        <motion.div animate={{ rotateY: flip ? 180 : 0 }} transition={{ type: "spring", stiffness: 160, damping: 20 }} className="relative size-full [transform-style:preserve-3d]">
          <div className="absolute inset-0 flex flex-col justify-between rounded-[22px] border border-cocoa bg-cream p-5 shadow-[3px_3px_0_0_#2f1c1a] [backface-visibility:hidden]">
            <span className="grid size-14 place-items-center rounded-2xl bg-orange text-white">
              <Icon className="size-7" />
            </span>
            <div>
              <div className="font-display text-[1.35rem] font-semibold leading-tight text-cocoa">{a.area}</div>
              <div className="mt-1 flex items-center gap-1 text-[0.85rem] font-bold text-orange">
                <RotateCcw className="size-3.5" /> Tap to flip
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between rounded-[22px] border border-cocoa bg-cocoa p-5 text-cream shadow-[3px_3px_0_0_#ff5c00] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-[0.98rem] leading-snug text-cream/85">{a.analyse}</p>
            <p className="font-display text-[1.1rem] font-semibold leading-snug text-haldi">{a.learn}</p>
          </div>
        </motion.div>
      </button>
    </motion.div>
  );
}

export function IdentityMap() {
  return (
    <section id="identity" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="What we will analyse" title="Six parts of a brand identity">
          Flip each card.
        </SectionIntro>
        <motion.figure initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 overflow-hidden rounded-[18px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
          <Image src="/chapter-2-1/lms-1.png" alt="Eat Better Co website header: logo, menu and the headline The joy of snacking, made better." width={1642} height={257} sizes="(max-width: 1280px) 100vw, 1200px" className="h-auto w-full" />
          <figcaption className="border-t border-cocoa/10 bg-cream px-4 py-2 text-[0.85rem] text-cocoa-2">Official Eat Better website (eatbetterco.com)</figcaption>
        </motion.figure>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a, i) => (
            <AreaCard key={a.id} a={a} i={i} />
          ))}
        </div>
        <div className="mt-10">
          <div className="text-center text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-orange">One identity, every touchpoint</div>
          <div className="mx-auto mt-4 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            {TOUCHPOINTS.map((t, i) => (
              <motion.figure key={t.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="overflow-hidden rounded-2xl border border-cocoa bg-white shadow-[2px_2px_0_0_#2f1c1a]">
                <div className="relative aspect-[4/3]">
                  <Image src={t.img} alt={t.note} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover object-top" />
                </div>
                <figcaption className="px-3 py-2 text-[0.92rem] font-bold text-cocoa">{t.label}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 2–7 · The six areas: the supplied data, picture-led ─────────── */

function AreaShow({ id, index, areaId, tone, title, media, children }: { id: string; index: string; areaId: AreaId; tone: "light" | "peach"; title: string; media: React.ReactNode; children?: React.ReactNode }) {
  const a = AREAS.find((x) => x.id === areaId)!;
  const Icon = ICONS[areaId];
  return (
    <section id={id} className={sectionCls}>
      <Panel tone={tone} reveal="up" width="max-w-7xl">
        <SectionIntro index={index} kicker={a.area} title={title} />
        <div className="mt-6 grid gap-5">
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-[22px] border border-cocoa bg-cream p-5 shadow-[3px_3px_0_0_#2f1c1a]">
              <div className="flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">
                <Icon className="size-4" /> What students will analyse
              </div>
              <p className="mt-2 font-display text-[1.2rem] font-semibold leading-snug text-cocoa">
                <GlossaryText>{a.analyse}</GlossaryText>
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-[22px] bg-cocoa p-5 text-cream shadow-[3px_3px_0_0_#ff5c00]">
              <div className="flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-haldi">
                <LeafBulb className="size-4" /> Key learning
              </div>
              <p className="mt-2 font-display text-[1.25rem] font-semibold leading-snug">{a.learn}</p>
            </motion.div>
          </div>
          <div className="min-w-0">{media}</div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </Panel>
    </section>
  );
}


const RANGE_PHOTOS: [string, string, string][] = [
  ["/brand/products/millet-bhujia-1.webp", "Millet range", "#35401D"],
  ["/brand/products/hazelnut-laddoo-1.webp", "Laddoos", "#381C11"],
  ["/brand/products/nut-mix-2.webp", "Nut mixes", "#AF4300"],
  ["/brand/products/laddoo-tin-0.webp", "Laddoo tin", "#E7BA68"],
  ["/brand/products/diwali-hamper-0.webp", "Gifting", "#550D10"],
  ["/brand/products/quinoa-namkeen-0.webp", "Quinoa namkeen", "#D81F45"],
];

export function NameSection() {
  return (
    <AreaShow
      id="name"
      index="2"
      areaId="name"
      tone="peach"
      title="Two words, one promise"
      media={
        <MediaRow
          items={[
            { kind: "image", src: "/chapter-2-1/web/home.webp", alt: "eatbetterco.com home page", ratio: 1.6, caption: "eatbetterco.com home page (screenshot)" },
            {
              kind: "node",
              ratio: 0.8,
              node: (
                <div className="flex size-full flex-col items-center justify-center gap-5 rounded-2xl border border-cocoa bg-cream p-6 shadow-[3px_3px_0_0_#2f1c1a]">
                  <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co logo" width={300} height={145} className="h-auto w-[78%]" />
                  <p className="text-center font-display text-[clamp(1.2rem,2.2vw,1.6rem)] font-semibold leading-tight text-cocoa">&ldquo;{TAGLINE}&rdquo;</p>
                </div>
              ),
              caption: "Logo and tagline (official)",
            },
          ]}
        />
      }
    />
  );
}

export function LookSection() {
  return (
    <AreaShow
      id="look"
      index="3"
      areaId="logo"
      tone="light"
      title="The same face, everywhere"
      media={
        <div className="grid gap-4">
          <MediaRow
            items={[
              { kind: "image", src: "/chapter-2-1/web/home2.webp", alt: "eatbetterco.com product range on desktop", ratio: 1.6, caption: "Website, desktop (screenshot)" },
              { kind: "image", src: "/chapter-2-1/web/mobile.webp", alt: "eatbetterco.com on a phone", ratio: 390 / 844, caption: "Website, phone (screenshot)" },
            ]}
          />
        </div>
      }
    >
      <div className="rounded-[22px] bg-cream p-4">
        <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">Brand colours (official website)</div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PALETTE.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="text-center">
              <div className="aspect-[2/1] rounded-xl border border-cocoa/20" style={{ background: p.hex }} />
              <div className="mt-1 text-[0.8rem] font-bold leading-tight text-cocoa">{p.name}</div>
              <div className="text-[0.75rem] text-cocoa-2">{p.hex}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </AreaShow>
  );
}

export function ColourSection() {
  return (
    <AreaShow
      id="colour"
      index="4"
      areaId="colour"
      tone="peach"
      title="Every range has its colour"
      media={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {RANGE_PHOTOS.map(([src, cap, hex], i) => (
            <motion.figure key={src} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="overflow-hidden rounded-2xl border border-cocoa bg-white">
              <div className="relative aspect-square">
                <Image src={src} alt={`${cap} — official Eat Better photo`} fill sizes="240px" className="object-cover" />
              </div>
              <figcaption className="flex items-center gap-2 px-2.5 py-2 text-[0.88rem] font-bold text-cocoa">
                <span className="size-4 shrink-0 rounded-full border border-cocoa/20" style={{ background: hex }} />
                {cap}
              </figcaption>
            </motion.figure>
          ))}
          <p className="col-span-full text-[0.82rem] text-cocoa-2">Official Eat Better product photos; dots show each photo&apos;s backdrop colour.</p>
        </div>
      }
    />
  );
}

export function PackSection() {
  const complete = useActivities21((s) => s.complete);
  const done = useActivities21((s) => s.done.pack);
  return (
    <AreaShow
      id="pack"
      index="5"
      areaId="pack"
      tone="light"
      title="A pack sells in seconds"
      media={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["/brand/products/millet-bhujia-0.webp", "Pouch", "Millet Bhujia"],
            ["/brand/products/hazelnut-laddoo-0.webp", "Sachet", "Hazelnut Chocolate Laddoos"],
            ["/brand/products/laddoo-box-24-0.webp", "Box", "Assorted Laddoo Box"],
            ["/brand/products/laddoo-tin-0.webp", "Tin", "Assorted Laddoo Tin"],
          ].map(([src, fmt, name], i) => (
            <motion.figure key={src} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="overflow-hidden rounded-2xl border border-cocoa bg-white">
              <div className="relative aspect-square">
                <Image src={src} alt={`${name} — official Eat Better photo`} fill sizes="300px" className="object-cover" />
                <span className="absolute left-2 top-2 rounded-full border border-cocoa bg-haldi px-2.5 py-0.5 text-[0.8rem] font-extrabold text-cocoa">{fmt}</span>
              </div>
              <figcaption className="px-2.5 py-2 text-[0.88rem] font-bold leading-tight text-cocoa">{name}</figcaption>
            </motion.figure>
          ))}
        </div>
      }
    >
      <ActivityLabel done={!!done}>Activity · Match the pack to the moment</ActivityLabel>
      <div className="mt-2">
        <LearnLab
          spec={LABS_21.pack}
          onDone={(r) => {
            useBrand21.setState((st) => ({ labs: { ...st.labs, [LABS_21.pack.id]: r } }));
            complete("pack");
          }}
        />
      </div>
    </AreaShow>
  );
}

export function ToneSection() {
  return (
    <AreaShow
      id="tone"
      index="6"
      areaId="tone"
      tone="peach"
      title="How Eat Better sounds"
      media={
        <div className="grid gap-4">
          <MediaRow
            items={[
              { kind: "image", src: "/chapter-2-1/web/bhujia.webp", alt: "Millet Bhujia product page on eatbetterco.com", ratio: 1.6, caption: "Product page copy, eatbetterco.com (screenshot)" },
              { kind: "image", src: "/chapter-2-1/web/story2.webp", alt: "Our Story copy on eatbetterco.com", ratio: 1.6, caption: "“Our Story” copy, eatbetterco.com (screenshot)" },
            ]}
          />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICIAL_LINES.map((l, i) => (
              <motion.div key={l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex items-center rounded-2xl border border-cocoa bg-white px-4 py-3 font-display text-[1.05rem] font-semibold leading-snug text-cocoa shadow-[2px_2px_0_0_#2f1c1a]">
                &ldquo;{l}&rdquo;
              </motion.div>
            ))}
          </div>
          <p className="text-[0.82rem] text-cocoa-2">Official lines from eatbetterco.com</p>
        </div>
      }
    />
  );
}

export function PerceptionSection() {
  return (
    <AreaShow
      id="perception"
      index="7"
      areaId="perception"
      tone="light"
      title="Same brand, different eyes"
      media={
        <MediaRow
          items={[
            { kind: "image", src: "/chapter-2-1/web/story.webp", alt: "Our Story page on eatbetterco.com", ratio: 1.6, caption: "Our Story page, eatbetterco.com (screenshot)" },
            { kind: "image", src: "/chapter-2-1/web/laddoo.webp", alt: "Hazelnut Chocolate Laddoos product page on eatbetterco.com", ratio: 1.6, caption: "Product page, eatbetterco.com (screenshot)" },
          ]}
        />
      }
    />
  );
}

/* ── 8 · Activity: Brand Identity Lab (3D) ───────────────────── */

export function LabSection() {
  const complete = useActivities21((s) => s.complete);
  const stations = useRef(new Set<string>());
  return (
    <section id="lab" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="8" kicker="Activity · Brand Identity Lab" title="Audit a real Eat Better pack in 3D">
          Four stations in one studio, then sign your Brand Identity Audit.
        </SectionIntro>
        <div className="mt-6">
          <IconFlow
            nodes={[
              { icon: Package, title: "Packaging", text: "Find the identity elements on a real pack" },
              { icon: Palette, title: "Colour", text: "Test colours on a concept pack" },
              { icon: Megaphone, title: "Tone", text: "Tune the brand voice" },
              { icon: Users, title: "Shoppers", text: "Predict what fictional shoppers notice" },
            ]}
          />
        </div>
        <div className="mt-8">
          <IdentityLab
            onStation={(id) => {
              stations.current.add(id);
              if (stations.current.size >= 4) complete("lab");
            }}
          />
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Reflect ──────────────────────────────────────────────── */

const RKEY = "ebc-2.1-reflection";

export function Reflect() {
  const [pick, setPick] = useState<AreaId | null>(null);
  const [why, setWhy] = useState("");
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities21((s) => s.complete);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(RKEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore */
      if (v) {
        setPick(v.pick ?? null);
        setWhy(v.why ?? "");
      }
    } catch {
      /* storage blocked */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(RKEY, JSON.stringify({ pick, why }));
    } catch {
      /* ignore */
    }
  }, [pick, why, restored]);
  const ok = !!pick && why.trim().length >= 15;
  useEffect(() => {
    if (ok) complete("reflect");
  }, [ok, complete]);
  const area = AREAS.find((a) => a.id === pick);
  const summary = `Eat Better Co — Chapter 2.1 · Reflection\n\nThe part of Eat Better's identity that would make me pick it up first: ${area?.area ?? "—"}\nWhy: ${why.trim() || "—"}`;

  return (
    <section id="reflect" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="9" kicker="Activity · Reflect" title="What would make you pick it up?" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid grid-cols-3 gap-2">
            {AREAS.map((a) => {
              const Icon = ICONS[a.id];
              const on = pick === a.id;
              return (
                <button key={a.id} onClick={() => setPick(a.id)} aria-pressed={on} className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4 text-center transition-colors ${on ? "border-orange bg-orange text-white shadow-[2px_2px_0_0_#2f1c1a]" : "border-cocoa/15 bg-cream text-cocoa hover:border-cocoa"}`}>
                  <Icon className="size-7" />
                  <span className="text-[0.9rem] font-bold leading-tight">{a.area}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 rounded-[22px] bg-cream p-4">
            <ActivityLabel done={ok}>Your answer</ActivityLabel>
            <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} aria-label="Why?" placeholder={area ? `${area.area} matters to me because…` : "Pick a card first…"} className="w-full flex-1 rounded-2xl border border-line-strong bg-white px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
            <button
              disabled={!ok}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard blocked */
                }
              }}
              className="eb-btn eb-btn-primary self-start !py-2 !normal-case"
            >
              {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />} {copied ? "Copied" : "Copy my answer"}
            </button>
            <p className="text-[0.82rem] text-cocoa-2">Saved on this device only.</p>
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up: the six key learnings ───────────────────────────── */

const ACT: { id: ActivityId21; label: string }[] = [
  { id: "pack", label: "Match the pack to the moment" },
  { id: "lab", label: "3D Brand Identity Lab" },
];

export function WrapUp() {
  const done = useActivities21((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 2.1 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">Six things you now know</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a, i) => {
            const Icon = ICONS[a.id];
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }} className="flex items-start gap-3 rounded-2xl border border-cocoa/15 bg-cream p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <div className="font-display text-[1.1rem] font-semibold text-cocoa">{a.area}</div>
                  <p className="text-[0.98rem] leading-snug text-cocoa">
                    <GlossaryText>{a.learn}</GlossaryText>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-6 rounded-[22px] bg-peach/60 p-5">
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
      </Panel>
    </section>
  );
}
