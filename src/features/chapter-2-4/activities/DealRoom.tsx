"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calculator, Check, Lightbulb, RefreshCw } from "lucide-react";
import { GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 1 · The Deal Room.
 * Research basis: classroom Shark Tank maths lessons (find the valuation from the ask, compare offers by what
 * the founder keeps, model a royalty as a payback). Students TYPE every number — no options to guess from.
 * Step 1 uses the real pitch from the chapter; steps 2–3 use FICTIONAL numbers that change on every attempt,
 * so answers can't be copied. Hints appear only after a wrong answer and teach the method, not the result.
 */

type Offer = { id: string; name: string; lakh: number; pct: number };
const rnd = (seed: number) => {
  let s = seed % 2147483647 || 7;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];

function makeRound(seed: number) {
  const r = rnd(seed);
  const combos: [number, number][] = [
    [40, 2],
    [50, 2],
    [60, 3],
    [75, 3],
    [40, 1],
    [80, 4],
    [50, 5],
    [90, 3],
    [60, 1.5],
    [30, 1],
  ];
  const chosen: [number, number][] = [];
  while (chosen.length < 3) {
    const c = pick(r, combos);
    const v = c[0] / c[1];
    if (!chosen.some((x) => x[0] / x[1] === v)) chosen.push(c);
  }
  const offers: Offer[] = chosen.map(([lakh, pct], i) => ({ id: "ABC"[i], name: `Investor ${"ABC"[i]}`, lakh, pct }));
  const salesLakh = pick(r, [50, 80, 100, 125, 200]);
  return { offers, salesLakh };
}

const num = (s: string) => Number(s.replace(/[,₹\s]/g, "").replace(/crore|cr|lakh|months?|%/gi, ""));
const near = (a: number, b: number) => Math.abs(a - b) < 0.011 * Math.max(1, Math.abs(b));
const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

function NumIn({ value, onChange, unit, label, disabled }: { value: string; onChange: (v: string) => void; unit: string; label: string; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <input inputMode="decimal" aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder="?" className="w-28 rounded-xl border-2 border-cocoa/20 bg-white px-3 py-2 text-right font-display text-[1.2rem] font-semibold tabular-nums text-cocoa outline-none focus:border-orange disabled:bg-success/10" />
      <span className="text-[0.95rem] font-bold text-cocoa-2">{unit}</span>
    </label>
  );
}

export default function DealRoom({ onDone }: { onDone: (summary: string) => void }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 99999));
  const round = useMemo(() => makeRound(seed), [seed]);
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [hint, setHint] = useState(0);
  const [a1, setA1] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [keeps, setKeeps] = useState<Record<string, string>>({});
  const [best, setBest] = useState<string | null>(null);
  const [roy, setRoy] = useState("");
  const [months, setMonths] = useState("");
  const [kept, setKept] = useState("");

  const reset = () => {
    setSeed(1 + Math.floor(Math.random() * 99999));
    setStep(0);
    setMistakes(0);
    setFb(null);
    setHint(0);
    setA1("");
    setVals({});
    setKeeps({});
    setBest(null);
    setRoy("");
    setMonths("");
    setKept("");
  };
  const wrong = (text: string) => {
    setMistakes((m) => m + 1);
    setHint((h) => h + 1);
    setFb({ tone: "bad", text });
  };

  // Step 1 — the real pitch
  const check1 = () => {
    if (near(num(a1), 100)) {
      setFb({ tone: "good", text: "₹50 lakh for 0.5% means 1% is worth ₹100 lakh, so 100% is worth ₹10,000 lakh = ₹100 crore. That's the valuation in the chapter." });
      setHint(0);
      setStep(1);
    } else wrong(hint === 0 ? "Start small: if 0.5% is worth ₹50 lakh, what is 1% worth?" : "1% is worth ₹100 lakh. The whole company is 100 × that = ₹10,000 lakh. How many crore is that? (1 crore = 100 lakh)");
  };

  // Step 2 — fictional offers
  const check2 = () => {
    for (const o of round.offers) {
      const v = o.lakh / o.pct;
      if (!near(num(vals[o.id] ?? ""), v)) return wrong(`Check ${o.name}: valuation = money ÷ share. ₹${o.lakh} lakh ÷ ${o.pct}% → in crore, divide the lakh number by the % number.`);
      if (!near(num(keeps[o.id] ?? ""), 100 - o.pct)) return wrong(`Check ${o.name}: if the investor gets ${o.pct}%, how much is left for the founders out of 100%?`);
    }
    const top = [...round.offers].sort((a, b) => b.lakh / b.pct - a.lakh / a.pct)[0];
    if (best !== top.id) return wrong("Your numbers are right. Now look at them: which offer says the company is worth the most?");
    setHint(0);
    setFb({ tone: "good", text: `${top.name} values the company highest (₹${fmt(top.lakh / top.pct)} crore) and lets the founders keep the most (${fmt(100 - top.pct)}%). Same money can mean very different deals.` });
    setStep(2);
  };

  // Step 3 — the royalty
  const royLakh = round.salesLakh * 0.01;
  const payMonths = Math.ceil(50 / royLakh);
  const check3 = () => {
    if (!near(num(roy), royLakh)) return wrong(`1% of ₹${round.salesLakh} lakh is ₹${round.salesLakh} ÷ 100 lakh. What is that?`);
    if (num(months) !== payMonths) return wrong(`₹50 lakh must come back at ₹${fmt(royLakh)} lakh a month. How many months is that? Round up to a whole month.`);
    if (!near(num(kept), 99.5)) return wrong("In the real deal the investor took 0.5% equity. How much do the founders keep?");
    setStep(3);
    setFb({ tone: "good", text: `The founders kept 99.5% of the company and paid back through a 1% royalty instead of giving away more equity. With fictional sales of ₹${fmt(round.salesLakh)} lakh a month, the ₹50 lakh is recouped in ${payMonths} months.` });
    onDone(`Deal Room: real valuation ₹100 crore; compared 3 practice offers; royalty payback ${payMonths} months at fictional sales of ₹${fmt(round.salesLakh)} lakh/month (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}).`);
  };

  return (
    <GameFrame
      kicker="Activity 1 · Deal Room"
      title="Do the deal maths yourself"
      mission="Every answer is a number you work out. Start with Eat Better's real pitch, then compare practice offers and model the royalty. The practice numbers change every time you restart."
      steps={["Value the pitch", "Compare offers", "Model the royalty"]}
      step={step}
      stars={step === 3 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note="Step 1 uses the real Shark Tank India (Season 4) ask from the chapter. Investors A–C and the monthly sales figures are fictional practice numbers, not Eat Better data."
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
            <div className="rounded-2xl bg-cocoa p-5 text-cream">
              <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-haldi">The real ask</div>
              <p className="mt-1 font-display text-[1.6rem] font-semibold leading-tight">₹50 lakh for 0.5% equity</p>
              <p className="mt-2 text-[0.95rem] text-cream/80">Equity is a share of ownership. Valuation is what the whole company is judged to be worth.</p>
            </div>
            <div>
              <p className="font-display text-[1.2rem] font-semibold text-cocoa">What valuation does that ask put on the company?</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="font-display text-[1.2rem] font-semibold text-cocoa">₹</span>
                <NumIn value={a1} onChange={setA1} unit="crore" label="Valuation in crore" />
                <button onClick={check1} className="eb-btn eb-btn-primary !normal-case">
                  <Calculator className="size-4" /> Check
                </button>
              </div>
              {hint > 0 && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-haldi/25 px-3 py-2 text-[0.95rem] text-cocoa">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#9A7B00]" /> Method: valuation = money asked ÷ share offered.
                </p>
              )}
            </div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="text-[1rem] text-cocoa">
              Three practice investors make offers. Work out each valuation and how much the founders would keep, then choose the offer that values the company highest.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {round.offers.map((o) => (
                <button key={o.id} onClick={() => setBest(o.id)} aria-pressed={best === o.id} className={`rounded-2xl border-2 p-4 text-left transition-colors ${best === o.id ? "border-orange bg-orange/5" : "border-cocoa/15 bg-cream/60 hover:border-cocoa/40"}`}>
                  <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{o.name} · practice</div>
                  <div className="mt-1 font-display text-[1.35rem] font-semibold text-cocoa">
                    ₹{o.lakh} lakh for {o.pct}%
                  </div>
                  <div className="mt-3 grid gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-2 text-[0.92rem] font-bold text-cocoa-2">
                      Valuation ₹
                      <NumIn value={vals[o.id] ?? ""} onChange={(v) => setVals((s) => ({ ...s, [o.id]: v }))} unit="crore" label={`${o.name} valuation`} />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[0.92rem] font-bold text-cocoa-2">
                      Founders keep
                      <NumIn value={keeps[o.id] ?? ""} onChange={(v) => setKeeps((s) => ({ ...s, [o.id]: v }))} unit="%" label={`${o.name} founders keep`} />
                    </div>
                  </div>
                  <div className="mt-2 text-[0.82rem] font-bold text-orange">{best === o.id ? "Chosen as the highest valuation" : "Tap the card to choose it"}</div>
                </button>
              ))}
            </div>
            <button onClick={check2} disabled={!best} className="eb-btn eb-btn-primary mt-4 !normal-case">
              <Calculator className="size-4" /> Check my offers
            </button>
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-2xl bg-cocoa p-5 text-cream">
              <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-haldi">The real deal</div>
              <p className="mt-1 font-display text-[1.3rem] font-semibold leading-snug">Namita Thapar: ₹50 lakh for 0.5% equity + a 1% royalty on sales until her investment is fully recouped.</p>
              <p className="mt-3 text-[0.95rem] text-cream/85">
                A royalty is a small share of every sale, paid until an agreed amount is paid back. Practice number: imagine monthly sales of <strong className="text-haldi">₹{fmt(round.salesLakh)} lakh</strong>.
              </p>
              {step === 3 && (
                <div className="mt-4">
                  <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-haldi">Payback, month by month</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Array.from({ length: Math.min(payMonths, 60) }, (_, i) => (
                      <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 }} className="size-3.5 rounded-sm bg-haldi" />
                    ))}
                  </div>
                  <div className="mt-1 text-[0.85rem] text-cream/80">{payMonths} months to recoup ₹50 lakh</div>
                </div>
              )}
            </div>
            <div className="grid content-start gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream p-3">
                <span className="text-[1rem] font-bold text-cocoa">Royalty paid each month</span>
                <span className="flex items-center gap-1.5 font-display text-[1.1rem] text-cocoa">
                  ₹<NumIn value={roy} onChange={setRoy} unit="lakh" label="Royalty each month in lakh" disabled={step === 3} />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream p-3">
                <span className="text-[1rem] font-bold text-cocoa">Months to recoup ₹50 lakh</span>
                <NumIn value={months} onChange={setMonths} unit="months" label="Months to recoup" disabled={step === 3} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream p-3">
                <span className="text-[1rem] font-bold text-cocoa">Equity the founders keep</span>
                <NumIn value={kept} onChange={setKept} unit="%" label="Equity the founders keep" disabled={step === 3} />
              </div>
              {step === 2 && (
                <button onClick={check3} className="eb-btn eb-btn-primary self-start !normal-case">
                  <Calculator className="size-4" /> Check the deal
                </button>
              )}
              {step === 3 && (
                <button onClick={reset} className="flex items-center gap-1.5 self-start rounded-xl px-3 py-2 text-[0.9rem] font-bold text-cocoa-2 hover:bg-peach">
                  <RefreshCw className="size-4" /> Try again with new practice numbers
                </button>
              )}
              <p className="flex items-start gap-2 text-[0.9rem] text-cocoa-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" /> Why it matters: the founders gave away very little ownership, and the royalty ends once the investment is back.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameFrame>
  );
}
