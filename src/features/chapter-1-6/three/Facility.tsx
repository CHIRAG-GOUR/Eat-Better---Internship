"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardCheck, Footprints, Lock, MapPin, ShieldCheck } from "lucide-react";
import { InspectPanel, LiteToggle, ObjectiveTracker, RoleBadge, liteCanvasProps, useLiteMode, type Objective } from "@/components/sim";
import { useKeyboardWalk, useWalker } from "@/components/sim/walk";
import FacilityScene from "./facility/Scene";
import { BATCH_ID, ORDER, REVIEW_X, STATION_INFO, STATION_X, type StationId } from "./facility/data";
import { mistakesAt, useFacility } from "./facility/store";
import { SIM_NOTE, StationPanel, inspectContent } from "./facility/Panels";

/**
 * Chapter 1.6 — The Virtual Quality & Packaging Facility (3D process simulation).
 * Role: Quality Assurance Specialist. Walk the facility floor, work through six checkpoints in order;
 * the simulated batch can't move on until the right quality decision is made. Wrong decisions show a
 * consequence and are recorded for the QA report.
 */
export default function Facility({ three = true, onComplete }: { three?: boolean; onComplete: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const lite = useLiteMode();
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const walker = useWalker({ start: [STATION_X.sourcing - 3.2, 0, 3.2], speed: 3.6 });
  useKeyboardWalk(walker, started && three);
  const view = useFacility((s) => s.view);
  const passed = useFacility((s) => s.passed);
  const toast = useFacility((s) => s.toast);
  const inspect = useFacility((s) => s.inspect);
  const log = useFacility((s) => s.log);
  const { go, say, setInspect } = useFacility.getState();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (passed >= ORDER.length) onComplete();
  }, [passed, onComplete]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => say(null), 3200);
    return () => clearTimeout(t);
  }, [toast, say]);

  const walkTo = useCallback(
    (id: StationId | "review") => {
      const idx = id === "review" ? ORDER.length : ORDER.indexOf(id);
      if (idx > passed) {
        go(id); // shows the locked message
        return;
      }
      if (!three) {
        go(id);
        return;
      }
      const x = id === "review" ? REVIEW_X : STATION_X[id];
      walker.goTo([x, 0, 2.4], () => go(id));
    },
    [passed, three, walker, go],
  );

  /** arriving anywhere on the floor: if it's a station zone, open it */
  const onArrive = () => {
    const p = walker.ref.current?.position;
    if (!p) return;
    const hit = ORDER.find((id) => Math.abs(STATION_X[id] - p.x) < 2.3);
    if (hit) {
      if (ORDER.indexOf(hit) <= useFacility.getState().passed) go(hit);
    } else if (Math.abs(REVIEW_X - p.x) < 2.3) go("review");
    else if (useFacility.getState().view !== "overview") go("overview");
  };

  const objectives: Objective[] = ORDER.map((id, i) => ({
    id,
    label: `0${i + 1} ${STATION_INFO[id].name}`,
    done: i < passed,
    detail: STATION_INFO[id].objectives.join(" · "),
  }));
  objectives.push({ id: "review", label: "Quality review room + QA report", done: false, detail: "Walk into the review room and complete your report below." });
  const ic = inspectContent(inspect);
  const station = view !== "overview" && view !== "review" ? view : null;

  return (
    <div ref={host} className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="relative h-[440px] overflow-hidden rounded-[24px] border border-cocoa bg-[#E9ECEA] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[520px] lg:sticky lg:top-4 lg:h-[620px]">
        {!three && <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url(/chapter-1-6/frames/facility-aerial.webp)" }} aria-hidden />}
        {visible && three && (
          <Canvas {...liteCanvasProps(lite)} camera={{ position: [STATION_X.sourcing - 2.8, 4.2, 9.4], fov: 45 }}>
            <FacilityScene lite={lite} walker={walker} walkTo={walkTo} onArrive={onArrive} />
          </Canvas>
        )}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          <RoleBadge role="Quality Assurance Specialist" icon={<ShieldCheck className="size-4 text-haldi" />} />
          {three && <LiteToggle className="pointer-events-auto" />}
        </div>
        <div className="absolute inset-x-2 bottom-2 z-20 flex gap-1 overflow-x-auto rounded-xl bg-cream/90 p-1.5 no-scrollbar" role="group" aria-label="Walk to a checkpoint">
          {ORDER.map((id, i) => {
            const locked = i > passed;
            const done = i < passed;
            return (
              <button
                key={id}
                onClick={() => walkTo(id)}
                aria-current={view === id}
                className={`flex shrink-0 items-center gap-1 rounded-lg border-2 px-2 py-1 text-[0.8rem] font-bold ${view === id ? "border-orange bg-orange/10 text-cocoa" : done ? "border-success/40 bg-white text-success" : locked ? "border-cocoa/10 bg-white/60 text-cocoa/40" : "border-cocoa/15 bg-white text-cocoa"}`}
              >
                {locked && <Lock className="size-3" />}0{i + 1}
                <span className="hidden sm:inline">{STATION_INFO[id].name}</span>
              </button>
            );
          })}
          <button
            onClick={() => walkTo("review")}
            className={`flex shrink-0 items-center gap-1 rounded-lg border-2 px-2 py-1 text-[0.8rem] font-bold ${view === "review" ? "border-orange bg-orange/10" : passed >= ORDER.length ? "border-cocoa/15 bg-white" : "border-cocoa/10 bg-white/60 text-cocoa/40"} text-cocoa`}
          >
            {passed < ORDER.length && <Lock className="size-3" />}
            <ClipboardCheck className="size-3.5" /> Review
          </button>
        </div>
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-1/2 top-14 z-30 w-[min(90%,360px)] -translate-x-1/2 rounded-xl border-2 border-cocoa bg-haldi px-3 py-2 text-center text-[0.9rem] font-bold text-cocoa shadow-[2px_2px_0_0_#2f1c1a]">
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
        <InspectPanel
          open={!!ic && started}
          kicker={ic?.kicker}
          title={ic?.title ?? ""}
          note={SIM_NOTE}
          onClose={() => setInspect(null)}
        >
          {ic && (
            <p className={ic.flag ? "font-bold text-error" : "text-cocoa"}>
              {ic.body}
            </p>
          )}
        </InspectPanel>

        {/* entry screen */}
        <AnimatePresence>
          {!started && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 grid place-items-center bg-cocoa/40 p-4">
              <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="max-w-sm rounded-[22px] border border-cocoa bg-cream p-5 text-center shadow-[4px_4px_0_0_#2f1c1a] sm:p-6">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-orange text-white">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="mt-3 font-display text-[1.5rem] font-semibold leading-tight text-cocoa">The Virtual Quality &amp; Packaging Facility</h3>
                <p className="mt-1.5 text-[0.98rem] leading-snug text-cocoa">
                  You are the Quality Assurance Specialist for simulated batch <strong>{BATCH_ID}</strong>. It can&apos;t move to the next checkpoint until you make the right call.
                </p>
                <ul className="mt-3 space-y-1 text-left text-[0.9rem] text-cocoa-2">
                  <li className="flex gap-2">
                    <Footprints className="mt-0.5 size-4 shrink-0 text-orange" /> Tap the floor to walk (WASD on a keyboard).
                  </li>
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-orange" /> Tap a station, or use the strip at the bottom, to walk to it.
                  </li>
                </ul>
                <button onClick={() => setStarted(true)} className="eb-btn eb-btn-primary mt-4 w-full justify-center">
                  {passed > 0 ? "Return to the facility" : "Enter the facility"}
                </button>
                <p className="mt-2 text-[0.78rem] text-cocoa-2">Every batch, fault and reading here is simulated for training.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* side panel */}
      <div className="flex flex-col gap-3">
        <ObjectiveTracker objectives={objectives} title={`Batch ${BATCH_ID} · checkpoints`} />
        <div className="rounded-[22px] bg-cream p-4 sm:p-5">
          {station ? (
            <StationPanel key={station} station={station} />
          ) : view === "review" ? (
            <div>
              <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">Quality review room</div>
              <h3 className="mt-1 font-display text-[1.4rem] font-semibold text-cocoa">Batch report</h3>
              <ul className="mt-3 space-y-1.5">
                {ORDER.map((id, i) => {
                  const m = mistakesAt(log, id);
                  return (
                    <li key={id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[0.92rem] text-cocoa">
                      <span>
                        0{i + 1} {STATION_INFO[id].name}
                      </span>
                      <span className={`text-[0.8rem] font-extrabold uppercase ${m ? "text-[#B87400]" : "text-success"}`}>{m ? `Corrected (${m})` : "Passed"}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[0.95rem] text-cocoa">The board on the wall shows the same review. Your Quality Assurance Report is right below this activity — add your final batch decision there.</p>
            </div>
          ) : (
            <div>
              <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">On the facility floor</div>
              <p className="mt-1 text-[1rem] leading-snug text-cocoa">
                {passed >= ORDER.length
                  ? "All six checkpoints are done. Walk into the review room at the far end."
                  : `The batch is waiting at checkpoint 0${passed + 1}, ${STATION_INFO[ORDER[passed]].name}. Walk to it to start.`}
              </p>
              {passed < ORDER.length && (
                <button onClick={() => walkTo(ORDER[passed])} className="eb-btn eb-btn-primary mt-3 !normal-case">
                  <Footprints className="size-4" /> Walk to checkpoint 0{passed + 1}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
