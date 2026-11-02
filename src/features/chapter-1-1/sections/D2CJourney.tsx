"use client";

import { GlossaryText } from "@/components/chapter/Glossary";
import { Panel } from "@/components/chapter/Panel";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Check, ChefHat, MessageCircle, MonitorSmartphone, Package, Play, RotateCcw, Store, Truck, UserRound, Warehouse } from "lucide-react";
import { D2C } from "../content";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { useActivities } from "../activityStore";

type RouteId = "traditional" | "d2c";
const ICONS: Record<string, typeof ChefHat> = {
  kitchen: ChefHat,
  distributor: Warehouse,
  shop: Store,
  customer: UserRound,
  website: MonitorSmartphone,
  delivery: Truck,
};

type Phase = "idle" | "out" | "back" | "done";

function Lane({
  route,
  step,
  phase,
  highlight,
  focusStop,
  onFocusStop,
}: {
  route: RouteId;
  step: number;
  phase: Phase;
  highlight: boolean;
  focusStop: string | null;
  onFocusStop: (k: string) => void;
}) {
  const r = D2C.routes[route];
  const n = r.stops.length;
  const pct = (i: number) => (i / (n - 1)) * 100;
  // feedback on the traditional route stalls at the shop (index 2); on D2C it reaches the kitchen
  const backStop = route === "traditional" ? 2 : 0;
  const tokenAt = phase === "back" || phase === "done" ? (phase === "done" ? backStop : n - 1) : step;
  const isD2C = route === "d2c";

  return (
    <div className={`rounded-[24px] border p-5 transition-colors sm:p-6 ${highlight ? (isD2C ? "border-orange bg-white" : "border-cocoa/40 bg-white") : "border-line bg-white/70"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-[1.3rem] font-semibold text-cocoa">{r.label}</h4>
        <span className={`rounded-full px-3 py-1 text-[0.85rem] font-extrabold uppercase tracking-[0.08em] ${isD2C ? "bg-orange text-white" : "bg-surface-sunk text-cocoa-2"}`}>{r.tag}</span>
      </div>

      <div className="relative mt-8 px-[6%] pb-2">
        {/* track */}
        <div className="absolute left-[6%] right-[6%] top-7 h-1.5 rounded-full bg-[#E9D3BC]" />
        <motion.div
          className={`absolute left-[6%] top-7 h-1.5 rounded-full ${isD2C ? "bg-orange" : "bg-cocoa-2"}`}
          animate={{ width: `${(Math.min(step, n - 1) / (n - 1)) * 88}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
          {r.stops.map((s, i) => {
            const Icon = ICONS[s.id];
            const reached = step >= i;
            const key = `${route}:${s.id}`;
            const middle = !isD2C && (s.id === "distributor" || s.id === "shop");
            return (
              <button
                key={s.id}
                onClick={() => onFocusStop(key)}
                aria-expanded={focusStop === key}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <motion.span
                  animate={{ scale: reached && phase !== "idle" ? 1.05 : 1 }}
                  className={`relative z-10 grid size-14 place-items-center rounded-2xl border-2 transition-colors ${reached && phase !== "idle" ? (isD2C ? "border-orange bg-orange text-white" : "border-cocoa bg-cocoa text-cream") : "border-line-strong bg-cream text-cocoa"} group-hover:border-orange`}
                >
                  <Icon className="size-6" />
                </motion.span>
                <span className="text-[0.95rem] font-bold leading-tight text-cocoa">{s.label}</span>
                {middle && <span className="text-[0.8rem] font-bold uppercase tracking-[0.06em] text-cocoa-2/70">in between</span>}
              </button>
            );
          })}
        </div>
        {/* moving pack / feedback token */}
        {phase !== "idle" && (
          <motion.div
            className="pointer-events-none absolute top-0 z-20 -translate-x-1/2"
            initial={false}
            animate={{ left: `calc(6% + ${pct(tokenAt) * 0.88}%)` }}
            transition={{ duration: phase === "done" ? 1.4 : 0.6, ease: "easeInOut" }}
          >
            <span className={`-mt-1 grid size-8 place-items-center rounded-full shadow-lg ${phase === "back" || phase === "done" ? "bg-haldi text-cocoa" : "bg-white text-orange"}`}>
              {phase === "back" || phase === "done" ? <MessageCircle className="size-4" /> : <Package className="size-4" />}
            </span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {phase === "done" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`mt-4 overflow-hidden rounded-xl px-4 py-3 text-[1rem] leading-relaxed ${isD2C ? "bg-orange/10 text-cocoa" : "bg-surface-sunk text-cocoa"}`}
          >
            {isD2C
              ? "Delivered with no one in between. The customer's feedback goes straight back to the kitchen."
              : "Delivered after two hand-offs. The customer's feedback reaches the shop — whether it ever gets back to the kitchen is out of the brand's hands."}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {focusStop?.startsWith(route + ":") && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden text-[1rem] leading-relaxed text-cocoa-2">
            <strong className="text-cocoa">{r.stops.find((s) => `${route}:${s.id}` === focusStop)?.label}: </strong>
            {r.stops.find((s) => `${route}:${s.id}` === focusStop)?.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function useOrderRun() {
  const [step, setStep] = useState(-1);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const run = () => {
    clear();
    setPhase("out");
    setStep(0);
    [1, 2, 3].forEach((s, i) => timers.current.push(setTimeout(() => setStep(s), 750 * (i + 1))));
    timers.current.push(setTimeout(() => setPhase("back"), 750 * 4));
    timers.current.push(setTimeout(() => setPhase("done"), 750 * 4 + 400));
  };
  const reset = () => {
    clear();
    setStep(-1);
    setPhase("idle");
  };
  return { step, phase, run, reset };
}

type ScenarioState = { tried: { traditional: boolean; d2c: boolean }; pick: RouteId | null; showing: RouteId | null };

export function D2CJourney() {
  const { step, phase, run, reset } = useOrderRun();
  const [focusStop, setFocusStop] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [states, setStates] = useState<ScenarioState[]>(() =>
    D2C.scenarios.map(() => ({ tried: { traditional: false, d2c: false }, pick: null, showing: null })),
  );
  const complete = useActivities((s) => s.complete);
  const sc = D2C.scenarios[active];
  const st = states[active];
  const solved = states.map((s, i) => s.pick === D2C.scenarios[i].answer);
  const allSolved = solved.every(Boolean);

  useEffect(() => {
    if (allSolved) complete("routes");
  }, [allSolved, complete]);

  const patch = (p: Partial<ScenarioState>) => setStates((all) => all.map((s, i) => (i === active ? { ...s, ...p } : s)));
  const tryRoute = (r: RouteId) => patch({ showing: r, tried: { ...st.tried, [r]: true } });

  return (
    <section id="d2c" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Understanding the internet-first (D2C) model" title="Two routes from a kitchen to a customer">
          <p><GlossaryText>{D2C.definition}</GlossaryText></p>
          <p className="mt-3 rounded-2xl border-l-4 border-orange bg-white px-5 py-4 text-cocoa"><GlossaryText>{D2C.howEatBetterSells}</GlossaryText></p>
        </SectionIntro>

        {/* simulator */}
        <div className="mt-10 rounded-[32px] bg-peach p-4 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <ActivityLabel>Simulator · Send an order</ActivityLabel>
              <p className="mt-2 max-w-2xl text-[1.1rem] leading-relaxed text-cocoa">
                Send the same order down both routes at once. Watch who handles it — and where the customer&apos;s feedback ends up. Select any stop to learn what happens there.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={run} className="eb-btn eb-btn-primary">
                <Play className="size-5 fill-white" /> {phase === "idle" ? "Send an order" : "Send again"}
              </button>
              {phase !== "idle" && (
                <button onClick={reset} className="grid size-12 place-items-center rounded-xl text-cocoa hover:bg-white/60" aria-label="Reset simulator">
                  <RotateCcw className="size-5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Lane route="traditional" step={step} phase={phase} highlight={st.showing === "traditional"} focusStop={focusStop} onFocusStop={(k) => setFocusStop(focusStop === k ? null : k)} />
            <Lane route="d2c" step={step} phase={phase} highlight={st.showing === "d2c"} focusStop={focusStop} onFocusStop={(k) => setFocusStop(focusStop === k ? null : k)} />
          </div>
          <p className="mt-4 text-[0.95rem] text-cocoa-2">The shop &amp; distributor route is a general explanation of how many products reach customers. The D2C route is how Eat Better sells through its own website.</p>
        </div>

        {/* scenarios */}
        <div className="mt-14">
          <ActivityLabel done={allSolved}>Decision lab · Which route solves it?</ActivityLabel>
          <p className="mt-2 max-w-2xl text-[1.1rem] leading-relaxed text-cocoa">Each situation is a real advantage of selling D2C. Try it on both routes, then decide.</p>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Scenarios">
            {D2C.scenarios.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[1rem] font-bold transition-colors ${i === active ? "bg-cocoa text-cream" : "bg-white text-cocoa ring-1 ring-line-strong hover:ring-cocoa"}`}
              >
                {solved[i] ? <Check className="size-4 text-success" strokeWidth={3} /> : <span className="text-cocoa-2/60">{i + 1}</span>}
                {D2C.advantages.find((a) => a.id === s.advantage)?.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={sc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mt-5 grid gap-5 rounded-[28px] border border-line bg-white p-5 sm:p-7 lg:grid-cols-[1fr_1fr]"
            >
              <div>
                <p className="font-display text-[1.45rem] font-medium leading-snug text-cocoa"><GlossaryText>{sc.prompt}</GlossaryText></p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => tryRoute("traditional")} className={`rounded-xl px-4 py-2.5 text-[1rem] font-bold ring-1 ${st.showing === "traditional" ? "bg-cocoa text-cream ring-cocoa" : "bg-white text-cocoa ring-line-strong hover:ring-cocoa"}`}>
                    Try the shop route {st.tried.traditional && "✓"}
                  </button>
                  <button onClick={() => tryRoute("d2c")} className={`rounded-xl px-4 py-2.5 text-[1rem] font-bold ring-1 ${st.showing === "d2c" ? "bg-orange text-white ring-orange" : "bg-white text-cocoa ring-line-strong hover:ring-orange"}`}>
                    Try the D2C route {st.tried.d2c && "✓"}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {st.showing && (
                    <motion.p
                      key={st.showing}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 rounded-2xl px-4 py-3 text-[1.05rem] leading-relaxed ${st.showing === "d2c" ? "bg-orange/10" : "bg-surface-sunk"}`}
                    >
                      <GlossaryText>{st.showing === "d2c" ? sc.d2cOutcome : sc.traditionalOutcome}</GlossaryText>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-2xl bg-cream p-5">
                <div className="text-[1.05rem] font-bold text-cocoa">Your decision</div>
                {st.tried.traditional && st.tried.d2c ? (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["traditional", "d2c"] as RouteId[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => patch({ pick: r })}
                          aria-pressed={st.pick === r}
                          className={`rounded-xl px-3 py-3 text-[1rem] font-bold ring-2 transition-colors ${st.pick === r ? (r === sc.answer ? "bg-success text-white ring-success" : "bg-error text-white ring-error") : "bg-white text-cocoa ring-line-strong hover:ring-cocoa"}`}
                        >
                          {r === "d2c" ? "D2C route" : "Shop route"}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence mode="wait">
                      {st.pick && (
                        <motion.div key={st.pick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-[1.02rem] leading-relaxed text-cocoa">
                          {st.pick === sc.answer ? (
                            <>
                              <strong className="text-success">Advantage unlocked:</strong> {D2C.advantages.find((a) => a.id === sc.advantage)?.text}
                            </>
                          ) : (
                            <>
                              <strong className="text-error">Look again.</strong> Compare the two outcomes on the left — on which route is nobody standing between the brand and the customer?
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <p className="mt-2 text-[1rem] leading-relaxed text-cocoa-2">Try the situation on both routes first — then you&apos;ll be able to decide.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* the three advantages assemble as they are unlocked */}
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {D2C.advantages.map((a, i) => {
              const unlocked = D2C.scenarios.some((s, j) => s.advantage === a.id && solved[j]);
              return (
                <motion.div
                  key={a.id}
                  animate={{ opacity: unlocked ? 1 : 0.55 }}
                  className={`rounded-[22px] p-5 ${unlocked ? "bg-orange text-white" : "border-2 border-dashed border-line-strong text-cocoa-2"}`}
                >
                  <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em]">Advantage {i + 1}</div>
                  <div className="mt-1 font-display text-[1.25rem] font-semibold leading-tight">{unlocked ? a.title : "Locked — solve the scenario"}</div>
                  {unlocked && <p className="mt-2 text-[1rem] leading-relaxed text-white/95"><GlossaryText>{a.text}</GlossaryText></p>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Panel>
    </section>
  );
}
