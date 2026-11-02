"use client";

import dynamic from "next/dynamic";
import { detectWebGL, useClientValue } from "@/lib/useClient";

const RouteDiorama = dynamic(() => import("../three/RouteDiorama"), {
  ssr: false,
  loading: () => <div className="h-[380px] animate-pulse rounded-[24px] bg-[#FBE6D3] sm:h-[460px]" />,
});

import Image from "next/image";
import { GlossaryText } from "@/components/chapter/Glossary";
import { Panel } from "@/components/chapter/Panel";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { D2C } from "../content";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { useActivities } from "../activityStore";

type RouteId = "traditional" | "d2c";
type ScenarioState = { tried: { traditional: boolean; d2c: boolean }; pick: RouteId | null; showing: RouteId | null };

export function D2CJourney() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
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
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <SectionIntro index="3" kicker="Understanding the internet-first (D2C) model" title="Two routes from a kitchen to a customer">
          <p><GlossaryText>{D2C.definition}</GlossaryText></p>
          <p className="mt-3 rounded-2xl border-l-4 border-orange bg-white px-5 py-4 text-cocoa"><GlossaryText>{D2C.howEatBetterSells}</GlossaryText></p>
        </SectionIntro>
          <motion.figure
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
          >
            <Image src="/chapter-1-1/art/doorstep.webp" alt="Illustration of a parcel being delivered to a home's front door" fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-lg bg-cream/95 px-3 py-1.5 text-[0.9rem] font-bold text-cocoa">From one kitchen to your door</figcaption>
          </motion.figure>
        </div>

        {/* simulator — a live 3D diorama that plays on its own */}
        <div className="mt-10 rounded-[32px] bg-peach p-4 sm:p-7">
          <ActivityLabel>Simulator · Watch both routes</ActivityLabel>
          <p className="mt-2 max-w-3xl text-[1.08rem] leading-relaxed text-cocoa">
            The same order leaves one kitchen on two roads. Follow the parcel — then watch where the yellow feedback bubble ends up. Tap any building to see what happens there.
          </p>
          <div className="mt-5">
            {webgl === false ? (
              <div className="grid gap-3 md:grid-cols-2">
                {(["traditional", "d2c"] as const).map((r) => (
                  <div key={r} className="rounded-2xl bg-white p-4">
                    <div className="font-display text-[1.15rem] font-semibold text-cocoa">{D2C.routes[r].label}</div>
                    <ol className="mt-2 space-y-1.5">
                      {D2C.routes[r].stops.map((stop, i) => (
                        <li key={stop.id} className="text-[1rem] text-cocoa">
                          <strong>{i + 1}. {stop.label}:</strong> {stop.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            ) : (
              <RouteDiorama highlight={st.showing} />
            )}
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
