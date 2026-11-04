"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUp, BookOpen, Check, CheckCircle2, Lightbulb, PenLine, RotateCcw, Star, Target, X } from "lucide-react";
import { GoalFlag } from "@/components/icons/EbIcons";

/**
 * LearnLab — a learnable activity: LEARN the rule → APPLY it to real material → CHECK with a diagnosis
 * that names the rule behind every mistake → CREATE your own, self-checked against the same rules.
 * (Pattern from the SkilliZee Architecture internship's studios.) Data-driven; one per chapter area.
 */

export type Rule = { id: string; title: string; text: string; icon?: React.ComponentType<{ className?: string }>; source?: string };

type WithWhy = { why: string; rule?: string };
export type ClassifyTask = {
  kind: "classify";
  prompt: string;
  buckets: { id: string; label: string }[];
  items: ({ id: string; label: string; sub?: string; img?: string; answer: string } & WithWhy)[];
};
export type ChooseTask = {
  kind: "choose";
  prompt: string;
  cases: { id: string; title: string; context?: string; img?: string; options: ({ id: string; text: string; best: boolean } & WithWhy)[] }[];
};
export type OrderTask = { kind: "order"; prompt: string; items: ({ id: string; label: string } & WithWhy)[] /* correct order */ };
export type BuildTask = {
  kind: "build";
  prompt: string;
  slots: { id: string; label: string; options: ({ id: string; text: string; best: boolean } & WithWhy)[] }[];
  /** how the built piece is shown, e.g. a review reply or a post */
  previewTitle?: string;
};
export type Task = ClassifyTask | ChooseTask | OrderTask | BuildTask;

export type LabSpec = {
  id: string;
  /** "You'll be able to …" */
  skill: string;
  rules: Rule[];
  task: Task;
  create: { prompt: string; placeholder: string; checklist: string[]; minChars?: number };
  /** shown under the task, e.g. "Practice material — fictional" */
  note?: string;
};

export type LabResult = { score: number; attempts: number; created: string; mistakes: string[] };

type Answers = Record<string, string>;
type Saved = { step: number; answers: Answers; order: string[]; checked: boolean; attempts: number; score: number; created: string; ticks: boolean[]; mistakes: string[] };

const STEPS = [
  { label: "Learn", icon: BookOpen },
  { label: "Apply", icon: Target },
  { label: "Check", icon: CheckCircle2 },
  { label: "Create", icon: PenLine },
];

function shuffle<T>(a: T[], seed: number) {
  const r = [...a];
  let s = seed;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Grade a task. Returns per-key correctness plus the reason text for each key. */
function grade(task: Task, answers: Answers, order: string[]) {
  const res: { key: string; label: string; ok: boolean; got?: string; want?: string; why: string; rule?: string }[] = [];
  if (task.kind === "classify") {
    for (const it of task.items) {
      const ok = answers[it.id] === it.answer;
      res.push({ key: it.id, label: it.label, ok, got: task.buckets.find((b) => b.id === answers[it.id])?.label, want: task.buckets.find((b) => b.id === it.answer)?.label, why: it.why, rule: it.rule });
    }
  } else if (task.kind === "choose") {
    for (const c of task.cases) {
      const o = c.options.find((x) => x.id === answers[c.id]);
      const best = c.options.find((x) => x.best)!;
      res.push({ key: c.id, label: c.title, ok: !!o?.best, got: o?.text, want: best.text, why: o ? o.why : best.why, rule: o?.rule ?? best.rule });
    }
  } else if (task.kind === "order") {
    task.items.forEach((it, i) => {
      const ok = order[i] === it.id;
      res.push({ key: it.id, label: it.label, ok, want: `position ${i + 1}`, got: `position ${order.indexOf(it.id) + 1}`, why: it.why, rule: it.rule });
    });
  } else {
    for (const s of task.slots) {
      const o = s.options.find((x) => x.id === answers[s.id]);
      const best = s.options.find((x) => x.best)!;
      res.push({ key: s.id, label: s.label, ok: !!o?.best, got: o?.text, want: best.text, why: o ? o.why : best.why, rule: o?.rule ?? best.rule });
    }
  }
  return res;
}

export function LearnLab({ spec, onDone }: { spec: LabSpec; onDone?: (r: LabResult) => void }) {
  const key = `ebc-lab-${spec.id}`;
  const task = spec.task;
  const seed = useMemo(() => spec.id.split("").reduce((a, c) => a + c.charCodeAt(0), 7), [spec.id]);
  const initialOrder = useMemo(() => (task.kind === "order" ? shuffle(task.items.map((i) => i.id), seed) : []), [task, seed]);
  const fresh: Saved = { step: 0, answers: {}, order: initialOrder, checked: false, attempts: 0, score: 0, created: "", ticks: spec.create.checklist.map(() => false), mistakes: [] };
  const [s, setS] = useState<Saved>(fresh);
  const [restored, setRestored] = useState(false);
  const set = (p: Partial<Saved>) => setS((o) => ({ ...o, ...p }));

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(key) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore after hydration
      if (v) setS((o) => ({ ...o, ...v }));
    } catch {
      /* storage blocked */
    }
    setRestored(true);
  }, [key]);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(key, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s, restored, key]);

  const results = grade(task, s.answers, s.order);
  const total = results.length;
  const correct = results.filter((r) => r.ok).length;
  const complete =
    task.kind === "classify" ? task.items.every((i) => s.answers[i.id]) : task.kind === "choose" ? task.cases.every((c) => s.answers[c.id]) : task.kind === "build" ? task.slots.every((x) => s.answers[x.id]) : true;
  const createOk = s.created.trim().length >= (spec.create.minChars ?? 40) && s.ticks.every(Boolean);
  const finished = s.step === 3 && createOk;

  useEffect(() => {
    if (finished) onDone?.({ score: s.score, attempts: s.attempts, created: s.created.trim(), mistakes: s.mistakes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const check = () => {
    const sc = Math.round((correct / total) * 5);
    const wrong = results.filter((r) => !r.ok).map((r) => r.label);
    set({ step: 2, checked: true, attempts: s.attempts + 1, score: s.attempts === 0 ? sc : s.score, mistakes: s.attempts === 0 ? wrong : s.mistakes });
  };
  const retry = () => {
    // keep correct answers, clear wrong ones
    const keep: Answers = {};
    for (const r of results) if (r.ok && s.answers[r.key]) keep[r.key] = s.answers[r.key];
    set({ step: 1, answers: keep, checked: false });
  };
  const ruleOf = (id?: string) => spec.rules.find((r) => r.id === id);

  return (
    <div className="overflow-hidden rounded-[24px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
      {/* header: skill + stepper */}
      <div className="border-b border-cocoa/10 bg-cream px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-end gap-2 empty:hidden">
          {s.attempts > 0 && (
            <span className="flex items-center gap-0.5" aria-label={`${s.score} of 5 stars on the first check`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`size-4 ${i < s.score ? "fill-haldi text-[#C9A400]" : "text-cocoa/20"}`} />
              ))}
            </span>
          )}
        </div>
        <ol className="mt-3 grid grid-cols-4 gap-1.5">
          {STEPS.map((st, i) => {
            const Icon = st.icon;
            const on = s.step === i;
            const done = s.step > i || (i === 3 && createOk);
            return (
              <li key={st.label} className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[0.82rem] font-bold sm:text-[0.88rem] ${on ? "bg-orange text-white" : done ? "bg-success/15 text-success" : "bg-white text-cocoa-2"}`}>
                {done && !on ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                <span className="hidden min-[400px]:inline">{st.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div key={s.step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            {/* LEARN */}
            {s.step === 0 && (
              <div>
                <p className="mb-3 flex items-start gap-2.5 rounded-2xl bg-peach/60 px-3.5 py-2.5 text-[1rem] leading-snug text-cocoa">
                  <GoalFlag className="mt-0.5 size-5 shrink-0 text-orange" />
                  <span className="min-w-0">
                    <span className="font-extrabold">Goal:</span> {spec.skill}
                  </span>
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {spec.rules.map((r, i) => {
                    const Icon = r.icon ?? Lightbulb;
                    return (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex min-w-0 gap-3 rounded-2xl border border-cocoa/10 bg-cream/60 p-3.5">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange text-white">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-[1.05rem] font-semibold leading-tight text-cocoa">{r.title}</span>
                          <span className="mt-0.5 block text-[0.95rem] leading-snug text-cocoa">{r.text}</span>
                          {r.source && <span className="mt-1 block text-[0.75rem] font-bold uppercase tracking-[0.06em] text-cocoa-2/80">{r.source}</span>}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                <button onClick={() => set({ step: 1 })} className="eb-btn eb-btn-primary mt-4 !normal-case">
                  Apply the rules <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {/* APPLY */}
            {s.step === 1 && (
              <div>
                <p className="font-display text-[1.15rem] font-semibold leading-snug text-cocoa">{task.prompt}</p>
                <div className="mt-3">
                  <TaskUI task={task} answers={s.answers} order={s.order} setAnswer={(k, v) => setS((o) => ({ ...o, answers: { ...o.answers, [k]: v } }))} setOrder={(ord) => setS((o) => ({ ...o, order: ord }))} />
                </div>
                {spec.note && <p className="mt-3 text-[0.82rem] text-cocoa-2/80">{spec.note}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button disabled={!complete} onClick={check} className="eb-btn eb-btn-primary !normal-case">
                    <CheckCircle2 className="size-4" /> Check my work
                  </button>
                  <button onClick={() => set({ step: 0 })} className="flex items-center gap-1 rounded-xl px-3 py-2 text-[0.9rem] font-bold text-cocoa-2 hover:bg-peach">
                    <BookOpen className="size-4" /> Re-read the rules
                  </button>
                </div>
              </div>
            )}

            {/* CHECK */}
            {s.step === 2 && (
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`font-display text-[1.6rem] font-semibold ${correct === total ? "text-success" : "text-cocoa"}`}>
                    {correct}/{total}
                  </span>
                  <span className="text-[1rem] font-bold text-cocoa-2">{correct === total ? "All correct. Every choice follows the rules." : "Read each diagnosis, then fix only the wrong ones."}</span>
                </div>
                <ul className="mt-3 grid gap-2">
                  {results.map((r) => {
                    const rule = ruleOf(r.rule);
                    return (
                      <li key={r.key} className={`rounded-2xl border px-3.5 py-2.5 ${r.ok ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"}`}>
                        <div className="flex items-start gap-2">
                          {r.ok ? <Check className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={3} /> : <X className="mt-0.5 size-5 shrink-0 text-error" strokeWidth={3} />}
                          <div className="min-w-0">
                            <div className="font-bold leading-snug text-cocoa">{r.label}</div>
                            {!r.ok && r.want && (
                              <div className="text-[0.92rem] text-cocoa-2">
                                {r.got ? <>You chose: {r.got}. </> : null}
                                {task.kind === "order" ? <>Belongs at {r.want}.</> : null}
                              </div>
                            )}
                            <div className="mt-0.5 text-[0.95rem] leading-snug text-cocoa">{r.why}</div>
                            {rule && <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[0.78rem] font-bold text-orange">Rule: {rule.title}</span>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {correct < total && (
                    <button onClick={retry} className="eb-btn eb-btn-secondary !normal-case">
                      <RotateCcw className="size-4" /> Fix the wrong ones
                    </button>
                  )}
                  {(correct === total || s.attempts >= 2) && (
                    <button onClick={() => set({ step: 3 })} className="eb-btn eb-btn-primary !normal-case">
                      Now create your own <ArrowRight className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* CREATE */}
            {s.step === 3 && (
              <div>
                <p className="font-display text-[1.15rem] font-semibold leading-snug text-cocoa">{spec.create.prompt}</p>
                <textarea
                  value={s.created}
                  onChange={(e) => set({ created: e.target.value })}
                  rows={4}
                  aria-label={spec.create.prompt}
                  placeholder={spec.create.placeholder}
                  className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
                />
                <div className="mt-3 text-[0.82rem] font-extrabold uppercase tracking-[0.1em] text-orange">Self-check against the rules</div>
                <ul className="mt-1.5 grid gap-1.5">
                  {spec.create.checklist.map((c, i) => (
                    <li key={c}>
                      <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 text-[0.98rem] leading-snug ${s.ticks[i] ? "border-success/40 bg-success/5 text-cocoa" : "border-cocoa/10 bg-white text-cocoa"}`}>
                        <input type="checkbox" checked={!!s.ticks[i]} onChange={() => setS((o) => ({ ...o, ticks: o.ticks.map((t, j) => (j === i ? !t : t)) }))} className="mt-1 size-4 accent-[#00a341]" />
                        {c}
                      </label>
                    </li>
                  ))}
                </ul>
                <p className={`mt-3 text-[0.95rem] font-bold ${createOk ? "text-success" : "text-cocoa-2"}`}>
                  {createOk ? "Done. Your work is saved and goes into the chapter report." : `Write at least ${spec.create.minChars ?? 40} characters and tick each rule you met.`}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── task renderers ───────────────────────────────────────────── */

function TaskUI({ task, answers, order, setAnswer, setOrder }: { task: Task; answers: Answers; order: string[]; setAnswer: (k: string, v: string) => void; setOrder: (o: string[]) => void }) {
  if (task.kind === "classify")
    return (
      <div className="grid gap-2.5 sm:grid-cols-2">
        {task.items.map((it) => (
          <div key={it.id} className={`min-w-0 overflow-hidden rounded-2xl border-2 ${answers[it.id] ? "border-cocoa/30" : "border-cocoa/10"} bg-cream/40`}>
            <div className="flex items-center gap-3 p-3">
              {it.img && (
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-peach">
                  <Image src={it.img} alt="" fill sizes="64px" className="object-cover" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block font-bold leading-snug text-cocoa">{it.label}</span>
                {it.sub && <span className="block text-[0.88rem] leading-snug text-cocoa-2">{it.sub}</span>}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-cocoa/10 bg-white p-2">
              {task.buckets.map((b) => {
                const on = answers[it.id] === b.id;
                return (
                  <button key={b.id} onClick={() => setAnswer(it.id, b.id)} aria-pressed={on} className={`rounded-full border px-3 py-1 text-[0.88rem] font-bold transition-colors ${on ? "border-cocoa bg-cocoa text-cream" : "border-cocoa/20 bg-white text-cocoa hover:border-cocoa"}`}>
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  if (task.kind === "choose")
    return (
      <div className="grid gap-3">
        {task.cases.map((c) => (
          <div key={c.id} className="min-w-0 rounded-2xl border border-cocoa/15 bg-cream/40 p-3 sm:p-4">
            <div className="flex items-start gap-3">
              {c.img && (
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-peach">
                  <Image src={c.img} alt="" fill sizes="64px" className="object-cover" />
                </span>
              )}
              <div className="min-w-0">
                <div className="font-display text-[1.05rem] font-semibold leading-tight text-cocoa">{c.title}</div>
                {c.context && <div className="mt-0.5 text-[0.95rem] leading-snug text-cocoa">{c.context}</div>}
              </div>
            </div>
            <div className="mt-2.5 grid gap-1.5">
              {c.options.map((o) => {
                const on = answers[c.id] === o.id;
                return (
                  <button key={o.id} onClick={() => setAnswer(c.id, o.id)} aria-pressed={on} className={`flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-left text-[0.98rem] font-semibold leading-snug ${on ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/10 bg-white text-cocoa hover:border-cocoa/40"}`}>
                    <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2 ${on ? "border-orange bg-orange" : "border-cocoa/30"}`} />
                    {o.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  if (task.kind === "order") {
    const byId = Object.fromEntries(task.items.map((i) => [i.id, i]));
    const move = (i: number, d: -1 | 1) => {
      const j = i + d;
      if (j < 0 || j >= order.length) return;
      const o = [...order];
      [o[i], o[j]] = [o[j], o[i]];
      setOrder(o);
    };
    return (
      <ol className="grid gap-2">
        {order.map((id, i) => (
          <motion.li layout key={id} className="flex items-center gap-2 rounded-2xl border border-cocoa/15 bg-cream/40 p-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cocoa font-display text-[0.95rem] font-semibold text-cream">{i + 1}</span>
            <span className="min-w-0 flex-1 font-semibold leading-snug text-cocoa">{byId[id].label}</span>
            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="grid size-9 place-items-center rounded-xl border border-cocoa/20 bg-white disabled:opacity-30">
              <ArrowUp className="size-4" />
            </button>
            <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move down" className="grid size-9 place-items-center rounded-xl border border-cocoa/20 bg-white disabled:opacity-30">
              <ArrowDown className="size-4" />
            </button>
          </motion.li>
        ))}
      </ol>
    );
  }
  // build
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="grid gap-3">
        {task.slots.map((sl) => (
          <div key={sl.id} className="min-w-0">
            <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.1em] text-orange">{sl.label}</div>
            <div className="mt-1 grid gap-1.5">
              {sl.options.map((o) => {
                const on = answers[sl.id] === o.id;
                return (
                  <button key={o.id} onClick={() => setAnswer(sl.id, o.id)} aria-pressed={on} className={`rounded-xl border-2 px-3 py-2 text-left text-[0.96rem] font-semibold leading-snug ${on ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/10 bg-white text-cocoa hover:border-cocoa/40"}`}>
                    {o.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="min-w-0 self-start rounded-2xl border border-cocoa/15 bg-cream p-4 lg:sticky lg:top-24">
        <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{task.previewTitle ?? "Preview"}</div>
        <div className="mt-2 grid gap-1.5 text-[1rem] leading-relaxed text-cocoa">
          {task.slots.map((sl) => {
            const o = sl.options.find((x) => x.id === answers[sl.id]);
            return (
              <p key={sl.id} className={o ? "" : "text-cocoa-2/50"}>
                {o ? o.text : `[${sl.label}]`}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
