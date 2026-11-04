"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  ArrowDown,
  BookOpen,
  Briefcase,
  Camera,
  Check,
  Clapperboard,
  Globe,
  Mail,
  MessagesSquare,
  Package,
  RotateCcw,
  ShoppingBasket,
  ShoppingCart,
  Star,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ActivityLabel } from "@/components/chapter/SectionIntro";
import { createActivityStore } from "@/lib/activities";
import { OFFERS } from "./content";

/**
 * Chapter 2.2 hands-on practice — one short activity per part of the chapter. Everything here is
 * FICTIONAL practice data (feedback, products, prices, reviews, customers) and labelled in the UI.
 * Answers are summarised into the Growth Plan report.
 */

export const ACTIVITY_IDS = ["community", "owned", "social", "story", "reviews", "basket", "markets", "desk", "reflect"] as const;
export const useActivities22 = createActivityStore(ACTIVITY_IDS);

/** What the student decided in each practice activity (feeds the Growth Plan). */
export const usePractice22 = create<{ notes: Record<string, string>; note: (k: string, v: string) => void }>((set) => ({
  notes: {},
  note: (k, v) => set((s) => ({ notes: { ...s.notes, [k]: v } })),
}));

function Card({ id, title, children, done }: { id: string; title: string; children: React.ReactNode; done: boolean }) {
  return (
    <div id={`act-${id}`} className="rounded-[22px] border border-cocoa bg-white p-4 shadow-[3px_3px_0_0_#2f1c1a] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ActivityLabel done={done}>{title}</ActivityLabel>
        <span className="rounded-full bg-peach px-2.5 py-0.5 text-[0.75rem] font-bold text-cocoa-2">Practice · fictional</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/* ── generic sorter: put each card in the right place ─────────── */

type SortItem = { id: string; text: string; answer: string; why: string };
type Target = { id: string; label: string; icon: LucideIcon };

function Sorter({ act, title, prompt, items, targets, noteKey }: { act: (typeof ACTIVITY_IDS)[number]; title: string; prompt: string; items: SortItem[]; targets: Target[]; noteKey: string }) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [tries, setTries] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const complete = useActivities22((s) => s.complete);
  const note = usePractice22((s) => s.note);
  const current = items.find((i) => !placed[i.id]);
  const done = !current;
  useEffect(() => {
    if (done) {
      complete(act);
      note(noteKey, `${items.length}/${items.length} placed${tries ? ` (${tries} retr${tries > 1 ? "ies" : "y"})` : " first time"}`);
    }
  }, [done, act, complete, note, noteKey, items.length, tries]);
  const last = Object.keys(placed).length ? items.find((i) => i.id === Object.keys(placed).slice(-1)[0]) : null;

  return (
    <Card id={act} title={title} done={done}>
      <p className="text-[1rem] text-cocoa-2">{prompt}</p>
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div key={current.id} initial={{ opacity: 0, x: 24 }} animate={miss === current.id ? { opacity: 1, x: [0, -8, 8, -4, 0] } : { opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="mt-3 rounded-2xl bg-cream p-4">
            <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-orange">
              {Object.keys(placed).length + 1} of {items.length}
            </div>
            <p className="mt-1 font-display text-[1.15rem] font-semibold leading-snug text-cocoa">{current.text}</p>
          </motion.div>
        ) : (
          <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-2xl bg-success/10 p-4 text-[1rem] font-bold text-success">
            All placed. Nice work.
          </motion.p>
        )}
      </AnimatePresence>
      <div className={`mt-3 grid gap-2 ${targets.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {targets.map((t) => {
          const Icon = t.icon;
          const count = items.filter((i) => placed[i.id] === t.id).length;
          return (
            <button
              key={t.id}
              disabled={done}
              onClick={() => {
                if (!current) return;
                if (current.answer === t.id) {
                  setPlaced((p) => ({ ...p, [current.id]: t.id }));
                  setMiss(null);
                } else {
                  setTries((n) => n + 1);
                  setMiss(current.id);
                }
              }}
              className="relative flex flex-col items-center gap-1.5 rounded-2xl border-2 border-cocoa/15 bg-white px-2 py-3 text-center transition-colors hover:border-orange disabled:opacity-70"
            >
              <span className="grid size-10 place-items-center rounded-full bg-orange text-white">
                <Icon className="size-5" />
              </span>
              <span className="text-[0.88rem] font-bold leading-tight text-cocoa">{t.label}</span>
              {count > 0 && <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-success text-[0.75rem] font-bold text-white">{count}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-2 min-h-[1.6rem] text-[0.95rem]" aria-live="polite">
        {miss && current ? <span className="font-bold text-error">Not quite — think about what that channel is for.</span> : last ? <span className="text-cocoa"><Check className="mr-1 inline size-4 text-success" />{last.why}</span> : null}
      </div>
      {done && (
        <button onClick={() => (setPlaced({}), setTries(0))} className="mt-1 flex items-center gap-1.5 text-[0.9rem] font-bold text-cocoa-2 hover:text-orange">
          <RotateCcw className="size-4" /> Try again
        </button>
      )}
    </Card>
  );
}

/* ── 1 · Community-first: feedback → product idea ─────────────── */

const FEEDBACK = [
  { id: "small", text: "Smaller packs at affordable prices", n: 7 },
  { id: "flavours", text: "More flavours", n: 3 },
  { id: "salt", text: "A little less salt", n: 2 },
  { id: "box", text: "A fancier box", n: 1 },
];
const IDEAS = [
  { id: "trial", text: "A small, affordable trial pack", fits: "small" },
  { id: "family", text: "A bigger family pack", fits: "" },
  { id: "luxury", text: "A luxury gift box", fits: "box" },
];

export function CommunityPractice() {
  const [fb, setFb] = useState<string | null>(null);
  const [idea, setIdea] = useState<string | null>(null);
  const complete = useActivities22((s) => s.complete);
  const note = usePractice22((s) => s.note);
  const top = FEEDBACK[0].id;
  const good = fb === top && IDEAS.find((i) => i.id === idea)?.fits === top;
  useEffect(() => {
    if (good) {
      complete("community");
      note("community", "Acted on the most-heard feedback: smaller, affordable packs → a trial-size pack.");
    }
  }, [good, complete, note]);
  return (
    <Card id="community" title="Activity · Turn feedback into a product idea" done={good}>
      <p className="text-[1rem] text-cocoa-2">Visitors at your exhibition stall said this (times heard). Which will you act on?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {FEEDBACK.map((f) => (
          <button key={f.id} onClick={() => (setFb(f.id), setIdea(null))} aria-pressed={fb === f.id} className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left ${fb === f.id ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
            <span className="flex gap-0.5">
              {Array.from({ length: f.n }, (_, i) => (
                <span key={i} className="h-6 w-1.5 rounded-full bg-orange" />
              ))}
            </span>
            <span className="flex-1 text-[0.98rem] font-bold text-cocoa">{f.text}</span>
            <span className="font-display text-[1.1rem] font-semibold text-cocoa-2">×{f.n}</span>
          </button>
        ))}
      </div>
      {fb && fb !== top && <p className="mt-2 text-[0.95rem] font-bold text-error">Listen to what most people asked for first.</p>}
      {fb === top && (
        <>
          <div className="mt-3 flex items-center gap-2 text-[0.95rem] font-bold text-cocoa">
            <ArrowDown className="size-4 text-orange" /> Now pick the product idea it leads to
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {IDEAS.map((i) => (
              <button key={i.id} onClick={() => setIdea(i.id)} aria-pressed={idea === i.id} className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-[0.95rem] font-bold ${idea === i.id ? (i.fits === top ? "border-success bg-success/10" : "border-error bg-error/10") : "border-cocoa/15 bg-white hover:border-cocoa"} text-cocoa`}>
                <Package className="size-5 shrink-0 text-orange" /> {i.text}
              </button>
            ))}
          </div>
          {idea && <p className={`mt-2 text-[0.95rem] font-bold ${good ? "text-success" : "text-error"}`}>{good ? "Feedback became a new product size — listen first, then improve." : "That doesn't answer what customers asked for."}</p>}
        </>
      )}
    </Card>
  );
}

/* ── 2 · Owned channels: route the message ────────────────────── */

const OWNED_T: Target[] = [
  { id: "website", label: "Website", icon: Globe },
  { id: "email", label: "Email list", icon: Mail },
  { id: "blog", label: "The Conscious Eater", icon: BookOpen },
  { id: "squad", label: "Squad", icon: Users },
];
export function OwnedPractice() {
  return (
    <Sorter
      act="owned"
      noteKey="owned"
      title="Activity · Route the message"
      prompt="Where should each message go?"
      targets={OWNED_T}
      items={[
        { id: "o1", text: "Full ingredient list and a Buy button for a snack", answer: "website", why: "The website shows products, prices, ingredients and buying options." },
        { id: "o2", text: "\"Our new snack launches next week!\" to past customers", answer: "email", why: "The email list keeps customers informed about new products, offers and updates." },
        { id: "o3", text: "An article: how to read a snack label", answer: "blog", why: "The Conscious Eater blog educates readers about food and conscious snacking." },
        { id: "o4", text: "\"Join us and be the first to hear from the brand\"", answer: "squad", why: "The Squad invites visitors into the brand's customer community." },
      ]}
    />
  );
}

/* ── 3 · Social: match content to platform ────────────────────── */

const SOCIAL_T: Target[] = [
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "youtube", label: "YouTube", icon: Clapperboard },
  { id: "facebook", label: "Facebook", icon: MessagesSquare },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
];
export function SocialPractice() {
  return (
    <Sorter
      act="social"
      noteKey="social"
      title="Activity · Pick the platform"
      prompt="Each idea has a best home. Match it by purpose."
      targets={SOCIAL_T}
      items={[
        { id: "s1", text: "A 15-second reel: a snack during a work break", answer: "instagram", why: "Instagram: product visuals, reels, collaborations, engagement." },
        { id: "s2", text: "A 10-minute founder story about starting the brand", answer: "youtube", why: "YouTube: longer videos and founder stories." },
        { id: "s3", text: "A community group post about a weekend offer", answer: "facebook", why: "Facebook: community interaction, promotions and reach." },
        { id: "s4", text: "\"We just opened a bigger kitchen\" — a business update", answer: "linkedin", why: "LinkedIn: business updates, founder insights, professional networking." },
      ]}
    />
  );
}

/* ── 4 · Storytelling: build the story arc ────────────────────── */

const ARC = [
  { id: "a1", text: "A family problem: tasty or healthy — never both" },
  { id: "a2", text: "So the founder started cooking better snacks at home" },
  { id: "a3", text: "From a home kitchen to a big factory" },
  { id: "a4", text: "Come and see: book a kitchen tour" },
];
const ARC_SHUFFLED = [ARC[2], ARC[0], ARC[3], ARC[1]];

export function StoryPractice() {
  const [order, setOrder] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const complete = useActivities22((s) => s.complete);
  const note = usePractice22((s) => s.note);
  const done = order.length === ARC.length;
  useEffect(() => {
    if (done) {
      complete("story");
      note("story", "Built the arc: problem → purpose → journey → transparency (kitchen tour).");
    }
  }, [done, complete, note]);
  return (
    <Card id="story" title="Activity · Build the founder story" done={done}>
      <p className="text-[1rem] text-cocoa-2">Tap the scenes in story order.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ARC_SHUFFLED.map((a) => {
          const pos = order.indexOf(a.id);
          return (
            <motion.button
              key={a.id}
              disabled={pos >= 0}
              animate={miss === a.id ? { x: [0, -8, 8, -4, 0] } : { x: 0 }}
              onClick={() => {
                if (ARC[order.length].id === a.id) {
                  setOrder((o) => [...o, a.id]);
                  setMiss(null);
                } else setMiss(a.id);
              }}
              className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left text-[0.98rem] font-bold ${pos >= 0 ? "border-success bg-success/10" : "border-cocoa/15 bg-white hover:border-cocoa"} text-cocoa`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-full font-display ${pos >= 0 ? "bg-success text-white" : "bg-peach text-cocoa-2"}`}>{pos >= 0 ? pos + 1 : "?"}</span>
              {a.text}
            </motion.button>
          );
        })}
      </div>
      <p className="mt-2 min-h-[1.5rem] text-[0.95rem] font-bold" aria-live="polite">
        {done ? <span className="text-success">Story, purpose, people — and an open kitchen to back it up.</span> : miss ? <span className="text-error">What comes first in a story?</span> : null}
      </p>
      {done && (
        <button onClick={() => setOrder([])} className="flex items-center gap-1.5 text-[0.9rem] font-bold text-cocoa-2 hover:text-orange">
          <RotateCcw className="size-4" /> Try again
        </button>
      )}
    </Card>
  );
}

/* ── 5 · Reviews: compare + reply ─────────────────────────────── */

const PAGES = [
  { id: "x", name: "Snack X", rating: 4.4, count: "1,200 reviews", mentions: ["Taste", "Packaging", "Delivery"] },
  { id: "y", name: "Snack Y", rating: 4.8, count: "6 reviews", mentions: ["Taste"] },
];
const REPLIES = [
  { id: "r1", text: "Thank them, apologise, and say how you'll fix the packing", good: true },
  { id: "r2", text: "Reply: \"It was fine when it left us.\"", good: false },
  { id: "r3", text: "Hide the review", good: false },
];

export function ReviewsPractice() {
  const [page, setPage] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const complete = useActivities22((s) => s.complete);
  const note = usePractice22((s) => s.note);
  const good = page === "x" && !!REPLIES.find((r) => r.id === reply)?.good;
  useEffect(() => {
    if (good) {
      complete("reviews");
      note("reviews", "Trusted many detailed reviews over a few perfect ones; replied constructively to a complaint.");
    }
  }, [good, complete, note]);
  return (
    <Card id="reviews" title="Activity · Read the reviews, then reply" done={good}>
      <p className="text-[1rem] text-cocoa-2">Two practice product pages. Which gives you more confidence?</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {PAGES.map((p) => (
          <button key={p.id} onClick={() => setPage(p.id)} aria-pressed={page === p.id} className={`rounded-2xl border-2 p-3 text-left ${page === p.id ? (p.id === "x" ? "border-success bg-success/10" : "border-error bg-error/10") : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
            <div className="font-display text-[1.1rem] font-semibold text-cocoa">{p.name}</div>
            <div className="mt-1 flex items-center gap-1 text-[0.95rem] font-bold text-cocoa">
              <Star className="size-4 fill-haldi text-[#C9A400]" /> {p.rating} · <span className="text-cocoa-2">{p.count}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.mentions.map((m) => (
                <span key={m} className="rounded-full bg-peach px-2 py-0.5 text-[0.78rem] font-bold text-cocoa-2">
                  {m}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      {page === "y" && <p className="mt-2 text-[0.95rem] font-bold text-error">Six perfect reviews tell you less than many detailed ones.</p>}
      {page === "x" && (
        <>
          <div className="mt-4 rounded-2xl bg-cream p-3">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`size-4 ${i < 2 ? "fill-haldi text-[#C9A400]" : "text-cocoa/20"}`} />
              ))}
            </div>
            <p className="mt-1 font-display text-[1.05rem] font-medium text-cocoa">&ldquo;Loved the taste, but the box arrived damaged.&rdquo;</p>
          </div>
          <div className="mt-2 grid gap-2">
            {REPLIES.map((r) => (
              <button key={r.id} onClick={() => setReply(r.id)} aria-pressed={reply === r.id} className={`rounded-xl border-2 px-3 py-2 text-left text-[0.95rem] font-bold text-cocoa ${reply === r.id ? (r.good ? "border-success bg-success/10" : "border-error bg-error/10") : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                {r.text}
              </button>
            ))}
          </div>
          {reply && <p className={`mt-2 text-[0.95rem] font-bold ${good ? "text-success" : "text-error"}`}>{good ? "Negative feedback, used constructively." : "That loses the customer — and everyone reading."}</p>}
        </>
      )}
    </Card>
  );
}

/* ── 6 · Offers: basket builder with AOV vs margin ────────────── */

/** PRACTICE items with made-up prices (not Eat Better's real prices). */
const ADDONS = [
  { id: "a", name: "Snack pack A", price: 59, img: "/brand/products/millet-bhujia-0.webp" },
  { id: "b", name: "Snack pack B", price: 119, img: "/brand/products/hazelnut-laddoo-0.webp" },
  { id: "c", name: "Snack pack C", price: 149, img: "/brand/products/trail-mix-0.webp" },
];

export function BasketPractice() {
  const [added, setAdded] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);
  const complete = useActivities22((s) => s.complete);
  const note = usePractice22((s) => s.note);
  const total = OFFERS.basket + ADDONS.filter((a) => added.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const free = total > OFFERS.threshold;
  // simulated: base margin 40%; free shipping absorbed costs 4 pts; every 10% discount costs 9 pts
  const margin = Math.max(4, 40 - (free ? 4 : 0) - discount * 0.9);
  useEffect(() => {
    if (free) {
      complete("basket");
      note("basket", `Basket grew from ₹${OFFERS.basket} to ₹${total} to unlock free shipping; extra discount ${discount}% → simulated margin ${Math.round(margin)}%.`);
    }
  }, [free, complete, note, total, discount, margin]);
  return (
    <Card id="basket" title="Activity · Reach free shipping" done={free}>
      <div className="flex items-center gap-3">
        <ShoppingBasket className="size-9 shrink-0 text-orange" />
        <div className="flex-1">
          <div className="relative h-5 overflow-hidden rounded-full bg-cocoa/10">
            <motion.div className={`h-full rounded-full ${free ? "bg-success" : "bg-orange"}`} animate={{ width: `${Math.min(100, (total / 650) * 100)}%` }} />
            <span className="absolute inset-y-0 border-l-2 border-dashed border-cocoa" style={{ left: `${(OFFERS.threshold / 650) * 100}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[0.85rem] font-bold text-cocoa-2">
            <span>Basket ₹{total}</span>
            <span>Free shipping above ₹{OFFERS.threshold}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {ADDONS.map((a) => {
          const on = added.includes(a.id);
          return (
            <button key={a.id} onClick={() => setAdded((x) => (on ? x.filter((y) => y !== a.id) : [...x, a.id]))} aria-pressed={on} className={`overflow-hidden rounded-2xl border-2 text-left transition-colors ${on ? "border-orange" : "border-cocoa/15 hover:border-cocoa"}`}>
              <span className="relative block aspect-square">
                <Image src={a.img} alt="" fill sizes="160px" className="object-cover" />
                {on && (
                  <span className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-orange text-white">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="block px-2 py-1.5 text-[0.88rem] font-bold text-cocoa">
                {a.name} · ₹{a.price}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl bg-cream p-3">
          <span className="flex justify-between text-[0.85rem] font-extrabold uppercase tracking-[0.06em] text-cocoa-2">
            Extra discount <span className="text-orange">{discount}%</span>
          </span>
          <input type="range" min={0} max={40} step={10} value={discount} onChange={(e) => setDiscount(+e.target.value)} className="mt-2 w-full accent-[#ff5c00]" />
        </label>
        <div className="rounded-xl bg-cream p-3">
          <div className="flex justify-between text-[0.85rem] font-extrabold uppercase tracking-[0.06em] text-cocoa-2">
            Margin (simulated) <span className={margin >= 30 ? "text-success" : margin >= 20 ? "text-[#9A7B00]" : "text-error"}>{Math.round(margin)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-cocoa/10">
            <motion.div className={`h-full rounded-full ${margin >= 30 ? "bg-success" : margin >= 20 ? "bg-haldi" : "bg-error"}`} animate={{ width: `${(margin / 40) * 100}%` }} />
          </div>
        </div>
      </div>
      <p className={`mt-3 text-[0.98rem] font-bold ${free ? "text-success" : "text-cocoa-2"}`}>
        {free ? `Free shipping unlocked — the order grew from ₹${OFFERS.basket} to ₹${total}.${discount >= 30 ? " But that big discount is eating the margin." : ""}` : `A ₹${OFFERS.basket} basket. Add a snack to cross ₹${OFFERS.threshold}.`}
      </p>
    </Card>
  );
}

/* ── 7 · Marketplaces & quick commerce: where should they buy? ── */

const PLACES = [
  { id: "web", label: "Brand website", icon: Globe, tradeoff: "Full margin and you keep the customer relationship — but they must find you." },
  { id: "amazon", label: "Amazon", icon: ShoppingCart, tradeoff: "Easy discovery — but platform fees, competition right next to you, less control." },
  { id: "quick", label: "Quick commerce", icon: Zap, tradeoff: "Delivered in minutes — but fees, availability limits and thinner margins." },
];
const BUYERS = [
  { id: "b1", text: "Saw a reel and wants the full range plus the Squad updates", best: "web" },
  { id: "b2", text: "Needs a snack at home in 15 minutes, right now", best: "quick" },
  { id: "b3", text: "Shops everything on one big marketplace and compares brands", best: "amazon" },
];

export function MarketsPractice() {
  const [pick, setPick] = useState<Record<string, string>>({});
  const complete = useActivities22((s) => s.complete);
  const note = usePractice22((s) => s.note);
  const done = BUYERS.every((b) => pick[b.id]);
  const fits = BUYERS.filter((b) => pick[b.id] === b.best).length;
  useEffect(() => {
    if (done) {
      complete("markets");
      note("markets", `Matched ${fits}/3 fictional customers to their best channel, weighing fees, margins and control.`);
    }
  }, [done, fits, complete, note]);
  return (
    <Card id="markets" title="Activity · Where will they buy?" done={done}>
      <p className="text-[1rem] text-cocoa-2">Choose a channel for each fictional customer — and see the trade-off.</p>
      <div className="mt-3 grid gap-3">
        {BUYERS.map((b) => {
          const p = PLACES.find((x) => x.id === pick[b.id]);
          return (
            <div key={b.id} className="rounded-2xl bg-cream p-3">
              <p className="font-display text-[1.05rem] font-semibold leading-snug text-cocoa">{b.text}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {PLACES.map((pl) => {
                  const Icon = pl.icon;
                  const on = pick[b.id] === pl.id;
                  return (
                    <button key={pl.id} onClick={() => setPick((x) => ({ ...x, [b.id]: pl.id }))} aria-pressed={on} className={`flex flex-col items-center gap-1 rounded-xl border-2 px-1.5 py-2 text-[0.85rem] font-bold leading-tight ${on ? (pl.id === b.best ? "border-success bg-success/10" : "border-[#C9A400] bg-haldi/20") : "border-cocoa/15 bg-white hover:border-cocoa"} text-cocoa`}>
                      <Icon className="size-5 text-orange" /> {pl.label}
                    </button>
                  );
                })}
              </div>
              {p && (
                <p className="mt-2 flex gap-1.5 text-[0.92rem] leading-snug text-cocoa">
                  {pick[b.id] === b.best ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <X className="mt-0.5 size-4 shrink-0 text-[#9A7B00]" />}
                  {pick[b.id] === b.best ? "Best fit. " : "Possible, but not the best fit. "}
                  {p.tradeoff}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
