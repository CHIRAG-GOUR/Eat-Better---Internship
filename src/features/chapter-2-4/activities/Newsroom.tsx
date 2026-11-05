"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, Check, Newspaper, Scissors, Undo2 } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 2 · The Newsroom.
 * Research basis: journalism lessons on the inverted pyramid (rank facts by newsworthiness, cut what isn't
 * news) and on ledes that answer who / what / how much / who else. The chapter calls funding announcements
 * "earned PR": coverage the brand earns because the story is newsworthy. Students build the release for the
 * real ₹17 crore Pre-Series A, then write a headline and lede that pass live checks.
 */

type Fact = { id: string; text: string; rank: number | null; why: string; practice?: boolean };
const FACTS: Fact[] = [
  { id: "raise", text: "Eat Better has raised ₹17 crore in a Pre-Series A funding round.", rank: 1, why: "The news itself — who did what, and how much. It goes first." },
  { id: "leads", text: "The round was co-led by Prath Ventures and Spring Marketing Capital.", rank: 2, why: "Who backed it — the next thing a reporter asks." },
  { id: "why", text: "Institutional backing reassures quick-commerce platforms, retail partners and suppliers about the brand's long-term stability.", rank: 3, why: "Why it matters — the context comes after the facts." },
  { id: "tv", text: "Eat Better also appeared on Shark Tank India, Season 4.", rank: 4, why: "Useful background, but older news — it goes at the bottom." },
  { id: "cake", text: "The team celebrated with a cake in the office.", rank: null, why: "Nice, but not news to readers of a business publication. Cut it.", practice: true },
  { id: "printer", text: "The office printer was replaced last week.", rank: null, why: "Not news at all. Cut it.", practice: true },
];

function shuffled(seed: number) {
  const a = [...FACTS.map((f) => f.id)];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export default function Newsroom({ onDone }: { onDone: (summary: string) => void }) {
  const [order, setOrder] = useState<string[]>(() => shuffled(42));
  const [cut, setCut] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [head, setHead] = useState("");
  const [lede, setLede] = useState("");

  const reset = () => {
    setOrder(shuffled(7 + Math.floor(Math.random() * 1000)));
    setCut([]);
    setStep(0);
    setMistakes(0);
    setFb(null);
    setHead("");
    setLede("");
  };
  const kept = order.filter((id) => !cut.includes(id));
  const byId = (id: string) => FACTS.find((f) => f.id === id)!;
  const move = (id: string, d: -1 | 1) => {
    const i = kept.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= kept.length) return;
    const other = kept[j];
    const o = [...order];
    const a = o.indexOf(id);
    const b = o.indexOf(other);
    [o[a], o[b]] = [o[b], o[a]];
    setOrder(o);
  };

  const checkOrder = () => {
    const keptNews = kept.filter((id) => byId(id).rank !== null);
    const wronglyCut = cut.find((id) => byId(id).rank !== null);
    if (wronglyCut) {
      setMistakes((m) => m + 1);
      return setFb({ tone: "bad", text: `You cut real news: “${byId(wronglyCut).text}” ${byId(wronglyCut).why}` });
    }
    const filler = kept.find((id) => byId(id).rank === null);
    if (filler) {
      setMistakes((m) => m + 1);
      return setFb({ tone: "bad", text: `“${byId(filler).text}” — would a business reporter print that? ${byId(filler).why}` });
    }
    for (let i = 0; i < keptNews.length; i++) {
      const f = byId(keptNews[i]);
      if (f.rank !== i + 1) {
        setMistakes((m) => m + 1);
        const should = FACTS.find((x) => x.rank === i + 1)!;
        return setFb({ tone: "bad", text: `Position ${i + 1} should hold the ${i === 0 ? "most newsworthy fact" : "next most important fact"}. Is “${f.text.slice(0, 60)}…” more important than “${should.text.slice(0, 60)}…”?` });
      }
    }
    setFb({ tone: "good", text: "That's an inverted pyramid: the news first, then who backed it, then why it matters, then background. Readers who stop early still get the story." });
    setStep(1);
  };

  const hChecks = useMemo(() => {
    const t = head.trim();
    return [
      { ok: /eat\s*better/i.test(t), label: "Says who: Eat Better" },
      { ok: /(rais|secur|bag|fund|round|investment)/i.test(t), label: "Says what happened: raised / secured funding" },
      { ok: /17\s*(crore|cr)/i.test(t), label: "Says how much: ₹17 crore" },
      { ok: wc(t) >= 4 && wc(t) <= 12, label: "4–12 words", hint: `Now ${wc(t)} words.` },
      { ok: t.length > 0 && !/!|amazing|incredible|best ever|shocking|you won'?t believe/i.test(t), label: "Plain news, no hype", hint: "Reporters cut exclamation marks and hype words." },
    ];
  }, [head]);
  const lChecks = useMemo(() => {
    const t = lede.trim();
    return [
      { ok: /eat\s*better/i.test(t), label: "Who: Eat Better" },
      { ok: /pre-?series\s*a|funding round/i.test(t), label: "What: a Pre-Series A funding round" },
      { ok: /17\s*(crore|cr)/i.test(t), label: "How much: ₹17 crore" },
      { ok: /prath|spring marketing/i.test(t), label: "Who backed it: Prath Ventures and Spring Marketing Capital" },
      { ok: wc(t) >= 12 && wc(t) <= 45, label: "One clear sentence (12–45 words)", hint: `Now ${wc(t)} words.` },
    ];
  }, [lede]);

  const finishHead = () => {
    setStep(2);
    setFb({ tone: "good", text: "Strong headline: who, what and how much in a few plain words." });
  };
  const finish = () => {
    setStep(3);
    setFb({ tone: "good", text: "Your release is ready to send. A newsworthy, clear story is what turns a funding round into earned media." });
    onDone(`Newsroom: headline “${head.trim()}” · lede “${lede.trim()}” (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}).`);
  };

  return (
    <GameFrame
      kicker="Activity 2 · Newsroom"
      title="Turn the funding round into news"
      mission="You're writing Eat Better's press release about its Pre-Series A round. Build it the way reporters read: most important first. Then write a headline and an opening sentence that pass every check."
      steps={["Build the pyramid", "Write the headline", "Write the lede"]}
      step={step}
      stars={step === 3 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note="Funding facts are from the chapter. The cake and printer facts are practice distractors."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0">
          {step === 0 ? (
            <>
              <p className="text-[1rem] text-cocoa">Use the arrows to rank the facts. Cut anything that isn&apos;t news.</p>
              <ol className="mt-3 grid gap-2">
                {kept.map((id, i) => {
                  const f = byId(id);
                  return (
                    <motion.li layout key={id} className="flex items-start gap-2 rounded-2xl border border-cocoa/15 bg-cream/60 p-2.5" style={{ marginLeft: `${Math.min(i, 4) * 0.6}rem`, marginRight: `${Math.min(i, 4) * 0.6}rem` }}>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cocoa font-display text-[0.95rem] font-semibold text-cream">{i + 1}</span>
                      <span className="min-w-0 flex-1 text-[0.98rem] leading-snug text-cocoa">{f.text}</span>
                      <span className="flex shrink-0 gap-1">
                        <button onClick={() => move(id, -1)} disabled={i === 0} aria-label="Move up" className="grid size-8 place-items-center rounded-lg border border-cocoa/20 bg-white disabled:opacity-30">
                          <ArrowUp className="size-4" />
                        </button>
                        <button onClick={() => move(id, 1)} disabled={i === kept.length - 1} aria-label="Move down" className="grid size-8 place-items-center rounded-lg border border-cocoa/20 bg-white disabled:opacity-30">
                          <ArrowDown className="size-4" />
                        </button>
                        <button onClick={() => setCut((c) => [...c, id])} aria-label="Cut this fact" className="grid size-8 place-items-center rounded-lg border border-error/30 bg-white text-error">
                          <Scissors className="size-4" />
                        </button>
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
              {cut.length > 0 && (
                <div className="mt-3 rounded-2xl border-2 border-dashed border-cocoa/15 p-2.5">
                  <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">Cut</div>
                  {cut.map((id) => (
                    <div key={id} className="mt-1.5 flex items-center gap-2 text-[0.92rem] text-cocoa-2 line-through">
                      <button onClick={() => setCut((c) => c.filter((x) => x !== id))} aria-label="Put this fact back" className="grid size-7 shrink-0 place-items-center rounded-lg border border-cocoa/20 bg-white text-cocoa no-underline">
                        <Undo2 className="size-3.5" />
                      </button>
                      {byId(id).text}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={checkOrder} className="eb-btn eb-btn-primary mt-4 !normal-case">
                <Check className="size-4" /> Check my pyramid
              </button>
            </>
          ) : (
            <div className="rounded-[20px] border-2 border-cocoa bg-[#FFFDF8] p-5 shadow-[3px_3px_0_0_#2f1c1a]">
              <div className="flex items-center gap-2 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">
                <Newspaper className="size-4" /> Press release · for immediate release
              </div>
              <h4 className="mt-2 font-display text-[1.5rem] font-semibold leading-tight text-cocoa">{head.trim() || "Your headline…"}</h4>
              <p className="mt-2 text-[1.02rem] font-semibold leading-relaxed text-cocoa">{lede.trim() || "Your opening sentence…"}</p>
              <ol className="mt-3 grid gap-1.5 text-[0.95rem] leading-snug text-cocoa-2">
                {FACTS.filter((f) => f.rank && f.rank > 1)
                  .sort((a, b) => a.rank! - b.rank!)
                  .map((f) => (
                    <li key={f.id}>{f.text}</li>
                  ))}
              </ol>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl bg-peach/60 p-4">
                <div className="font-display text-[1.15rem] font-semibold text-cocoa">The inverted pyramid</div>
                <div className="mt-3 grid gap-1">
                  {["Most newsworthy fact", "Who else is involved", "Why it matters", "Background"].map((l, i) => (
                    <div key={l} className="mx-auto rounded-lg bg-orange py-1.5 text-center text-[0.88rem] font-bold text-white" style={{ width: `${100 - i * 18}%`, opacity: 1 - i * 0.15 }}>
                      {l}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[0.92rem] leading-snug text-cocoa">Reporters and readers often stop after a sentence or two, so the most important facts go first.</p>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="h" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <label htmlFor="nh" className="font-display text-[1.2rem] font-semibold text-cocoa">
                  Write the headline
                </label>
                <input id="nh" value={head} onChange={(e) => setHead(e.target.value)} placeholder="e.g. Eat Better …" className="mt-2 w-full rounded-xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] text-cocoa outline-none focus:border-orange" />
                <ul className="mt-2 grid gap-1.5">
                  {hChecks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </ul>
                <button disabled={!hChecks.every((c) => c.ok)} onClick={finishHead} className="eb-btn eb-btn-primary mt-3 !normal-case">
                  <Check className="size-4" /> Use this headline
                </button>
              </motion.div>
            )}
            {step >= 2 && (
              <motion.div key="l" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                <label htmlFor="nl" className="font-display text-[1.2rem] font-semibold text-cocoa">
                  Write the lede (the opening sentence)
                </label>
                <textarea id="nl" value={lede} disabled={step === 3} onChange={(e) => setLede(e.target.value)} rows={3} placeholder="Eat Better has …" className="mt-2 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
                <ul className="mt-2 grid gap-1.5">
                  {lChecks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </ul>
                {step === 2 && (
                  <button disabled={!lChecks.every((c) => c.ok)} onClick={finish} className="eb-btn eb-btn-primary mt-3 !normal-case">
                    <Check className="size-4" /> Send the release
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameFrame>
  );
}
