"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { AlertTriangle, Check, CheckCircle2, Flag, Lightbulb, Microscope, Play, RotateCcw } from "lucide-react";
import {
  COOK_TARGET,
  DIALS,
  LABEL_ITEMS,
  LOTS,
  MACHINES,
  MATERIALS,
  ORDER,
  PARTICLES,
  PREP_ORDER,
  QC_CRITERIA,
  SAMPLES,
  STATION_INFO,
  TEST_CRITERIA,
  TEST_RULES,
  TRAYS,
  type StationId,
} from "./data";
import { mistakesAt, useFacility, type Inspect } from "./store";

type Feedback = { ok: boolean; text: string } | null;

const SIM = "Simulated batch for training — not a real Eat Better batch.";

function Fb({ fb }: { fb: Feedback }) {
  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait">
        {fb && (
          <motion.div
            key={fb.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 flex gap-2 rounded-xl px-3 py-2.5 text-[0.95rem] leading-snug text-cocoa ${fb.ok ? "bg-success/10" : "bg-error/10"}`}
          >
            {fb.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" />}
            <span>
              {!fb.ok && <strong className="text-error">Consequence (simulated): </strong>}
              {fb.ok && <strong className="text-success">Correct decision. </strong>}
              {fb.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-cocoa/10 bg-white p-3">
      <div className="flex items-center gap-2 text-[0.95rem] font-bold text-cocoa">
        <span className={`grid size-6 place-items-center rounded-full text-[0.8rem] font-extrabold ${done ? "bg-success text-white" : "bg-orange text-white"}`}>{done ? <Check className="size-3.5" strokeWidth={3} /> : n}</span>
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const small = "rounded-lg border-2 px-2.5 py-1.5 text-[0.88rem] font-bold transition-colors disabled:opacity-40";

/* ── 01 Sourcing ──────────────────────────────────────────────── */

function SourcingPanel({ done }: { done: boolean }) {
  const src = useFacility((s) => s.src);
  const { patch, record, pass, setInspect } = useFacility.getState();
  const [fb, setFb] = useState<Feedback>(null);
  const all = LOTS.every((l) => src.decisions[l.id]);
  const submit = () => {
    const wrongLots = LOTS.filter((l) => (src.decisions[l.id] === "reject") !== l.fault);
    const summary = LOTS.map((l) => `Lot ${l.id}: ${src.decisions[l.id]}`).join(", ");
    if (!wrongLots.length) {
      record("sourcing", summary, true, "Rejected the lot with a freshness problem.");
      pass("sourcing");
      setFb({ ok: true, text: "Lot B goes back to the supplier. Lots A and C move on — walk to station 02, Quality Check." });
    } else {
      const acceptedBad = wrongLots.some((l) => l.fault);
      const note = acceptedBad ? "Spotted, damp dates would enter production — every pack made from them could spoil." : "Rejecting good material wastes it and delays the whole batch.";
      record("sourcing", summary, false, note);
      setFb({ ok: false, text: note + " Look again and change your decision." });
      const d = { ...src.decisions };
      wrongLots.forEach((l) => delete d[l.id]);
      patch("src", { decisions: d });
    }
  };
  return (
    <>
      <p className="text-[0.95rem] text-cocoa">Click each sack on the receiving dock to inspect it, then accept or reject each lot.</p>
      <ul className="mt-3 space-y-2">
        {LOTS.map((l) => {
          const seen = src.inspected.includes(l.id);
          const d = src.decisions[l.id];
          return (
            <li key={l.id} className="rounded-xl border border-cocoa/10 bg-white p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-cocoa">{l.name}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      patch("src", { selected: l.id, inspected: seen ? src.inspected : [...src.inspected, l.id] });
                      setInspect({ kind: "lot", id: l.id });
                    }}
                    className={`${small} border-cocoa/20 bg-white text-cocoa hover:border-cocoa`}
                  >
                    <Microscope className="mr-1 inline size-3.5" />
                    Inspect
                  </button>
                  <button disabled={!seen || done} onClick={() => patch("src", { decisions: { ...src.decisions, [l.id]: "accept" } })} className={`${small} ${d === "accept" ? "border-success bg-success/10 text-success" : "border-cocoa/15 bg-white text-cocoa"}`}>
                    Accept
                  </button>
                  <button disabled={!seen || done} onClick={() => patch("src", { decisions: { ...src.decisions, [l.id]: "reject" } })} className={`${small} ${d === "reject" ? "border-error bg-error/10 text-error" : "border-cocoa/15 bg-white text-cocoa"}`}>
                    Reject
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[0.88rem] text-cocoa-2">{seen ? l.finding : "Not inspected yet."}</p>
            </li>
          );
        })}
      </ul>
      {!done && (
        <button disabled={!all} onClick={submit} className="eb-btn eb-btn-primary mt-3 !normal-case">
          Confirm lot decisions
        </button>
      )}
      <Fb fb={fb} />
    </>
  );
}

/* ── 02 Quality Check ─────────────────────────────────────────── */

function CheckPanel({ done }: { done: boolean }) {
  const qc = useFacility((s) => s.qc);
  const { patch, record, pass, setInspect } = useFacility.getState();
  const [fb, setFb] = useState<Feedback>(null);
  const all = TRAYS.every((t) => qc.seen.includes(t.id) && qc.flags[t.id] !== undefined);
  const submit = () => {
    const wrong = TRAYS.filter((t) => !!qc.flags[t.id] !== !!t.fault);
    const summary = TRAYS.map((t) => `${t.name}: ${qc.flags[t.id] ? "flagged" : "passed"}`).join(", ");
    if (!wrong.length) {
      record("check", summary, true, "Flagged the trays that failed the criteria.");
      pass("check");
      setFb({ ok: true, text: "Trays 2 and 3 are held back; Tray 1 continues. Walk to station 03, Prepping." });
    } else {
      const note = wrong.some((t) => t.id === "T2")
        ? "Stones and husk would go on into prepping and cooking — a safety risk."
        : wrong.some((t) => t.id === "T3")
          ? "Uneven pieces cook unevenly — some burn while others stay under-done."
          : "Holding back a good tray wastes material.";
      record("check", summary, false, note);
      setFb({ ok: false, text: note + " Re-check the trays against the criteria." });
    }
  };
  return (
    <>
      <div className="rounded-xl bg-peach/60 p-2.5">
        <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">Inspection criteria (simulated)</div>
        <ul className="mt-1 list-disc pl-5 text-[0.88rem] text-cocoa">
          {QC_CRITERIA.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[0.95rem] text-cocoa">Move the magnifier over each tray on the table (tap a tray on a phone). Then pass or flag it.</p>
      <ul className="mt-2 space-y-2">
        {TRAYS.map((t) => {
          const seen = qc.seen.includes(t.id);
          const f = qc.flags[t.id];
          return (
            <li key={t.id} className="rounded-xl border border-cocoa/10 bg-white p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-cocoa">{t.name}</span>
                <div className="flex gap-1.5">
                  {!seen && (
                    <button
                      onClick={() => {
                        patch("qc", { seen: [...qc.seen, t.id] });
                        setInspect({ kind: "tray", id: t.id });
                      }}
                      className={`${small} border-cocoa/20 bg-white text-cocoa hover:border-cocoa`}
                    >
                      <Microscope className="mr-1 inline size-3.5" />
                      Magnify
                    </button>
                  )}
                  <button disabled={!seen || done} onClick={() => patch("qc", { flags: { ...qc.flags, [t.id]: false } })} className={`${small} ${f === false ? "border-success bg-success/10 text-success" : "border-cocoa/15 bg-white text-cocoa"}`}>
                    Pass
                  </button>
                  <button disabled={!seen || done} onClick={() => patch("qc", { flags: { ...qc.flags, [t.id]: true } })} className={`${small} ${f === true ? "border-error bg-error/10 text-error" : "border-cocoa/15 bg-white text-cocoa"}`}>
                    <Flag className="mr-1 inline size-3.5" />
                    Flag
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[0.88rem] text-cocoa-2">{seen ? t.finding : "Not magnified yet."}</p>
            </li>
          );
        })}
      </ul>
      {!done && (
        <button disabled={!all} onClick={submit} className="eb-btn eb-btn-primary mt-3 !normal-case">
          Submit inspection
        </button>
      )}
      <Fb fb={fb} />
    </>
  );
}

/* ── 03 Prepping ──────────────────────────────────────────────── */

function PrepPanel({ done }: { done: boolean }) {
  const prep = useFacility((s) => s.prep);
  const { patch, record, pass } = useFacility.getState();
  const [fb, setFb] = useState<Feedback>(null);
  const [hint, setHint] = useState(false);
  const run = () => {
    const ok = prep.seq.join() === PREP_ORDER.join();
    const summary = `Sequence: ${prep.seq.map((id) => MACHINES.find((m) => m.id === id)!.name).join(" → ")}`;
    if (ok) {
      record("prepping", summary, true, "Set the chapter's order: cleaning → dry roasting → sorting.");
      patch("prep", { ran: true });
      setFb({ ok: true, text: "The batch runs through cleaning, dry roasting and sorting. Now check the sorter's output tray." });
    } else {
      const note = "Out of order, the batch isn't hygienically cleaned before roasting, or impurities aren't sorted out at the end. The chapter's order is hygienic cleaning → dry roasting → meticulous sorting.";
      record("prepping", summary, false, note);
      patch("prep", { seq: [] });
      setFb({ ok: false, text: note });
    }
  };
  const decide = (choice: string, ok: boolean) => {
    if (ok) {
      record("prepping", choice, true, "Incomplete sorting found — batch re-sorted and re-inspected.");
      pass("prepping");
      setFb({ ok: true, text: "Sorting was incomplete, so the whole batch is re-sorted and re-inspected. Walk to station 04, Cooking." });
    } else {
      const note = "If sorting missed these particles, it may have missed others you can't see. They would end up in customers' packs.";
      record("prepping", choice, false, note);
      setFb({ ok: false, text: note });
    }
  };
  const allFound = prep.found.length >= PARTICLES;
  return (
    <>
      <Step n={1} title="Set the preparation sequence" done={prep.ran}>
        <p className="text-[0.9rem] text-cocoa-2">Click the machines in 3D, or use the buttons, in the order the batch should go through them.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MACHINES.map((m) => (
            <button
              key={m.id}
              disabled={prep.ran || prep.seq.includes(m.id)}
              onClick={() => patch("prep", { seq: [...prep.seq, m.id] })}
              className={`${small} border-cocoa/15 bg-white text-cocoa hover:border-cocoa`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex min-h-[2rem] flex-wrap items-center gap-1.5 text-[0.9rem] font-bold text-cocoa">
          {prep.seq.length ? prep.seq.map((id, i) => <span key={id} className="rounded-lg bg-orange/15 px-2 py-1">{`${i + 1}. ${MACHINES.find((m) => m.id === id)!.name}`}</span>) : <span className="font-medium text-cocoa-2">No machines chosen yet.</span>}
        </div>
        {!prep.ran && (
          <div className="mt-2 flex gap-2">
            <button disabled={prep.seq.length < 3} onClick={run} className="eb-btn eb-btn-primary !py-1.5 !normal-case">
              <Play className="size-4" /> Run sequence
            </button>
            <button disabled={!prep.seq.length} onClick={() => patch("prep", { seq: [] })} className="eb-btn eb-btn-secondary !py-1.5 !normal-case">
              <RotateCcw className="size-4" /> Clear
            </button>
          </div>
        )}
      </Step>
      {prep.ran && (
        <Step n={2} title="Inspect the sorted output" done={allFound}>
          <p className="text-[0.9rem] text-cocoa">
            Click every grey particle left in the steel tray in front of the sorter. Found: <strong>{prep.found.length}/{PARTICLES}</strong>
          </p>
          {!allFound && (
            <button onClick={() => setHint(true)} className="mt-1 text-[0.85rem] font-bold text-orange underline">
              I can&apos;t find them
            </button>
          )}
          {hint && !allFound && (
            <>
              <p className="mt-1 text-[0.85rem] text-cocoa-2">Walk up close to station 03 — the tray is on the right, in front of the sorting machine. The particles are darker and larger than the millet grains.</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Keyboard alternative: mark particles">
                {Array.from({ length: PARTICLES }, (_, k) => (
                  <button key={k} disabled={prep.found.includes(k)} onClick={() => patch("prep", { found: [...prep.found, k] })} className={`${small} border-cocoa/15 bg-white text-cocoa`}>
                    Mark particle {k + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </Step>
      )}
      {allFound && !done && (
        <Step n={3} title="What happens to this batch now?">
          <div className="grid gap-1.5">
            <button onClick={() => decide("Send the batch on to cooking", false)} className={`${small} border-cocoa/15 bg-white text-left text-cocoa hover:border-orange`}>
              Send the batch on to cooking
            </button>
            <button onClick={() => decide("Pick out the particles I found and continue", false)} className={`${small} border-cocoa/15 bg-white text-left text-cocoa hover:border-orange`}>
              Pick out the particles I found and continue
            </button>
            <button onClick={() => decide("Re-sort the whole batch and re-inspect before cooking", true)} className={`${small} border-cocoa/15 bg-white text-left text-cocoa hover:border-orange`}>
              Re-sort the whole batch and re-inspect before cooking
            </button>
          </div>
        </Step>
      )}
      <Fb fb={fb} />
    </>
  );
}

/* ── 04 Cooking ───────────────────────────────────────────────── */

export function cookResult(c: { heat: number; time: number; size: number }) {
  const score = c.heat + c.time;
  const colour = ["Pale", "Light", "Even golden", "Dark", "Burnt"][score];
  const crunch = score < 2 ? "Soft — under-done" : score === 2 ? "Crunchy" : "Over-done";
  const even = c.size ? "Uneven — large batch" : "Even";
  return { score, colour, crunch, even };
}

function CookPanel({ done }: { done: boolean }) {
  const cook = useFacility((s) => s.cook);
  const { patch, record, pass } = useFacility.getState();
  const [fb, setFb] = useState<Feedback>(null);
  const r = cookResult(cook);
  const lock = () => {
    const ok = cook.heat === COOK_TARGET.heat && cook.time === COOK_TARGET.time && cook.size === COOK_TARGET.size;
    const summary = `Heat ${DIALS[0].stops[cook.heat]}, time ${DIALS[1].stops[cook.time]}, ${DIALS[2].stops[cook.size].toLowerCase()} batch`;
    if (ok) {
      record("cooking", summary, true, "Small batch, controlled cooking — even, golden and crunchy.");
      pass("cooking");
      setFb({ ok: true, text: "A small, controlled batch comes out even, golden and crunchy. Walk to station 05, Batch Testing." });
    } else {
      const note = `This batch comes out ${r.colour.toLowerCase()}, ${r.crunch.toLowerCase()}, ${r.even.toLowerCase()}. The goal is preserving nutrition and crunch — controlled cooking in small batches.`;
      record("cooking", summary, false, note);
      setFb({ ok: false, text: note });
    }
  };
  return (
    <>
      <p className="text-[0.95rem] text-cocoa">Turn the dials on the control panel (click them in 3D, or use the buttons). Watch the batch in the kettle change. Lock the settings when the batch is even, golden and crunchy.</p>
      <div className="mt-3 space-y-2">
        {DIALS.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-[0.9rem] font-bold text-cocoa">{d.name}</span>
            <div className="flex gap-1" role="group" aria-label={d.name}>
              {d.stops.map((s, i) => (
                <button key={s} disabled={done} aria-pressed={cook[d.id] === i} onClick={() => patch("cook", { [d.id]: i })} className={`${small} ${cook[d.id] === i ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ["Colour", r.colour, r.score === 2],
          ["Crunch", r.crunch, r.score === 2],
          ["Evenness", r.even, cook.size === 0],
        ].map(([k, v, ok]) => (
          <div key={k as string} className={`rounded-xl p-2 ${ok ? "bg-success/10" : "bg-haldi/25"}`}>
            <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{k}</div>
            <div className="text-[0.9rem] font-bold leading-tight text-cocoa">{v}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[0.8rem] text-cocoa-2">Simulated controls and results — not real recipes or operating settings.</p>
      {!done && (
        <button onClick={lock} className="eb-btn eb-btn-primary mt-3 !normal-case">
          Lock settings
        </button>
      )}
      <Fb fb={fb} />
    </>
  );
}

/* ── 05 Batch Testing ─────────────────────────────────────────── */

function TestPanel({ done }: { done: boolean }) {
  const test = useFacility((s) => s.test);
  const { patch, record, pass, setInspect } = useFacility.getState();
  const [fb, setFb] = useState<Feedback>(null);
  const all = SAMPLES.every((s) => test.tested.includes(s.id));
  const runTest = (id: string) => {
    patch("test", { selected: id, tested: test.tested.includes(id) ? test.tested : [...test.tested, id], runs: test.runs + 1 });
    setInspect({ kind: "sample", id });
  };
  const decide = (d: string) => {
    const label = TEST_RULES.find((r) => r.d === d)!.label;
    if (d === "rework") {
      record("testing", label, true, "Sample C missed texture and moisture — rework, not a safety problem.");
      pass("testing");
      setFb({ ok: true, text: "Sample C misses the texture and moisture criteria, but there is no safety problem — the batch goes back for rework. Walk to station 06, Packaging." });
    } else {
      const note = d === "release" ? "Sample C is soft and too moist — customers would open soft, stale-tasting snacks." : "Nothing unsafe was found. Rejecting wastes a batch the simulated rules say can be reworked.";
      record("testing", label, false, note);
      setFb({ ok: false, text: note });
    }
  };
  return (
    <>
      <div className="rounded-xl bg-peach/60 p-2.5">
        <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">Acceptance criteria (fictional, for this exercise)</div>
        <ul className="mt-1 space-y-0.5 text-[0.86rem] text-cocoa">
          {TEST_CRITERIA.map((c) => (
            <li key={c.k}>
              <strong>{c.k}:</strong> {c.rule}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[0.95rem] text-cocoa">Select a sample cup on the bench and run the analyser, or use Test below.</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[300px] text-left text-[0.86rem] text-cocoa">
          <thead className="text-[0.75rem] uppercase tracking-[0.08em] text-cocoa-2">
            <tr>
              <th className="py-1">Sample</th>
              <th>Moisture</th>
              <th>Texture</th>
              <th>Taste</th>
              <th>Colour</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {SAMPLES.map((s) => {
              const t = test.tested.includes(s.id);
              return (
                <tr key={s.id} className="border-t border-cocoa/10">
                  <td className="py-1.5 font-bold">{s.id}</td>
                  <td className={t && s.moisture > 3 ? "font-bold text-error" : ""}>{t ? `${s.moisture}/5` : "—"}</td>
                  <td className={t && s.texture !== "Crunchy" ? "font-bold text-error" : ""}>{t ? s.texture : "—"}</td>
                  <td>{t ? s.taste : "—"}</td>
                  <td className={t && s.colour !== "Even golden" ? "font-bold text-error" : ""}>{t ? s.colour : "—"}</td>
                  <td>
                    <button onClick={() => runTest(s.id)} className={`${small} border-cocoa/15 bg-white text-cocoa hover:border-cocoa`}>
                      Test
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-1.5">
        {TEST_RULES.map((r) => (
          <button key={r.d} disabled={!all || done} onClick={() => decide(r.d)} className={`${small} border-cocoa/15 bg-white text-left text-cocoa hover:border-orange`}>
            <span className="text-orange">{r.label}</span> — <span className="font-medium">{r.rule}</span>
          </button>
        ))}
      </div>
      {!all && <p className="mt-1 text-[0.82rem] text-cocoa-2">Test all four samples before you decide.</p>}
      <Fb fb={fb} />
    </>
  );
}

/* ── 06 Packaging ─────────────────────────────────────────────── */

function PackPanel({ done }: { done: boolean }) {
  const pack = useFacility((s) => s.pack);
  const { patch, record, pass } = useFacility.getState();
  const [fb, setFb] = useState<Feedback>(null);
  const [hint, setHint] = useState(false);
  const matOk = pack.material === "pouch";
  const labelOk = pack.labelPick === "bestbefore";
  const chooseMat = (id: string) => {
    const m = MATERIALS.find((x) => x.id === id)!;
    patch("pack", { material: id });
    record("packaging", `Material: ${m.name}`, m.ok, m.why);
    setFb({ ok: m.ok, text: m.why });
  };
  const pickLabel = (id: string) => {
    const it = LABEL_ITEMS.find((x) => x.id === id)!;
    patch("pack", { labelPick: id });
    const ok = !it.present;
    const note = ok ? "The best-before (date) marking is missing — shoppers can't tell how long the snack stays fresh." : `“${it.label}” is on the label. Read it again — which required item is not there?`;
    record("packaging", `Label check: ${it.label}`, ok, note);
    setFb({ ok, text: note });
  };
  const leakTest = () => {
    if (!pack.repacked) {
      patch("pack", { leak: "fail" });
      setFb(null);
    } else {
      patch("pack", { leak: "pass" });
      record("packaging", "Leak test after re-packing: passed", true, "New seal holds — freshness protected.");
      pass("packaging");
      setFb({ ok: true, text: "No bubbles — the new seal holds and the label is complete. Walk on to the Quality Review room." });
    }
  };
  const afterLeak = (ok: boolean, choice: string) => {
    if (ok) {
      record("packaging", choice, true, "Re-packed with a proper seal and the date marking added.");
      patch("pack", { repacked: true, leak: "none" });
      setFb({ ok: true, text: "Re-packed in a new sealed pouch with the date marking added. Run the leak test again to confirm." });
    } else {
      const note = "Bubbles mean air gets in — moisture follows, and the snack goes stale long before its date.";
      record("packaging", choice, false, note);
      setFb({ ok: false, text: note });
    }
  };
  return (
    <>
      <Step n={1} title="Choose the packaging" done={matOk}>
        <div className="grid gap-1.5">
          {MATERIALS.map((m) => (
            <button key={m.id} disabled={matOk} onClick={() => chooseMat(m.id)} className={`${small} text-left ${pack.material === m.id ? (m.ok ? "border-success bg-success/10" : "border-error bg-error/10") : "border-cocoa/15 bg-white"} text-cocoa`}>
              {m.name}
            </button>
          ))}
        </div>
      </Step>
      {matOk && (
        <Step n={2} title="Inspect the seal" done={pack.sealFound}>
          <p className="text-[0.9rem] text-cocoa">Drag the pouch on the black turntable to rotate it. Click the part of the seal that is faulty.</p>
          {!pack.sealFound && (
            <button onClick={() => setHint(true)} className="mt-1 text-[0.85rem] font-bold text-orange underline">
              Where should I look?
            </button>
          )}
          {hint && !pack.sealFound && (
            <>
              <p className="mt-1 text-[0.85rem] text-cocoa-2">Turn the pouch round to its back and look along the top seal.</p>
              <button onClick={() => patch("pack", { sealFound: true })} className={`${small} mt-1.5 border-cocoa/15 bg-white text-cocoa`}>
                Mark the back top seal as faulty
              </button>
            </>
          )}
          {pack.sealFound && <p className="mt-1 text-[0.88rem] font-bold text-error">Found: the top seal on the back isn&apos;t closed.</p>}
        </Step>
      )}
      {pack.sealFound && (
        <Step n={3} title="Examine the label" done={labelOk}>
          <div className="rounded-xl border-2 border-dashed border-cocoa/25 bg-[#FFFDF9] p-2.5 text-[0.85rem] text-cocoa">
            <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">Back of pack · practice label</div>
            <ul className="mt-1 space-y-0.5">
              {LABEL_ITEMS.filter((i) => i.present).map((i) => (
                <li key={i.id}>
                  <strong>{i.label}:</strong> {i.value}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-[0.9rem] text-cocoa">Which required item is missing?</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {LABEL_ITEMS.map((i) => (
              <button key={i.id} disabled={labelOk} onClick={() => pickLabel(i.id)} className={`${small} ${pack.labelPick === i.id ? (i.present ? "border-error bg-error/10" : "border-success bg-success/10") : "border-cocoa/15 bg-white"} text-cocoa`}>
                {i.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[0.78rem] text-cocoa-2">Educational exercise based on this chapter — not a substitute for actual FSSAI compliance advice.</p>
        </Step>
      )}
      {labelOk && (
        <Step n={4} title="Freshness-protection check (leak test)" done={pack.leak === "pass"}>
          <p className="text-[0.9rem] text-cocoa">The pouch is lowered into the water tank. Bubbles mean air can get in.</p>
          {pack.leak !== "fail" && !done && (
            <button onClick={leakTest} className="eb-btn eb-btn-primary mt-2 !py-1.5 !normal-case">
              <Play className="size-4" /> Run leak test
            </button>
          )}
          {pack.leak === "fail" && (
            <>
              <p className="mt-2 text-[0.9rem] font-bold text-error">Bubbles rising from the top seal.</p>
              <div className="mt-2 grid gap-1.5">
                <button onClick={() => afterLeak(false, "Dispatch — it's only a few bubbles")} className={`${small} border-cocoa/15 bg-white text-left text-cocoa hover:border-orange`}>
                  Dispatch — it&apos;s only a few bubbles
                </button>
                <button onClick={() => afterLeak(true, "Re-pack in a new sealed pouch with the date marking, then re-test")} className={`${small} border-cocoa/15 bg-white text-left text-cocoa hover:border-orange`}>
                  Re-pack in a new sealed pouch with the date marking, then re-test
                </button>
              </div>
            </>
          )}
        </Step>
      )}
      <Fb fb={fb} />
    </>
  );
}

/* ── panel switch ─────────────────────────────────────────────── */

export function StationPanel({ station }: { station: StationId }) {
  const passed = useFacility((s) => s.passed);
  const log = useFacility((s) => s.log);
  const idx = ORDER.indexOf(station);
  const info = STATION_INFO[station];
  const done = idx < passed;
  const m = mistakesAt(log, station);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">Checkpoint 0{info.n} · simulated batch</span>
        {done && (
          <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[0.78rem] font-extrabold uppercase text-success">
            Passed{m ? ` · ${m} correction${m > 1 ? "s" : ""}` : ""}
          </span>
        )}
      </div>
      <h3 className="mt-1 font-display text-[1.4rem] font-semibold leading-tight text-cocoa">{info.name}</h3>
      <p className="mt-1 text-[0.95rem] leading-snug text-cocoa-2">{info.role}</p>
      <div className="mt-3">
        {station === "sourcing" && <SourcingPanel done={done} />}
        {station === "check" && <CheckPanel done={done} />}
        {station === "prepping" && <PrepPanel done={done} />}
        {station === "cooking" && <CookPanel done={done} />}
        {station === "testing" && <TestPanel done={done} />}
        {station === "packaging" && <PackPanel done={done} />}
      </div>
    </div>
  );
}

/* ── contextual inspection content for the in-canvas InspectPanel ── */

export function inspectContent(i: Inspect): { kicker: string; title: string; body: string; flag?: boolean } | null {
  if (!i) return null;
  if (i.kind === "lot") {
    const l = LOTS.find((x) => x.id === i.id)!;
    return { kicker: "01 Sourcing · incoming lot", title: l.name, body: l.finding, flag: l.fault };
  }
  if (i.kind === "tray") {
    const t = TRAYS.find((x) => x.id === i.id)!;
    return { kicker: "02 Quality Check · under the magnifier", title: t.name, body: t.finding, flag: !!t.fault };
  }
  if (i.kind === "sample") {
    const s = SAMPLES.find((x) => x.id === i.id)!;
    return { kicker: "05 Batch Testing · simulated reading", title: `Sample ${s.id}`, body: `Moisture ${s.moisture}/5 · Texture: ${s.texture} · Taste: ${s.taste} · Colour: ${s.colour}`, flag: s.moisture > 3 || s.texture !== "Crunchy" };
  }
  return { kicker: "06 Packaging · seal inspection", title: "Seal defect found", body: "The top seal on the back of the pouch isn't fully closed. Air and moisture can get in, so the snack would lose its freshness.", flag: true };
}

export const SIM_NOTE = SIM;

export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-xl bg-haldi/25 px-3 py-2 text-[0.9rem] leading-snug text-cocoa">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#B38F00]" /> {children}
    </p>
  );
}

