"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Search, Stamp, X } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 2 · The USP Evidence Desk.
 * The chapter says a strong USP is specific, relevant, distinctive and supported by evidence, and that
 * claims "should be verified against the relevant product labels … as claims may vary across products".
 * Students act as a claims checker: (1) find printed proof for each stated differentiator on real Eat Better
 * packs and brand material, (2) check claims pack by pack — including ones that are NOT on a given pack,
 * (3) rewrite a weak line into a USP that passes all four tests using only claims they verified.
 */

type DiffId = "familiar" | "palm" | "sugar" | "fats" | "six";
const DIFFS: { id: DiffId; label: string }[] = [
  { id: "familiar", label: "Familiar taste and snack formats" },
  { id: "palm", label: "No palm oil" },
  { id: "sugar", label: "No refined sugar" },
  { id: "fats", label: "No bad fats" },
  { id: "six", label: "A six-layer quality check" },
];

type Spot = { diff: DiffId; r: [number, number, number, number]; says: string };
type Doc = { id: string; src: string; w: number; h: number; title: string; spots: Spot[] };
const DOCS: Doc[] = [
  {
    id: "bhel",
    src: "/brand/products/millet-bhel-0.webp",
    w: 900,
    h: 900,
    title: "Millet Bhel pack",
    spots: [
      { diff: "familiar", r: [0.33, 0.4, 0.77, 0.52], says: "“Millet Bhel · Bombay Bhelpuri” — a snack Indian families already know." },
      { diff: "palm", r: [0.58, 0.72, 0.8, 0.84], says: "“No palm oil” printed on the pack." },
    ],
  },
  {
    id: "laddoo",
    src: "/brand/products/hazelnut-laddoo-0.webp",
    w: 900,
    h: 900,
    title: "Hazelnut Chocolate Laddoos pack",
    spots: [
      { diff: "sugar", r: [0.4, 0.645, 0.61, 0.7], says: "“Sweetened with dates” — dates instead of refined sugar." },
      { diff: "familiar", r: [0.38, 0.51, 0.63, 0.645], says: "Laddoos — a familiar Indian sweet format." },
    ],
  },
  {
    id: "box",
    src: "/chapter-1-4/what-makes-it-better.png",
    w: 447,
    h: 447,
    title: "Ultimate Snack Box creative",
    spots: [
      { diff: "fats", r: [0.16, 0.35, 0.46, 0.46], says: "“No Cholesterol · No Transfat”." },
      { diff: "palm", r: [0.16, 0.52, 0.4, 0.59], says: "“No Palm Oil”." },
    ],
  },
  {
    id: "badges",
    src: "/chapter-1-6/quality-promise-badges.png",
    w: 1536,
    h: 315,
    title: "Badges on eatbetterco.com",
    spots: [
      { diff: "six", r: [0.55, 0.12, 0.67, 0.86], says: "“6 Layer Quality Check”." },
      { diff: "palm", r: [0.84, 0.12, 0.96, 0.86], says: "“No Palm Oil Used”." },
    ],
  },
];

/** Round 2 — claims vary across products: is it printed on THIS pack? */
const LABELS: { id: string; doc: string; claim: string; present: boolean; diff?: DiffId; why: string }[] = [
  { id: "l1", doc: "ragi", claim: "Ragi Chips says “No palm oil”", present: true, diff: "palm", why: "The bottom strip reads “Baked not fried | No palm oil”." },
  { id: "l2", doc: "bhel", claim: "Millet Bhel says “Sweetened with dates”", present: false, why: "Dates sweeten the laddoos. A savoury namkeen pack doesn't make that claim — claims vary across products." },
  { id: "l3", doc: "laddoo", claim: "Hazelnut Chocolate Laddoos says “No palm oil”", present: false, why: "That isn't printed on the front of this pack. You'd have to check the full label before saying it." },
  { id: "l4", doc: "box", claim: "The Snack Box creative says “No Transfat”", present: true, diff: "fats", why: "It reads “No Cholesterol · No Transfat”." },
];
const RAGI: Doc = { id: "ragi", src: "/brand/products/ragi-chips-0.webp", w: 900, h: 900, title: "Ragi Chips pack", spots: [{ diff: "palm", r: [0.62, 0.8, 0.84, 0.89], says: "“No palm oil”." }] };
const docById = (id: string) => (id === "ragi" ? RAGI : DOCS.find((d) => d.id === id)!);

const inside = (r: [number, number, number, number], x: number, y: number) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];

function Evidence({ doc, found, onTap, flash }: { doc: Doc; found: string[]; onTap: (doc: Doc, x: number, y: number) => void; flash: { x: number; y: number; k: number; ok: boolean } | null }) {
  return (
    <figure className="min-w-0">
      <div
        className="relative w-full cursor-crosshair overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[2px_2px_0_0_#2f1c1a]"
        style={{ aspectRatio: doc.w / doc.h }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onTap(doc, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}
      >
        <Image src={doc.src} alt={doc.title} fill sizes="(max-width: 640px) 100vw, 420px" className="pointer-events-none object-cover" />
        {doc.spots.map((s, i) =>
          found.includes(`${doc.id}:${i}`) ? (
            <motion.span key={i} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="pointer-events-none absolute rounded-lg border-[3px] border-success bg-success/15" style={{ left: `${s.r[0] * 100}%`, top: `${s.r[1] * 100}%`, width: `${(s.r[2] - s.r[0]) * 100}%`, height: `${(s.r[3] - s.r[1]) * 100}%` }}>
              <Stamp className="absolute -right-2 -top-2 size-6 rounded-full bg-success p-1 text-white" />
            </motion.span>
          ) : null,
        )}
        {flash && (
          <motion.span key={flash.k} initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.6 }} className={`pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] ${flash.ok ? "border-success" : "border-error"}`} style={{ left: `${flash.x * 100}%`, top: `${flash.y * 100}%` }} />
        )}
      </div>
      <figcaption className="mt-1.5 text-[0.85rem] font-bold text-cocoa">{doc.title}</figcaption>
    </figure>
  );
}

const VERIFIED_WORDS: Record<DiffId, RegExp> = {
  familiar: /(familiar|traditional|bhujia|bhel|namkeen|laddoo|indian)/i,
  palm: /palm/i,
  sugar: /(dates|refined sugar)/i,
  fats: /(trans ?fat|cholesterol|bad fat)/i,
  six: /(six|6).?(layer|quality)/i,
};

export default function UspEvidence({ onDone }: { onDone: (summary: string) => void }) {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<DiffId>("familiar");
  const [proof, setProof] = useState<Partial<Record<DiffId, string>>>({});
  const [found, setFound] = useState<string[]>([]);
  const [flash, setFlash] = useState<Record<string, { x: number; y: number; k: number; ok: boolean } | null>>({});
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [li, setLi] = useState(0);
  const [usp, setUsp] = useState("");

  const reset = () => {
    setStep(0);
    setActive("familiar");
    setProof({});
    setFound([]);
    setFlash({});
    setMistakes(0);
    setFb(null);
    setLi(0);
    setUsp("");
  };
  const miss = (text: string) => {
    setMistakes((m) => m + 1);
    setFb({ tone: "bad", text });
  };

  // Round 1: find proof for the active differentiator
  const tapR1 = (doc: Doc, x: number, y: number) => {
    const i = doc.spots.findIndex((s) => inside(s.r, x, y));
    setFlash((f) => ({ ...f, [doc.id]: { x, y, k: Date.now(), ok: i >= 0 && doc.spots[i].diff === active } }));
    if (i < 0) return miss(`Nothing on the ${doc.title.toLowerCase()} there proves “${DIFFS.find((d) => d.id === active)!.label}”. Read the printed words closely.`);
    const s = doc.spots[i];
    if (s.diff !== active) return miss(`${s.says} That's proof for “${DIFFS.find((d) => d.id === s.diff)!.label}”, not for “${DIFFS.find((d) => d.id === active)!.label}”.`);
    setFound((f) => (f.includes(`${doc.id}:${i}`) ? f : [...f, `${doc.id}:${i}`]));
    const next = { ...proof, [active]: `${doc.title}: ${s.says}` };
    setProof(next);
    setFb({ tone: "good", text: `${s.says} Stamped as proof.` });
    const left = DIFFS.find((d) => !next[d.id]);
    if (left) setActive(left.id);
    else {
      setStep(1);
      setFb({ tone: "info", text: "Every differentiator has printed proof. Now the harder part: claims can differ from one product to another." });
    }
  };

  // Round 2: check each claim against one pack
  const L = LABELS[li];
  const answerLabel = (present: boolean, tap?: { x: number; y: number }) => {
    if (!L) return;
    const doc = docById(L.doc);
    if (present && !L.present) return miss(`Look again — that claim isn't printed on the ${doc.title.toLowerCase()}. ${L.why}`);
    if (!present && L.present) return miss(`It is on this pack. Find it and tap it. ${L.why}`);
    if (present && tap) {
      const ok = doc.spots.some((s) => s.diff === L.diff && inside(s.r, tap.x, tap.y));
      setFlash((f) => ({ ...f, [`r2-${doc.id}`]: { x: tap.x, y: tap.y, k: Date.now(), ok } }));
      if (!ok) return miss("The claim is on this pack, but not where you tapped. Point to the exact printed words.");
    }
    setFb({ tone: "good", text: L.why });
    if (li + 1 < LABELS.length) setLi(li + 1);
    else setStep(2);
  };

  // Round 3: the four tests, live
  const tests = useMemo(() => {
    const t = usp.trim();
    const used = (Object.keys(VERIFIED_WORDS) as DiffId[]).filter((k) => VERIFIED_WORDS[k].test(t));
    const unproven = /(zero calories|sugar.?free|100% healthy|no fat\b|best in (the )?(world|india)|number one|no\.? ?1|cures?|guaranteed|protein.?packed)/i.test(t);
    return [
      { ok: used.length >= 1, label: "Specific — names a real difference", hint: "Mention a differentiator you stamped, e.g. no palm oil, sweetened with dates." },
      { ok: /(family|families|kids|children|parents|work|office|desk|break|tiffin|gift|you love|chai|tea[- ]?time|evening)/i.test(t), label: "Relevant — speaks to a customer or a moment", hint: "Who is it for, or when do they eat it?" },
      { ok: /(not fried|instead of|without|unlike|no palm|roasted|baked)/i.test(t), label: "Distinctive — shows what others don't do", hint: "Contrast it: “roasted, not fried”, “dates instead of refined sugar”." },
      { ok: used.length >= 1 && !unproven, label: "Supported — only claims you verified", hint: unproven ? "Remove claims you didn't find printed on a pack." : "Use a claim you found printed." },
      { ok: t.split(/\s+/).filter(Boolean).length >= 6 && t.split(/\s+/).filter(Boolean).length <= 25, label: "6–25 words", hint: "Short enough to remember, long enough to say something." },
    ];
  }, [usp]);
  const done = tests.every((x) => x.ok);
  const finish = () => {
    setStep(3);
    setFb({ tone: "good", text: "That USP is specific, relevant, distinctive and backed by printed proof — the chapter's four tests." });
    onDone(`USP Evidence Desk: proof found for 5 differentiators, 4 label checks (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}). My USP: “${usp.trim()}”`);
  };

  return (
    <GameFrame
      kicker="Activity 2 · USP Evidence Desk"
      title="Prove every claim"
      mission="You're the brand's claims checker. A USP only counts if a shopper can check it. Find the printed proof, check claims pack by pack, then rewrite a weak line into a USP that passes all four tests."
      steps={["Stamp the proof", "Check each label", "Upgrade the USP"]}
      step={step}
      stars={step === 3 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note="Packs and badges are official Eat Better images. Claims can vary across products — always check the label."
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="r1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-wrap gap-2">
              {DIFFS.map((d) => {
                const ok = !!proof[d.id];
                const on = active === d.id;
                return (
                  <button key={d.id} onClick={() => !ok && setActive(d.id)} aria-pressed={on} className={`flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-[0.92rem] font-bold ${ok ? "border-success bg-success text-white" : on ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa-2"}`}>
                    {ok ? <Check className="size-4" strokeWidth={3} /> : <Search className="size-4" />} {d.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[1rem] text-cocoa">
              Find printed proof for <strong className="text-orange">“{DIFFS.find((d) => d.id === active)!.label}”</strong> and tap exactly where it is written.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {DOCS.slice(0, 3).map((d) => (
                <Evidence key={d.id} doc={d} found={found} onTap={tapR1} flash={flash[d.id] ?? null} />
              ))}
              <div className="col-span-2 md:col-span-3">
                <Evidence doc={DOCS[3]} found={found} onTap={tapR1} flash={flash.badges ?? null} />
              </div>
            </div>
          </motion.div>
        )}
        {step === 1 && L && (
          <motion.div key={`r2-${L.id}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center">
            <Evidence doc={docById(L.doc)} found={[]} onTap={(_, x, y) => answerLabel(true, { x, y })} flash={flash[`r2-${L.doc}`] ?? null} />
            <div>
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">
                Label check {li + 1} of {LABELS.length}
              </div>
              <p className="mt-1 font-display text-[1.35rem] font-semibold leading-snug text-cocoa">“{L.claim}”</p>
              <p className="mt-2 text-[1rem] text-cocoa">If it is printed, tap the exact words on the pack. If it isn&apos;t there, say so.</p>
              <button onClick={() => answerLabel(false)} className="eb-btn eb-btn-secondary mt-4 !normal-case">
                <X className="size-4" /> Not printed on this pack
              </button>
            </div>
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div key="r3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="rounded-2xl border-2 border-dashed border-error/40 bg-error/5 p-4">
                <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-error">Weak line (practice)</div>
                <p className="mt-1 font-display text-[1.3rem] font-semibold text-cocoa">“Our snacks are really tasty!”</p>
                <p className="mt-1 text-[0.95rem] text-cocoa-2">Every snack brand can say this. It isn&apos;t specific, distinctive or proven.</p>
              </div>
              <div className="mt-3 text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">Proof you stamped</div>
              <ul className="mt-1.5 grid gap-1.5">
                {DIFFS.map((d) => (
                  <li key={d.id} className="rounded-xl bg-success/10 px-3 py-1.5 text-[0.9rem] text-cocoa">
                    <strong>{d.label}:</strong> {proof[d.id]}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange" htmlFor="usp">
                Your USP
              </label>
              <textarea id="usp" value={usp} disabled={step === 3} onChange={(e) => setUsp(e.target.value)} rows={3} placeholder="e.g. Chatpata tea-time bhel your family loves — roasted, not fried, with no palm oil." className="mt-1 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
              <ul className="mt-2 grid gap-1.5">
                {tests.map((t) => (
                  <CheckRow key={t.label} {...t} />
                ))}
              </ul>
              {step === 2 && (
                <button disabled={!done} onClick={finish} className="eb-btn eb-btn-primary mt-4 !normal-case">
                  <Check className="size-4" /> Submit my USP
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameFrame>
  );
}
