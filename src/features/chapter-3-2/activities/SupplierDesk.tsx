"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calculator, Check, Factory, Lightbulb, Truck } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";
import { DocTabs, NumIn, TapImage, inside, near, num, shuffle, words, type Doc, type Flash, type Rect } from "./shared";

/**
 * Activity 2 · Supplier Failure Desk — "What would happen to the brand if one key supplier failed?"
 * Research basis: supply-chain disruption classroom games (e.g. sourcing games that pit a cheap/fast but risky
 * supplier against a reliable one) and the risk measure "time to survive" — how long current stock lasts
 * (stock ÷ daily use) compared with how long a backup takes to arrive.
 * The student reads the REAL Ragi Chips label to find the ingredient at risk and its printed share (30%), uses that
 * share in randomised practice maths (typed, never chosen), measures each backup's gap, proves with the printed pack
 * promise why the fastest backup is unusable, and writes a plan that is checked live against their own numbers.
 */

const LABEL: Doc = { id: "label", src: "/chapter-3-2/act-ragi-label.webp", title: "Ragi Chips · ingredients", alt: "Ragi Chips Achari Masti nutrition table and ingredients list" };
const CLAIMS: Doc = { id: "claims", src: "/chapter-3-2/act-ragi-claims.webp", title: "Ragi Chips · what makes it better", alt: "Ragi Chips claims card: baked and not fried, no palm oil, no cholesterol no transfat, made with ragi" };

const RAGI: Rect = [0.2, 0.785, 0.39, 0.835];
const LABEL_DECOYS: { r: Rect; name: string }[] = [
  { r: [0.09, 0.785, 0.2, 0.835], name: "“Flour Mix” — that names the whole mix, not one ingredient" },
  { r: [0.39, 0.785, 0.505, 0.835], name: "Rice Flour" },
  { r: [0.505, 0.785, 0.67, 0.835], name: "Tapioca Starch" },
  { r: [0.67, 0.785, 0.9, 0.835], name: "Chickpea Flour" },
  { r: [0.11, 0.835, 0.325, 0.875], name: "Black Gram Flour" },
  { r: [0.325, 0.835, 0.47, 0.875], name: "Jowar Flour" },
  { r: [0.47, 0.835, 0.89, 0.875], name: "the oil (Rice Bran Oil)" },
];
const PROOF: { doc: string; r: Rect; says: string }[] = [
  { doc: "claims", r: [0.07, 0.77, 0.43, 0.84], says: "“Made with Ragi”" },
  { doc: "claims", r: [0.61, 0.54, 0.81, 0.72], says: "The pack is called “Ragi Chips”" },
  { doc: "label", r: RAGI, says: "“Ragi Flour (30%)” in the ingredients" },
];
const PROOF_DECOYS: { doc: string; r: Rect; says: string }[] = [
  { doc: "claims", r: [0.07, 0.47, 0.37, 0.56], says: "“No Palm Oil” is a promise about the oil. The swap changes the flour." },
  { doc: "claims", r: [0.55, 0.71, 0.87, 0.77], says: "“Baked not fried | No palm oil” is about cooking and oil. The swap changes the flour." },
  { doc: "claims", r: [0.07, 0.33, 0.36, 0.44], says: "“Baked and not fried” is about how it is cooked, not what flour it uses." },
  { doc: "claims", r: [0.07, 0.6, 0.43, 0.71], says: "“No cholesterol, no transfat” isn’t what a flour swap would break." },
];

type Sup = { kind: "ok" | "late" | "swap"; name: string; what: string; lead: number };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
function makeRound() {
  const mix = pick([40, 50, 60, 80]);
  const perBatch = Math.round(mix * 0.3);
  const perDay = pick([2, 3, 4]);
  const cover = pick([4, 5, 6, 7, 8]);
  const extra = 1 + Math.floor(Math.random() * (perBatch - 1));
  const stock = perBatch * perDay * cover + extra;
  const okLead = 2 + Math.floor(Math.random() * (cover - 2)); // 2 … cover-1
  const lateBy = pick([2, 3, 4]);
  const letters = shuffle(["A", "B", "C"]);
  const sups: Sup[] = shuffle([
    { kind: "ok" as const, name: `Supplier ${letters[0]}`, what: "Ragi flour, quality-checked lots", lead: okLead },
    { kind: "late" as const, name: `Supplier ${letters[1]}`, what: "Ragi flour, quality-checked lots", lead: cover + lateBy },
    { kind: "swap" as const, name: `Supplier ${letters[2]}`, what: "Jowar flour instead of ragi (cheaper)", lead: 1 },
  ]);
  return { mix, perBatch, perDay, cover, stock, batches: perDay * cover, sups, okLead, orderBy: cover - okLead };
}

export default function SupplierDesk({ onDone }: { onDone: (summary: string) => void }) {
  const [R, setR] = useState(makeRound);
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState<"gap" | "proof" | "order">("gap");
  const [mistakes, setMistakes] = useState(0);
  const [hint, setHint] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [flash, setFlash] = useState<Record<string, Flash>>({});
  const [doc, setDoc] = useState("claims");
  const [a, setA] = useState({ per: "", batches: "", days: "" });
  const [gaps, setGaps] = useState<Record<string, string>>({});
  const [proof, setProof] = useState<{ doc: string; r: Rect; says: string } | null>(null);
  const [order, setOrder] = useState("");
  const [plan, setPlan] = useState("");

  const ok = R.sups.find((s) => s.kind === "ok")!;
  const late = R.sups.find((s) => s.kind === "late")!;
  const swap = R.sups.find((s) => s.kind === "swap")!;

  const reset = () => {
    setR(makeRound());
    setStep(0);
    setSub("gap");
    setMistakes(0);
    setHint(0);
    setFb(null);
    setFlash({});
    setDoc("claims");
    setA({ per: "", batches: "", days: "" });
    setGaps({});
    setProof(null);
    setOrder("");
    setPlan("");
  };
  const wrong = (text: string) => {
    setMistakes((m) => m + 1);
    setHint((h) => h + 1);
    setFb({ tone: "bad", text });
  };

  // Step 1 — find the ingredient at risk on the real label
  const tapLabel = (x: number, y: number) => {
    const hit = inside(RAGI, x, y);
    setFlash((f) => ({ ...f, s0: { x, y, k: Date.now(), ok: hit } }));
    if (hit) {
      setHint(0);
      setStep(1);
      setFb({ tone: "good", text: "“Ragi Flour (30%)”: ragi is 30% of the flour mix in every batch. Keep that number, you need it now." });
      return;
    }
    const d = LABEL_DECOYS.find((q) => inside(q.r, x, y));
    wrong(d ? `That’s ${d.name}. The failed supplier sends the flour the snack is named after. Find it and its printed share.` : "Tap the exact words in the ingredients list, under the nutrition table.");
  };

  // Step 2 — cover maths
  const checkMaths = () => {
    if (!near(num(a.per), R.perBatch)) return wrong(hint === 0 ? `Each batch uses ${R.mix} kg of flour mix, and the label says ragi is 30% of it. What is 30% of ${R.mix}?` : `30% of ${R.mix} kg = ${R.mix} × 30 ÷ 100. Type that number of kg.`);
    if (num(a.batches) !== R.batches) return wrong(`Ragi in stock ÷ ragi per batch = ${R.stock} ÷ ${R.perBatch}. Only whole batches can be cooked, so round down.`);
    if (num(a.days) !== R.cover) return wrong(`The kitchen runs ${R.perDay} batches a day. How many FULL days do ${R.batches} batches last? Round down.`);
    setHint(0);
    setStep(2);
    setFb({ tone: "good", text: `${R.stock} kg ÷ ${R.perBatch} kg = ${R.batches} whole batches, which is ${R.cover} full days of production. That is your time to survive: a backup has to arrive within ${R.cover} days or the kitchen stops.` });
  };

  // Step 3 — backups
  const gapOf = (s: Sup) => Math.max(0, s.lead - R.cover);
  const checkGaps = () => {
    for (const s of R.sups) {
      const v = gaps[s.name] ?? "";
      if (v.trim() === "" || num(v) !== gapOf(s))
        return wrong(hint === 0 ? `Check ${s.name}: it delivers in ${s.lead} day${s.lead === 1 ? "" : "s"} and your stock lasts ${R.cover} days. Days with no ragi = delivery days − days of stock, and never less than 0.` : `${s.name}: ${s.lead} − ${R.cover} ${s.lead > R.cover ? `= ${s.lead - R.cover}` : "is below 0, so the gap is 0"}.`);
    }
    setHint(0);
    setSub("proof");
    setFb({ tone: "info", text: `${late.name} leaves the kitchen with ${gapOf(late)} days of no ragi. ${swap.name} arrives tomorrow with no gap, but would Ragi Chips still keep the promise printed on its pack? Tap the printed words that rule it out.` });
  };
  const tapProof = (d: string, x: number, y: number) => {
    const hit = PROOF.find((p) => p.doc === d && inside(p.r, x, y));
    setFlash((f) => ({ ...f, [`p-${d}`]: { x, y, k: Date.now(), ok: !!hit } }));
    if (hit) {
      setProof(hit);
      setHint(0);
      setSub("order");
      setFb({ tone: "good", text: `${hit.says}. Swapping in jowar flour would make the pack’s printed promise untrue, so ${swap.name} is out, however fast it is.` });
      return;
    }
    const dec = PROOF_DECOYS.find((p) => p.doc === d && inside(p.r, x, y));
    wrong(dec ? dec.says : "Find the printed words about the ingredient being swapped.");
  };
  const checkOrder = () => {
    if (order.trim() === "" || num(order) !== R.orderBy) return wrong(hint === 0 ? `Today is day 0. Stock lasts ${R.cover} days and ${ok.name} takes ${ok.lead} days to deliver. What is the last day you can order so it arrives before stock runs out?` : `${R.cover} − ${ok.lead} = ?`);
    setHint(0);
    setStep(3);
    setFb({ tone: "good", text: `Order from ${ok.name} by day ${R.orderBy} and the ragi arrives on day ${R.orderBy + ok.lead}, just as the stock runs out. Now write the plan.` });
  };

  // Step 4 — the plan, checked live
  const okL = ok.name.slice(-1);
  const swL = swap.name.slice(-1);
  const checks = useMemo(() => {
    const t = plan;
    const rejectsJowar = /(no|not|never|reject\w*|without|avoid\w*|won'?t|can'?t|cannot)\W+(\w+\W+){0,4}jowar/i.test(t) || /jowar\W+(\w+\W+){0,6}(breaks?|would break|untrue|not allowed|can'?t|cannot)/i.test(t);
    const usesSwap = new RegExp(`(use|order from|buy from|go with|choose|pick)\\s+(supplier\\s*)?${swL}\\b`, "i").test(t);
    const n = words(t);
    return [
      { ok: new RegExp(`supplier\\s*${okL}\\b`, "i").test(t), label: `Names the backup that works (${ok.name})`, hint: "Which supplier has no gap and keeps the printed promise?" },
      { ok: new RegExp(`\\b${R.cover}\\b`).test(t) && /days?/i.test(t), label: "Says how many days of stock are left", hint: "Use the number of full days you worked out." },
      { ok: new RegExp(`(day\\s*${R.orderBy}\\b|\\b${R.orderBy}\\s*days?\\b${R.orderBy === 0 ? "|today" : ""})`, "i").test(t), label: "Says by when to order", hint: "Write the order day you worked out, e.g. “by day N”." },
      { ok: /(check|test|quality)/i.test(t), label: "Keeps the quality checks", hint: "New lots still go through sourcing checks before cooking." },
      { ok: /(tell|inform|update|warn|let\W+\w+\W+know|message|call|email)/i.test(t) && /(team|kitchen|platform|quick.?commerce|customer|corporate|client|partner|deliver|marketplace)/i.test(t), label: "Tells someone who depends on the supply", hint: "Who should hear about a possible delay: the team, platforms, corporate clients?" },
      { ok: !usesSwap && (!/jowar/i.test(t) || rejectsJowar), label: "Keeps the printed promise (no jowar swap)", hint: "Don’t plan to use the jowar swap. If you mention it, say why you won’t." },
      { ok: n >= 20 && n <= 90, label: "20–90 words", hint: `${n} words so far.` },
    ];
  }, [plan, R, ok.name, okL, swL]);
  const planOk = checks.every((c) => c.ok);
  const finish = () => {
    setStep(4);
    setFb({ tone: "good", text: "That is a real continuity plan: you know how long you can survive, which backup arrives in time, and you kept the promise printed on the pack." });
    onDone(`Supplier Failure Desk: found “Ragi Flour (30%)” on the real label; practice stock = ${R.batches} batches = ${R.cover} days of cover; rejected the jowar swap (${proof?.says ?? "printed promise"}); order from ${ok.name} by day ${R.orderBy} (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}). My plan: “${plan.trim()}”`);
  };

  const practiceBox = (
    <div className="rounded-2xl bg-cocoa p-4 text-cream">
      <div className="flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-haldi">
        <Factory className="size-4" /> Practice numbers
      </div>
      <ul className="mt-2 grid gap-1 text-[0.98rem]">
        <li>
          Flour mix per small batch: <strong className="text-haldi">{R.mix} kg</strong>
        </li>
        <li>
          Batches cooked per day: <strong className="text-haldi">{R.perDay}</strong>
        </li>
        <li>
          Ragi flour left in stock: <strong className="text-haldi">{R.stock} kg</strong>
        </li>
      </ul>
    </div>
  );

  return (
    <GameFrame
      kicker="Activity 2 · Supplier Failure Desk"
      title="One supplier fails. Now what?"
      mission="Practice scenario: the supplier that sends ragi flour for Ragi Chips can’t deliver. Read the real label, work out how long the kitchen can keep going, test the backups and write the plan. The practice numbers change every restart."
      steps={["Find the risk", "Count the cover", "Test the backups", "Write the plan"]}
      step={step}
      stars={step === 4 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{
        real: "The Ragi Chips label, its ingredients list (“Ragi Flour (30%)”) and its claims card are official Eat Better images. Ingredient suppliers are a key partner in this chapter.",
        practice: "The supplier failure, stock, batch sizes and Suppliers A–C are made up for practice and change every restart. They are not Eat Better data.",
        tip: "Days of cover = stock ÷ what you use each day. Only whole batches count, so round down.",
      }}
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
            <TapImage doc={LABEL} onTap={tapLabel} flash={flash.s0} />
            <div>
              <p className="font-display text-[1.3rem] font-semibold leading-snug text-cocoa">The ragi flour supplier can’t deliver.</p>
              <p className="mt-2 text-[1rem] text-cocoa">Before you can plan, find out how much the snack depends on it. Tap the ingredient on the real label, including its printed share.</p>
            </div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="grid content-start gap-3">
              {practiceBox}
              <div className="rounded-2xl bg-success/10 p-3 text-[0.95rem] text-cocoa">
                <strong>From the real label:</strong> ragi flour is 30% of the flour mix.
              </div>
            </div>
            <div className="grid content-start gap-3">
              {[
                { k: "per" as const, q: "Ragi flour in one batch", unit: "kg" },
                { k: "batches" as const, q: "Whole batches the stock can still make", unit: "batches" },
                { k: "days" as const, q: "Full days of production left", unit: "days" },
              ].map((row) => (
                <div key={row.k} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream p-3">
                  <span className="text-[1rem] font-bold text-cocoa">{row.q}</span>
                  <NumIn value={a[row.k]} onChange={(v) => setA((s) => ({ ...s, [row.k]: v }))} unit={row.unit} label={row.q} />
                </div>
              ))}
              <button onClick={checkMaths} className="eb-btn eb-btn-primary self-start !normal-case">
                <Calculator className="size-4" /> Check my numbers
              </button>
              {hint > 0 && (
                <p className="flex items-start gap-2 rounded-xl bg-haldi/25 px-3 py-2 text-[0.95rem] text-cocoa">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#9A7B00]" /> Work in order: ragi per batch first, then batches, then days.
                </p>
              )}
            </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="text-[1rem] text-cocoa">
              Your stock lasts <strong className="text-orange">{R.cover} full days</strong>. Three practice backup suppliers reply. For each one, work out how many days the kitchen would have no ragi flour.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {R.sups.map((s) => (
                <div key={s.name} className={`rounded-2xl border-2 p-4 ${sub !== "gap" && s.kind === "swap" ? "border-error/50 bg-error/5" : sub === "order" && s.kind === "ok" ? "border-success bg-success/5" : "border-cocoa/15 bg-cream/60"}`}>
                  <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{s.name} · practice</div>
                  <div className="mt-1 font-display text-[1.15rem] font-semibold leading-snug text-cocoa">{s.what}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[0.95rem] font-bold text-cocoa">
                    <Truck className="size-4 text-orange" /> Delivers in {s.lead} day{s.lead === 1 ? "" : "s"}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.92rem] font-bold text-cocoa-2">
                    Days with no ragi
                    <NumIn value={gaps[s.name] ?? ""} onChange={(v) => setGaps((g) => ({ ...g, [s.name]: v }))} unit="days" label={`${s.name} days with no ragi`} disabled={sub !== "gap"} w="w-20" />
                  </div>
                </div>
              ))}
            </div>
            {sub === "gap" && (
              <button onClick={checkGaps} className="eb-btn eb-btn-primary mt-4 !normal-case">
                <Calculator className="size-4" /> Check the gaps
              </button>
            )}
            {sub === "proof" && (
              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
                <div>
                  <DocTabs docs={[CLAIMS, LABEL]} active={doc} onChange={setDoc} />
                  <TapImage doc={doc === "claims" ? CLAIMS : LABEL} onTap={(x, y) => tapProof(doc, x, y)} flash={flash[`p-${doc}`]} />
                </div>
                <p className="text-[1rem] text-cocoa">
                  {swap.name} offers <strong>jowar flour instead of ragi</strong>, delivered tomorrow. Tap the printed words on the pack that make this swap a broken promise.
                </p>
              </div>
            )}
            {sub === "order" && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-cream p-4">
                <span className="text-[1rem] font-bold text-cocoa">
                  Today is day 0. Last day to order from {ok.name}: day
                </span>
                <NumIn value={order} onChange={setOrder} label="Last day to order" w="w-20" />
                <button onClick={checkOrder} className="eb-btn eb-btn-primary !normal-case">
                  <Check className="size-4" /> Check
                </button>
              </div>
            )}
          </motion.div>
        )}
        {step >= 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="grid content-start gap-2">
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">Your evidence</div>
              {[
                `Ragi flour is 30% of the flour mix (real label).`,
                `${R.stock} kg in stock = ${R.batches} batches = ${R.cover} full days.`,
                `${late.name}: ${gapOf(late)} days with no ragi.`,
                `${swap.name}: no gap, but breaks the printed promise (${proof?.says ?? ""}).`,
                `${ok.name}: arrives in ${ok.lead} days; order by day ${R.orderBy}.`,
              ].map((t) => (
                <div key={t} className="rounded-xl bg-success/10 px-3 py-2 text-[0.92rem] text-cocoa">
                  {t}
                </div>
              ))}
            </div>
            <div>
              <label htmlFor="sd-plan" className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                Your plan
              </label>
              <textarea id="sd-plan" value={plan} disabled={step === 4} onChange={(e) => setPlan(e.target.value)} rows={4} placeholder="We have … days of ragi left, so we will order from Supplier … by day …" className="mt-1 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
              <ul className="mt-2 grid gap-1.5">
                {checks.map((c) => (
                  <CheckRow key={c.label} {...c} />
                ))}
              </ul>
              {step === 3 && (
                <button disabled={!planOk} onClick={finish} className="eb-btn eb-btn-primary mt-4 !normal-case">
                  <Check className="size-4" /> Submit my plan
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameFrame>
  );
}
