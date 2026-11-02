"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { getProduct } from "@/lib/brand";
import type { CheckResult } from "../checks";
import type { PackDesign } from "../types";

export function BriefPanel({ checks, design }: { checks: CheckResult[]; design: PackDesign }) {
  const [open, setOpen] = useState(true);
  const [focus, setFocus] = useState<string | null>(null);
  const passed = checks.filter((c) => c.pass).length;
  const p = getProduct(design.productId);

  return (
    <motion.div
      layout
      className="pointer-events-auto w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/40 bg-cream/95 shadow-[0_18px_50px_-18px_rgba(30,12,6,0.55)] backdrop-blur-md"
    >
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-orange">Demo brief</div>
          <div className="truncate font-display text-[1.1rem] font-semibold leading-tight text-cocoa">Shelf-ready concept · {p.name}</div>
        </div>
        <div className="flex items-center gap-1" aria-label={`${passed} of ${checks.length} checks met`}>
          {checks.map((c) => (
            <motion.span
              key={c.id}
              className="h-2 w-4 rounded-full"
              animate={{ backgroundColor: c.pass ? "#00A341" : "rgba(47,28,26,0.18)", scale: c.pass ? [1, 1.35, 1] : 1 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="size-5 text-cocoa-2" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[42dvh] space-y-1 overflow-y-auto border-t border-line px-2 py-2 lg:max-h-none"
          >
            {checks.map((c) => {
              const expanded = focus === c.id;
              return (
                <li key={c.id}>
                  <button onClick={() => setFocus(expanded ? null : c.id)} className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left hover:bg-peach/60" aria-expanded={expanded}>
                    <motion.span
                      key={String(c.pass)}
                      initial={{ scale: 0.4, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 520, damping: 22 }}
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${c.pass ? "bg-success text-white" : "border-2 border-line-strong text-transparent"}`}
                    >
                      {c.pass ? <Check className="size-4" strokeWidth={3} /> : <X className="size-3" />}
                    </motion.span>
                    <span className="min-w-0">
                      <span className="block text-[1rem] font-semibold leading-snug text-cocoa">{c.title}</span>
                      <span className={`block text-[0.92rem] leading-snug ${c.pass ? "text-cocoa-2/80" : "text-cocoa-2"}`}>{c.detail}</span>
                      <AnimatePresence>
                        {expanded && (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-1.5 block overflow-hidden rounded-lg bg-peach/70 px-2.5 py-2 text-[0.9rem] leading-snug text-cocoa"
                          >
                            <strong className="font-semibold">Why it matters: </strong>
                            {c.why}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="px-2 pb-1 pt-2 text-[0.82rem] leading-snug text-cocoa-2/70">
              Placeholder brief to demonstrate live feedback. Chapter 1&apos;s real brief will replace it.
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
