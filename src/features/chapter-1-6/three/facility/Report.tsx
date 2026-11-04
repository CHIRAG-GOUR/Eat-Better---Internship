"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarX, Check, ClipboardCopy, Download, Filter, Flame, FlaskConical, Leaf, Package, PackageX, Printer, RotateCcw, ScanSearch, Stamp, Truck, Waves, Wrench, X } from "lucide-react";
import { reportToMarkdown, type ReportData } from "@/components/sim/SimReport";
import { BATCH_ID, MATERIALS, ORDER, STATION_INFO, type StationId } from "./data";
import { mistakesAt, useFacility } from "./store";

/**
 * Quality Assurance Report — picture-first, built only from what the student actually did in the
 * simulated facility. Details stay folded away until a station is tapped. Simulated batch; not FSSAI advice.
 */

const ICON: Record<StationId, typeof Truck> = { sourcing: Truck, check: ScanSearch, prepping: Filter, cooking: Flame, testing: FlaskConical, packaging: Package };

const FAULTS: { id: string; station: StationId; label: string; icon: typeof Truck }[] = [
  { id: "spoiled", station: "sourcing", label: "Spoiled lot", icon: Leaf },
  { id: "particles", station: "check", label: "Foreign particles", icon: ScanSearch },
  { id: "sorting", station: "prepping", label: "Incomplete sorting", icon: Filter },
  { id: "texture", station: "testing", label: "Uneven texture", icon: Waves },
  { id: "seal", station: "packaging", label: "Faulty seal", icon: PackageX },
  { id: "label", station: "packaging", label: "Missing date", icon: CalendarX },
];

const VERDICTS = [
  { id: "Release", icon: Check, tone: "border-success bg-success text-white", ring: "text-success border-success" },
  { id: "Rework", icon: Wrench, tone: "border-[#C9A400] bg-haldi text-cocoa", ring: "text-[#9A7B00] border-[#C9A400]" },
  { id: "Reject", icon: X, tone: "border-error bg-error text-white", ring: "text-error border-error" },
] as const;

export function QAReport() {
  const passed = useFacility((s) => s.passed);
  const log = useFacility((s) => s.log);
  const pack = useFacility((s) => s.pack);
  const final = useFacility((s) => s.final);
  const patch = useFacility((s) => s.patch);
  const reset = useFacility((s) => s.reset);
  const [open, setOpen] = useState<StationId | null>(null);
  const [copied, setCopied] = useState(false);

  const done = passed >= ORDER.length;
  const cleared = (st: StationId) => ORDER.indexOf(st) < passed;
  const caught = FAULTS.filter((f) => cleared(f.station)).length;
  const fixes = log.filter((l) => !l.correct).length;
  const material = MATERIALS.find((m) => m.id === pack.material);
  const packChecks = [
    { label: "High-barrier pouch", ok: !!material?.ok },
    { label: "Seal checked", ok: pack.sealFound },
    { label: "Date added", ok: pack.labelPick === "bestbefore" },
    { label: "Leak test", ok: pack.leak === "pass" },
  ];
  const ready = done && !!final.decision && final.justification.trim().length >= 10;

  const data: ReportData = useMemo(
    () => ({
      title: "Quality Assurance Report",
      chapter: "Chapter 1.6 · The Virtual Quality & Packaging Facility",
      role: "Quality Assurance Specialist",
      sections: [
        {
          heading: "Six checkpoint decisions",
          items: ORDER.map((st) => {
            const m = mistakesAt(log, st);
            return `${STATION_INFO[st].n}. ${STATION_INFO[st].name}: ${cleared(st) ? (m ? `cleared after ${m} correction${m > 1 ? "s" : ""}` : "cleared first time") : "not reached"}`;
          }),
        },
        { heading: "Quality issues identified", items: ORDER.filter(cleared).map((st) => `${STATION_INFO[st].name}: ${STATION_INFO[st].issue}`) },
        { heading: "Corrective actions", items: ORDER.filter(cleared).map((st) => `${STATION_INFO[st].name}: ${STATION_INFO[st].action}`) },
        { heading: "Packaging inspection", items: packChecks.map((c) => `${c.label}: ${c.ok ? "OK" : "not done"}`) },
        { heading: "Final batch decision", body: `${final.decision ?? "—"} — ${final.justification.trim() || "—"}` },
      ],
      footnote: `Simulated batch ${BATCH_ID}. Educational exercise based on the chapter — not a substitute for FSSAI compliance advice.`,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derived from the listed store values
    [log, passed, pack, final],
  );
  const md = useMemo(() => reportToMarkdown(data), [data]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("ebc-1.6-qa-report", md);
    } catch {
      /* storage blocked */
    }
  }, [md, ready]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "quality-assurance-report.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Quality Assurance Report</title><pre style="font:15px/1.6 system-ui;white-space:pre-wrap;max-width:720px;margin:32px auto">${esc(md)}</pre><script>onload=()=>setTimeout(()=>print(),300)</script>`);
    w.document.close();
  };

  const verdict = VERDICTS.find((v) => v.id === final.decision);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
      {/* header: title + big progress number */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-orange bg-cream px-5 py-4 sm:px-6">
        <div>
          <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-orange">Batch {BATCH_ID} · simulated</div>
          <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-cocoa">Quality Assurance Report</h3>
        </div>
        <div className="flex items-center gap-4">
          <Stat value={`${Math.min(passed, 6)}/6`} label="checkpoints" />
          <Stat value={`${caught}/${FAULTS.length}`} label="faults caught" />
          <Stat value={String(fixes)} label="corrections" />
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6">
        {/* 1 · the line, as a picture */}
        <div>
          <div className="relative grid grid-cols-6 gap-1">
            <div className="absolute left-[8%] right-[8%] top-5 h-1.5 rounded-full bg-cocoa/10 sm:top-7" />
            <motion.div className="absolute left-[8%] top-5 h-1.5 rounded-full bg-success sm:top-7" animate={{ width: `${(Math.max(0, Math.min(passed, 6) - 1) / 5) * 84}%` }} />
            {ORDER.map((st, i) => {
              const Icon = ICON[st];
              const ok = cleared(st);
              const m = mistakesAt(log, st);
              const on = open === st;
              return (
                <div key={st} className="relative flex flex-col items-center">
                  <button
                    onClick={() => setOpen(on ? null : st)}
                    disabled={!ok}
                    aria-expanded={on}
                    aria-label={`${STATION_INFO[st].name}: ${ok ? (m ? `cleared after ${m} corrections` : "cleared first time") : "not reached"}`}
                    className={`relative grid size-11 place-items-center rounded-full border-2 transition-transform sm:size-16 ${ok ? (m ? "border-[#C9A400] bg-haldi text-cocoa" : "border-success bg-success text-white") : "border-cocoa/15 bg-white text-cocoa/30"} ${on ? "scale-110 shadow-[2px_2px_0_0_#2f1c1a]" : ok ? "hover:scale-105" : ""}`}
                  >
                    <Icon className="size-5 sm:size-7" />
                    {ok && m > 0 && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full border-2 border-white bg-orange text-[0.75rem] font-bold text-white">{m}</span>}
                    <span className="absolute -bottom-1 grid size-5 place-items-center rounded-full border-2 border-white bg-cocoa text-[0.7rem] font-bold text-cream">{i + 1}</span>
                  </button>
                  <span className="mt-2 hidden text-center text-[0.9rem] font-bold leading-tight text-cocoa sm:block">{STATION_INFO[st].name}</span>
                </div>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {open && (
              <motion.div key={open} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="font-display text-[1.1rem] font-semibold text-cocoa sm:col-span-2">
                  {STATION_INFO[open].n}. {STATION_INFO[open].name}
                </div>
                <p className="flex gap-2 rounded-2xl bg-error/10 px-4 py-3 text-[1rem] leading-snug text-cocoa">
                  <ScanSearch className="mt-0.5 size-5 shrink-0 text-error" /> {STATION_INFO[open].issue}
                </p>
                <p className="flex gap-2 rounded-2xl bg-success/10 px-4 py-3 text-[1rem] leading-snug text-cocoa">
                  <Wrench className="mt-0.5 size-5 shrink-0 text-success" /> {STATION_INFO[open].action}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!open && passed > 0 && <p className="mt-3 text-center text-[0.9rem] text-cocoa-2">Tap a checkpoint to see the issue and the fix.</p>}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* 2 · faults caught */}
          <div>
            <h4 className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">Faults caught</h4>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {FAULTS.map((f) => {
                const Icon = f.icon;
                const ok = cleared(f.station);
                return (
                  <div key={f.id} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-center ${ok ? "border-success/40 bg-success/10" : "border-dashed border-cocoa/15 bg-cream/50"}`}>
                    <span className={`grid size-10 place-items-center rounded-full ${ok ? "bg-white text-error" : "bg-white text-cocoa/25"}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className={`text-[0.85rem] font-bold leading-tight ${ok ? "text-cocoa" : "text-cocoa/40"}`}>{f.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 · packaging inspection */}
          <div>
            <h4 className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">Packaging check</h4>
            <div className="mt-2 flex items-center gap-4 rounded-2xl bg-cream p-4">
              <span className={`grid size-16 shrink-0 place-items-center rounded-2xl ${packChecks.every((c) => c.ok) ? "bg-success text-white" : "bg-white text-cocoa/30"}`}>
                <Package className="size-8" />
              </span>
              <ul className="grid flex-1 gap-1.5">
                {packChecks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-[0.95rem] font-semibold text-cocoa">
                    {c.ok ? <Check className="size-5 text-success" strokeWidth={3} /> : <span className="grid size-5 place-items-center rounded-full border-2 border-cocoa/20" />}
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4 · final decision — the stamp */}
        <div className="relative rounded-2xl border-2 border-dashed border-cocoa/20 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">
              <Stamp className="size-4" /> Your final batch decision
            </h4>
            {!done && <span className="text-[0.9rem] font-bold text-cocoa-2">Unlocks after all six checkpoints</span>}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {VERDICTS.map((v) => {
              const Icon = v.icon;
              const on = final.decision === v.id;
              return (
                <button
                  key={v.id}
                  disabled={!done}
                  onClick={() => patch("final", { decision: v.id })}
                  aria-pressed={on}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 font-display text-[1.1rem] font-semibold transition-colors disabled:opacity-40 ${on ? `${v.tone} shadow-[2px_2px_0_0_#2f1c1a]` : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}
                >
                  <Icon className="size-6" strokeWidth={2.5} /> {v.id}
                </button>
              );
            })}
          </div>
          <input
            value={final.justification}
            disabled={!done}
            onChange={(e) => patch("final", { justification: e.target.value })}
            maxLength={160}
            aria-label="Why? One line of justification"
            placeholder="Why? One line is enough…"
            className="mt-3 w-full rounded-xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] text-cocoa outline-none focus:border-orange disabled:opacity-40"
          />
              {/* the stamp lands on the decision */}
          <AnimatePresence>
            {verdict && final.justification.trim().length >= 10 && (
              <motion.div
                key={verdict.id}
                initial={{ scale: 2.2, opacity: 0, rotate: -24 }}
                animate={{ scale: 1, opacity: 0.9, rotate: -12 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`pointer-events-none absolute -top-5 right-4 hidden rounded-xl border-4 px-4 py-1.5 font-display text-[1.6rem] font-bold uppercase tracking-[0.1em] sm:block ${verdict.ring}`}
              >
                {verdict.id}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={!ready}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(md);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                /* clipboard blocked */
              }
            }}
            className="eb-btn eb-btn-secondary !py-2 !normal-case"
          >
            {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />} {copied ? "Copied" : "Copy"}
          </button>
          <button disabled={!ready} onClick={download} className="eb-btn eb-btn-secondary !py-2 !normal-case">
            <Download className="size-4" /> Download
          </button>
          <button disabled={!ready} onClick={print} className="eb-btn eb-btn-primary !py-2 !normal-case">
            <Printer className="size-4" /> Print / PDF
          </button>
          <button onClick={() => reset()} className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.9rem] font-bold text-cocoa-2 hover:bg-peach">
            <RotateCcw className="size-4" /> Run a new batch
          </button>
        </div>
        <p className="text-[0.82rem] text-cocoa-2/80">Simulated batch · educational exercise, not FSSAI compliance advice · saved on this device, not LMS progress.</p>
      </div>

    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-[1.5rem] font-semibold leading-none text-cocoa tabular-nums">{value}</div>
      <div className="mt-1 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-cocoa-2">{label}</div>
    </div>
  );
}
