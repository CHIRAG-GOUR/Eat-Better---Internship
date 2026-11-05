"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lock, MapPin } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 1 · The Positioning Map.
 * Research basis: classroom perceptual-mapping exercises (plot brands from their features/benefits on two
 * axes, look for the gap, then write a positioning statement). Students must (a) place each brand from its
 * evidence and (b) back the placement with one clue per axis before it locks — no guessing past a brand.
 * Competitor brands are FICTIONAL types named in the chapter's objective; Eat Better's clues come from its packs.
 */

type Clue = { text: string; axis: "x" | "y" | null; dir: 1 | -1 };
type Brand = { id: string; name: string; kind: string; real: boolean; color: string; clues: Clue[]; x: number; y: number };

// x: 0 = new / unfamiliar formats → 1 = familiar Indian snacks · y: 0 = indulgence first → 1 = better-for-you ingredients
const BRANDS: Brand[] = [
  {
    id: "mithai",
    name: "Mithai Mahal",
    kind: "Traditional sweet shop (fictional)",
    real: false,
    color: "#B3261E",
    x: 0.85,
    y: 0.15,
    clues: [
      { text: "Kaju katli, gulab jamun and boondi laddoos — sweets every family knows", axis: "x", dir: 1 },
      { text: "Made with sugar syrup and lots of ghee", axis: "y", dir: -1 },
      { text: "Sold by weight from a glass counter", axis: null, dir: 1 },
      { text: "“Celebrate every festival the traditional way”", axis: "x", dir: 1 },
    ],
  },
  {
    id: "namkeen",
    name: "Crunch Masters",
    kind: "Mainstream namkeen brand (fictional)",
    real: false,
    color: "#C9A400",
    x: 0.78,
    y: 0.22,
    clues: [
      { text: "Deep-fried for extra crunch", axis: "y", dir: -1 },
      { text: "Aloo bhujia, sev and chakli — classic tea-time namkeen", axis: "x", dir: 1 },
      { text: "Big family packs at low prices", axis: null, dir: 1 },
      { text: "Palm oil appears in the ingredient list", axis: "y", dir: -1 },
    ],
  },
  {
    id: "protein",
    name: "ProteinPeak",
    kind: "Health-first snack brand (fictional)",
    real: false,
    color: "#1E5AA8",
    x: 0.18,
    y: 0.86,
    clues: [
      { text: "Flavours like “cookie dough” and “blueberry cheesecake”", axis: "x", dir: -1 },
      { text: "Sold mainly in gyms and fitness apps", axis: null, dir: 1 },
      { text: "Every pack says “High protein · zero added sugar”", axis: "y", dir: 1 },
      { text: "Protein bars and protein cookies", axis: "x", dir: -1 },
    ],
  },
  {
    id: "eb",
    name: "Eat Better",
    kind: "The brand in this chapter",
    real: true,
    color: "#FF5C00",
    x: 0.82,
    y: 0.8,
    clues: [
      { text: "“Roasted not fried · No palm oil” printed on the Millet Bhujia pack", axis: "y", dir: 1 },
      { text: "Ships its snacks across India", axis: null, dir: 1 },
      { text: "Millet Bhujia, Bombay Bhel and dry-fruit laddoos", axis: "x", dir: 1 },
      { text: "“Sweetened with dates” printed on the laddoo pack", axis: "y", dir: 1 },
    ],
  },
];

const side = (v: number) => (v >= 0.5 ? 1 : -1);
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export default function PositionMap({ onDone }: { onDone: (summary: string) => void }) {
  const [step, setStep] = useState(0);
  const [cur, setCur] = useState(0);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const [locked, setLocked] = useState<string[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [gap, setGap] = useState<string | null>(null);
  const [stmt, setStmt] = useState({ who: "", need: "", diff: "", proof: "" });
  const map = useRef<HTMLDivElement>(null);
  const brand = BRANDS[cur];

  const reset = () => {
    setStep(0);
    setCur(0);
    setPos({});
    setLocked([]);
    setPicked([]);
    setMistakes(0);
    setFb(null);
    setGap(null);
    setStmt({ who: "", need: "", diff: "", proof: "" });
  };

  const place = (e: React.PointerEvent) => {
    if (step !== 0 || !brand) return;
    const r = map.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    setPos((p) => ({ ...p, [brand.id]: { x, y } }));
    setFb(null);
  };

  const lockBrand = () => {
    const p = pos[brand.id];
    if (!p) return setFb({ tone: "info", text: `Tap the map to place ${brand.name} first.` });
    const fail = (text: string) => {
      setMistakes((m) => m + 1);
      setFb({ tone: "bad", text });
    };
    const xClue = brand.clues.find((c) => c.axis === "x")!;
    const yClue = brand.clues.find((c) => c.axis === "y")!;
    if (side(p.x) !== side(brand.x)) return fail(`Check the left–right axis. “${xClue.text}” — is that a familiar Indian snack or a new format?`);
    if (side(p.y) !== side(brand.y)) return fail(`Check the up–down axis. “${yClue.text}” — does that point to indulgence or to better-for-you ingredients?`);
    const chosen = picked.map((i) => brand.clues[i]);
    if (chosen.length !== 2) return fail("Now back it up: tap exactly two clues, one for each axis.");
    if (chosen.some((c) => c.axis === null)) {
      const c = chosen.find((x) => x.axis === null)!;
      return fail(`“${c.text}” is about how it is sold, not about familiarity or ingredients. Pick a clue that explains an axis.`);
    }
    if (chosen[0].axis === chosen[1].axis) return fail(`Both clues explain the ${chosen[0].axis === "x" ? "left–right (familiarity)" : "up–down (ingredients)"} axis. You need one clue for each axis.`);
    setLocked((l) => [...l, brand.id]);
    setPicked([]);
    setFb({ tone: "good", text: `${brand.name} is locked: ${side(brand.x) > 0 ? "familiar formats" : "new formats"} and ${side(brand.y) > 0 ? "better-for-you ingredients" : "indulgence first"} — and you showed the evidence.` });
    if (cur + 1 < BRANDS.length) setCur(cur + 1);
    else setStep(1);
  };

  const QUADS = [
    { id: "tl", label: "New formats · better-for-you", x: 0, y: 0 },
    { id: "tr", label: "Familiar snacks · better-for-you", x: 1, y: 0 },
    { id: "bl", label: "New formats · indulgence first", x: 0, y: 1 },
    { id: "br", label: "Familiar snacks · indulgence first", x: 1, y: 1 },
  ];
  const pickGap = (id: string) => {
    if (step !== 1) return;
    setGap(id);
    if (id === "tr") {
      setFb({ tone: "good", text: "That is the space the chapter describes: between traditional indulgent snacks and products marketed mainly around health — familiar snacks with a better-for-you approach. Only Eat Better sits there." });
      setStep(2);
    } else {
      setMistakes((m) => m + 1);
      const who = QUADS.find((q) => q.id === id)!.label;
      const there = BRANDS.filter((b) => (side(b.x) > 0 ? "r" : "l") === id[1] && (side(b.y) > 0 ? "t" : "b") === id[0]).map((b) => b.name);
      setFb({ tone: "bad", text: `“${who}” already has ${there.length ? there.join(" and ") : "no one"} in it${there.length ? "" : " — but it isn't where Eat Better stands"}. Look for the corner where Eat Better is on its own.` });
    }
  };

  const checks = useMemo(() => {
    const all = `${stmt.who} ${stmt.need} ${stmt.diff} ${stmt.proof}`.toLowerCase();
    return [
      { ok: /famil|parent|kid|child|professional|work|office|gift|corporate|student|mom|dad|mother|father/i.test(stmt.who), label: "A clear target customer", hint: "Who exactly? e.g. busy parents, working professionals." },
      { ok: /tast|famil|enjoy|crunch|flavou?r|chatpata|love/i.test(stmt.need) && words(stmt.need) >= 4, label: "A real customer need", hint: "What do they want from a snack? Use at least four words." },
      { ok: /(famil|tradition|indian|bhujia|namkeen|laddoo|bhel|taste)/i.test(stmt.diff) && /(better|roast|not fried|palm|date|refined|ingredient|healthi|clean)/i.test(stmt.diff), label: "Point of difference: familiar AND better-for-you", hint: "Mention both halves: the familiar taste and the better-for-you part." },
      { ok: /(roast|not fried|palm oil|dates|six|6.?layer|quality check|trans)/i.test(stmt.proof), label: "Proof a shopper can check", hint: "Use a claim printed on the pack, e.g. “Roasted not fried”, “No palm oil”, “Sweetened with dates”." },
      { ok: !/(best in the world|no\.? ?1|number one|zero calories|guaranteed|cures?)/i.test(all), label: "No claims you can't prove", hint: "Remove words like “best in the world” or “zero calories”." },
    ];
  }, [stmt]);
  const allOk = checks.every((c) => c.ok);
  const finish = () => {
    const sentence = `For ${stmt.who.trim()} who ${stmt.need.trim()}, Eat Better is the snack brand that ${stmt.diff.trim()}, because ${stmt.proof.trim()}.`;
    setStep(3);
    setFb({ tone: "good", text: "Positioning statement saved. It names who, what they need, why Eat Better is different and the proof." });
    onDone(`Positioning Map: mapped 4 brands with evidence (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}). Statement: ${sentence}`);
  };

  return (
    <GameFrame
      kicker="Activity 1 · Positioning Map"
      title="Find where Eat Better stands"
      mission="Read each brand's clues, place it on the map, then prove the spot with one clue per axis. When the map is complete, find the space Eat Better owns and write its positioning statement."
      steps={["Map the brands", "Find the space", "Write the statement"]}
      step={step}
      stars={step === 3 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{ real: "Eat Better's clues are printed on its own packs. The competitor types are the ones named in this chapter.", practice: "Mithai Mahal, Crunch Masters and ProteinPeak are made-up brands for practice.", tip: "Place a brand from what it is, not how it is sold. Price, pack size and where it is sold are not on these axes." }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        {/* the map */}
        <div className="min-w-0">
          <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
            <div className="absolute -left-1 top-1/2 hidden -translate-x-full -translate-y-1/2 -rotate-90 whitespace-nowrap text-[0.8rem] font-bold text-cocoa-2 sm:block" />
            <div ref={map} onPointerDown={place} className={`absolute inset-0 overflow-hidden rounded-[22px] border-2 border-cocoa bg-[#FFF8F1] ${step === 0 ? "cursor-crosshair" : ""}`} aria-label="Positioning map: left is new formats, right is familiar Indian snacks, bottom is indulgence first, top is better-for-you ingredients">
              {/* quadrants */}
              {QUADS.map((q) => {
                const on = gap === q.id;
                return (
                  <button
                    key={q.id}
                    onPointerDown={(e) => step === 1 && e.stopPropagation()}
                    onClick={() => pickGap(q.id)}
                    disabled={step !== 1}
                    className={`absolute flex size-1/2 items-start p-2 text-left text-[0.72rem] font-extrabold uppercase leading-tight tracking-[0.06em] transition-colors sm:text-[0.78rem] ${q.x ? "left-1/2" : "left-0"} ${q.y ? "top-1/2" : "top-0"} ${on ? (q.id === "tr" ? "bg-success/15 text-success" : "bg-error/10 text-error") : step === 1 ? "text-cocoa-2/70 hover:bg-orange/10" : "text-cocoa-2/45"} ${step === 1 ? "pointer-events-auto" : "pointer-events-none"}`}
                  >
                    {q.label}
                  </button>
                );
              })}
              <div className="pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-cocoa/30" />
              <div className="pointer-events-none absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-cocoa/30" />
              {/* tokens */}
              {BRANDS.map((b) => {
                const p = pos[b.id];
                if (!p) return null;
                const isLocked = locked.includes(b.id);
                return (
                  <motion.div
                    key={b.id}
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    animate={{ left: `${p.x * 100}%`, top: `${(1 - p.y) * 100}%`, scale: isLocked ? 1 : 1.08 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="grid size-9 place-items-center rounded-full border-2 border-white text-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)]" style={{ background: b.color }}>
                        {isLocked ? <Lock className="size-4" /> : <MapPin className="size-4" />}
                      </span>
                      <span className="mt-0.5 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[0.75rem] font-extrabold text-cocoa shadow">{b.name}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="mx-auto mt-2 grid max-w-[520px] grid-cols-2 text-[0.8rem] font-bold text-cocoa-2">
            <span>← New or unfamiliar formats</span>
            <span className="text-right">Familiar Indian snacks →</span>
          </div>
          <p className="mx-auto max-w-[520px] text-center text-[0.8rem] font-bold text-cocoa-2">↑ Better-for-you ingredients · ↓ Indulgence first</p>
        </div>

        {/* the working panel */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 0 && brand && (
              <motion.div key={brand.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full text-white" style={{ background: brand.color }}>
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <div className="font-display text-[1.3rem] font-semibold leading-tight text-cocoa">{brand.name}</div>
                    <div className="text-[0.9rem] font-bold text-cocoa-2">
                      {brand.kind} · brand {cur + 1} of {BRANDS.length}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[0.98rem] text-cocoa">
                  <strong>1.</strong> Tap the map to place it. <strong>2.</strong> Tap the two clues that prove your spot. <strong>3.</strong> Lock it.
                </p>
                <ul className="mt-3 grid gap-2">
                  {brand.clues.map((c, i) => {
                    const on = picked.includes(i);
                    return (
                      <li key={c.text}>
                        <button
                          onClick={() => setPicked((p) => (on ? p.filter((x) => x !== i) : p.length >= 2 ? [p[1], i] : [...p, i]))}
                          aria-pressed={on}
                          className={`flex w-full items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-[0.98rem] leading-snug transition-colors ${on ? "border-orange bg-orange/10 font-bold text-cocoa" : "border-cocoa/10 bg-cream/60 text-cocoa hover:border-cocoa/40"}`}
                        >
                          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 ${on ? "border-orange bg-orange text-white" : "border-cocoa/30"}`}>{on && <Check className="size-3.5" strokeWidth={3} />}</span>
                          {c.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button onClick={lockBrand} className="eb-btn eb-btn-primary mt-4 !normal-case">
                  <Lock className="size-4" /> Lock {brand.name}
                </button>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="gap" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="font-display text-[1.3rem] font-semibold text-cocoa">The map is complete.</div>
                <p className="mt-2 text-[1.02rem] leading-relaxed text-cocoa">Brand positioning is the place a brand holds in a customer&apos;s mind compared with competing brands. Tap the corner of the map that Eat Better holds on its own.</p>
              </motion.div>
            )}
            {step >= 2 && (
              <motion.div key="stmt" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="font-display text-[1.3rem] font-semibold text-cocoa">Write Eat Better&apos;s positioning statement</div>
                <div className="mt-3 grid gap-2 text-[1rem] text-cocoa">
                  {(
                    [
                      ["who", "For", "busy parents…"],
                      ["need", "who", "want snacks the whole family enjoys…"],
                      ["diff", "Eat Better is the snack brand that", "keeps familiar Indian flavours but…"],
                      ["proof", "because", "its packs say…"],
                    ] as const
                  ).map(([k, lead, ph]) => (
                    <label key={k} className="grid gap-1">
                      <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.08em] text-orange">{lead}</span>
                      <input value={stmt[k]} disabled={step === 3} onChange={(e) => setStmt((s) => ({ ...s, [k]: e.target.value }))} placeholder={ph} className="rounded-xl border border-line-strong bg-cream/50 px-3.5 py-2.5 text-[1rem] outline-none focus:border-orange" />
                    </label>
                  ))}
                </div>
                <ul className="mt-3 grid gap-1.5">
                  {checks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </ul>
                {step === 2 && (
                  <button disabled={!allOk} onClick={finish} className="eb-btn eb-btn-primary mt-4 !normal-case">
                    <Check className="size-4" /> Save my statement
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
