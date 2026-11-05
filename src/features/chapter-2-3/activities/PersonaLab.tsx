"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Quote, Trash2, User } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";

/**
 * Activity 3 · The Persona Lab.
 * Research basis: practitioner persona work — every persona claim must be backed by a real quote, and a
 * pattern only counts when it repeats across interviews. Students file quotes from four FICTIONAL interviews
 * into the persona card; a trait is confirmed only when two different people say it. One interviewee belongs
 * to a different audience, and off-topic lines must be binned. Then they name the audience from the chapter's
 * table and write a message that uses only confirmed traits.
 */

type Field = "profile" | "need" | "consider" | "bin";
type Line = { id: string; text: string; field: Field; trait?: string; why: string };
type Person = { id: string; name: string; who: string; lines: Line[] };

const TRAITS: Record<string, { field: Exclude<Field, "bin">; label: string }> = {
  busy: { field: "profile", label: "Works long, busy days" },
  desk: { field: "need", label: "Eats at the desk or on short breaks" },
  taste: { field: "need", label: "Still wants real, chatpata taste" },
  pack: { field: "consider", label: "Small packs that don't go stale" },
  ingredients: { field: "consider", label: "Checks if a snack is fried" },
};

const PEOPLE: Person[] = [
  {
    id: "aman",
    name: "Aman, 27",
    who: "Software tester",
    lines: [
      { id: "a1", text: "My days are back-to-back calls.", field: "profile", trait: "busy", why: "That tells us about his life — the profile." },
      { id: "a2", text: "I snack at my desk between meetings.", field: "need", trait: "desk", why: "When and where he snacks is a need the product must fit." },
      { id: "a3", text: "I still want that chatpata taste — bland snacks are a no.", field: "need", trait: "taste", why: "Taste is what he wants from the snack." },
      { id: "a4", text: "I play cricket every Sunday.", field: "bin", why: "True, but it says nothing about how he buys snacks." },
    ],
  },
  {
    id: "neha",
    name: "Neha, 31",
    who: "Bank analyst",
    lines: [
      { id: "n1", text: "I usually work late, three or four days a week.", field: "profile", trait: "busy", why: "Another busy schedule — this confirms the profile trait." },
      { id: "n2", text: "Big family packs go soft and stale in my office drawer.", field: "consider", trait: "pack", why: "Pack size affects whether she buys — a buying consideration." },
      { id: "n3", text: "If it tastes boring, I won't buy it again.", field: "need", trait: "taste", why: "Taste again — now two people say it." },
      { id: "n4", text: "My favourite colour is blue.", field: "bin", why: "Not about snacking at all." },
    ],
  },
  {
    id: "farah",
    name: "Farah, 29",
    who: "Hospital nurse",
    lines: [
      { id: "f1", text: "My breaks are ten minutes long, so I need something I can open and eat fast.", field: "need", trait: "desk", why: "Short breaks — the same need Aman has." },
      { id: "f2", text: "One small pack is perfect for my shift bag.", field: "consider", trait: "pack", why: "Pack size again — confirmed by two people." },
      { id: "f3", text: "I turn the pack over to check if it's fried.", field: "consider", trait: "ingredients", why: "Checking ingredients shapes her choice." },
      { id: "f4", text: "I work twelve-hour shifts.", field: "profile", trait: "busy", why: "A long, busy day — profile." },
    ],
  },
  {
    id: "gupta",
    name: "Mr Gupta, 52",
    who: "Office administrator",
    lines: [
      { id: "g1", text: "I need 200 gift boxes for our staff before Diwali.", field: "bin", why: "He's a corporate gift buyer — a different target audience. Keep this persona about one group." },
      { id: "g2", text: "The boxes must look premium with our logo on them.", field: "bin", why: "Customisation for bulk gifts belongs to the corporate-buyer audience, not this persona." },
      { id: "g3", text: "Sometimes I read the label to see if it's fried.", field: "consider", trait: "ingredients", why: "Even a different buyer can share a habit — this confirms “checks if it's fried”." },
    ],
  },
];

const ALL = PEOPLE.flatMap((p) => p.lines.map((l) => ({ ...l, person: p.id, personName: p.name })));
const FIELDS: { id: Field; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "need", label: "Need" },
  { id: "consider", label: "Buying considerations" },
  { id: "bin", label: "Not for this persona" },
];
const AUDIENCES = ["Health-conscious families", "Working professionals", "Festive gift buyers", "Corporate buyers"];

export default function PersonaLab({ onDone }: { onDone: (summary: string) => void }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [filed, setFiled] = useState<Record<string, Field>>({});
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [aud, setAud] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const reset = () => {
    setStep(0);
    setSel(null);
    setFiled({});
    setMistakes(0);
    setFb(null);
    setAud(null);
    setMsg("");
  };

  const support = useMemo(() => {
    const s: Record<string, Set<string>> = {};
    for (const l of ALL) if (filed[l.id] && l.trait) (s[l.trait] ??= new Set()).add(l.person);
    return s;
  }, [filed]);
  const confirmed = Object.keys(TRAITS).filter((t) => (support[t]?.size ?? 0) >= 2);
  const allFiled = ALL.every((l) => filed[l.id]);

  const file = (f: Field) => {
    if (!sel) return setFb({ tone: "info", text: "First tap a quote from an interview, then tap where it belongs on the persona card." });
    const l = ALL.find((x) => x.id === sel)!;
    if (l.field !== f) {
      setMistakes((m) => m + 1);
      const hint = l.field === "bin" ? "Does this line tell us how this group buys snacks?" : `Ask: is it about who they are (profile), what they want (need), or what makes them choose a pack (buying considerations)?`;
      return setFb({ tone: "bad", text: `“${l.text}” doesn't go in ${FIELDS.find((x) => x.id === f)!.label}. ${hint}` });
    }
    const next = { ...filed, [l.id]: f };
    setFiled(next);
    setSel(null);
    const t = l.trait;
    const n = t ? new Set(ALL.filter((x) => next[x.id] && x.trait === t).map((x) => x.person)).size : 0;
    setFb({ tone: "good", text: `${l.why}${t ? (n >= 2 ? ` Trait confirmed: “${TRAITS[t].label}” — ${n} people said it.` : ` One person so far — a trait needs a second person before it counts.`) : ""}` });
    if (ALL.every((x) => next[x.id])) {
      setStep(1);
      setFb({ tone: "info", text: "Every quote is filed and all five traits are confirmed by at least two people. Now: which target audience from the chapter is this?" });
    }
  };

  const pickAud = (a: string) => {
    setAud(a);
    if (a === "Working professionals") {
      setStep(2);
      setFb({ tone: "good", text: "The table: working professionals need “convenient snacks for work breaks and busy schedules”, and Eat Better could “highlight convenience, taste and suitable pack sizes” — exactly what your evidence shows." });
    } else {
      setMistakes((m) => m + 1);
      setFb({ tone: "bad", text: `Look at your confirmed traits: busy days, desk and short breaks, small packs. Which row of the table lists “convenient snacks for work breaks and busy schedules”?` });
    }
  };

  const checks = useMemo(() => {
    const t = msg.trim();
    const w = t.split(/\s+/).filter(Boolean).length;
    return [
      { ok: /(break|desk|on the go|shift|busy|quick|between|drawer|bag|carry)/i.test(t), label: "Uses a confirmed need: desk and short breaks", hint: "Mention the break, the desk or a busy day." },
      { ok: /(tast|chatpata|crunch|flavou?r|delicious|masala)/i.test(t), label: "Uses a confirmed need: real taste", hint: "Promise the taste they said they want." },
      { ok: /(small|single|mini|one pack|pocket|fresh|stale|re.?seal)/i.test(t), label: "Answers a buying consideration: pack size", hint: "Say something about the small pack." },
      { ok: /(roast|not fried|baked|palm oil|ingredient)/i.test(t), label: "Answers a buying consideration: not fried / ingredients", hint: "They check if it's fried — tell them, truthfully." },
      { ok: w >= 6 && w <= 22, label: "6–22 words, like a real ad line", hint: `Now ${w} words.` },
    ];
  }, [msg]);
  const done = checks.every((c) => c.ok);
  const finish = () => {
    setStep(3);
    setFb({ tone: "good", text: "Your persona and message are built entirely from evidence — every word traces back to something two people said." });
    onDone(`Persona Lab: The Desk-Break Snacker (working professionals), 5 traits each confirmed by 2+ interviews (${mistakes} mistakes). Message: “${msg.trim()}”`);
  };

  const selLine = ALL.find((l) => l.id === sel);

  return (
    <GameFrame
      kicker="Activity 3 · Persona Lab"
      title="Build a persona from real evidence"
      mission="You interviewed four snack buyers. File each quote onto the persona card. A trait only counts when two different people say it — and one interview may belong to a different audience."
      steps={["File the evidence", "Name the audience", "Write the message"]}
      step={step}
      stars={step === 3 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note="Aman, Neha, Farah and Mr Gupta are fictional interviewees for classroom learning, not Eat Better customer research."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        {/* interviews */}
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {PEOPLE.map((p) => (
            <div key={p.id} className="min-w-0 rounded-2xl border border-cocoa/15 bg-cream/60 p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-full bg-cocoa text-cream">
                  <User className="size-4" />
                </span>
                <div>
                  <div className="font-display text-[1.02rem] font-semibold leading-tight text-cocoa">{p.name}</div>
                  <div className="text-[0.8rem] font-bold text-cocoa-2">{p.who}</div>
                </div>
              </div>
              <ul className="mt-2 grid gap-1.5">
                {p.lines.map((l) => {
                  const f = filed[l.id];
                  const on = sel === l.id;
                  return (
                    <li key={l.id}>
                      <button
                        disabled={!!f || step !== 0}
                        onClick={() => setSel(on ? null : l.id)}
                        aria-pressed={on}
                        className={`flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left text-[0.92rem] leading-snug transition-colors ${f ? (f === "bin" ? "bg-white/50 text-cocoa-2/50 line-through" : "bg-success/10 text-cocoa-2") : on ? "bg-orange text-white" : "bg-white text-cocoa hover:bg-peach"}`}
                      >
                        <Quote className="mt-0.5 size-3.5 shrink-0 opacity-60" />
                        {l.text}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* persona card */}
        <div className="min-w-0 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-[22px] border-2 border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
            <div className="bg-cocoa px-4 py-3 text-cream">
              <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-haldi">Persona card</div>
              <div className="font-display text-[1.25rem] font-semibold">The Desk-Break Snacker</div>
              <div className="text-[0.85rem] text-cream/80">{aud && step >= 2 ? `Target audience: ${aud}` : "Target audience: ?"}</div>
            </div>
            <div className="grid gap-2 p-3">
              {FIELDS.map((f) => {
                const traits = Object.entries(TRAITS).filter(([, t]) => t.field === f.id);
                const binned = ALL.filter((l) => filed[l.id] === "bin").length;
                return (
                  <button
                    key={f.id}
                    disabled={step !== 0}
                    onClick={() => file(f.id)}
                    className={`rounded-2xl border-2 p-3 text-left transition-colors ${sel && step === 0 ? "border-dashed border-orange bg-orange/5 hover:bg-orange/10" : "border-cocoa/10 bg-cream/50"} ${f.id === "bin" ? "" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                      <span className="flex items-center gap-1.5">
                        {f.id === "bin" && <Trash2 className="size-3.5" />}
                        {f.label}
                      </span>
                      {f.id === "bin" && <span className="tabular-nums text-cocoa-2">{binned} lines</span>}
                    </div>
                    {f.id !== "bin" && (
                      <ul className="mt-1.5 grid gap-1">
                        {traits.map(([id, t]) => {
                          const n = support[id]?.size ?? 0;
                          const ok = n >= 2;
                          return (
                            <li key={id} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-[0.9rem] ${ok ? "bg-success/12 font-bold text-cocoa" : n ? "bg-haldi/25 text-cocoa" : "text-cocoa-2/45"}`}>
                              <span>{n ? t.label : "— needs evidence —"}</span>
                              <span className="flex gap-0.5">
                                {[0, 1].map((i) => (
                                  <span key={i} className={`size-2.5 rounded-full ${i < n ? "bg-success" : "bg-cocoa/15"}`} />
                                ))}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {step === 0 && (
            <p className="mt-2 text-[0.9rem] text-cocoa-2">
              {selLine ? (
                <>
                  Filing: <strong className="text-cocoa">“{selLine.text}”</strong> — tap where it belongs.
                </>
              ) : (
                `Confirmed traits: ${confirmed.length}/5 · quotes filed: ${Object.keys(filed).length}/${ALL.length}`
              )}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-5 border-t border-cocoa/10 pt-5 lg:grid-cols-2">
            <div>
              <div className="font-display text-[1.2rem] font-semibold text-cocoa">Which target audience from the chapter&apos;s table is this?</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {AUDIENCES.map((a) => (
                  <button key={a} disabled={step !== 1} onClick={() => pickAud(a)} aria-pressed={aud === a} className={`rounded-2xl border-2 px-3 py-3 text-left text-[0.98rem] font-bold leading-tight ${aud === a ? (a === "Working professionals" ? "border-success bg-success/10" : "border-error bg-error/10") : "border-cocoa/15 bg-white hover:border-cocoa"} text-cocoa`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {step >= 2 && (
              <div>
                <label htmlFor="pmsg" className="font-display text-[1.2rem] font-semibold text-cocoa">
                  Write a marketing message for this persona
                </label>
                <p className="mt-1 text-[0.9rem] text-cocoa-2">Like the chapter&apos;s sample: “Your favourite snacking moments, with ingredients you can understand.”</p>
                <textarea id="pmsg" value={msg} disabled={step === 3} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Your message…" className="mt-2 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
                <ul className="mt-2 grid gap-1.5">
                  {checks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </ul>
                {step === 2 && (
                  <button disabled={!done} onClick={finish} className="eb-btn eb-btn-primary mt-3 !normal-case">
                    <Check className="size-4" /> Save persona and message
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {step === 0 && allFiled && null}
    </GameFrame>
  );
}
