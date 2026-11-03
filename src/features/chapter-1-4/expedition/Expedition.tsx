"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BookOpen, Check, ChevronDown, ChevronUp, Circle, DoorOpen, Footprints, Hand, Lightbulb, MapPin, MessageCircle, Search } from "lucide-react";
import { InspectPanel, LiteToggle, ObjectiveTracker, RoleBadge, type Objective } from "@/components/sim/SimHud";
import { SimReport, type ReportData } from "@/components/sim/SimReport";
import { liteCanvasProps, useLiteMode } from "@/components/sim/useLiteMode";
import { FIT_TABLE } from "../content";
import { CONSUMERS, EVIDENCE_NEEDED, LEADING_FEEDBACK, LOCATIONS, SEGMENTS, evidenceDone, type Consumer, type LocationId, type ProblemId } from "./data";
import { Neighbourhood, type Pending } from "./Neighbourhood";
import { COLUMNS, Wall } from "./Wall";
import { InspectObject, OBJECT_FRAME } from "./objects";

const KEY = "ebc-1.4-expedition";
const ROW = Object.fromEntries(FIT_TABLE.map((r) => [r.id, r])) as Record<ProblemId, (typeof FIT_TABLE)[number]>;

type Phase = "intro" | "explore" | "studio";
type Saved = {
  asked: Record<string, string[]>;
  inspected: Record<string, boolean>;
  leading: string[];
  placed: Record<string, ProblemId | null>;
  strongest: ProblemId | null;
  segments: string[];
  target: string;
  opportunity: string;
  researcher: string;
};
const EMPTY: Saved = { asked: {}, inspected: {}, leading: [], placed: {}, strongest: null, segments: [], target: "", opportunity: "", researcher: "" };
const byId = (id: string) => CONSUMERS.find((c) => c.id === id)!;

/* ── close-up 3D viewer for inspected objects ─────────────────── */

function InspectViewer({ c, lite }: { c: Consumer; lite: boolean }) {
  const f = OBJECT_FRAME[c.object.kind];
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-cocoa/15 bg-gradient-to-b from-peach to-cream">
      <Canvas {...liteCanvasProps(lite)} shadows={false} camera={{ position: [f.dist * 0.75, f.y + f.dist * 0.45, f.dist * 0.75], fov: 40 }}>
        <hemisphereLight args={["#FFF4E6", "#7A5A3A", 1.2]} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} />
        <InspectObject kind={c.object.kind} />
        <OrbitControls target={[0, f.y, 0]} enablePan={false} minDistance={f.dist * 0.5} maxDistance={f.dist * 1.6} autoRotate autoRotateSpeed={1.6} />
      </Canvas>
      <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-cream/90 px-2 py-0.5 text-[0.75rem] font-bold text-cocoa-2">
        <Hand className="size-3.5" /> Drag to turn it
      </span>
    </div>
  );
}

/* ── the expedition ───────────────────────────────────────────── */

export default function Expedition({ onComplete }: { onComplete: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const goRef = useRef<((p: Pending) => void) | null>(null);
  const lite = useLiteMode();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [s, setS] = useState<Saved>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [talk, setTalk] = useState<string | null>(null);
  const [inspect, setInspect] = useState<string | null>(null);
  const [notebook, setNotebook] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [where, setWhere] = useState<LocationId | "studio" | null>(null);
  const [lastQ, setLastQ] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showObj, setShowObj] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (v) setS({ ...EMPTY, ...v });
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s, restored]);

  const status = useMemo(() => Object.fromEntries(CONSUMERS.map((c) => [c.id, { done: evidenceDone(s.asked[c.id], s.inspected[c.id]), inspected: !!s.inspected[c.id] }])), [s.asked, s.inspected]);
  const collected = CONSUMERS.filter((c) => status[c.id].done).map((c) => c.id);
  const enough = collected.length >= EVIDENCE_NEEDED;
  const placedAll = collected.length > 0 && collected.every((id) => s.placed[id]);
  const counts = useMemo(() => {
    const m = Object.fromEntries(COLUMNS.map((p) => [p, 0])) as Record<ProblemId, number>;
    for (const id of collected) {
      const p = s.placed[id];
      if (p) m[p]++;
    }
    return m;
  }, [collected, s.placed]);
  const maxCount = Math.max(...Object.values(counts));
  const mostFrequent = COLUMNS.filter((p) => maxCount > 0 && counts[p] === maxCount);
  const accuracy = collected.filter((id) => s.placed[id] === byId(id).problem).length;
  const reportReady = enough && placedAll && !!s.strongest && (s.segments.length > 0 || s.target.trim().length > 3) && s.opportunity.trim().length >= 20;

  useEffect(() => {
    if (reportReady) onComplete();
  }, [reportReady, onComplete]);

  const flash = useCallback((t: string) => {
    setToast(t);
    setTimeout(() => setToast((x) => (x === t ? null : x)), 2600);
  }, []);

  const arrive = useCallback(
    (p: Pending) => {
      if (!p) return;
      if (p.type === "talk") {
        setTalk(p.id);
        setInspect(null);
        setLastQ(null);
      } else if (p.type === "inspect") {
        setInspect(p.id);
        setTalk(null);
        setS((x) => ({ ...x, inspected: { ...x.inspected, [p.id]: true } }));
      } else if (p.type === "studio") {
        if (collected.length >= EVIDENCE_NEEDED) setPhase("studio");
        else flash(`The studio opens once you have ${EVIDENCE_NEEDED} complete pieces of evidence (you have ${collected.length}).`);
      }
    },
    [collected.length, flash],
  );

  const ask = (c: Consumer, qid: string) => {
    setLastQ(qid);
    setS((x) => {
      const prev = x.asked[c.id] ?? [];
      return {
        ...x,
        asked: { ...x.asked, [c.id]: prev.includes(qid) ? prev : [...prev, qid] },
        leading: qid === "leading" && !x.leading.includes(c.id) ? [...x.leading, c.id] : x.leading,
      };
    });
  };

  const tc = talk ? byId(talk) : null;
  const ic = inspect ? byId(inspect) : null;
  const askedT = tc ? (s.asked[tc.id] ?? []) : [];
  const objectives: Objective[] = [
    { id: "talk", label: `Interview consumers (${collected.length}/${EVIDENCE_NEEDED} complete)`, done: enough, detail: "Ask what frustrates them, then ask why — and inspect the snack next to them." },
    { id: "studio", label: "Take your evidence to the Research Studio", done: phase === "studio" || placedAll, detail: "Walk to the glowing door at the top of the street." },
    { id: "group", label: "Group the evidence on the investigation wall", done: enough && placedAll, detail: "Group each card by the problem that keeps driving the choice — not by what they say." },
    { id: "need", label: "Pick the strongest unmet need", done: !!s.strongest && placedAll, detail: "The biggest group is your strongest signal." },
    { id: "report", label: "Write your Consumer Insight Report", done: reportReady, detail: "Choose the target group and write one opportunity." },
  ];

  const report: ReportData = {
    title: "Consumer Insight Report",
    chapter: "Chapter 1.4 · The Consumer Insight Expedition",
    role: `Junior Consumer Researcher${s.researcher.trim() ? ` — ${s.researcher.trim()}` : ""}`,
    sections: [
      {
        heading: `Customer profiles investigated (${collected.length})`,
        items: collected.map((id) => {
          const c = byId(id);
          return `${c.name} — ${c.role} (${LOCATIONS[c.location].name}). Says: “${c.says}” Observed: ${c.observed} Real driver: ${c.driver}`;
        }),
      },
      {
        heading: "Common problems identified",
        items: COLUMNS.filter((p) => counts[p] > 0).map((p) => `${ROW[p].problem} — ${counts[p]} consumer${counts[p] > 1 ? "s" : ""}: ${collected.filter((id) => s.placed[id] === p).map((id) => byId(id).name.split(" (")[0]).join(", ")}`),
      },
      {
        heading: "Most frequently occurring customer need",
        body: mostFrequent.length ? `${mostFrequent.map((p) => ROW[p].problem).join(" / ")} (${maxCount} of ${collected.length} profiles, from my grouping)` : "—",
      },
      { heading: "Strongest unmet need (my choice)", body: s.strongest ? ROW[s.strongest].problem : "—" },
      { heading: "Target customer group", body: [s.segments.join(", "), s.target.trim()].filter(Boolean).join(" — ") || "—" },
      { heading: "Opportunity Eat Better Co could address", body: s.opportunity.trim() || "—" },
      ...(s.strongest ? [{ heading: "How Eat Better answers this need today (from the chapter)", body: `${ROW[s.strongest].answer}. Proof point: ${ROW[s.strongest].proof}.` }] : []),
      {
        heading: "Research quality",
        status: "info" as const,
        items: [`Grouping matched the real driver for ${accuracy} of ${collected.length} profiles.`, `Leading questions asked: ${s.leading.length}${s.leading.length ? " (they suggest an answer instead of finding one out)" : ""}.`],
      },
    ],
    footnote: "Fictional consumers · practice exercise. Fit is proven by customer evidence, not by assumptions or advertising.",
  };

  const toggleSeg = (seg: string) => setS((x) => ({ ...x, segments: x.segments.includes(seg) ? x.segments.filter((y) => y !== seg) : [...x.segments, seg] }));
  const suggested = s.strongest ? Array.from(new Set(collected.filter((id) => s.placed[id] === s.strongest).map((id) => byId(id).segment))) : [];

  return (
    <div className="space-y-5">
      <div ref={host} className="relative h-[560px] overflow-hidden rounded-[24px] border border-cocoa bg-[#F6D7B8] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[600px] lg:h-[660px]">
        {visible && (
          <Canvas {...liteCanvasProps(lite)} camera={{ position: [0, 8.5, 14.5], fov: 45 }} frameloop={inspect ? "never" : "always"} style={{ touchAction: "none" }}>
            {phase === "studio" ? (
              <Wall cards={collected} placed={s.placed} selected={selected} strongest={s.strongest} lite={lite} onPlace={(id, p) => setS((x) => ({ ...x, placed: { ...x.placed, [id]: p } }))} onSelect={setSelected} />
            ) : (
              <Neighbourhood
                lite={lite}
                frozen={phase === "intro" || !!talk || !!inspect || notebook}
                talkingId={talk}
                status={status}
                studioOpen={enough}
                onArrive={arrive}
                onNear={setNear}
                onLocation={setWhere}
                goRef={goRef}
              />
            )}
          </Canvas>
        )}

        {/* HUD — top */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          <RoleBadge role="Junior Consumer Researcher" icon={<Search className="size-4 text-haldi" />} />
          <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
            <LiteToggle />
            {phase !== "intro" && (
              <button onClick={() => setNotebook((v) => !v)} aria-pressed={notebook} className="flex items-center gap-1.5 rounded-xl border border-cocoa/20 bg-cream/95 px-2.5 py-1.5 text-[0.8rem] font-bold text-cocoa hover:border-cocoa">
                <BookOpen className="size-4 text-orange" /> Notebook {collected.length}/{EVIDENCE_NEEDED}
              </button>
            )}
          </div>
        </div>
        {phase !== "intro" && (
          <div className="absolute left-3 top-14 z-10 hidden md:block">
            {showObj ? (
              <div className="relative w-[280px]">
                <ObjectiveTracker objectives={objectives} />
                <button onClick={() => setShowObj(false)} aria-label="Collapse objectives" className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-cocoa-2 hover:text-cocoa">
                  <ChevronUp className="size-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowObj(true)} aria-expanded={false} className="flex max-w-[320px] items-center gap-2 rounded-xl border border-cocoa/15 bg-cream/95 px-3 py-1.5 text-left text-[0.82rem] font-bold leading-snug text-cocoa hover:border-cocoa">
                <span className="shrink-0 rounded-md bg-orange px-1.5 py-0.5 text-[0.72rem] text-white">
                  {objectives.filter((o) => o.done).length}/{objectives.length}
                </span>
                <span className="truncate">{objectives.find((o) => !o.done)?.label ?? "Report complete"}</span>
                <ChevronDown className="size-4 shrink-0 text-cocoa-2" />
              </button>
            )}
          </div>
        )}
        {phase !== "intro" && (
          <div className="pointer-events-none absolute left-3 top-12 z-10 max-w-[70%] rounded-xl bg-cream/95 px-2.5 py-1.5 text-[0.8rem] font-bold leading-snug text-cocoa md:hidden">
            {objectives.find((o) => !o.done)?.label ?? "Report complete"}
          </div>
        )}

        {/* HUD — bottom prompts (explore) */}
        {phase === "explore" && !talk && !inspect && !notebook && (
          <div className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-end justify-between gap-2">
            <div className="pointer-events-none flex items-center gap-1.5 rounded-xl bg-cocoa/90 px-2.5 py-1.5 text-[0.8rem] font-bold text-cream">
              <MapPin className="size-4 text-haldi" /> {where === "studio" ? "Research Studio" : where ? LOCATIONS[where].name : "Neighbourhood street"}
            </div>
            <div className="flex flex-wrap gap-2">
              {near && (
                <button onClick={() => goRef.current?.({ type: "talk", id: near })} className="eb-btn eb-btn-primary !py-2 !text-[0.9rem] !normal-case">
                  <MessageCircle className="size-4" /> Talk to {byId(near).name.split(" (")[0]}
                </button>
              )}
              {enough && (
                <button onClick={() => goRef.current?.({ type: "studio" })} className="eb-btn eb-btn-dark !py-2 !text-[0.9rem] !normal-case">
                  <DoorOpen className="size-4" /> {where === "studio" ? "Enter the studio" : "Walk to the studio"}
                </button>
              )}
            </div>
            <div className="pointer-events-none hidden w-full text-[0.78rem] font-bold text-cocoa/70 sm:block">
              <Footprints className="mr-1 inline size-3.5" /> Tap or click the ground to walk · WASD / arrow keys on a keyboard · tap people to talk, glowing rings to inspect
            </div>
          </div>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute left-1/2 top-[38%] z-30 w-[min(420px,88%)] -translate-x-1/2 rounded-2xl border border-cocoa bg-cream px-4 py-3 text-center text-[0.95rem] font-bold text-cocoa shadow-[3px_3px_0_0_#2f1c1a]">
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* conversation */}
        <InspectPanel
          open={!!tc}
          kicker={tc ? `Fictional consumer · ${LOCATIONS[tc.location].name}` : ""}
          title={tc ? `${tc.name} — ${tc.role}` : ""}
          onClose={() => setTalk(null)}
          note="A fictional consumer for practice. Their words are written for learning — they are not real reviews."
          actions={
            tc && (
              <>
                <button
                  onClick={() => {
                    setTalk(null);
                    goRef.current?.({ type: "inspect", id: tc.id });
                  }}
                  className={`eb-btn !py-1.5 !text-[0.85rem] !normal-case ${s.inspected[tc.id] ? "eb-btn-secondary" : "eb-btn-primary"}`}
                >
                  <Search className="size-4" /> {s.inspected[tc.id] ? "Look again at" : "Inspect"} {tc.object.title.split(" ").slice(-2).join(" ")}
                </button>
                <button onClick={() => setTalk(null)} className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case">
                  Done talking
                </button>
              </>
            )
          }
        >
          {tc && (
            <div>
              <p className="rounded-xl bg-haldi/40 px-3 py-2 font-bold">&ldquo;{tc.says}&rdquo;</p>
              {/* transcript */}
              <div className="mt-2 space-y-1.5">
                {tc.questions
                  .filter((q) => askedT.includes(q.id))
                  .map((q) => (
                    <div key={q.id} className={`rounded-xl px-3 py-2 text-[0.9rem] ${lastQ === q.id ? "bg-white ring-2 ring-orange/40" : "bg-white/70"}`}>
                      <div className="font-bold text-cocoa-2">You: {q.q}</div>
                      <div className="mt-0.5">“{q.a}”</div>
                      <div className={`mt-1 text-[0.75rem] font-extrabold uppercase tracking-[0.08em] ${q.id === "leading" ? "text-error" : q.id === "why" ? "text-success" : "text-orange"}`}>{q.tag}</div>
                    </div>
                  ))}
              </div>
              {lastQ === "leading" && (
                <p className="mt-2 flex gap-1.5 rounded-xl bg-error/10 px-3 py-2 text-[0.85rem] font-bold text-cocoa">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-error" /> {LEADING_FEEDBACK}
                </p>
              )}
              {/* question choices */}
              <div className="mt-3 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">Ask a question</div>
              <div className="mt-1.5 grid gap-1.5">
                {tc.questions
                  .filter((q) => !askedT.includes(q.id) && (q.id !== "why" || askedT.includes("frustration")))
                  .map((q) => (
                    <button key={q.id} onClick={() => ask(tc, q.id)} className="rounded-xl border-2 border-cocoa/15 bg-white px-3 py-2 text-left text-[0.9rem] font-bold leading-snug text-cocoa hover:border-orange">
                      {q.q}
                    </button>
                  ))}
                {tc.questions.every((q) => askedT.includes(q.id)) && <span className="text-[0.85rem] text-cocoa-2">You&apos;ve asked everything.</span>}
              </div>
              {/* evidence checklist */}
              <ul className="mt-3 grid gap-1 text-[0.82rem]">
                {[
                  { ok: askedT.includes("frustration"), t: "Asked what frustrates them" },
                  { ok: askedT.includes("why"), t: "Asked why (the follow-up)" },
                  { ok: !!s.inspected[tc.id], t: "Inspected their snack" },
                ].map((x) => (
                  <li key={x.t} className={`flex items-center gap-1.5 ${x.ok ? "font-bold text-success" : "text-cocoa-2"}`}>
                    {x.ok ? <Check className="size-3.5" strokeWidth={3} /> : <Circle className="size-3.5" />} {x.t}
                  </li>
                ))}
              </ul>
              {status[tc.id].done && <p className="mt-2 rounded-xl bg-success/10 px-3 py-2 text-[0.85rem] font-bold text-success">Evidence card added to your notebook.</p>}
            </div>
          )}
        </InspectPanel>

        {/* inspect */}
        <InspectPanel
          open={!!ic}
          kicker={ic ? `Inspect · ${ic.name.split(" (")[0]}'s snack` : ""}
          title={ic?.object.title ?? ""}
          facts={ic?.object.facts}
          note="Fictional products and packaging, made for this exercise."
          onClose={() => setInspect(null)}
          actions={
            ic && (
              <button
                onClick={() => {
                  setInspect(null);
                  setTalk(ic.id);
                }}
                className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case"
              >
                <MessageCircle className="size-4" /> Talk to {ic.name.split(" (")[0]}
              </button>
            )
          }
        >
          {ic && <InspectViewer c={ic} lite={lite} />}
        </InspectPanel>

        {/* notebook */}
        <InspectPanel open={notebook && phase !== "intro"} kicker="Evidence notebook" title={`${collected.length} of ${EVIDENCE_NEEDED} complete`} onClose={() => setNotebook(false)}>
          <ul className="space-y-1.5">
            {CONSUMERS.map((c) => {
              const a = s.asked[c.id] ?? [];
              const done = status[c.id].done;
              return (
                <li key={c.id} className={`rounded-xl px-3 py-2 ${done ? "bg-success/10" : "bg-white"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{c.name.split(" (")[0]}</span>
                    <span className="text-[0.75rem] font-bold text-cocoa-2">{LOCATIONS[c.location].name}</span>
                  </div>
                  {a.length || s.inspected[c.id] ? (
                    <div className="text-[0.82rem] text-cocoa-2">
                      Says: “{c.says}”{done ? <span className="block text-success">Why: {c.questions.find((q) => q.id === "why")!.a}</span> : <span className="block">{[!a.includes("frustration") && "ask about frustrations", !a.includes("why") && "ask why", !s.inspected[c.id] && "inspect their snack"].filter(Boolean).join(" · ")}</span>}
                    </div>
                  ) : (
                    <div className="text-[0.82rem] text-cocoa-2/70">Not met yet</div>
                  )}
                </li>
              );
            })}
          </ul>
        </InspectPanel>

        {/* studio HUD */}
        {phase === "studio" && (
          <div className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl rounded-2xl bg-cream/95 p-3 text-[0.88rem] leading-snug text-cocoa">
              {selected ? (
                <span>
                  <strong>{byId(selected).name.split(" (")[0]}</strong> selected — tap a problem heading on the wall to pin the card there.
                </span>
              ) : !placedAll ? (
                <span>
                  <strong>Drag each card</strong> (or tap it, then tap a heading) into the problem that keeps driving that person&apos;s choice. Read the &ldquo;why&rdquo;, not just what they say.
                </span>
              ) : (
                <span>
                  All cards are grouped. Your grouping matches the real driver for <strong>{accuracy}/{collected.length}</strong>.
                  {accuracy < collected.length && " Orange pins are grouped by what people said — move them by their 'why'."}
                </span>
              )}
            </div>
            <button onClick={() => setPhase("explore")} className="eb-btn eb-btn-secondary self-start !py-2 !text-[0.85rem] !normal-case sm:self-auto">
              <ArrowLeft className="size-4" /> Back to the street
            </button>
          </div>
        )}

        {/* intro */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 grid place-items-center bg-cocoa/45 p-3">
              <motion.div initial={{ y: 20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} className="max-h-full max-w-md overflow-y-auto rounded-[22px] border border-cocoa bg-cream p-5 shadow-[4px_4px_0_0_#2f1c1a] sm:p-6">
                <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-orange">Role · Junior Consumer Researcher</div>
                <h3 className="mt-1 font-display text-[1.6rem] font-semibold leading-tight text-cocoa">The Consumer Insight Expedition</h3>
                <p className="mt-2 text-[0.98rem] leading-snug text-cocoa">Eat Better wants evidence, not guesses. Visit the supermarket, a family kitchen, an office break area and a college canteen. Interview fictional consumers, inspect what they snack on, and find the problem that keeps driving their choices.</p>
                <ul className="mt-3 space-y-1.5 text-[0.9rem] text-cocoa">
                  <li className="flex gap-2">
                    <Footprints className="mt-0.5 size-4 shrink-0 text-orange" /> Tap or click the ground to walk (WASD works too).
                  </li>
                  <li className="flex gap-2">
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-orange" /> Tap a person to talk. Ask what frustrates them — then ask why.
                  </li>
                  <li className="flex gap-2">
                    <Search className="mt-0.5 size-4 shrink-0 text-orange" /> Tap the glowing ring by each person to inspect their snack.
                  </li>
                </ul>
                <button onClick={() => setPhase(collected.length >= EVIDENCE_NEEDED && restored && Object.keys(s.placed).length ? "studio" : "explore")} className="eb-btn eb-btn-primary mt-4 w-full justify-center">
                  {collected.length ? "Continue the expedition" : "Start the expedition"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* accessible wall controls + strongest need + report inputs */}
      {phase === "studio" && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[22px] bg-cream p-4 sm:p-5">
            <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">Investigation wall</div>
            <p className="mt-1 text-[0.92rem] text-cocoa-2">Prefer a list? Group the cards here too.</p>
            <ul className="mt-3 space-y-2">
              {collected.map((id) => {
                const c = byId(id);
                const p = s.placed[id];
                return (
                  <li key={id} className="flex flex-col gap-1.5 rounded-xl bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[0.92rem] text-cocoa">
                      <strong>{c.name.split(" (")[0]}</strong> — “{c.says}”
                    </span>
                    <select
                      value={p ?? ""}
                      onChange={(e) => setS((x) => ({ ...x, placed: { ...x.placed, [id]: (e.target.value || null) as ProblemId | null } }))}
                      aria-label={`Group ${c.name}'s card under a problem`}
                      className={`rounded-lg border px-2 py-1.5 text-[0.88rem] ${!p ? "border-cocoa/20" : p === c.problem ? "border-success" : "border-orange"}`}
                    >
                      <option value="">Not grouped</option>
                      {COLUMNS.map((q) => (
                        <option key={q} value={q}>
                          {ROW[q].problem}
                        </option>
                      ))}
                    </select>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-[22px] bg-cream p-4 sm:p-5">
            <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">Strongest unmet need</div>
            {!placedAll ? (
              <p className="mt-2 text-[0.95rem] text-cocoa-2">Group every card first — then the counts appear here.</p>
            ) : (
              <>
                <ul className="mt-2 space-y-2">
                  {COLUMNS.map((p) => (
                    <li key={p}>
                      <button
                        onClick={() => setS((x) => ({ ...x, strongest: p }))}
                        disabled={!counts[p]}
                        aria-pressed={s.strongest === p}
                        className={`w-full rounded-xl border-2 px-3 py-2 text-left disabled:opacity-40 ${s.strongest === p ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}
                      >
                        <span className="flex items-center justify-between gap-2 text-[0.92rem] font-bold text-cocoa">
                          {ROW[p].problem}
                          <span className="tabular-nums">{counts[p]}</span>
                        </span>
                        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-cocoa/10">
                          <span className="block h-full rounded-full bg-orange" style={{ width: `${(counts[p] / Math.max(1, collected.length)) * 100}%` }} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.88rem] text-cocoa-2">
                  Most frequent in your grouping: <strong className="text-cocoa">{mostFrequent.map((p) => ROW[p].problem).join(" / ")}</strong>. Tap the need you think is strongest.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {(phase === "studio" || reportReady) && placedAll && s.strongest && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[22px] bg-white p-4 sm:p-5">
            <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">Finish your report</div>
            <label className="mt-3 block text-[0.92rem] font-bold text-cocoa">
              Your name (optional)
              <input value={s.researcher} onChange={(e) => setS((x) => ({ ...x, researcher: e.target.value }))} className="mt-1 w-full rounded-xl border border-line-strong px-3 py-2 font-normal outline-none focus:border-orange" />
            </label>
            <div className="mt-3 text-[0.92rem] font-bold text-cocoa">Target customer group</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SEGMENTS.map((seg) => (
                <button key={seg} onClick={() => toggleSeg(seg)} aria-pressed={s.segments.includes(seg)} className={`rounded-full border-2 px-3 py-1 text-[0.85rem] font-bold ${s.segments.includes(seg) ? "border-orange bg-orange text-white" : suggested.includes(seg) ? "border-orange/50 bg-orange/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa"}`}>
                  {seg}
                </button>
              ))}
            </div>
            {suggested.length > 0 && <p className="mt-1 text-[0.8rem] text-cocoa-2">Highlighted: the groups your strongest-need cards came from.</p>}
            <input value={s.target} onChange={(e) => setS((x) => ({ ...x, target: e.target.value }))} placeholder="Describe them in your words (optional)" className="mt-2 w-full rounded-xl border border-line-strong px-3 py-2 text-[0.95rem] outline-none focus:border-orange" />
            <label className="mt-3 block text-[0.92rem] font-bold text-cocoa">
              One opportunity Eat Better Co could address
              <textarea value={s.opportunity} onChange={(e) => setS((x) => ({ ...x, opportunity: e.target.value }))} rows={4} placeholder="Based on my evidence, Eat Better could…" className="mt-1 w-full rounded-xl border border-line-strong px-3 py-2 font-normal leading-relaxed outline-none focus:border-orange" />
            </label>
            {!reportReady && <p className="mt-1 text-[0.82rem] text-cocoa-2">Pick a target group and write at least a sentence to unlock copy, download and print.</p>}
          </div>
          <SimReport data={report} storageKey="ebc-1.4-insight-report" ready={reportReady} />
        </div>
      )}
      {phase !== "studio" && enough && !placedAll && (
        <p className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2.5 text-[0.95rem] font-bold text-success">
          <DoorOpen className="size-5" /> You have enough evidence. Walk to the Research Studio at the top of the street.
        </p>
      )}
    </div>
  );
}
