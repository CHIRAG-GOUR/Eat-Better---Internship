"use client";

import { createContext, Fragment, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

/** A word a school student may not know: its everyday meaning + what it means in this chapter. */
export type GlossaryEntry = {
  term: string;
  /** extra spellings that should also be explained (matched case-insensitively) */
  match?: string[];
  general: string;
  chapter: string;
};

const GlossaryContext = createContext<GlossaryEntry[]>([]);

export function GlossaryProvider({ entries, children }: { entries: GlossaryEntry[]; children: ReactNode }) {
  return <GlossaryContext.Provider value={entries}>{children}</GlossaryContext.Provider>;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Renders plain text, turning the first mention of each glossary word into a Term tooltip.
 * Usage: <GlossaryText>{someContentString}</GlossaryText>
 */
export function GlossaryText({ children }: { children: string }) {
  const entries = useContext(GlossaryContext);
  const { re, lookup } = useMemo(() => {
    const pairs: [string, GlossaryEntry][] = [];
    for (const e of entries) for (const m of [e.term, ...(e.match ?? [])]) pairs.push([m.toLowerCase(), e]);
    pairs.sort((a, b) => b[0].length - a[0].length);
    if (!pairs.length) return { re: null, lookup: new Map<string, GlossaryEntry>() };
    return {
      re: new RegExp(`(?<![\\w-])(${pairs.map(([m]) => escape(m)).join("|")})(?![\\w-])`, "gi"),
      lookup: new Map(pairs),
    };
  }, [entries]);

  if (!re) return <>{children}</>;
  const out: ReactNode[] = [];
  const used = new Set<GlossaryEntry>();
  let last = 0;
  for (const m of children.matchAll(re)) {
    const entry = lookup.get(m[0].toLowerCase());
    if (!entry || used.has(entry) || m.index === undefined) continue;
    used.add(entry);
    out.push(children.slice(last, m.index));
    out.push(
      <Term key={m.index} entry={entry}>
        {m[0]}
      </Term>,
    );
    last = m.index + m[0].length;
  }
  out.push(children.slice(last));
  return (
    <>
      {out.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}

/** Inline word with a tooltip card. Hover, keyboard focus or tap opens it; Escape closes it. */
export function Term({ entry, children }: { entry: GlossaryEntry; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);
  const id = useId();

  const place = useCallback(() => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    const W = Math.min(320, window.innerWidth - 24);
    const left = Math.max(12, Math.min(window.innerWidth - W - 12, r.left + r.width / 2 - W / 2));
    const above = r.top > 240;
    setPos({ left, top: above ? r.top - 10 : r.bottom + 10, above });
  }, []);

  const show = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    place();
    setOpen(true);
  }, [place]);
  const hide = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          if (open) setOpen(false);
          else show();
        }}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className="inline cursor-help rounded-sm bg-transparent p-0 align-baseline font-[inherit] text-[length:inherit] leading-[inherit] text-inherit underline decoration-orange decoration-dotted decoration-2 underline-offset-[5px] transition-colors hover:bg-orange/10 focus-visible:bg-orange/10"
      >
        {children}
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                id={id}
                role="tooltip"
                onMouseEnter={show}
                onMouseLeave={hide}
                initial={{ opacity: 0, y: pos.above ? 6 : -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: pos.above ? 4 : -4 }}
                transition={{ duration: 0.16 }}
                className="fixed z-[60] w-[min(320px,calc(100vw-24px))] rounded-xl border border-cocoa bg-cream p-4 text-left text-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
                style={{ left: pos.left, top: pos.top, translate: pos.above ? "0 -100%" : "0 0" }}
              >
                <div className="font-display text-[1.15rem] font-semibold capitalize leading-tight">{entry.term}</div>
                <div className="mt-2 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">Meaning</div>
                <p className="mt-0.5 text-[0.98rem] font-medium leading-snug">{entry.general}</p>
                <div className="mt-2.5 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">In this chapter</div>
                <p className="mt-0.5 text-[0.98rem] font-medium leading-snug">{entry.chapter}</p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
