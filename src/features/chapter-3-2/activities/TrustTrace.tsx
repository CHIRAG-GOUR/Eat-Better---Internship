"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, EyeOff, Search } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";
import { DocTabs, NumIn, TapImage, inside, near, num, shuffle, words, type Doc, type Flash, type Rect } from "./shared";

/**
 * Activity 3 · Trust Trace — "Which key activity matters most for trust?"
 * Research basis: Business Model Canvas teaching links each Key Activity to the value it delivers; label-reading
 * practice asks shoppers to check front-of-pack claims against the ingredients list and nutrition table on the back.
 * For every promise on the real Quinoa Namkeen pack the student must (1) tap the printed proof on the back (or
 * recognise that no printed proof exists), (2) read a number where the proof is a number, and (3) trace the proof to the
 * key activity that keeps it true. Wrong taps and wrong activities are explained and cost stars. The final answer must
 * be argued from the tally the student built and quote proof they actually found.
 */

const CLAIMS: Doc = { id: "claims", src: "/chapter-3-2/act-quinoa-claims.webp", title: "Front claims", alt: "Quinoa Namkeen claims card: roasted and not fried, no palm oil, no cholesterol no transfat, made with quinoa" };
const LABEL: Doc = { id: "label", src: "/chapter-3-2/act-quinoa-label.webp", title: "Nutrition & ingredients", alt: "Quinoa Namkeen nutrition table and ingredients list" };
const BACK: Doc = { id: "back", src: "/chapter-3-2/act-quinoa-back.webp", title: "Back of pack", alt: "Quinoa Namkeen back of pack: maker and address, FSSAI licence number, consumer care, allergen advice and storage" };
const DOCS = [CLAIMS, LABEL, BACK];

type ActId = "src" | "cook" | "pack" | "mktg" | "newp";
const ACTS: { id: ActId; label: string }[] = [
  { id: "src", label: "Sourcing ingredients and running quality checks" },
  { id: "cook", label: "Cooking in small batches and testing every batch" },
  { id: "pack", label: "Packaging and order fulfilment" },
  { id: "mktg", label: "Marketing, community building and customer care" },
  { id: "newp", label: "Developing new products and festive gifting ranges" },
];
const actLabel = (id: ActId) => ACTS.find((a) => a.id === id)!.label;
/** How a written answer names each key activity (first one mentioned counts). */
const ACT_RE: Record<ActId, RegExp> = { src: /(sourc|quality check)/i, cook: /(small batch|cooking|cook|testing)/i, pack: /(packag|fulfil)/i, mktg: /(marketing|community|customer care)/i, newp: /(new product|festive)/i };
const WORDNUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };

/** Named spots on the label and back of pack, used to explain wrong taps. */
const SPOTS: { doc: string; r: Rect; name: string }[] = [
  { doc: "label", r: [0.23, 0.785, 0.665, 0.828], name: "“Quinoa Flakes - 48.9% (Quinoa, Rice)”" },
  { doc: "label", r: [0.665, 0.785, 0.78, 0.828], name: "“Peanuts”" },
  { doc: "label", r: [0.28, 0.828, 0.43, 0.865], name: "“Pumpkin Seeds”" },
  { doc: "label", r: [0.43, 0.828, 0.535, 0.865], name: "“Chana”" },
  { doc: "label", r: [0.535, 0.828, 0.72, 0.865], name: "“Sunflower Oil”" },
  { doc: "label", r: [0.2, 0.428, 0.82, 0.458], name: "the Trans fat row (0)" },
  { doc: "label", r: [0.2, 0.612, 0.82, 0.645], name: "the Cholesterol row (0)" },
  { doc: "label", r: [0.2, 0.366, 0.82, 0.428], name: "the fat rows (total and saturated fat)" },
  { doc: "label", r: [0.2, 0.3, 0.82, 0.366], name: "the energy and protein rows" },
  { doc: "label", r: [0.2, 0.458, 0.82, 0.612], name: "the carbohydrate, fibre, sugar and sodium rows" },
  { doc: "label", r: [0.27, 0.865, 0.73, 0.915], name: "the seasoning list" },
  { doc: "back", r: [0.1, 0.475, 0.47, 0.57], name: "the FSSAI licence number" },
  { doc: "back", r: [0.52, 0.26, 0.93, 0.46], name: "the consumer care details (phone and email)" },
  { doc: "back", r: [0.09, 0.26, 0.47, 0.46], name: "“Mfd and Mkt By” — who made and marketed it, and their address" },
  { doc: "back", r: [0.52, 0.545, 0.75, 0.615], name: "the allergen advice (“Contains Nuts”)" },
  { doc: "back", r: [0.52, 0.62, 0.93, 0.72], name: "the storage instructions" },
  { doc: "back", r: [0.52, 0.475, 0.9, 0.525], name: "the website address" },
  { doc: "back", r: [0.1, 0.6, 0.47, 0.77], name: "the barcode" },
];

type Round = {
  id: string;
  promise: string;
  from: string;
  proof: { doc: string; r: Rect }[] | null; // null = no printed proof on the pack
  ask?: { q: string; answer: number; unit: string };
  found: string;
  acts: ActId[];
  actWhy: string;
  actHint: string;
  quote: RegExp;
};
const ROUNDS: Round[] = [
  {
    id: "palm",
    actHint: "Ask yourself: when is it decided which oil goes into the snack?",
    promise: "“No Palm Oil”",
    from: "Front claim",
    proof: [{ doc: "label", r: [0.535, 0.828, 0.72, 0.865] }],
    found: "The ingredients list names the oil used: “Sunflower Oil”.",
    acts: ["src"],
    actWhy: "Which oil goes in is decided when ingredients are sourced and checked.",
    quote: /sunflower/i,
  },
  {
    id: "quinoa",
    actHint: "Ask yourself: how does the quinoa get into the kitchen in the first place?",
    promise: "“Made with Quinoa”",
    from: "Front claim",
    proof: [{ doc: "label", r: [0.23, 0.785, 0.665, 0.828] }],
    ask: { q: "What share of the snack is quinoa flakes?", answer: 48.9, unit: "%" },
    found: "“Quinoa Flakes - 48.9%” is the first ingredient listed.",
    acts: ["src"],
    actWhy: "Getting real quinoa flakes in, and checking them, is sourcing.",
    quote: /(quinoa|48\.9)/i,
  },
  {
    id: "trans",
    actHint: "Ask yourself: what decides the fat in the snack — what goes in, and how each batch is made and tested?",
    promise: "“No Cholesterol, No Transfat”",
    from: "Front claim",
    proof: [
      { doc: "label", r: [0.2, 0.428, 0.82, 0.458] },
      { doc: "label", r: [0.2, 0.612, 0.82, 0.645] },
    ],
    found: "The nutrition table prints Trans fat 0 and Cholesterol 0.",
    acts: ["src", "cook"],
    actWhy: "Those zeros depend on the ingredients chosen and checked, and on cooking and testing each batch.",
    quote: /(trans ?fat|cholesterol|nutrition table)/i,
  },
  {
    id: "roasted",
    actHint: "Ask yourself: roasting or frying happens during which activity?",
    promise: "“Roasted and Not Fried”",
    from: "Front claim",
    proof: null,
    found: "Nothing on the back of the pack can show how it was cooked. A shopper has to trust the process.",
    acts: ["cook"],
    actWhy: "How a snack is cooked is the cooking activity itself.",
    quote: /(roasted|not fried)/i,
  },
  {
    id: "fssai",
    actHint: "Ask yourself: a food safety licence is about making food safely. Which activities keep food safe?",
    promise: "Is it made by a licensed food business?",
    from: "Shopper’s question",
    proof: [{ doc: "back", r: [0.1, 0.475, 0.47, 0.57] }],
    found: "The back prints an FSSAI licence number. FSSAI is India’s food safety authority.",
    acts: ["src", "cook"],
    actWhy: "A food safety licence sits behind the quality checks and the testing of what is made.",
    quote: /(fssai|licen[cs]e)/i,
  },
  {
    id: "care",
    actHint: "Ask yourself: who answers when a shopper complains or gives feedback?",
    promise: "If something is wrong, can I reach the company?",
    from: "Shopper’s question",
    proof: [{ doc: "back", r: [0.52, 0.26, 0.93, 0.46] }],
    found: "Consumer care details: a phone number and care@eatbetterco.com.",
    acts: ["mktg"],
    actWhy: "Answering complaints and feedback is customer care.",
    quote: /(care@|consumer care|customer care|phone|email)/i,
  },
];

export default function TrustTrace({ onDone }: { onDone: (summary: string) => void }) {
  const [order, setOrder] = useState(() => shuffle(ROUNDS));
  const [ri, setRi] = useState(0);
  const [phase, setPhase] = useState<"find" | "num" | "act">("find");
  const [doc, setDoc] = useState("label");
  const [flash, setFlash] = useState<Record<string, Flash>>({});
  const [marks, setMarks] = useState<{ doc: string; r: Rect }[]>([]);
  const [val, setVal] = useState("");
  const [picks, setPicks] = useState<Record<string, ActId>>({});
  const [wrongActs, setWrongActs] = useState<ActId[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState(false);

  const R = order[ri];
  const tracing = ri < order.length;
  const step = finished ? 3 : tracing ? (ri < 3 ? 0 : 1) : 2;

  const reset = () => {
    setOrder(shuffle(ROUNDS));
    setRi(0);
    setPhase("find");
    setDoc("label");
    setFlash({});
    setMarks([]);
    setVal("");
    setPicks({});
    setWrongActs([]);
    setMistakes(0);
    setFb(null);
    setAnswer("");
    setFinished(false);
  };
  const miss = (text: string) => {
    setMistakes((m) => m + 1);
    setFb({ tone: "bad", text });
  };

  const found = (r: Round) => {
    setFb({ tone: "good", text: r.found });
    setPhase(r.ask ? "num" : "act");
  };
  const tap = (d: string, x: number, y: number) => {
    if (!R || phase !== "find") return;
    const hit = R.proof?.find((p) => p.doc === d && inside(p.r, x, y));
    setFlash((f) => ({ ...f, [d]: { x, y, k: Date.now(), ok: !!hit } }));
    if (hit) {
      setMarks((m) => [...m, hit]);
      return found(R);
    }
    if (d === "claims") return miss("That’s the promise itself. A promise can’t prove itself: look for proof printed on the nutrition table, ingredients or back of pack.");
    const s = SPOTS.find((q) => q.doc === d && inside(q.r, x, y));
    if (!R.proof) return miss(`${s ? `You tapped ${s.name}. ` : ""}Does anything printed there actually show this promise is true? Read the question again.`);
    miss(s ? `You tapped ${s.name}. That doesn’t prove ${R.promise}. Keep looking.` : `Tap the exact printed words or row that prove ${R.promise}.`);
  };
  const noProof = () => {
    if (!R || phase !== "find") return;
    if (R.proof) return miss(`There is printed proof for ${R.promise} on this pack. Check every image.`);
    found(R);
  };
  const checkNum = () => {
    if (!R?.ask) return;
    if (!near(num(val), R.ask.answer)) return miss(`Read the number printed next to the ingredient you stamped.`);
    setFb({ tone: "good", text: `Yes, ${R.ask.answer}${R.ask.unit}: almost half of every pack is quinoa flakes. That is a promise you can measure.` });
    setPhase("act");
  };
  const pickAct = (a: ActId) => {
    if (!R || phase !== "act" || wrongActs.includes(a)) return;
    if (!R.acts.includes(a)) {
      setWrongActs((w) => [...w, a]);
      return miss(`“${actLabel(a)}” doesn’t keep ${R.promise} true. ${R.actHint}`);
    }
    setPicks((p) => ({ ...p, [R.id]: a }));
    setWrongActs([]);
    setFb({ tone: "good", text: `${R.actWhy}${R.acts.length > 1 ? " (More than one key activity counts here; yours is one of them.)" : ""}` });
    setRi(ri + 1);
    setPhase("find");
    setVal("");
  };

  const tally = useMemo(() => {
    const t: Record<ActId, number> = { src: 0, cook: 0, pack: 0, mktg: 0, newp: 0 };
    Object.values(picks).forEach((a) => t[a]++);
    return t;
  }, [picks]);
  const top = (Object.keys(tally) as ActId[]).sort((a, b) => tally[b] - tally[a])[0];

  const checks = useMemo(() => {
    const t = answer;
    const n = words(t);
    const hits = (Object.keys(ACT_RE) as ActId[]).map((id) => ({ id, i: t.search(ACT_RE[id]) })).filter((h) => h.i >= 0).sort((a, b) => a.i - b.i);
    const named = hits[0]?.id;
    const m = t.match(/\b(\d|one|two|three|four|five|six)\b\W+(?:\w+\W+){0,3}?(?:of|out of)\W+(?:\w+\W+){0,2}?(?:6|six)\b/i) || t.match(/\b(\d)\s*\/\s*6\b/);
    const said = m ? (WORDNUM[m[1].toLowerCase()] ?? Number(m[1])) : NaN;
    const proofs = ROUNDS.filter((r) => r.quote.test(t)).length;
    return [
      { ok: !!named, label: "Names one key activity", hint: "Use the activity’s name, e.g. sourcing ingredients and running quality checks." },
      { ok: proofs >= 1, label: "Quotes printed proof you found", hint: "Mention one, e.g. sunflower oil, 48.9% quinoa, trans fat 0, the FSSAI licence, consumer care." },
      { ok: !!named && said === tally[named], label: "Uses your tally correctly (e.g. “3 of 6 promises”)", hint: `${named && Number.isFinite(said) ? `Your tally gives “${actLabel(named)}” ${tally[named]}, not ${said}. ` : ""}Your tally: ${ACTS.filter((a) => tally[a.id]).map((a) => `${a.label.split(" ")[0]} ${tally[a.id]}`).join(", ")}.` },
      { ok: /(because|so that|since|which means|this shows|that's why|that is why)/i.test(t), label: "Gives a reason", hint: "Use “because …”." },
      { ok: /(customer|shopper|buyer|people|famil|parent|you\b)/i.test(t), label: "Says who the trust is for", hint: "Who has to believe the promise?" },
      { ok: n >= 18 && n <= 80, label: "18–80 words", hint: `${n} words so far.` },
    ];
  }, [answer, tally]);
  const allOk = checks.every((c) => c.ok);
  const submit = () => {
    setFinished(true);
    setFb({ tone: "good", text: "Your answer is built on proof you found yourself. Notice that one promise, “Roasted and Not Fried”, had no printed proof at all: there, trust depends entirely on the activity being done right." });
    onDone(`Trust Trace: traced 6 Quinoa Namkeen promises to printed proof and key activities (tally: ${ACTS.filter((a) => tally[a.id]).map((a) => `${a.label} ${tally[a.id]}`).join("; ")}; ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}). My answer: “${answer.trim()}”`);
  };

  const D = DOCS.find((d) => d.id === doc)!;

  return (
    <GameFrame
      kicker="Activity 3 · Trust Trace"
      title="Which key activity matters most for trust?"
      mission="Take one real pack, Quinoa Namkeen. For every promise, find the printed proof (or notice there is none), then trace it to the key activity that keeps it true. Your answer at the end has to come from what you found."
      steps={["Trace the front claims", "Trace the shopper’s questions", "Argue your answer"]}
      step={step}
      stars={finished ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{
        real: "All three images are official Eat Better Quinoa Namkeen pack images. The five key activities are from this chapter.",
        practice: "Which activity keeps each promise true is a learning model for this exercise. Two promises accept more than one activity.",
        tip: "Claims on the front are promises. Proof is printed elsewhere: the ingredients, the nutrition table, the back of pack.",
      }}
    >
      {tracing && R ? (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          <div className="min-w-0">
            <DocTabs docs={DOCS} active={doc} onChange={setDoc} />
            <TapImage doc={D} onTap={phase === "find" ? (x, y) => tap(doc, x, y) : undefined} marks={marks.filter((m) => m.doc === doc).map((m) => m.r)} flash={flash[doc]} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={R.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="min-w-0">
              <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">
                {R.from} · {ri + 1} of {order.length}
              </div>
              <p className="mt-1 font-display text-[1.45rem] font-semibold leading-snug text-cocoa">{R.promise}</p>
              {phase === "find" && (
                <>
                  <p className="mt-2 flex items-start gap-2 text-[1rem] text-cocoa">
                    <Search className="mt-1 size-4 shrink-0 text-orange" /> Switch between the pack images and tap the exact printed proof.
                  </p>
                  <button onClick={noProof} className="eb-btn eb-btn-secondary mt-3 !py-2 !text-[0.9rem] !normal-case">
                    <EyeOff className="size-4" /> No printed proof on this pack
                  </button>
                </>
              )}
              {phase === "num" && R.ask && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-cream p-3">
                  <span className="text-[1rem] font-bold text-cocoa">{R.ask.q}</span>
                  <NumIn value={val} onChange={setVal} unit={R.ask.unit} label={R.ask.q} />
                  <button onClick={checkNum} className="eb-btn eb-btn-primary !normal-case">
                    <Check className="size-4" /> Check
                  </button>
                </div>
              )}
              {phase === "act" && (
                <div className="mt-3">
                  <p className="text-[1rem] font-bold text-cocoa">Which key activity keeps this promise true?</p>
                  <div className="mt-2 grid gap-2">
                    {ACTS.map((a) => (
                      <button key={a.id} onClick={() => pickAct(a.id)} disabled={wrongActs.includes(a.id)} className="rounded-xl border-2 border-cocoa/15 bg-white px-3 py-2 text-left text-[0.95rem] font-bold text-cocoa hover:border-orange disabled:border-error/30 disabled:bg-error/5 disabled:text-cocoa-2/60 disabled:line-through">
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">Your tally · 6 promises</div>
            <div className="mt-2 grid gap-2">
              {ACTS.map((a) => (
                <div key={a.id} className="rounded-xl bg-cream px-3 py-2">
                  <div className="flex items-center justify-between gap-3 text-[0.92rem] font-bold text-cocoa">
                    <span>{a.label}</span>
                    <span className="font-display text-[1.15rem]">{tally[a.id]}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(tally[a.id] / 6) * 100}%` }} className={`h-full rounded-full ${a.id === top ? "bg-orange" : "bg-cocoa/40"}`} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[0.92rem] text-cocoa-2">Remember: “Roasted and Not Fried” had no printed proof. A shopper can only trust it.</p>
          </div>
          <div>
            <label htmlFor="tt-answer" className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">
              Which key activity matters most for trust?
            </label>
            <textarea id="tt-answer" value={answer} disabled={finished} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="I think … matters most for trust, because it keeps … of 6 promises true, like …" className="mt-1 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
            <ul className="mt-2 grid gap-1.5">
              {checks.map((c) => (
                <CheckRow key={c.label} {...c} />
              ))}
            </ul>
            {!finished && (
              <button disabled={!allOk} onClick={submit} className="eb-btn eb-btn-primary mt-4 !normal-case">
                <Check className="size-4" /> Submit my answer
              </button>
            )}
          </div>
        </div>
      )}
    </GameFrame>
  );
}
