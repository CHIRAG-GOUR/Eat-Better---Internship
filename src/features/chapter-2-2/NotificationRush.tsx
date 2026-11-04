"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Briefcase, Check, Flame, Heart, Mail, MessageCircle, Megaphone, RotateCcw, ShoppingCart, Star, Store, Timer, TimerOff, Trophy, Users, X, Zap, type LucideIcon } from "lucide-react";
import { Sprout } from "@/components/icons/EbIcons";

/**
 * Notification Rush — a timed game. Fictional notifications slide onto a phone; the student picks the
 * response the chapter recommends. Correct = points + streak + meter; wrong = a heart lost and a one-line
 * "why" from the chapter. Three rounds follow the chapter's arc: reach → trust → the second order.
 * Every message is FICTIONAL practice material; rules quote the 2.2 chapter text.
 */

type Opt = { text: string; ok: boolean; why: string };
type Note = { id: string; from: string; icon: LucideIcon; text: string; options: Opt[] };
type Meter = "reach" | "trust" | "repeat";
const ROUNDS: { title: string; goal: string; meter: Meter; cards: Note[] }[] = [
  {
    title: "Round 1 · Reach new people",
    goal: "Pick the platform that fits each content idea.",
    meter: "reach",
    cards: [
      { id: "reel", from: "Content team", icon: Megaphone, text: "Idea: a short reel of a snack being enjoyed during a work break.", options: [{ text: "Instagram", ok: true, why: "Instagram: product visuals, reels, collaborations and engagement." }, { text: "LinkedIn", ok: false, why: "LinkedIn is for business updates and founder insights, not snack reels." }, { text: "Email list", ok: false, why: "Email keeps existing customers informed — a reel is for reaching new people." }] },
      { id: "founder", from: "Founder", icon: Users, text: "I want to tell the full 10-minute story of building our factory.", options: [{ text: "YouTube", ok: true, why: "YouTube: longer videos and founder stories." }, { text: "Facebook promotion", ok: false, why: "Promotions are short offers; a 10-minute story needs YouTube." }, { text: "Instagram reel", ok: false, why: "Reels are short; long founder stories belong on YouTube." }] },
      { id: "funding", from: "Founder", icon: Briefcase, text: "Big news: we just raised a funding round. Where do we share it?", options: [{ text: "LinkedIn", ok: true, why: "LinkedIn: business updates and professional networking." }, { text: "A product reel", ok: false, why: "Funding news is a business update, not a product visual." }, { text: "A customer review video", ok: false, why: "Review videos show customers' experiences, not company news." }] },
      { id: "local", from: "Community team", icon: Users, text: "A weekend promotion for local community groups.", options: [{ text: "Facebook", ok: true, why: "Facebook: community interaction, promotions and audience reach." }, { text: "LinkedIn", ok: false, why: "LinkedIn is for professional networking, not local promotions." }, { text: "A 10-minute YouTube film", ok: false, why: "Too long for a quick weekend promotion." }] },
      { id: "collab", from: "Instagram DM", icon: MessageCircle, text: "Hi! I'm a food creator — want to collaborate on a post?", options: [{ text: "Plan an Instagram collaboration", ok: true, why: "Collaborations are an Instagram format." }, { text: "Send a press release", ok: false, why: "A creator collaboration is a social post, not press." }, { text: "Ignore it", ok: false, why: "Collaborations can introduce the brand to new people." }] },
    ],
  },
  {
    title: "Round 2 · Build trust",
    goal: "Stories, transparency and reviews — reply like the chapter teaches.",
    meter: "trust",
    cards: [
      { id: "crushed", from: "2-star review", icon: Star, text: "“Tasty, but the pouch arrived crushed.”", options: [{ text: "Thank them, send a replacement, check how orders are packed", ok: true, why: "Use negative feedback constructively to improve the product or service." }, { text: "Reply: our packaging is fine", ok: false, why: "Arguing doesn't fix the problem or build trust." }, { text: "Ask them to delete the review", ok: false, why: "Hiding feedback destroys the trust reviews create." }] },
      { id: "made", from: "Instagram DM", icon: MessageCircle, text: "How are your snacks actually made?", options: [{ text: "Invite them to book a kitchen tour", ok: true, why: "Transparency strengthens trust — Eat Better invites customers to book a kitchen tour." }, { text: "Say it's a secret", ok: false, why: "Secrecy works against transparency." }, { text: "Send a discount code", ok: false, why: "A discount doesn't answer the question; transparency does." }] },
      { id: "why", from: "Website chat", icon: ShoppingCart, text: "I'm comparing two snack brands. Why should I trust you?", options: [{ text: "Point to real ratings and reviews from customers", ok: true, why: "Reviews provide social proof and reduce uncertainty." }, { text: "Say “we're simply the best”", ok: false, why: "A claim without proof doesn't reduce uncertainty." }, { text: "Say nothing", ok: false, why: "Online buyers can't taste first — help them decide." }] },
      { id: "story", from: "Team chat", icon: Megaphone, text: "Should we post the founder's story of why the brand started?", options: [{ text: "Yes — stories create connection, backed by real quality", ok: true, why: "Storytelling creates emotional connection; trust also needs quality and credible information." }, { text: "No — only post discounts", ok: false, why: "Discounts alone don't make a brand personal or relatable." }, { text: "Yes — and exaggerate it for drama", ok: false, why: "Trust depends on credible information." }] },
      { id: "love", from: "5-star review", icon: Star, text: "“Loved the crunch — my whole family finished the pack!”", options: [{ text: "Thank them and invite them to join the Squad", ok: true, why: "The Squad turns happy buyers into a community." }, { text: "Ignore — it's already positive", ok: false, why: "Replying to happy customers builds the relationship too." }, { text: "Ask them to change it to 6 stars", ok: false, why: "That isn't how trust is earned." }] },
    ],
  },
  {
    title: "Round 3 · Earn the second order",
    goal: "Owned channels, offers and the right place to buy.",
    meter: "repeat",
    cards: [
      { id: "cart", from: "Cart alert", icon: ShoppingCart, text: "A customer has ₹400 in the basket. Free shipping is above ₹499.", options: [{ text: "Show that one more snack unlocks free shipping", ok: true, why: "The chapter's example: a ₹400 basket may add another product to qualify." }, { text: "Raise the threshold to ₹999", ok: false, why: "Out of reach — it won't nudge the basket up." }, { text: "Remove the offer", ok: false, why: "The threshold is what encourages a bigger order." }] },
      { id: "launch", from: "Marketing calendar", icon: Mail, text: "A new snack launches next week. Tell people who bought before.", options: [{ text: "Email list", ok: true, why: "Email keeps customers informed about new products — an owned channel." }, { text: "Hope they find it", ok: false, why: "Owned channels keep a direct relationship — use them." }, { text: "Only a marketplace listing", ok: false, why: "That reaches strangers, not your past buyers directly." }] },
      { id: "late", from: "Customer message", icon: Zap, text: "Late-night study craving — I need a snack within minutes!", options: [{ text: "Point them to a quick-commerce app", ok: true, why: "Quick commerce offers convenient access, depending on availability." }, { text: "Standard website delivery", ok: false, why: "That won't arrive in minutes." }, { text: "Next month's exhibition", ok: false, why: "Far too late for a craving tonight." }] },
      { id: "half", from: "Team chat", icon: Megaphone, text: "Let's do 50% off everything, forever!", options: [{ text: "No — excessive discounts reduce margins; use targeted offers", ok: true, why: "Offers can raise order value, but excessive discounts may reduce profit margins." }, { text: "Yes, more discount is always better", ok: false, why: "Sales may rise while every order stops making money." }, { text: "Make it 70%", ok: false, why: "Even bigger margin losses." }] },
      { id: "packs", from: "Exhibition feedback", icon: Store, text: "Lots of visitors asked for smaller packs at affordable prices.", options: [{ text: "Explore a new, smaller pack size", ok: true, why: "The chapter's example: listen first, then use feedback to improve the business." }, { text: "Ignore it — big packs earn more", ok: false, why: "Not listening wastes what customers are telling you." }, { text: "Raise prices instead", ok: false, why: "That's the opposite of what customers asked for." }] },
    ],
  },
];

/** Stable per-card shuffle so the right answer isn't always first. */
function shuffled(opts: Opt[], key: string) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = [...opts];
  for (let i = r.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
for (const R of ROUNDS) for (const c of R.cards) c.options = shuffled(c.options, c.id);

const TOTAL = ROUNDS.reduce((a, r) => a + r.cards.length, 0);
const LIMIT = 15; // seconds per notification
const HEARTS = 5;
const METER_INFO: Record<Meter, { label: string; icon: LucideIcon; color: string }> = {
  reach: { label: "Reach", icon: Megaphone, color: "bg-orange" },
  trust: { label: "Trust", icon: Heart, color: "bg-success" },
  repeat: { label: "Repeat orders", icon: RotateCcw, color: "bg-[#C9A400]" },
};

type Phase = "idle" | "play" | "feedback" | "round" | "over" | "won";
type Miss = { text: string; why: string };

export default function NotificationRush({ onDone }: { onDone: (summary: string) => void }) {
  const reduce = !!useReducedMotion();
  const [timed, setTimed] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [meters, setMeters] = useState<Record<Meter, number>>({ reach: 0, trust: 0, repeat: 0 });
  const [left, setLeft] = useState(LIMIT);
  const [last, setLast] = useState<{ ok: boolean; why: string; chosen: string } | null>(null);
  const [misses, setMisses] = useState<Miss[]>([]);
  const [correct, setCorrect] = useState(0);
  const deadline = useRef(0);

  const R = ROUNDS[round];
  const card = R?.cards[idx];
  const useTimer = timed && !reduce;

  const start = () => {
    setRound(0);
    setIdx(0);
    setScore(0);
    setStreak(0);
    setBest(0);
    setHearts(HEARTS);
    setMeters({ reach: 0, trust: 0, repeat: 0 });
    setMisses([]);
    setCorrect(0);
    setLast(null);
    deadline.current = performance.now() + LIMIT * 1000;
    setLeft(LIMIT);
    setPhase("play");
  };

  const answer = (o: Opt | null) => {
    if (phase !== "play" || !card) return;
    const ok = !!o?.ok;
    const right = card.options.find((x) => x.ok)!;
    if (ok) {
      const bonus = streak * 20;
      setScore((s) => s + 100 + bonus + (useTimer ? Math.round(left * 4) : 0));
      setStreak((s) => {
        const n = s + 1;
        setBest((b) => Math.max(b, n));
        return n;
      });
      setCorrect((c) => c + 1);
      setMeters((m) => ({ ...m, [R.meter]: Math.min(100, m[R.meter] + 20) }));
    } else {
      setStreak(0);
      setHearts((h) => h - 1);
      setMisses((ms) => [...ms, { text: card.text, why: right.why }]);
    }
    setLast({ ok, why: ok ? o!.why : o ? o.why : `Time's up. ${right.why}`, chosen: o?.text ?? "No answer" });
    setPhase("feedback");
  };

  // countdown while playing
  useEffect(() => {
    if (phase !== "play" || !useTimer) return;
    const id = setInterval(() => {
      const s = Math.max(0, (deadline.current - performance.now()) / 1000);
      setLeft(s);
      if (s <= 0) {
        clearInterval(id);
        answer(null);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, round, useTimer]);

  const next = () => {
    if (hearts <= 0) {
      setPhase("over");
      return;
    }
    if (idx + 1 < R.cards.length) {
      setIdx(idx + 1);
      deadline.current = performance.now() + LIMIT * 1000;
      setLeft(LIMIT);
      setPhase("play");
    } else if (round + 1 < ROUNDS.length) setPhase("round");
    else {
      setPhase("won");
      onDone(`Notification Rush: ${correct}/${TOTAL} right, score ${score}, best streak ${best}. Reach ${meters.reach}%, trust ${meters.trust}%, repeat orders ${meters.repeat}%.`);
    }
  };
  const nextRound = () => {
    setRound(round + 1);
    setIdx(0);
    deadline.current = performance.now() + LIMIT * 1000;
    setLeft(LIMIT);
    setPhase("play");
  };

  const stars = correct / TOTAL >= 0.85 ? 3 : correct / TOTAL >= 0.6 ? 2 : 1;
  const rank = stars === 3 ? "Growth Star" : stars === 2 ? "Rising Marketer" : "Junior Marketer";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)_minmax(0,1fr)] lg:items-center">
      {/* left HUD: score + streak + hearts */}
      <div className="order-2 grid grid-cols-3 gap-2 lg:order-1 lg:grid-cols-1">
        <Hud label="Score" value={score.toLocaleString("en-IN")} icon={Trophy} />
        <Hud label="Streak" value={`${streak}`} icon={Flame} hot={streak >= 3} />
        <div className="rounded-2xl border border-cocoa/15 bg-white p-3 text-center lg:text-left">
          <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">Hearts</div>
          <div className="mt-1 flex justify-center gap-1 lg:justify-start">
            {Array.from({ length: HEARTS }, (_, i) => i).map((i) => (
              <motion.span key={i} animate={{ scale: i < hearts ? 1 : 0.8, opacity: i < hearts ? 1 : 0.25 }}>
                <Heart className="size-5 text-error" fill={i < hearts ? "currentColor" : "none"} />
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* the phone */}
      <div className="order-1 mx-auto w-full max-w-[380px] lg:order-2">
        <div className="relative rounded-[42px] border-[10px] border-cocoa bg-[#FFF8F2] p-3 shadow-[6px_6px_0_0_#ff5c00]">
          <div className="mx-auto mb-2 h-5 w-24 rounded-full bg-cocoa" />
          <div className="relative flex min-h-[460px] flex-col overflow-hidden rounded-[26px] bg-gradient-to-b from-peach to-cream p-3">
            {/* status */}
            <div className="flex items-center justify-between text-[0.78rem] font-bold text-cocoa-2">
              <span className="flex items-center gap-1">
                <Bell className="size-3.5" /> {phase === "idle" ? "Notifications" : R?.title.split(" · ")[1]}
              </span>
              {phase !== "idle" && (
                <span>
                  {Math.min(round * 5 + idx + 1, TOTAL)}/{TOTAL}
                </span>
              )}
            </div>
            {useTimer && (phase === "play" || phase === "feedback") && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-cocoa/10">
                <motion.div className={`h-full rounded-full ${left < 5 ? "bg-error" : "bg-orange"}`} style={{ width: `${(left / LIMIT) * 100}%` }} />
              </div>
            )}

            <div className="relative mt-3 flex flex-1 flex-col">
              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-auto text-center">
                    <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-orange text-white">
                      <Sprout className="size-8" />
                    </span>
                    <h4 className="mt-3 font-display text-[1.5rem] font-semibold leading-tight text-cocoa">Notification Rush</h4>
                    <p className="mt-1 text-[0.95rem] leading-snug text-cocoa">15 notifications · 3 rounds · 5 hearts. Answer like the chapter teaches.</p>
                    <button onClick={start} className="eb-btn eb-btn-primary mt-4 w-full justify-center">
                      Start the rush
                    </button>
                    <button onClick={() => setTimed(!timed)} aria-pressed={!timed} className="mt-2 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[0.85rem] font-bold text-cocoa-2 hover:bg-white">
                      {timed && !reduce ? <Timer className="size-4" /> : <TimerOff className="size-4" />} Timer: {timed && !reduce ? "On" : "Off"}
                    </button>
                  </motion.div>
                )}

                {(phase === "play" || phase === "feedback") && card && (
                  <motion.div key={`${round}-${idx}`} initial={{ opacity: 0, y: -40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: last?.ok ? 260 : -260, rotate: last?.ok ? 8 : -8 }} transition={{ type: "spring", stiffness: 320, damping: 26 }} className="flex flex-1 flex-col">
                    <div className="rounded-2xl border border-cocoa/15 bg-white p-3.5 shadow-[0_10px_24px_-14px_rgba(74,40,20,0.6)]">
                      <div className="flex items-center gap-2 text-[0.8rem] font-extrabold text-cocoa-2">
                        <span className="grid size-7 place-items-center rounded-lg bg-orange/15 text-orange">
                          <card.icon className="size-4" />
                        </span>
                        {card.from}
                        <span className="ml-auto text-[0.72rem] font-bold uppercase text-cocoa-2/60">now</span>
                      </div>
                      <p className="mt-2 text-[1.02rem] font-semibold leading-snug text-cocoa">{card.text}</p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {card.options.map((o) => {
                        const show = phase === "feedback";
                        const chosen = last?.chosen === o.text;
                        return (
                          <button
                            key={o.text}
                            disabled={phase !== "play"}
                            onClick={() => answer(o)}
                            className={`flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-[0.95rem] font-bold leading-snug transition-colors ${show ? (o.ok ? "border-success bg-success/10 text-cocoa" : chosen ? "border-error bg-error/10 text-cocoa" : "border-cocoa/10 bg-white/60 text-cocoa-2/60") : "border-cocoa/15 bg-white text-cocoa hover:border-orange"}`}
                          >
                            {show && o.ok && <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />}
                            {show && chosen && !o.ok && <X className="mt-0.5 size-4 shrink-0 text-error" strokeWidth={3} />}
                            {o.text}
                          </button>
                        );
                      })}
                    </div>
                    {phase === "feedback" && last && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-3 rounded-xl px-3 py-2.5 text-[0.92rem] leading-snug ${last.ok ? "bg-success/15 text-cocoa" : "bg-error/10 text-cocoa"}`}>
                        <strong className={last.ok ? "text-success" : "text-error"}>{last.ok ? `+${100 + Math.max(0, streak - 1) * 20} · ` : "Heart lost · "}</strong>
                        {last.why}
                        <button onClick={next} className="eb-btn eb-btn-primary mt-2.5 w-full justify-center !py-2 !normal-case">
                          {hearts <= 0 ? "See results" : idx + 1 < R.cards.length ? "Next notification" : round + 1 < ROUNDS.length ? "Finish the round" : "See results"}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {phase === "round" && (
                  <motion.div key="round" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="m-auto w-full text-center">
                    <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-success">Round complete</div>
                    <h4 className="mt-1 font-display text-[1.3rem] font-semibold text-cocoa">{ROUNDS[round + 1].title}</h4>
                    <p className="mt-1 text-[0.95rem] text-cocoa">{ROUNDS[round + 1].goal}</p>
                    <button onClick={nextRound} className="eb-btn eb-btn-primary mt-4 w-full justify-center">
                      Next round
                    </button>
                  </motion.div>
                )}

                {(phase === "won" || phase === "over") && (
                  <motion.div key="end" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col">
                    <div className="text-center">
                      <span className={`mx-auto grid size-14 place-items-center rounded-full ${phase === "won" ? "bg-haldi" : "bg-cocoa/10"} text-cocoa`}>
                        <Trophy className="size-7" />
                      </span>
                      <div className={`mt-2 text-[0.8rem] font-extrabold uppercase tracking-[0.12em] ${phase === "won" ? "text-success" : "text-error"}`}>{phase === "won" ? "Rush complete" : "Out of hearts"}</div>
                      <h4 className="font-display text-[1.4rem] font-semibold text-cocoa">{phase === "won" ? rank : "Try again"}</h4>
                      {phase === "won" && (
                        <div className="mt-1 flex justify-center gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <Star key={i} className={`size-6 ${i < stars ? "fill-haldi text-[#C9A400]" : "text-cocoa/20"}`} />
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-[0.95rem] font-bold text-cocoa-2">
                        {correct}/{TOTAL} right · {score.toLocaleString("en-IN")} points · best streak {best}
                      </p>
                    </div>
                    {misses.length > 0 && (
                      <div className="mt-3 max-h-[170px] overflow-auto rounded-xl bg-white p-2.5">
                        <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-orange">Review your misses</div>
                        <ul className="mt-1 space-y-1.5">
                          {misses.map((m) => (
                            <li key={m.text} className="text-[0.85rem] leading-snug text-cocoa">
                              <span className="font-bold">{m.text}</span> {m.why}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button onClick={start} className="eb-btn eb-btn-secondary mt-auto w-full justify-center">
                      <RotateCcw className="size-4" /> Play again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[0.8rem] text-cocoa-2">Fictional practice notifications · answers follow the chapter.</p>
      </div>

      {/* right: the three meters */}
      <div className="order-3 grid gap-2">
        {(Object.keys(METER_INFO) as Meter[]).map((k) => {
          const M = METER_INFO[k];
          const active = phase !== "idle" && R?.meter === k;
          return (
            <div key={k} className={`rounded-2xl border p-3 ${active ? "border-cocoa bg-white shadow-[2px_2px_0_0_#2f1c1a]" : "border-cocoa/15 bg-white/70"}`}>
              <div className="flex items-center justify-between text-[0.9rem] font-bold text-cocoa">
                <span className="flex items-center gap-1.5">
                  <M.icon className="size-4 text-orange" /> {M.label}
                </span>
                <span className="tabular-nums">{meters[k]}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-cocoa/10">
                <motion.div className={`h-full rounded-full ${M.color}`} animate={{ width: `${meters[k]}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
              </div>
            </div>
          );
        })}
        <p className="text-[0.85rem] leading-snug text-cocoa-2">For a D2C brand, marketing is stories, reviews, community and a great first order that earns the second.</p>
      </div>
    </div>
  );
}

function Hud({ label, value, icon: Icon, hot }: { label: string; value: string; icon: LucideIcon; hot?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-center lg:text-left ${hot ? "border-orange bg-orange text-white" : "border-cocoa/15 bg-white text-cocoa"}`}>
      <div className={`flex items-center justify-center gap-1 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] lg:justify-start ${hot ? "text-white/85" : "text-cocoa-2"}`}>
        <Icon className="size-3.5" /> {label}
      </div>
      <motion.div key={value} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="font-display text-[1.6rem] font-semibold tabular-nums">
        {value}
      </motion.div>
    </div>
  );
}
