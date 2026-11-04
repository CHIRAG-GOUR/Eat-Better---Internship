"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Camera,
  Check,
  Circle,
  ClipboardCopy,
  Clapperboard,
  Clock,
  Ear,
  Gift,
  Globe,
  Lightbulb,
  Mail,
  MessageCircle,
  MessagesSquare,
  Play,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { FlipCards, IconFlow, SplitStory, StatBand } from "@/components/rich";
import { Lab22, useActivities22, ACTIVITY_IDS } from "./practice";
import { LABS_22 } from "./labs";
import { COMMUNITY, MARKETS, OFFERS, OWNED, REVIEWS, SOCIAL, STORY, TAKEAWAY, THINK, VIDEOS } from "./content";

const GrowthDesk = dynamic(() => import("./three/GrowthDesk"), {
  ssr: false,
  loading: () => <div className="h-[360px] animate-pulse rounded-[24px] bg-[#FBE3CF] sm:h-[460px] lg:h-[560px]" />,
});

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

/** A supplied LMS image, shown unaltered with its caption. */
function Shot({ src, w, h, alt, caption, className = "" }: { src: string; w: number; h: number; alt: string; caption: string; className?: string }) {
  return (
    <motion.figure initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={className}>
      <Image src={src} alt={alt} width={w} height={h} sizes="(max-width: 1024px) 100vw, 640px" className="h-auto w-full rounded-2xl border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]" />
      <figcaption className="mt-2 text-[0.88rem] text-cocoa-2">{caption}</figcaption>
    </motion.figure>
  );
}

/* ── 1 · Community-first marketing ────────────────────────────── */

export function Community() {
  const icons = [Users, Ear, Wrench];
  return (
    <section id="community" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Community-first marketing" title="Listen before you sell">
          <GlossaryText>{COMMUNITY.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6">
          <SplitStory img="/chapter-1-3/exhibition-stall.webp" alt="A snack stall at an exhibition" kicker="Where it started" title="Exhibitions and direct selling">
            <div className="space-y-4">
              <Example>{COMMUNITY.example}</Example>
              <Concept>{COMMUNITY.concept}</Concept>
            </div>
          </SplitStory>
        </div>
        <div className="mt-8">
          <IconFlow nodes={COMMUNITY.loop.map((t, i) => ({ icon: icons[i], title: t }))} />
        </div>
        <div className="mt-6">
          <Lab22 spec={LABS_22.community} act="community" label="Community-first" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Owned digital channels ───────────────────────────────── */

export function Owned() {
  const icons = [Globe, Mail, BookOpen, Users];
  return (
    <section id="owned" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Owned digital channels" title="Channels the brand controls">
          <GlossaryText>{OWNED.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-start">
          <div className="space-y-4">
            <FlipCards cols={2} cards={OWNED.channels.map((c, i) => ({ front: c.name, back: c.line, icon: icons[i] }))} />
            <Example>{OWNED.example}</Example>
            <Concept>{OWNED.concept}</Concept>
          </div>
          <div className="space-y-5">
            <Shot src="/chapter-2-2/lms-2.png" w={866} h={731} alt="Product cards on the Eat Better Co website" caption="The official Eat Better Co website (screenshot)." />
            <VideoBlock kind="file" portrait h264={VIDEOS.perfectSnack.h264} poster={VIDEOS.perfectSnack.poster} title={VIDEOS.perfectSnack.title} caption="From Eat Better Co's own YouTube channel." />
          </div>
        </div>
        <div className="mt-6">
          <Lab22 spec={LABS_22.owned} act="owned" label="Owned channels" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Social media marketing ───────────────────────────────── */

function InstagramPost() {
  return (
    <figure>
      <Image src="/chapter-2-2/lms-3.png" alt="Eat Better Co's founders with their products — an Instagram post" width={800} height={1067} sizes="(max-width: 640px) 100vw, 340px" className="mx-auto h-auto w-full max-w-[340px] rounded-2xl border border-cocoa shadow-[4px_4px_0_0_#ff5c00]" />
      <figcaption className="mt-2 text-center text-[0.88rem] text-cocoa-2">
        A post from Eat Better Co on Instagram.{" "}
        <a href={`https://www.instagram.com/p/${VIDEOS.instagramPost}/`} target="_blank" rel="noopener noreferrer" className="pointer-events-auto font-bold text-orange underline underline-offset-2">
          View on Instagram
        </a>
      </figcaption>
    </figure>
  );
}

export function Social() {
  const icons = [Camera, Clapperboard, MessagesSquare, Briefcase];
  return (
    <section id="social" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Social media marketing" title="One brand, four platforms">
          <GlossaryText>{SOCIAL.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6">
          <FlipCards cols={4} cards={SOCIAL.platforms.map((p, i) => ({ front: p.name, back: p.line, icon: icons[i] }))} />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <VideoBlock kind="file" portrait h264={VIDEOS.reel.h264} poster={VIDEOS.reel.poster} title={VIDEOS.reel.title} caption="Instagram: a reel from Eat Better Co." />
          <VideoBlock kind="file" portrait av1={VIDEOS.factory.av1} h264={VIDEOS.factory.h264} poster={VIDEOS.factory.poster} title={VIDEOS.factory.title} caption="YouTube: a Short from Eat Better Co." />
          <InstagramPost />
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <Example>{SOCIAL.example}</Example>
          <Concept>{SOCIAL.concept}</Concept>
        </div>
        <div className="mt-6">
          <Lab22 spec={LABS_22.social} act="social" label="Social platforms" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Brand storytelling & transparency ────────────────────── */

export function Story() {
  const icons = [Users, Play, Store];
  return (
    <section id="story" className={sectionCls}>
      <Panel tone="dark" reveal="up" width="max-w-7xl">
        <SectionIntro index="4" kicker="Brand storytelling & transparency" title="Story, purpose, people" tone="dark">
          <GlossaryText>{STORY.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
          <VideoBlock kind="file" portrait av1={VIDEOS.sharks.av1} h264={VIDEOS.sharks.h264} poster={VIDEOS.sharks.poster} title={VIDEOS.sharks.title} caption="From Eat Better Co's own YouTube channel." />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {STORY.points.map((p, i) => {
                const Icon = icons[i];
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-2 rounded-2xl bg-cream p-3 text-center text-cocoa">
                    <span className="grid size-12 place-items-center rounded-full bg-orange text-white">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-[0.95rem] font-bold leading-tight">{p.label}</span>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-[1.02rem] leading-relaxed text-cream/90">
              <GlossaryText>{STORY.detail}</GlossaryText>
            </p>
            <Example>{STORY.example}</Example>
            <div className="rounded-2xl bg-haldi p-4 text-cocoa">
              <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em]">Key concept</div>
              <p className="mt-1 text-[1.02rem] font-semibold leading-snug">
                <GlossaryText>{STORY.concept}</GlossaryText>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Lab22 spec={LABS_22.story} act="story" label="Brand story" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 5 · Customer reviews & ratings ───────────────────────────── */

export function Reviews() {
  const icons = [Users, ShieldCheck, Check];
  return (
    <section id="reviews" className={sectionCls}>
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="5" kicker="Customer reviews & ratings" title="Other buyers, before you buy">
          <GlossaryText>{REVIEWS.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
          <div className="rounded-[22px] border border-cocoa bg-white p-5 shadow-[3px_3px_0_0_#2f1c1a]">
            <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">What a shopper compares</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {REVIEWS.compare.map((c, i) => {
                const Icon = [Star, MessageCircle, Gift, Truck][i];
                return (
                  <div key={c} className="flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-2.5 text-[0.98rem] font-bold text-cocoa">
                    <Icon className="size-5 shrink-0 text-orange" /> {c}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-error/15 text-error">
                <Wrench className="size-5" />
              </span>
              <p className="text-[0.98rem] leading-snug text-cocoa">
                <GlossaryText>{REVIEWS.negative}</GlossaryText>
              </p>
            </div>
            <Shot src="/chapter-2-2/lms-4.png" w={1092} h={680} alt="A customer review of an Eat Better product on Amazon" caption="A customer review on Amazon (screenshot)." className="mt-4" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {REVIEWS.roles.map((r, i) => {
                const Icon = icons[i];
                return (
                  <motion.div key={r} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-2 rounded-2xl border border-cocoa/15 bg-cream p-3 text-center">
                    <span className="grid size-11 place-items-center rounded-full bg-success text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-[0.92rem] font-bold leading-tight text-cocoa">
                      <GlossaryText>{r}</GlossaryText>
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <Example>{REVIEWS.example}</Example>
            <Concept>{REVIEWS.concept}</Concept>
          </div>
        </div>
        <div className="mt-6">
          <Lab22 spec={LABS_22.reviews} act="reviews" label="Reviews & replies" />
        </div>
      </Panel>
    </section>
  );
}

/* ── 6 · Offers & conversion — free-shipping basket ───────────── */

export function Offers() {
  const icons = [Gift, Truck, Clock];
  return (
    <section id="offers" className={sectionCls}>
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="6" kicker="Offers & conversion strategies" title="A reason to buy today">
          <GlossaryText>{OFFERS.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6">
          <FlipCards cols={3} cards={OFFERS.types.map((t, i) => ({ front: t.name, back: t.line, icon: icons[i] }))} />
        </div>
        <div className="mt-6">
          <StatBand
            tone="cocoa"
            stats={[
              { value: OFFERS.basket, prefix: "₹", label: "The customer's basket", icon: ShoppingCart, note: "From the chapter's example" },
              { value: OFFERS.threshold, prefix: "₹", label: "Free shipping on orders above", icon: Truck, note: "From the chapter's example" },
            ]}
          />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <Lab22 spec={LABS_22.offers} act="basket" label="Offers & margin" />
          <div className="space-y-4">
            <Example>{OFFERS.example}</Example>
            <Concept>{OFFERS.concept}</Concept>
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 7 · Marketplaces & quick commerce ────────────────────────── */

export function Markets() {
  return (
    <section id="markets" className={sectionCls}>
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <SectionIntro index="7" kicker="Marketplaces & quick commerce" title="Many doors to the same snack">
          <GlossaryText>{MARKETS.text}</GlossaryText>
        </SectionIntro>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <motion.figure initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[2px_2px_0_0_#2f1c1a]">
            <div className="relative aspect-[16/10]">
              <Image src="/chapter-1-1/art/order-online.webp" alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </div>
            <figcaption className="flex items-center gap-2 p-3 font-display text-[1.1rem] font-semibold text-cocoa">
              <Globe className="size-5 text-orange" /> Own website
            </figcaption>
          </motion.figure>
          {MARKETS.places.map((p, i) => (
            <motion.figure key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i + 1) * 0.1 }} className="overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[2px_2px_0_0_#2f1c1a]">
              <div className="relative aspect-[16/10]">
                <Image src={i === 0 ? "/chapter-1-2/frames/shipping-box.webp" : "/chapter-1-2/quick-delivery.webp"} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <figcaption className="p-3">
                <div className="flex items-center gap-2 font-display text-[1.1rem] font-semibold text-cocoa">
                  {i === 0 ? <ShoppingCart className="size-5 text-orange" /> : <Zap className="size-5 text-orange" />} {p.name}
                </div>
                <p className="mt-1 text-[0.95rem] leading-snug text-cocoa-2">
                  <GlossaryText>{p.line}</GlossaryText>
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {MARKETS.considerations.map((c) => (
            <span key={c} className="rounded-full border border-cocoa bg-white px-3.5 py-1.5 text-[0.95rem] font-bold text-cocoa">
              <GlossaryText>{c}</GlossaryText>
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="space-y-5">
            <VideoBlock kind="youtube" id={VIDEOS.sharkTank.id} poster="/chapter-1-3/shark-tank-thumb.jpg" title={VIDEOS.sharkTank.title} caption="Shark Tank India, Season 4 (Sony LIV on YouTube) — plays from YouTube." />
            <Shot src="/chapter-2-2/lms-5.png" w={1181} h={497} alt="Eat Better namkeens in quick-commerce app search results" caption="Quick-commerce listings (screenshot); prices vary." />
          </div>
          <div className="space-y-4">
            <Example>{MARKETS.example}</Example>
            <Concept>{MARKETS.concept}</Concept>
          </div>
        </div>
        <div className="mt-6">
          <Lab22 spec={LABS_22.markets} act="markets" label="Sales channels" />
        </div>
      </Panel>
    </section>
  );
}

/* ── Activity: D2C Growth Desk ────────────────────────────────── */

export function DeskSection() {
  const complete = useActivities22((s) => s.complete);
  return (
    <section id="growth-desk" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="8" kicker="Activity · D2C Growth Desk" title="Run a two-week launch">
          Pick channels, answer reviews, set an offer — then watch shoppers flow. A fictional practice launch with simulated numbers.
        </SectionIntro>
        <div className="mt-6">
          <GrowthDesk onComplete={() => complete("desk")} />
        </div>
      </Panel>
    </section>
  );
}

/* ── Think & discuss ──────────────────────────────────────────── */

const KEY = "ebc-2.2-reflection";
const SIDES = [
  { id: "celebrity", label: "A celebrity ad", icon: Star },
  { id: "reviews", label: "500 real reviews", icon: Users },
];

export function Think() {
  const [side, setSide] = useState<string | null>(null);
  const [why, setWhy] = useState("");
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities22((s) => s.complete);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (s) {
        setSide(s.side ?? null);
        setWhy(s.why ?? "");
      }
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ side, why }));
    } catch {
      /* ignore */
    }
  }, [side, why, restored]);
  const ok = !!side && why.trim().length >= 15;
  useEffect(() => {
    if (ok) complete("reflect");
  }, [ok, complete]);
  const summary = `Eat Better Co — Chapter 2.2 · Think & Discuss\n\n${THINK.q}\nMy pick: ${SIDES.find((s) => s.id === side)?.label ?? "—"}\nWhy: ${why.trim() || "—"}`;

  return (
    <section id="think" className={sectionCls}>
      <Panel tone="peach" reveal="right" width="max-w-7xl">
        <SectionIntro index="9" kicker="Think & Discuss" title="Ads or real voices?" />
        <h3 className="mt-6 font-display text-[1.4rem] font-semibold leading-snug text-cocoa">{THINK.q}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {SIDES.map((s) => {
            const Icon = s.icon;
            const on = side === s.id;
            return (
              <button key={s.id} onClick={() => setSide(s.id)} aria-pressed={on} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-colors ${on ? "border-orange bg-orange text-white shadow-[3px_3px_0_0_#2f1c1a]" : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}>
                <Icon className="size-8" />
                <span className="font-display text-[1.2rem] font-semibold">{s.label}</span>
              </button>
            );
          })}
        </div>
        <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} aria-label="Why?" placeholder={side ? "Because…" : "Pick one first…"} className="mt-3 w-full rounded-2xl border border-line-strong bg-white px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
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
            className="eb-btn eb-btn-primary"
          >
            {copied ? <Check className="size-5" /> : <ClipboardCopy className="size-5" />} {copied ? "Copied" : "Copy my answer"}
          </button>
          <span className="text-[0.92rem] text-cocoa-2">Saved on this device only.</span>
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP: { title: string; icon: LucideIcon }[] = [
  { title: "Listen first", icon: Ear },
  { title: "Own the channel", icon: Globe },
  { title: "Pick platforms", icon: Camera },
  { title: "Tell the story", icon: Play },
  { title: "Earn reviews", icon: Star },
  { title: "Offer wisely", icon: Gift },
  { title: "Sell everywhere", icon: ShoppingCart },
];
const ACT: { id: (typeof ACTIVITY_IDS)[number]; label: string }[] = [
  { id: "community", label: "Lab · Feedback into improvement" },
  { id: "owned", label: "Lab · Owned channels" },
  { id: "social", label: "Lab · Social platforms" },
  { id: "story", label: "Lab · Brand story arc" },
  { id: "reviews", label: "Lab · Reply to a review" },
  { id: "basket", label: "Lab · Offers vs margin" },
  { id: "markets", label: "Lab · Sales channels" },
  { id: "desk", label: "Capstone · D2C Growth Desk" },
  { id: "reflect", label: "Think & Discuss" },
];

export function WrapUp() {
  const done = useActivities22((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className={sectionCls}>
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 2.2 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">More than ads</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
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
        <p className="mt-5 max-w-3xl font-display text-[1.2rem] leading-snug text-cocoa">{TAKEAWAY}</p>
        <div className="mt-6 rounded-[22px] bg-peach/70 p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[1.2rem] font-semibold text-cocoa">Activities on this page</span>
            <span className="font-bold text-cocoa-2">
              {n}/{ACT.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
