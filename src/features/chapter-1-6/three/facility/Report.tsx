"use client";

import { useMemo } from "react";
import { Lock } from "lucide-react";
import { SimReport, type ReportData } from "@/components/sim";
import { BATCH_ID, LABEL_ITEMS, MATERIALS, ORDER, STATION_INFO } from "./data";
import { mistakesAt, useFacility } from "./store";

const FINAL = ["Release the batch for dispatch", "Hold the batch for further checks", "Reject the batch"];

/** Quality Assurance Report — generated from the facility's real activity state. */
export function QAReport() {
  const passed = useFacility((s) => s.passed);
  const log = useFacility((s) => s.log);
  const pack = useFacility((s) => s.pack);
  const final = useFacility((s) => s.final);
  const patch = useFacility((s) => s.patch);
  const all = passed >= ORDER.length;
  const ready = all && !!final.decision && final.justification.trim().length >= 20;

  const data: ReportData = useMemo(() => {
    const reached = ORDER.slice(0, passed);
    const mat = MATERIALS.find((m) => m.id === pack.material);
    const missing = LABEL_ITEMS.find((i) => !i.present)!;
    const corrections = log.filter((l) => !l.correct);
    return {
      title: "Quality Assurance Report",
      chapter: "Chapter 1.6 · The Virtual Quality & Packaging Facility",
      role: "Quality Assurance Specialist",
      sections: [
        { heading: "Batch", body: `Simulated batch ${BATCH_ID}, inspected across Eat Better's six quality checkpoints.`, status: "info" },
        {
          heading: "Checkpoint decisions",
          items: ORDER.map((id, i) => {
            const m = mistakesAt(log, id);
            const done = i < passed;
            const last = [...log].reverse().find((l) => l.station === id && l.correct);
            return `0${i + 1} ${STATION_INFO[id].name}: ${!done ? "not completed" : m ? `passed after ${m} correction${m > 1 ? "s" : ""}` : "passed on the first decision"}${last ? ` — ${last.decision}` : ""}`;
          }),
          status: all ? "pass" : "fail",
        },
        { heading: "Quality issues identified", items: reached.map((id) => `${STATION_INFO[id].name}: ${STATION_INFO[id].issue}`), status: "info" },
        { heading: "Corrective actions", items: reached.map((id) => `${STATION_INFO[id].name}: ${STATION_INFO[id].action}`), status: "info" },
        {
          heading: "Packaging inspection result",
          items: [
            `Material: ${mat ? mat.name : "not chosen"}`,
            `Seal: ${pack.sealFound ? "defect found on the back top seal" : "not inspected"}`,
            `Label: ${pack.labelPick === missing.id ? `missing item identified — ${missing.label}` : "not checked"}`,
            `Leak test: ${pack.leak === "pass" ? "passed after re-packing" : pack.repacked ? "re-packed, re-test pending" : pack.leak === "fail" ? "failed (bubbles from the seal)" : "not run"}`,
          ],
          status: pack.leak === "pass" ? "pass" : "fail",
        },
        {
          heading: "Decisions that needed correction",
          items: corrections.length ? corrections.map((l) => `${STATION_INFO[l.station].name}: “${l.decision}” — ${l.note}`) : ["None — every first decision was correct."],
          status: corrections.length ? "fail" : "pass",
        },
        { heading: "Final batch decision", body: `${final.decision ?? "Not decided yet"}. Justification: ${final.justification.trim() || "—"}`, status: ready ? "info" : "fail" },
      ],
      footnote: "Simulated batch and faults for training only — not real Eat Better data. The label inspection is an educational exercise and not a substitute for actual FSSAI compliance advice.",
    };
  }, [passed, log, pack, final, all, ready]);

  return (
    <div>
      {!all && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-haldi/25 px-3 py-2 text-[0.95rem] text-cocoa">
          <Lock className="size-4" /> Finish all six checkpoints in the facility above to complete this report. It fills in as you go.
        </p>
      )}
      <div className="rounded-[22px] border border-cocoa/15 bg-white p-4 sm:p-5">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-orange">Your final batch decision</div>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Final batch decision">
          {FINAL.map((f) => (
            <button
              key={f}
              disabled={!all}
              aria-pressed={final.decision === f}
              onClick={() => patch("final", { decision: f })}
              className={`rounded-xl border-2 px-3 py-2 text-[0.95rem] font-bold disabled:opacity-40 ${final.decision === f ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <textarea
          value={final.justification}
          disabled={!all}
          onChange={(e) => patch("final", { justification: e.target.value })}
          rows={4}
          aria-label="Justify your final batch decision"
          placeholder="I decided this because… (mention what you found and what was corrected)"
          className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange disabled:opacity-50"
        />
        <p className="mt-1 text-[0.85rem] text-cocoa-2">{final.justification.trim().length < 20 ? "Write at least a sentence or two." : "Saved on this device."}</p>
      </div>
      <div className="mt-4">
        <SimReport data={data} storageKey="ebc-1.6-qa-report" ready={ready} />
      </div>
    </div>
  );
}
