"use client";

import { Panel } from "@/components/chapter/Panel";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Globe2, Store } from "lucide-react";
import { CATEGORIES, THINK, type CategoryId } from "../content";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { useActivities } from "../activityStore";

type Channel = "online" | "either" | "shop";
type Q2 = Record<CategoryId, { channel: Channel | null; reason: string }>;
type Saved = { reasons: string[]; q1Text: string; q2: Q2 };

const KEY = "ebc-1.1-reflection";
const EMPTY_Q2: Q2 = {
  sweets: { channel: null, reason: "" },
  namkeens: { channel: null, reason: "" },
  nuts: { channel: null, reason: "" },
  gifting: { channel: null, reason: "" },
};
const CHANNEL_LABEL: Record<Channel, string> = { online: "Online", either: "Either", shop: "Local shop" };

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export function ThinkDiscuss() {
  const [reasons, setReasons] = useState<string[]>([]);
  const [q1Text, setQ1Text] = useState("");
  const [q2, setQ2] = useState<Q2>(EMPTY_Q2);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);
  const complete = useActivities((s) => s.complete);

  // restore from this device only — must run after hydration (localStorage doesn't exist on the server)
  useEffect(() => {
    const s = load();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
    if (s) {
      setReasons(s.reasons ?? []);
      setQ1Text(s.q1Text ?? "");
      setQ2({ ...EMPTY_Q2, ...(s.q2 ?? {}) });
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ reasons, q1Text, q2 }));
    } catch {
      /* storage unavailable (private mode / blocked) — the activity still works */
    }
  }, [reasons, q1Text, q2, restored]);

  const q1Done = reasons.length >= 1 && q1Text.trim().length >= 25;
  const q2Done = CATEGORIES.every((c) => q2[c.id].channel && (q2[c.id].reason.trim().length > 0));
  const allDone = q1Done && q2Done;
  useEffect(() => {
    if (allDone) complete("reflect");
  }, [allDone, complete]);

  const toggleReason = (id: string) =>
    setReasons((r) => (r.includes(id) ? r.filter((x) => x !== id) : r.length >= 3 ? r : [...r, id]));
  const pickedCounter = reasons.some((id) => !THINK.q1Reasons.find((r) => r.id === id)?.fromChapter);

  const summary = useMemo(() => {
    const lines = [
      "Eat Better Co — Chapter 1.1 · Think & Discuss",
      "",
      `1. ${THINK.q1}`,
      ...reasons.map((id) => `   • ${THINK.q1Reasons.find((r) => r.id === id)?.text}`),
      `   In my words: ${q1Text.trim() || "—"}`,
      "",
      `2. ${THINK.q2}`,
      ...CATEGORIES.map((c) => `   • ${c.title}: ${q2[c.id].channel ? CHANNEL_LABEL[q2[c.id].channel!] : "—"}${q2[c.id].reason ? ` — ${q2[c.id].reason}` : ""}`),
    ];
    return lines.join("\n");
  }, [reasons, q1Text, q2]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="think" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="left" width="max-w-6xl">
        <SectionIntro index="5" kicker="Think & Discuss" title="What would you do?">
          There are no right or wrong answers here — only reasons. Build your thinking step by step, then copy it into your discussion or submission.
        </SectionIntro>

        {/* Q1 */}
        <div className="mt-10 rounded-[28px] border border-line bg-white p-5 sm:p-8">
          <ActivityLabel done={q1Done}>Question 1</ActivityLabel>
          <h3 className="mt-2 font-display text-[1.65rem] font-semibold leading-snug text-cocoa">{THINK.q1}</h3>
          <p className="mt-2 text-[1.05rem] text-cocoa-2">Step 1 — Choose up to three reasons you find most convincing. Some are the advantages you met in this chapter; others are things to weigh up.</p>
          <div className="mt-5 grid gap-2.5 md:grid-cols-2">
            {THINK.q1Reasons.map((r) => {
              const on = reasons.includes(r.id);
              const full = !on && reasons.length >= 3;
              return (
                <motion.button
                  key={r.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleReason(r.id)}
                  aria-pressed={on}
                  disabled={full}
                  className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors disabled:opacity-45 ${on ? "border-orange bg-orange/5" : "border-line hover:border-line-strong"}`}
                >
                  <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 ${on ? "border-orange bg-orange text-white" : "border-line-strong"}`}>
                    {on && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span>
                    <span className="block text-[1.05rem] leading-snug text-cocoa">{r.text}</span>
                    <span className={`mt-1 block text-[0.85rem] font-extrabold uppercase tracking-[0.08em] ${r.fromChapter ? "text-orange" : "text-cocoa-2/70"}`}>
                      {r.fromChapter ? "From this chapter" : "Something to weigh up"}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {reasons.length > 0 && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-2xl bg-peach/70 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa">
                {pickedCounter
                  ? "Good thinking — strong answers weigh the downsides too. Can you explain why the advantages might still be worth it?"
                  : "These are the D2C advantages from this chapter. Think about which one would matter most to a small food brand just starting out."}
              </motion.p>
            )}
          </AnimatePresence>
          <label htmlFor="q1-text" className="mt-6 block text-[1.05rem] font-bold text-cocoa">
            Step 2 — In your own words
          </label>
          <textarea
            id="q1-text"
            value={q1Text}
            onChange={(e) => setQ1Text(e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="I think a food brand would start online because…"
            className="mt-2 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.08rem] leading-relaxed text-cocoa outline-none focus:border-orange focus:shadow-[0_0_0_4px_rgba(255,92,0,0.15)]"
          />
          <div className="mt-1 text-right text-[0.9rem] text-cocoa-2/75">{q1Text.trim().length < 25 ? `Write at least ${25 - q1Text.trim().length} more characters` : `${q1Text.length}/600`}</div>
        </div>

        {/* Q2 */}
        <div className="mt-8 rounded-[28px] border border-line bg-white p-5 sm:p-8">
          <ActivityLabel done={q2Done}>Question 2</ActivityLabel>
          <h3 className="mt-2 font-display text-[1.65rem] font-semibold leading-snug text-cocoa">{THINK.q2}</h3>
          <p className="mt-2 text-[1.05rem] text-cocoa-2">For each category, decide where you&apos;d buy it, then give a reason.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {CATEGORIES.map((c) => {
              const v = q2[c.id];
              const options = v.channel === "shop" ? THINK.q2Reasons.shop : v.channel === "online" ? THINK.q2Reasons.online : [...THINK.q2Reasons.online.slice(0, 2), ...THINK.q2Reasons.shop.slice(0, 2)];
              const set = (p: Partial<Q2[CategoryId]>) => setQ2((q) => ({ ...q, [c.id]: { ...q[c.id], ...p } }));
              return (
                <div key={c.id} className="rounded-2xl bg-cream p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="size-3 rounded-full" style={{ background: c.tone }} />
                    <span className="font-display text-[1.25rem] font-semibold text-cocoa">{c.title}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl bg-white p-1" role="radiogroup" aria-label={`Where would you buy ${c.title}?`}>
                    {(["online", "either", "shop"] as Channel[]).map((ch) => {
                      const on = v.channel === ch;
                      return (
                        <button
                          key={ch}
                          role="radio"
                          aria-checked={on}
                          onClick={() => set({ channel: ch, reason: "" })}
                          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[0.98rem] font-bold transition-colors ${on ? (ch === "online" ? "bg-orange text-white" : ch === "shop" ? "bg-cocoa text-cream" : "bg-mustard text-cocoa") : "text-cocoa hover:bg-peach"}`}
                        >
                          {ch === "online" && <Globe2 className="size-4" />}
                          {ch === "shop" && <Store className="size-4" />}
                          {CHANNEL_LABEL[ch]}
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {v.channel && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {options.map((o) => (
                            <button
                              key={o}
                              onClick={() => set({ reason: o })}
                              aria-pressed={v.reason === o}
                              className={`rounded-full px-3 py-1.5 text-[0.95rem] font-bold ring-1 ${v.reason === o ? "bg-cocoa text-cream ring-cocoa" : "bg-white text-cocoa ring-line-strong hover:ring-cocoa"}`}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                        <input
                          value={options.includes(v.reason) ? "" : v.reason}
                          onChange={(e) => set({ reason: e.target.value })}
                          maxLength={120}
                          placeholder="…or write your own reason"
                          aria-label={`Your own reason for ${c.title}`}
                          className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3 py-2.5 text-[1rem] text-cocoa outline-none focus:border-orange"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* summary */}
        <motion.div layout className="mt-8 rounded-[28px] bg-cocoa p-5 text-cream sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Your reasoning</div>
              <p className="mt-1 text-[1rem] text-cream/80">Saved on this device only. Copy it into your discussion or LMS submission.</p>
            </div>
            <button onClick={copy} disabled={!allDone} className="eb-btn eb-btn-primary">
              {copied ? <Check className="size-5" /> : <ClipboardCopy className="size-5" />}
              {copied ? "Copied" : "Copy my answers"}
            </button>
          </div>
          <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-black/25 p-4 font-sans text-[1rem] leading-relaxed text-cream/95">{summary}</pre>
          {!allDone && <p className="mt-3 text-[0.95rem] text-cream/75">Finish both questions to copy your answers.</p>}
        </motion.div>
      </Panel>
    </section>
  );
}
