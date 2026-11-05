"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgePercent, Building2, Gift, MessageCircleQuestion, Newspaper, Tv, User } from "lucide-react";
import { GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 3 · The Trust Journey.
 * Each FICTIONAL buyer has a real doubt that stops them buying. The student answers it with the asset that,
 * according to the chapter, actually removes that doubt. Assets can be used more than once and one tempting
 * asset (a big discount) never works — so matching by elimination doesn't help; only understanding does.
 * Every wrong pick shows what that asset really does, quoted from the chapter.
 */

type AssetId = "tv" | "funding" | "roster" | "featured" | "hamper" | "discount";
const ASSETS: { id: AssetId; name: string; icon: typeof Tv; does: string }[] = [
  { id: "tv", name: "Shark Tank India broadcast", icon: Tv, does: "A prime-time national broadcast is high-trust, top-of-funnel marketing — it makes people aware the brand exists." },
  { id: "funding", name: "Press coverage of the ₹17 crore funding", icon: Newspaper, does: "Publicised institutional backing reassures quick-commerce platforms, retail partners and suppliers of the brand's long-term stability." },
  { id: "roster", name: "Corporate client roster on the website", icon: Building2, does: "Bulk orders from established corporate buyers validate quality, taste consistency and supply-chain reliability — which also reassures individual shoppers." },
  { id: "featured", name: "“Featured In” press section on the website", icon: Newspaper, does: "On-site press features give first-time visitors immediate proof of legitimacy and lower purchase hesitation." },
  { id: "hamper", name: "Rakhi & Diwali hamper campaign", icon: Gift, does: "Date-sweetened laddoos and roasted nut mixes, positioned as alternatives to sugar-heavy sweets for festive gifting." },
  { id: "discount", name: "A big discount", icon: BadgePercent, does: "A discount can nudge a purchase, but it doesn't prove a brand is real, stable or consistent — and excessive discounts reduce margins (Chapter 2.2)." },
];

const DOUBTS: { id: string; who: string; role: string; text: string; answer: AssetId; win: string }[] = [
  { id: "d1", who: "Riya", role: "Shopper, watching TV at home", text: "I've never even heard of Eat Better.", answer: "tv", win: "Prime-time national TV puts the brand in front of millions — the top of the funnel." },
  { id: "d2", who: "Riya", role: "Visiting the website for the first time", text: "How do I know this brand is genuine?", answer: "featured", win: "Press features on the site are instant proof of legitimacy for a first-time visitor." },
  { id: "d3", who: "Karan", role: "Category manager, quick-commerce app", text: "Will this brand still be around to supply us next year?", answer: "funding", win: "Coverage of institutional backing reassures platforms about long-term stability." },
  { id: "d4", who: "Meera", role: "HR manager", text: "Can they deliver 300 gift boxes that all taste the same?", answer: "roster", win: "Bulk orders from established companies show taste consistency and reliable supply." },
  { id: "d5", who: "Dev", role: "Shopper comparing snack brands", text: "Is the taste the same from one pack to the next?", answer: "roster", win: "If big corporate buyers re-order in bulk, consistency has been tested — that reassures individual shoppers too." },
  { id: "d6", who: "Riya", role: "Shopping before Diwali", text: "I want to gift something — but not another box of sugar-heavy sweets.", answer: "hamper", win: "Festive hampers with date-sweetened laddoos answer exactly this — healthier Indian gifting." },
];

export default function TrustJourney({ onDone }: { onDone: (summary: string) => void }) {
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(4);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [solved, setSolved] = useState<Record<string, AssetId>>({});
  const [wrongs, setWrongs] = useState<AssetId[]>([]);
  const done = i >= DOUBTS.length;
  const out = hearts <= 0;
  const D = DOUBTS[i];

  const reset = () => {
    setI(0);
    setHearts(4);
    setMistakes(0);
    setFb(null);
    setSolved({});
    setWrongs([]);
  };
  const play = (a: AssetId) => {
    if (done || out) return;
    const A = ASSETS.find((x) => x.id === a)!;
    if (a !== D.answer) {
      setMistakes((m) => m + 1);
      setHearts((h) => h - 1);
      setWrongs((w) => [...w, a]);
      return setFb({ tone: "bad", text: `${A.name}: ${A.does} Does that answer “${D.text}”?` });
    }
    setSolved((s) => ({ ...s, [D.id]: a }));
    setWrongs([]);
    setFb({ tone: "good", text: D.win });
    const n = i + 1;
    setI(n);
    if (n >= DOUBTS.length) onDone(`Trust Journey: cleared 6 buyer doubts with the right trust asset (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}).`);
  };

  const step = done ? 3 : i < 2 ? 0 : i < 5 ? 1 : 2;

  return (
    <GameFrame
      kicker="Activity 3 · Trust Journey"
      title="Clear every buyer's doubt"
      mission="Six buyers, six doubts. Answer each doubt with the asset that really removes it. Assets can be used more than once, and one tempting asset never works. Four hearts."
      steps={["Get noticed", "Earn trust", "Win the moment"]}
      step={step}
      stars={done ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note="Riya, Karan, Meera and Dev are fictional buyers. What each asset does is quoted from this chapter."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* the doubt */}
        <div className="min-w-0">
          <div className="flex items-center justify-between text-[0.85rem] font-bold text-cocoa-2">
            <span>{done ? "All doubts cleared" : `Doubt ${i + 1} of ${DOUBTS.length}`}</span>
            <span className="flex gap-1" aria-label={`${hearts} hearts left`}>
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={`size-3 rounded-full ${k < hearts ? "bg-error" : "bg-cocoa/15"}`} />
              ))}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {!done && !out && D && (
              <motion.div key={D.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="mt-3 rounded-[22px] border-2 border-cocoa bg-white p-5 shadow-[3px_3px_0_0_#2f1c1a]">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-cocoa text-cream">
                    <User className="size-6" />
                  </span>
                  <div>
                    <div className="font-display text-[1.2rem] font-semibold leading-tight text-cocoa">{D.who}</div>
                    <div className="text-[0.88rem] font-bold text-cocoa-2">{D.role}</div>
                  </div>
                </div>
                <div className="relative mt-4 rounded-2xl bg-haldi/30 px-4 py-3">
                  <MessageCircleQuestion className="absolute -top-3 left-4 size-6 rounded-full bg-haldi p-1 text-cocoa" />
                  <p className="font-display text-[1.25rem] font-semibold leading-snug text-cocoa">“{D.text}”</p>
                </div>
              </motion.div>
            )}
            {out && !done && (
              <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-[22px] border-2 border-error bg-error/5 p-5">
                <div className="font-display text-[1.3rem] font-semibold text-error">Out of hearts</div>
                <p className="mt-1 text-[1rem] text-cocoa">Read what each asset really does, then restart the journey.</p>
              </motion.div>
            )}
            {done && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 rounded-[22px] border-2 border-success bg-success/5 p-5">
                <div className="font-display text-[1.3rem] font-semibold text-success">Every buyer is ready</div>
                <p className="mt-1 text-[1rem] leading-relaxed text-cocoa">PR is earned attention. Each asset did a different job: awareness, legitimacy, stability, consistency, and the right festive offer.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* journey so far */}
          <ol className="mt-4 grid gap-1.5">
            {DOUBTS.map((d, k) => {
              const a = solved[d.id];
              return (
                <li key={d.id} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[0.88rem] ${a ? "bg-success/10 text-cocoa" : k === i ? "bg-orange/10 font-bold text-cocoa" : "bg-cream text-cocoa-2/60"}`}>
                  <span className="tabular-nums">{k + 1}.</span>
                  <span className="min-w-0 flex-1 truncate">
                    {d.who}: {a ? ASSETS.find((x) => x.id === a)!.name : k === i ? "now" : "…"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* the assets */}
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {ASSETS.map((a) => {
            const Icon = a.icon;
            const isWrong = wrongs.includes(a.id);
            return (
              <button key={a.id} disabled={done || out} onClick={() => play(a.id)} className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-colors disabled:opacity-60 ${isWrong ? "border-error/50 bg-error/5" : "border-cocoa/15 bg-white hover:border-orange"}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${a.id === "discount" ? "bg-cocoa/10 text-cocoa" : "bg-orange text-white"}`}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 font-display text-[1.02rem] font-semibold leading-snug text-cocoa">{a.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
