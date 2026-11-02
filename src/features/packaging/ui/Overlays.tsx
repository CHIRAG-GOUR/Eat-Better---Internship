"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Download, Layers3, MousePointer2, PackageOpen, Ruler } from "lucide-react";
import Image from "next/image";
import { useStudio } from "../store";
import type { CheckResult } from "../checks";

const STEPS = [
  { icon: PackageOpen, title: "Pick a real product", text: "Choose an Eat Better Co snack and the pack it should come in." },
  { icon: MousePointer2, title: "Design on the pack", text: "Colours, words and artwork paint straight onto the 3D model. Drag items right on its surface." },
  { icon: Ruler, title: "Test like a designer", text: "Step back for a shelf test, save versions and compare them side by side." },
];

export function IntroOverlay() {
  const seen = useStudio((s) => s.introSeen);
  const setSeen = useStudio((s) => s.setIntroSeen);
  return (
    <AnimatePresence>
      {!seen && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-cocoa/55 p-4 backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 28, delay: 0.1 }}
            className="relative w-full max-w-[640px] overflow-hidden rounded-[28px] bg-cream shadow-[0_40px_120px_-30px_rgba(20,8,4,0.8)]"
          >
            <div className="grain absolute inset-0 opacity-70" aria-hidden />
            <div className="relative px-7 pb-7 pt-7 sm:px-10 sm:pt-9">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3">
                <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co" width={83} height={40} priority />
                <span className="h-6 w-px bg-line-strong" />
                <span className="text-[0.9rem] font-bold uppercase tracking-[0.16em] text-cocoa-2">SkilliZee internship</span>
              </motion.div>
              <motion.h1
                id="intro-title"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 24 }}
                className="mt-6 font-display text-[clamp(2.2rem,6vw,3.4rem)] font-semibold leading-[1.02] text-cocoa"
              >
                Packaging Design Studio
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-3 text-[1.1rem] leading-relaxed text-cocoa-2">
                Design a concept pack for a real Eat Better Co product and see every decision on a 3D model under studio lights.
              </motion.p>
              <ol className="mt-7 space-y-4">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={s.title}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.1, type: "spring", stiffness: 260, damping: 26 }}
                    className="flex gap-4"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-peach text-orange">
                      <s.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-display text-[1.15rem] font-semibold text-cocoa">{s.title}</span>
                      <span className="block text-[1rem] leading-snug text-cocoa-2">{s.text}</span>
                    </span>
                  </motion.li>
                ))}
              </ol>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-[300px] text-[0.88rem] leading-snug text-cocoa-2/80">
                  What you make here is a design exercise, not official Eat Better Co packaging.
                </p>
                <motion.button
                  autoFocus
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={setSeen}
                  className="group flex items-center gap-2 rounded-2xl bg-orange px-6 py-3.5 text-[1.05rem] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(255,92,0,0.8)]"
                >
                  Enter the studio <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const BURST = Array.from({ length: 22 }, (_, i) => i);
const BURST_COLORS = ["#FF5C00", "#FED300", "#00A341", "#603A38", "#E7BA68"];

export function CelebrateOverlay({ checks, thumb, onExport }: { checks: CheckResult[]; thumb: string | null; onExport: () => void }) {
  const open = useStudio((s) => s.celebrateOpen);
  const close = useStudio((s) => s.closeCelebrate);
  const saveSnapshot = useStudio((s) => s.saveSnapshot);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-cocoa/50 p-4 backdrop-blur-[4px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="done-title"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
            {BURST.map((i) => {
              const a = (i / BURST.length) * Math.PI * 2;
              const r = 220 + (i % 5) * 40;
              return (
                <motion.span
                  key={i}
                  className="absolute block rounded-sm"
                  style={{ width: 10 + (i % 3) * 4, height: 6 + (i % 2) * 6, background: BURST_COLORS[i % BURST_COLORS.length] }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
                  animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r + 60, opacity: 0, rotate: 260 + i * 30, scale: 1 }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                />
              );
            })}
          </div>
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative grid w-full max-w-[760px] overflow-hidden rounded-[28px] bg-cream shadow-[0_40px_120px_-30px_rgba(20,8,4,0.8)] sm:grid-cols-[230px_1fr]"
          >
            <div className="grid place-items-center bg-peach p-6">
              {thumb && (
                <motion.img
                  src={thumb}
                  alt="Your front panel"
                  initial={{ rotate: -8, y: 20, opacity: 0 }}
                  animate={{ rotate: -3, y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 18 }}
                  className="max-h-[300px] w-auto rounded-lg shadow-[0_20px_40px_-14px_rgba(47,28,26,0.6)]"
                />
              )}
            </div>
            <div className="p-7 sm:p-8">
              <div className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-success">Brief met</div>
              <h2 id="done-title" className="mt-1 font-display text-[2rem] font-semibold leading-tight text-cocoa">
                Your concept is shelf-ready
              </h2>
              <p className="mt-2 text-[1.02rem] leading-relaxed text-cocoa-2">What you just put into practice:</p>
              <ul className="mt-3 space-y-2.5">
                {checks.map((c, i) => (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="text-[0.98rem] leading-snug text-cocoa"
                  >
                    <strong className="font-semibold">{c.title}.</strong> <span className="text-cocoa-2">{c.why}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={onExport} className="flex items-center gap-2 rounded-xl bg-orange px-4 py-3 text-[1rem] font-semibold text-white">
                  <Download className="size-5" /> Download concept card
                </button>
                <button
                  onClick={() => {
                    if (thumb) saveSnapshot(thumb);
                    close();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-cocoa px-4 py-3 text-[1rem] font-semibold text-cocoa hover:bg-peach"
                >
                  <Layers3 className="size-5" /> Save as a version & keep exploring
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
