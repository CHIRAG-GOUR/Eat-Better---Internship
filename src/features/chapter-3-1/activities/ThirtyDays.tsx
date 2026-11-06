"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Mail, MessageCircle, Newspaper, Star, Tag, Users, X } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";
import { pick, rnd } from "./shared";

/**
 * Activity 3 · First 30 Days.
 * Customer relationships are about acquiring, keeping and growing customers over time. Students plan ONE
 * first-time buyer's first 30 days using only the real relationship tools from the chapter. The made-up customer
 * (and the days of her story) change every attempt, so the plan has to be built from the facts, not memorised.
 * Rules are checked live; locking an invalid plan costs a star and explains the broken rule.
 */

type Tool = "care" | "review" | "community" | "content" | "offer" | "combo" | "kitchen";
const TOOLS: { id: Tool; label: string; icon: typeof Mail; sells?: boolean }[] = [
  { id: "care", label: "Customer care by email", icon: Mail },
  { id: "review", label: "Ask for a review and rating", icon: Star },
  { id: "community", label: "Invite to the subscriber community", icon: Users },
  { id: "content", label: "Send content (snack ideas, stories)", icon: Newspaper },
  { id: "offer", label: "Send an offer", icon: Tag, sells: true },
  { id: "combo", label: "Suggest a repeat-purchase combo", icon: MessageCircle, sells: true },
  { id: "kitchen", label: "Show the kitchen and origin-story video", icon: Eye },
];
const DAYS = [0, 2, 5, 10, 20, 30];
const NAMES = ["Aarav", "Diya", "Kabir", "Isha", "Zoya", "Neel"];
const WHERE = ["on Blinkit", "on eatbetterco.com", "on Amazon", "on Zepto"];

function build(seed: number) {
  const r = rnd(seed);
  return {
    name: pick(r, NAMES),
    where: pick(r, WHERE),
    persona: pick(r, ["trust", "deal"] as const),
    finish: pick(r, [5, 10]),
    care: pick(r, [2, 5]),
  };
}
const tl = (id: Tool) => TOOLS.find((t) => t.id === id)!;

export default function ThirtyDays({ onDone }: { onDone: (summary: string) => void }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 99999));
  const s = useMemo(() => build(seed), [seed]);
  const [plan, setPlan] = useState<(Tool | null)[]>(DAYS.map(() => null));
  const [sel, setSel] = useState<Tool | null>(null);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);

  const reset = () => {
    setSeed(1 + Math.floor(Math.random() * 99999));
    setPlan(DAYS.map(() => null));
    setSel(null);
    setStep(0);
    setNote("");
    setMistakes(0);
    setFb(null);
  };

  const place = (i: number) => {
    if (step !== 0) return;
    if (!sel) {
      if (plan[i]) setPlan((p) => p.map((x, j) => (j === i ? null : x)));
      return;
    }
    setPlan((p) => p.map((x, j) => (j === i ? sel : x === sel ? null : x)));
    setSel(null);
  };
  const sellIdx = plan.map((t, i) => (t && tl(t).sells ? i : -1)).filter((i) => i >= 0);

  const rules = useMemo(() => {
    const d = (t: Tool) => {
      const i = plan.indexOf(t);
      return i < 0 ? null : DAYS[i];
    };
    const firstSell = sellIdx.length ? DAYS[sellIdx[0]] : null;
    const kitchen = d("kitchen");
    const combo = d("combo");
    const review = d("review");
    const care = d("care");
    return [
      { ok: plan.every(Boolean), label: "All 6 days have exactly one tool", hint: "Fill every day. You have 7 tools, so leave one out." },
      { ok: plan[0] === null || !tl(plan[0]).sells, label: "Day 0 does not sell anything", hint: "The pack has just arrived. Do not push an offer or a combo on day 0." },
      { ok: care !== null && care <= s.care, label: `Customer care is in place by Day ${s.care}`, hint: `${s.name} will have a question on Day ${s.care}. She must already know where to write.` },
      { ok: review !== null && review >= s.finish, label: `The review ask comes on or after Day ${s.finish}`, hint: `${s.name} finishes her first pack on Day ${s.finish}. Ask for a review before she has tasted it all and it feels pushy.` },
      { ok: sellIdx.length >= 1, label: "Includes a way to bring her back (offer or combo)", hint: "Relationships should also lead to a repeat purchase." },
      { ok: combo === null || combo >= s.finish, label: `A repeat-purchase combo is not suggested before Day ${s.finish}`, hint: "A combo while she still has the first pack feels like noise." },
      { ok: sellIdx.every((v, k) => k === 0 || v - sellIdx[k - 1] > 1), label: "No two selling messages back to back", hint: "Two sales messages in neighbouring slots feel like spam." },
      s.persona === "trust"
        ? { ok: kitchen !== null && (firstSell === null || kitchen < firstSell), label: `${s.name} wants proof first: the kitchen video comes before the first offer or combo`, hint: `${s.name} asked how the snack is made. Show the kitchen before you sell.` }
        : { ok: firstSell !== null && firstSell <= 10, label: `${s.name} compares prices: the first offer or combo is on or before Day 10`, hint: `${s.name} is a deal-seeker and may switch brands after Day 10 if she has not heard an offer.` },
    ];
  }, [plan, s, sellIdx]);



  const lock = () => {
    const bad = rules.find((r) => !r.ok);
    if (bad) {
      setMistakes((m) => m + 1);
      return setFb({ tone: "bad", text: `${bad.label}. ${bad.hint}` });
    }
    setStep(1);
    setFb({ tone: "good", text: "Plan locked. Every rule holds. Last: write the Day 0 note that goes with the pack." });
  };

  const words = note.trim().split(/\s+/).filter(Boolean).length;
  const day0 = plan[0] ? tl(plan[0]).label : "";
  const noteChecks = [
    { ok: note.toLowerCase().includes(s.name.toLowerCase()), label: `Uses her name (${s.name})`, hint: "Start with her name." },
    { ok: /(care|email|write to us|reach us|help|question)/i.test(note), label: "Tells her how to reach customer care", hint: "Mention care, email or how to write to you." },
    { ok: !/(buy now|hurry|limited time|last chance|act now)/i.test(note), label: "No pushy selling words", hint: "No “buy now”, “hurry” or “last chance” on day 0." },
    { ok: words >= 10 && words <= 35, label: "10 to 35 words", hint: `${words} words so far.` },
  ];
  const finish = () => {
    setStep(2);
    setFb({ tone: "good", text: "A plan built on the customer's own facts: care early, review after tasting, proof before selling or a timely offer for a deal-seeker." });
    onDone(`First 30 Days for ${s.name} (practice customer, ${s.persona === "trust" ? "wants proof" : "compares prices"}): ${DAYS.map((d, i) => `Day ${d} ${plan[i] ? tl(plan[i]!).label : "-"}`).join("; ")}. Day 0 note: “${note.trim()}” (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"})`);
  };

  return (
    <GameFrame
      kicker="Activity 3 · First 30 Days"
      title="Keep a first-time buyer"
      mission="A new customer just ordered. Use the relationship tools from this chapter to plan her first 30 days. Her story decides which plans work, and it changes every attempt."
      steps={["Build the plan", "Day 0 note"]}
      step={step}
      stars={step === 2 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{ real: "The seven tools are the relationship tools named in this chapter: reviews and ratings, customer care by email, a subscriber community, content, offers, repeat-purchase combos and kitchen visibility with the origin-story video.", practice: s.name + " and her story are made up. The timing rules are practice rules for this exercise, not Eat Better's real schedule.", tip: "Tap a tool, then tap a day. Tap a filled day with nothing selected to clear it." }}
    >
      <div className="rounded-2xl border-2 border-orange bg-orange/5 p-3">
        <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">Practice customer</div>
        <p className="mt-1 text-[1rem] leading-snug text-cocoa">
          <strong>{s.name}</strong> placed her first order {s.where}. She will finish her first pack on <strong>Day {s.finish}</strong> and will have a question on <strong>Day {s.care}</strong>.{" "}
          {s.persona === "trust" ? "She asked in the order notes: “How is this made? I want to see it before I trust it.”" : "She told a friend: “I will keep buying if the price is right, otherwise I will switch.”"}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">1. Pick a tool</div>
          <div className="mt-2 grid gap-1.5">
            {TOOLS.map((t) => {
              const placed = plan.includes(t.id);
              return (
                <button key={t.id} disabled={step !== 0} aria-pressed={sel === t.id} onClick={() => setSel(sel === t.id ? null : t.id)} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-[0.95rem] font-semibold ${sel === t.id ? "border-orange bg-orange text-white" : placed ? "border-success/40 bg-success/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa hover:border-orange"}`}>
                  <t.icon className="size-4 shrink-0" /> {t.label}
                  {placed && <Check className="ml-auto size-4 shrink-0" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">2. Put it on a day</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {DAYS.map((d, i) => {
              const t = plan[i] ? tl(plan[i]!) : null;
              return (
                <button key={d} disabled={step !== 0} onClick={() => place(i)} aria-label={`Day ${d}${t ? `: ${t.label}` : ""}`} className={`flex min-h-[88px] flex-col items-start gap-1 rounded-xl border-2 p-2.5 text-left ${t ? "border-cocoa bg-cream" : "border-dashed border-cocoa/30 bg-white"} ${sel && !t ? "border-orange" : ""}`}>
                  <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-cocoa-2">Day {d}</span>
                  {t ? (
                    <span className="flex items-start gap-1.5 text-[0.9rem] font-bold leading-tight text-cocoa">
                      <t.icon className="mt-0.5 size-4 shrink-0 text-orange" /> {t.label}
                      {step === 0 && <X className="ml-auto size-3.5 shrink-0 text-cocoa-2" />}
                    </span>
                  ) : (
                    <span className="text-[0.88rem] text-cocoa-2/70">empty</span>
                  )}
                </button>
              );
            })}
          </div>
          <ul className="mt-3 grid gap-1.5">
            {rules.map((r) => (
              <CheckRow key={r.label} ok={r.ok} label={r.label} hint={r.hint} />
            ))}
          </ul>
          {step === 0 && (
            <button onClick={lock} className="eb-btn eb-btn-primary mt-3 !normal-case">
              <Check className="size-4" /> Lock my plan
            </button>
          )}
        </div>
      </div>

      {step >= 1 && (
        <div className="mt-5 rounded-2xl bg-cream p-4">
          <label htmlFor="d0" className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">
            Day 0 note to {s.name} (your Day 0 tool: {day0})
          </label>
          <textarea id="d0" value={note} disabled={step === 2} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={`${s.name}, thank you for your first order …`} className="mt-1 w-full rounded-2xl border border-line-strong bg-white px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
          <ul className="mt-2 grid gap-1.5">
            {noteChecks.map((c) => (
              <CheckRow key={c.label} {...c} />
            ))}
          </ul>
          {step === 1 && (
            <button disabled={!noteChecks.every((c) => c.ok)} onClick={finish} className="eb-btn eb-btn-primary mt-3 !normal-case">
              <Check className="size-4" /> Send the note
            </button>
          )}
        </div>
      )}
    </GameFrame>
  );
}
