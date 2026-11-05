"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, RotateCcw, Star } from "lucide-react";

/**
 * Shared frame for the evidence-based activities (2.3, 2.4): a header with the mission, a step track
 * that only advances when a step is truly done, a score that rewards first-time accuracy, and a
 * feedback strip that always explains *why* using the evidence.
 */

export type Feedback = { tone: "good" | "bad" | "info"; text: string } | null;

export function GameFrame({
  kicker,
  title,
  mission,
  steps,
  step,
  stars,
  onReset,
  feedback,
  note,
  children,
}: {
  kicker: string;
  title: string;
  mission: string;
  steps: string[];
  step: number;
  stars?: number; // 0..3, shown once the activity is finished
  onReset?: () => void;
  feedback?: Feedback;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
      <div className="border-b border-cocoa/10 bg-cream px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">{kicker}</div>
            <h3 className="font-display text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold leading-tight text-cocoa">{title}</h3>
            <p className="mt-1 max-w-3xl text-[1rem] leading-snug text-cocoa-2">{mission}</p>
          </div>
          <div className="flex items-center gap-2">
            {stars !== undefined && (
              <span className="flex gap-0.5" aria-label={`${stars} of 3 stars`}>
                {[0, 1, 2].map((i) => (
                  <Star key={i} className={`size-5 ${i < stars ? "fill-haldi text-[#C9A400]" : "text-cocoa/20"}`} />
                ))}
              </span>
            )}
            {onReset && (
              <button onClick={onReset} className="flex items-center gap-1.5 rounded-xl border border-cocoa/20 bg-white px-3 py-1.5 text-[0.85rem] font-bold text-cocoa-2 hover:border-cocoa">
                <RotateCcw className="size-4" /> Restart
              </button>
            )}
          </div>
        </div>
        <ol className="mt-3 flex flex-wrap gap-1.5">
          {steps.map((s, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <li key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.85rem] font-bold ${on ? "bg-orange text-white" : done ? "bg-success/15 text-success" : "bg-white text-cocoa-2/70"}`}>
                {done ? <Check className="size-3.5" strokeWidth={3} /> : <span className="tabular-nums">{i + 1}</span>}
                {s}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={`mx-4 mb-4 rounded-2xl px-4 py-3 text-[1rem] leading-snug sm:mx-6 ${feedback.tone === "good" ? "bg-success/12 text-cocoa" : feedback.tone === "bad" ? "bg-error/10 text-cocoa" : "bg-peach/70 text-cocoa"}`}
          >
            <strong className={feedback.tone === "good" ? "text-success" : feedback.tone === "bad" ? "text-error" : "text-orange"}>{feedback.tone === "good" ? "Yes. " : feedback.tone === "bad" ? "Not yet. " : ""}</strong>
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>
      {note && <p className="border-t border-cocoa/10 px-4 py-2.5 text-[0.82rem] text-cocoa-2 sm:px-6">{note}</p>}
    </div>
  );
}

/** Stars from mistakes: 0–1 mistakes = 3, 2–4 = 2, more = 1. */
export const starsFor = (mistakes: number) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);

/** Live check-list row used by "write it yourself" steps. */
export function CheckRow({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <li className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[0.95rem] leading-snug ${ok ? "bg-success/10 text-cocoa" : "bg-cream text-cocoa-2"}`}>
      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${ok ? "bg-success text-white" : "border-2 border-cocoa/25"}`}>{ok && <Check className="size-3.5" strokeWidth={3} />}</span>
      <span>
        <span className="font-bold">{label}</span>
        {!ok && hint && <span className="block text-[0.86rem]">{hint}</span>}
      </span>
    </li>
  );
}

/** "My work" panel for the wrap-up: what the student produced in each activity, with a copy button. */
export function MyWork({ chapter, items }: { chapter: string; items: { label: string; text?: string }[] }) {
  const done = items.filter((i) => i.text).map((i) => ({ ...i, text: i.text!.startsWith(`${i.label}:`) ? i.text!.slice(i.label.length + 1).trim() : i.text }));
  if (!done.length) return null;
  const all = `Eat Better Co — Chapter ${chapter} · My work\n\n` + done.map((i) => `${i.label}\n${i.text}`).join("\n\n");
  return (
    <div className="mt-4 rounded-[22px] border border-cocoa bg-white p-5 shadow-[2px_2px_0_0_#2f1c1a]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-[1.2rem] font-semibold text-cocoa">My work</span>
        <button
          onClick={() => navigator.clipboard?.writeText(all).catch(() => {})}
          className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case"
        >
          Copy my work
        </button>
      </div>
      <ul className="mt-3 grid gap-2">
        {done.map((i) => (
          <li key={i.label} className="rounded-xl bg-cream px-3.5 py-2.5 text-[0.95rem] leading-snug text-cocoa">
            <strong>{i.label}:</strong> {i.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
