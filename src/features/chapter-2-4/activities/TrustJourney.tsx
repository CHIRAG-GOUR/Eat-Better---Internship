"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgePercent, Building2, Check, Gift, Heart, MessageCircleQuestion, Newspaper, NotebookPen, RotateCcw, Tv, User, X } from "lucide-react";
import { FeedbackStrip, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 3 · The Trust Journey.
 * Each FICTIONAL buyer has a real doubt that stops them buying. The student answers it with the asset that,
 * according to the chapter, actually removes that doubt. Assets can be used more than once and one tempting
 * asset (a big discount) never works — so matching by elimination doesn't help; only understanding does.
 * Every asset tried is written into a field notebook (what it really does, from the chapter) that survives a
 * restart, a wrong asset is blocked for that doubt, and stars still count every mistake in the current run.
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
  const [notes, setNotes] = useState<AssetId[]>([]); // field notes survive a restart
  const doubtRef = useRef<HTMLDivElement>(null);
  const done = i >= DOUBTS.length;
  const out = hearts <= 0 && !done;
  const D = DOUBTS[i];

  const reset = () => {
    setI(0);
    setHearts(4);
    setMistakes(0);
    setFb(notes.length ? { tone: "info", text: "New run. Your field notes are still here, so read them before you answer." } : null);
    setSolved({});
    setWrongs([]);
  };

  // on small screens the assets sit below the buyer card: after each pick, bring the card and its result back into view
  const showDoubt = () =>
    requestAnimationFrame(() => {
      const el = doubtRef.current;
      if (el && el.getBoundingClientRect().top < 72) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

  const play = (a: AssetId) => {
    if (done || out || wrongs.includes(a)) return;
    const A = ASSETS.find((x) => x.id === a)!;
    setNotes((n) => (n.includes(a) ? n : [...n, a]));
    if (a !== D.answer) {
      setMistakes((m) => m + 1);
      setHearts((h) => h - 1);
      setWrongs((w) => [...w, a]);
      setFb({ tone: "bad", text: `${A.name}: ${A.does} Does that answer ${D.who}'s doubt, “${D.text}”?` });
      showDoubt();
      return;
    }
    setSolved((s) => ({ ...s, [D.id]: a }));
    setWrongs([]);
    setFb({ tone: "good", text: D.win });
    const n = i + 1;
    setI(n);
    showDoubt();
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
      note={{
        real: "What each asset does is taken from this chapter. The point about discounts comes from Chapter 2.2.",
        practice: "Riya, Karan, Meera and Dev are made-up buyers for practice.",
        tip: "Every asset you try is saved in your field notes, and the notes stay if you restart.",
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* the doubt */}
        <div ref={doubtRef} className="order-1 min-w-0 scroll-mt-20 lg:col-start-1 lg:row-start-1">
          <div className="flex items-center justify-between text-[0.9rem] font-bold text-cocoa-2">
            <span>{done ? "All doubts cleared" : `Doubt ${i + 1} of ${DOUBTS.length}`}</span>
            <span className="flex gap-1" aria-label={`${hearts} of 4 hearts left`}>
              {[0, 1, 2, 3].map((k) => (
                <Heart key={k} className={`size-4 ${k < hearts ? "fill-error text-error" : "text-cocoa/20"}`} />
              ))}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {!done && !out && D && (
              <motion.div key={D.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="mt-3 rounded-[22px] border-2 border-cocoa bg-white p-4 shadow-[3px_3px_0_0_#2f1c1a] sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cocoa text-cream">
                    <User className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-[1.2rem] font-semibold leading-tight text-cocoa">{D.who}</div>
                    <div className="text-[0.9rem] font-bold text-cocoa-2">{D.role}</div>
                  </div>
                </div>
                <div className="relative mt-4 rounded-2xl bg-haldi/30 px-4 pb-3 pt-4">
                  <MessageCircleQuestion className="absolute -top-3 left-4 size-6 rounded-full bg-haldi p-1 text-cocoa" />
                  <p className="font-display text-[1.2rem] font-semibold leading-snug text-cocoa sm:text-[1.25rem]">“{D.text}”</p>
                </div>
                {wrongs.length > 0 && (
                  <p className="mt-3 text-[0.9rem] text-cocoa-2">
                    Ruled out for {D.who}: {wrongs.map((w) => ASSETS.find((x) => x.id === w)!.name).join(", ")}.
                  </p>
                )}
              </motion.div>
            )}
            {out && (
              <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-[22px] border-2 border-error bg-error/5 p-5">
                <div className="font-display text-[1.3rem] font-semibold text-error">Out of hearts</div>
                <p className="mt-1 text-[1rem] leading-snug text-cocoa">Every asset you tried is now in your field notes. Read what each one really does, then start the journey again.</p>
                <button onClick={reset} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2 text-[0.95rem] font-bold text-white hover:bg-cocoa">
                  <RotateCcw className="size-4" /> Restart the journey
                </button>
              </motion.div>
            )}
            {done && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 rounded-[22px] border-2 border-success bg-success/5 p-5">
                <div className="font-display text-[1.3rem] font-semibold text-success">Every buyer is ready</div>
                <p className="mt-1 text-[1rem] leading-relaxed text-cocoa">PR is earned attention. Each asset did a different job: awareness, legitimacy, stability, consistency, and the right festive offer.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <FeedbackStrip feedback={fb} className="mt-3" />
        </div>

        {/* the assets */}
        <div className="order-2 grid min-w-0 grid-cols-2 gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {ASSETS.map((a) => {
            const Icon = a.icon;
            const isWrong = !done && wrongs.includes(a.id);
            const known = notes.includes(a.id);
            return (
              <button
                key={a.id}
                disabled={done || out || isWrong}
                onClick={() => play(a.id)}
                aria-label={isWrong ? `${a.name} (ruled out for this buyer)` : a.name}
                className={`relative flex min-h-[4.5rem] flex-col items-start gap-2 rounded-2xl border-2 p-3 text-left transition-colors sm:flex-row sm:gap-3 ${isWrong ? "border-error/40 bg-error/5 opacity-70" : "border-cocoa/15 bg-white hover:border-orange disabled:opacity-60"}`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl sm:size-10 ${isWrong ? "bg-error/15 text-error" : a.id === "discount" ? "bg-cocoa/10 text-cocoa" : "bg-orange text-white"}`}>
                  {isWrong ? <X className="size-5" /> : <Icon className="size-5" />}
                </span>
                <span className="min-w-0 pr-5 font-display text-[0.98rem] font-semibold leading-snug text-cocoa sm:text-[1.02rem]">{a.name}</span>
                {known && !isWrong && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-cream text-cocoa-2" title="In your field notes">
                    <NotebookPen className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* journey so far + field notes */}
        <div className="order-3 grid min-w-0 gap-4 lg:col-start-1 lg:row-start-2">
          <ol className="grid gap-1.5" aria-label="Journey so far">
            {DOUBTS.map((d, k) => {
              const a = solved[d.id];
              const now = k === i && !out;
              return (
                <li key={d.id} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[0.9rem] ${a ? "bg-success/10 text-cocoa" : now ? "bg-orange/10 font-bold text-cocoa" : "bg-cream text-cocoa-2/70"}`}>
                  {a ? <Check className="size-4 shrink-0 text-success" strokeWidth={3} /> : <span className="w-4 shrink-0 text-center tabular-nums">{k + 1}</span>}
                  <span className="min-w-0 flex-1 truncate">
                    {d.who}: {a ? ASSETS.find((x) => x.id === a)!.name : now ? "now" : "…"}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="rounded-[20px] border border-cocoa/15 bg-cream/70 p-4">
            <div className="flex items-center gap-2 font-display text-[1.1rem] font-semibold text-cocoa">
              <NotebookPen className="size-5 text-orange" /> Field notes
              <span className="ml-auto text-[0.85rem] font-bold text-cocoa-2">
                {notes.length} of {ASSETS.length} assets
              </span>
            </div>
            {notes.length === 0 ? (
              <p className="mt-2 text-[0.92rem] leading-snug text-cocoa-2">Empty for now. Each asset you try is added here with what it really does.</p>
            ) : (
              <ul className="mt-2 grid gap-2">
                {ASSETS.filter((a) => notes.includes(a.id)).map((a) => (
                  <li key={a.id} className="rounded-xl bg-white px-3 py-2 text-[0.92rem] leading-snug text-cocoa">
                    <strong>{a.name}.</strong> {a.does}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </GameFrame>
  );
}
