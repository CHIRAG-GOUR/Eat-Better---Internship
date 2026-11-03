"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  PackageCheck,
  Search,
  Flame,
  Sprout,
  Gauge,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  BadgeCheck,
  QrCode,
  FileCheck2,
} from "lucide-react";
import { BATCH_ID, ORDER, type StationId } from "./data";
import { mistakesAt, useFacility } from "./store";

const STAMP_OPTIONS = [
  {
    id: "release",
    label: "RELEASE FOR DISPATCH",
    subtext: "All 6 checkpoints cleared & verified",
    color: "#00A341", // Brand Success Green
    bg: "bg-emerald-500/10",
    border: "border-emerald-600",
    text: "text-emerald-700",
    stampBorder: "border-emerald-600 text-emerald-700",
    stampIcon: CheckCircle2,
  },
  {
    id: "hold",
    label: "HOLD FOR RE-INSPECTION",
    subtext: "Quarantine pending secondary lab test",
    color: "#E7BA68", // Brand Mustard/Amber
    bg: "bg-amber-500/10",
    border: "border-amber-600",
    text: "text-amber-800",
    stampBorder: "border-amber-600 text-amber-800",
    stampIcon: AlertTriangle,
  },
  {
    id: "reject",
    label: "REJECT DEFECTIVE BATCH",
    subtext: "Failed compliance, return to vendor",
    color: "#F83A3A", // Brand Error Red
    bg: "bg-red-500/10",
    border: "border-red-600",
    text: "text-red-700",
    stampBorder: "border-red-600 text-red-700",
    stampIcon: XCircle,
  },
];

const QUICK_ENDORSEMENTS = [
  "Zero chemical additives or preservatives confirmed",
  "100% hermetic multi-layer barrier seal verified",
  "Moisture & crunch profile within target range",
  "Raw ingredients optical sort & de-stoning passed",
  "FSSAI compliance date marking & net wt. checked",
  "Hygienic dry roasting with zero palm oil",
];

const STATION_VISUALS = [
  {
    id: "sourcing",
    name: "01 · Raw Sourcing",
    icon: Sprout,
    badge: "Lot B Quarantined",
    spec: "Moisture < 12%",
    finding: "Spoiled dates rejected at dock; fresh almonds & millets accepted.",
  },
  {
    id: "check",
    name: "02 · Quality Check",
    icon: Search,
    badge: "Optical Sort Passed",
    spec: "0 Foreign Matter",
    finding: "Stones & husk debris filtered; uniform kernel size verified.",
  },
  {
    id: "prepping",
    name: "03 · Clean Prepping",
    icon: Flame,
    badge: "Dry Roasting Line",
    spec: "Zero Palm Oil",
    finding: "Line sanitized; gentle slow roasting without added oil.",
  },
  {
    id: "cooking",
    name: "04 · Thermal Cook",
    icon: Gauge,
    badge: "Heat Level 1 Target",
    spec: "Even Gold Roast",
    finding: "Temperature curves strictly calibrated for maximum crunch retention.",
  },
  {
    id: "testing",
    name: "05 · Batch Sensory",
    icon: Award,
    badge: "Sensory Benchmark OK",
    spec: "Natural Jaggery",
    finding: "Crunch, aroma, and natural taste match reference formulation.",
  },
  {
    id: "packaging",
    name: "06 · Barrier Pack",
    icon: PackageCheck,
    badge: "Hermetic Pouch Seal",
    spec: "0% Leak Rate",
    finding: "Nitrogen barrier pouch tested airtight under immersion test.",
  },
];

export function QAReport() {
  const passed = useFacility((s) => s.passed);
  const log = useFacility((s) => s.log);
  const final = useFacility((s) => s.final);
  const patch = useFacility((s) => s.patch);

  const [activeStamp, setActiveStamp] = useState<string | null>(final.decision ?? "release");
  const [selectedEndorsements, setSelectedEndorsements] = useState<string[]>([
    "Zero chemical additives or preservatives confirmed",
    "100% hermetic multi-layer barrier seal verified",
    "FSSAI compliance date marking & net wt. checked",
  ]);
  const [copied, setCopied] = useState(false);
  const [stampAnimationKey, setStampAnimationKey] = useState(0);

  const allCompleted = passed >= ORDER.length;
  const currentStamp = STAMP_OPTIONS.find((s) => s.id === activeStamp) || STAMP_OPTIONS[0];

  const handleSelectStamp = (id: string, label: string) => {
    setActiveStamp(id);
    setStampAnimationKey((prev) => prev + 1);
    patch("final", { decision: label });
  };

  const toggleEndorsement = (item: string) => {
    setSelectedEndorsements((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const certificateId = useMemo(() => {
    return `EBC-QA-${BATCH_ID}-${new Date().getFullYear()}`;
  }, []);

  const handleCopySummary = async () => {
    const summary = `================================================================
EAT BETTER CO. — QUALITY ASSURANCE DISPATCH PASSPORT
Certificate ID: ${certificateId}
Batch: ${BATCH_ID} | Line: 02 (Roasted Snacks)
Role: Quality Assurance Specialist
Decision: ${currentStamp.label}
Status: VERIFIED & STAMPED
----------------------------------------------------------------
Endorsed Quality Checkpoints:
${selectedEndorsements.map((e) => `[✓] ${e}`).join("\n")}
================================================================`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleDownloadCertificate = () => {
    const content = `================================================================
EAT BETTER CO. × SKILLIZEE
OFFICIAL QUALITY ASSURANCE BATCH PASSPORT
================================================================
Certificate Serial: ${certificateId}
Simulated Batch: ${BATCH_ID}
Inspection Officer: Quality Assurance Specialist
Dispatch Verdict: ${currentStamp.label}
Timestamp: ${new Date().toLocaleString("en-IN")}
----------------------------------------------------------------
CHECKPOINT TELEMETRY:
01. Sourcing: Lot B Spoilage Quarantined, Grade-A Approved
02. Physical QC: Optical De-stoning Cleared (0% Foreign Matter)
03. Prepping Line: Clean-Label Roasting (Zero Palm Oil)
04. Thermal Profile: Target Heat Profile Achieved
05. Sensory & Lab: Formulation Benchmark Matched
06. Packaging: High-Barrier Pouch (Immersion Leak Test: Passed)

ENDORSED CRITERIA:
${selectedEndorsements.map((e) => `* ${e}`).join("\n")}

AUDIT STATUS: APPROVED & DIGITALLY SEALED
================================================================
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `EatBetter_QA_Passport_${BATCH_ID}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ── Top Industrial Status Header ───────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-cocoa/15 bg-white p-4 sm:p-5 shadow-[3px_3px_0_0_#2f1c1a]">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-orange text-white shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-orange">
                Dispatch Line 02
              </span>
              <span className="rounded bg-cocoa/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-cocoa">
                BATCH {BATCH_ID}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-cocoa sm:text-xl">
              Quality Assurance Inspection Terminal
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-cocoa/10 bg-cream px-3 py-1.5 text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-cocoa-2">
              Facility Status
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-success">
              <span className="size-2 animate-pulse rounded-full bg-success" />
              {allCompleted ? "6/6 Checkpoints Cleared" : `${Math.min(passed, 6)}/6 Inspected`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Visual Checkpoint Matrix (Cards instead of text walls) ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-4 text-orange" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-cocoa-2">
              Station Telemetry & Quality Audit Log
            </span>
          </div>
          <span className="text-xs font-semibold text-cocoa-2">
            Click any tile to review findings
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATION_VISUALS.map((st, idx) => {
            const Icon = st.icon;
            const mistakes = mistakesAt(log, st.id as StationId);
            const isCleared = idx < passed || allCompleted;

            return (
              <motion.div
                key={st.id}
                whileHover={{ y: -2 }}
                className={`group relative overflow-hidden rounded-2xl border-2 p-3.5 transition-all ${
                  isCleared
                    ? "border-cocoa/20 bg-cream/70 hover:border-cocoa hover:bg-cream"
                    : "border-cocoa/10 bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-xl border border-cocoa/10 bg-white text-cocoa shadow-xs">
                      <Icon className="size-4 text-orange" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold leading-tight text-cocoa">
                        {st.name}
                      </h4>
                      <span className="inline-block rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-bold text-orange">
                        {st.spec}
                      </span>
                    </div>
                  </div>

                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-cocoa-2">
                  {st.finding}
                </p>

                <div className="mt-2.5 flex items-center justify-between border-t border-cocoa/10 pt-2 text-[11px] font-medium text-cocoa">
                  <span className="font-semibold text-orange">{st.badge}</span>
                  <span className="font-mono text-[10px] text-cocoa-2">
                    {mistakes > 0 ? `${mistakes} correction` : "First-pass OK"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Interactive Rubber Stamping Machine ─────────────────── */}
      <div className="rounded-3xl border-2 border-cocoa/20 bg-white p-5 sm:p-6 shadow-[4px_4px_0_0_#2f1c1a]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-orange">
              <Sparkles className="size-4" /> Specialist Batch Release Decision
            </div>
            <h3 className="font-display text-xl font-bold text-cocoa">
              Apply Official QA Verification Stamp
            </h3>
          </div>
          <span className="text-xs font-medium text-cocoa-2">
            Select stamp to endorse official passport
          </span>
        </div>

        {/* 3 Physical Tactile Stamp Triggers */}
        <div className="grid gap-3 sm:grid-cols-3">
          {STAMP_OPTIONS.map((opt) => {
            const Icon = opt.stampIcon;
            const isSelected = activeStamp === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectStamp(opt.id, opt.label)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all ${
                  isSelected
                    ? `${opt.border} ${opt.bg} shadow-[3px_3px_0_0_#2f1c1a] ring-2 ring-orange/30`
                    : "border-cocoa/15 bg-cream/40 hover:border-cocoa hover:bg-cream"
                }`}
              >
                <div
                  className={`mb-2 grid size-10 place-items-center rounded-full border-2 ${
                    isSelected
                      ? `${opt.border} ${opt.text} bg-white shadow-xs`
                      : "border-cocoa/20 text-cocoa-2 bg-white"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div className={`font-display text-sm font-extrabold tracking-wide ${opt.text}`}>
                  {opt.label}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-cocoa-2">
                  {opt.subtext}
                </div>

                {isSelected && (
                  <span className="absolute -right-1 -top-1 size-3 rounded-full bg-orange ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Clickable Quick-Endorsement Checklist */}
        <div className="mt-6 border-t border-cocoa/10 pt-5">
          <div className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-cocoa-2">
            Inspection Endorsement Tags (Click to include in certificate)
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ENDORSEMENTS.map((item) => {
              const isChecked = selectedEndorsements.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleEndorsement(item)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    isChecked
                      ? "border-orange bg-orange/10 text-orange shadow-xs"
                      : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa hover:bg-cream"
                  }`}
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded border ${
                      isChecked
                        ? "border-orange bg-orange text-white"
                        : "border-cocoa/30 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="size-3 stroke-[3]" />}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Official Stamped Batch Certificate (Live Visual Deliverable) ── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-cocoa bg-[#FFFDF9] p-6 shadow-[5px_5px_0_0_#2f1c1a]">
        {/* Certificate Decorative Border */}
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-dashed border-cocoa/20" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 border-b border-cocoa/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-orange px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                Official EBC Audit
              </span>
              <span className="font-mono text-xs font-bold text-cocoa-2">
                SER #{certificateId}
              </span>
            </div>
            <h3 className="mt-1 font-display text-2xl font-black tracking-tight text-cocoa">
              Quality Assurance Batch Passport
            </h3>
            <p className="text-xs text-cocoa-2">
              Eat Better Co. Virtual Manufacturing & Quality Assurance Division
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cocoa/20 bg-white px-3 py-1.5 text-xs font-bold text-cocoa shadow-xs hover:border-cocoa hover:bg-cream"
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied" : "Copy ID"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCertificate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cocoa/20 bg-white px-3 py-1.5 text-xs font-bold text-cocoa shadow-xs hover:border-cocoa hover:bg-cream"
            >
              <Download className="size-3.5 text-orange" />
              <span>Download .txt</span>
            </button>
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-orange/90"
            >
              <Printer className="size-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>

        {/* Certificate Body with Dynamic Inked Stamp Overlay */}
        <div className="relative z-10 mt-5 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-cream/50 p-4 border border-cocoa/10 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cocoa-2">
                  Sampled Product
                </span>
                <div className="font-display font-bold text-cocoa">
                  Roasted Millet & Seed Crunch Mix
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cocoa-2">
                  Production Lot
                </span>
                <div className="font-mono font-bold text-cocoa">
                  LOT-2026-A1 ({BATCH_ID})
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cocoa-2">
                  Inspector Title
                </span>
                <div className="font-bold text-cocoa">
                  Quality Assurance Specialist
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cocoa-2">
                  Audit Date
                </span>
                <div className="font-mono font-bold text-cocoa">
                  {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-cocoa-2">
                Certified Quality Parameters
              </div>
              <div className="space-y-1.5">
                {selectedEndorsements.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-cocoa border border-cocoa/10 shadow-2xs"
                  >
                    <BadgeCheck className="size-4 shrink-0 text-success" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stamped Ink Seal Area */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cocoa/20 bg-cream/30 p-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={stampAnimationKey}
                initial={{ scale: 1.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: -4 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className={`relative rounded-2xl border-4 ${currentStamp.stampBorder} bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-xs`}
              >
                {/* Stamp Internal Border */}
                <div className={`rounded-xl border-2 border-dashed ${currentStamp.stampBorder} p-2.5`}>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em]">
                    ★ OFFICIAL SEAL OF QA ★
                  </div>
                  <div className="my-1 font-display text-base font-black tracking-tight leading-tight">
                    {currentStamp.label}
                  </div>
                  <div className="font-mono text-[9px] font-bold opacity-80">
                    AUTH #{BATCH_ID} • {new Date().toLocaleDateString("en-IN")}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-cocoa-2">
              <QrCode className="size-3.5" />
              <span>DIGITAL SIGNATURE VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
