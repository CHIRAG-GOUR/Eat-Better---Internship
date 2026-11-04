"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Circle, Gauge, Target, X } from "lucide-react";
import type { ReactNode } from "react";
import { setLiteMode, useLiteMode } from "./useLiteMode";

/**
 * Shared HUD pieces for the chapter simulations — one visual language across 1.4, 1.5 and 1.6.
 * Place them inside the canvas container (position: relative).
 */

/** "Role: Junior Consumer Researcher" badge (top-left of the canvas). */
export function RoleBadge({ role, icon, className = "" }: { role: string; icon?: ReactNode; className?: string }) {
  return (
    <div className={`pointer-events-none flex items-center gap-2 rounded-xl bg-cocoa/90 px-3 py-1.5 text-[0.82rem] font-bold text-cream shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] ${className}`}>
      {icon ?? <Target className="size-4 text-haldi" />}
      <span className="hidden sm:inline text-cream/70">Role:</span> {role}
    </div>
  );
}

export type Objective = { id: string; label: string; done: boolean; detail?: string };

/** Task list with the current objective highlighted. Works as an overlay or in a side panel. */
export function ObjectiveTracker({ objectives, title = "Objectives", className = "" }: { objectives: Objective[]; title?: string; className?: string }) {
  const current = objectives.find((o) => !o.done)?.id;
  const done = objectives.filter((o) => o.done).length;
  return (
    <div className={`rounded-2xl border border-cocoa/15 bg-cream/95 p-3 ${className}`} aria-label={title}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-orange">{title}</span>
        <span className="text-[0.8rem] font-bold tabular-nums text-cocoa-2">
          {done}/{objectives.length}
        </span>
      </div>
      <ol className="mt-2 space-y-1.5">
        {objectives.map((o) => {
          const cur = o.id === current;
          return (
            <li key={o.id} className={`flex items-start gap-2 rounded-lg px-1.5 py-1 text-[0.9rem] leading-snug ${cur ? "bg-orange/10 font-bold text-cocoa" : o.done ? "text-cocoa-2/70" : "text-cocoa-2"}`}>
              {o.done ? <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} /> : <Circle className={`mt-0.5 size-4 shrink-0 ${cur ? "text-orange" : "text-cocoa/25"}`} />}
              <span>
                {o.label}
                {cur && o.detail && <span className="block text-[0.82rem] font-medium text-cocoa-2">{o.detail}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Lighter-graphics switch (auto-on for phones / low-end devices). */
export function LiteToggle({ className = "" }: { className?: string }) {
  const lite = useLiteMode();
  return (
    <button
      onClick={() => setLiteMode(!lite)}
      aria-pressed={lite}
      title="Lighter graphics run faster on phones and older computers"
      className={`flex items-center gap-1.5 rounded-xl border border-cocoa/20 bg-cream/95 px-2.5 py-1.5 text-[0.8rem] font-bold text-cocoa hover:border-cocoa ${className}`}
    >
      <Gauge className="size-4 text-orange" />
      <span className="hidden sm:inline">Lighter graphics:</span>
      <span className="sr-only sm:hidden">Lighter graphics</span> {lite ? "On" : "Off"}
    </button>
  );
}

/**
 * Contextual inspection panel for a clicked 3D object. Bottom sheet on phones, side card on desktop.
 * Put supplied facts in `facts`; mark simulated/fictional content with `note`.
 */
export function InspectPanel({
  open,
  kicker,
  title,
  children,
  facts,
  note,
  actions,
  onClose,
}: {
  open: boolean;
  kicker?: string;
  title: string;
  children?: ReactNode;
  facts?: string[];
  note?: string;
  actions?: ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label={title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="absolute inset-x-2 bottom-2 z-30 max-h-[70%] overflow-y-auto rounded-2xl border border-cocoa bg-cream p-4 shadow-[3px_3px_0_0_#2f1c1a] sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-14 sm:w-[340px] sm:max-h-[calc(100%-4.5rem)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {kicker && <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-orange">{kicker}</div>}
              <h4 className="font-display text-[1.2rem] font-semibold leading-tight text-cocoa">{title}</h4>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-full border border-cocoa/20 bg-white hover:border-cocoa">
              <X className="size-4" />
            </button>
          </div>
          {children && <div className="mt-2 text-[0.95rem] leading-relaxed text-cocoa">{children}</div>}
          {facts && facts.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {facts.map((f) => (
                <li key={f} className="flex gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[0.9rem] leading-snug text-cocoa">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          )}
          {note && <p className="mt-3 text-[0.8rem] text-cocoa-2/80">{note}</p>}
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
