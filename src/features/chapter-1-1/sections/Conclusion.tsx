"use client";

import { Panel } from "@/components/chapter/Panel";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, Circle } from "lucide-react";
import { D2C, GLANCE, TAKEAWAY } from "../content";
import { useActivities, type ActivityId } from "../activityStore";

const RECAP = [
  `${GLANCE.name} (${GLANCE.legalName}) was founded in ${GLANCE.founded} in ${GLANCE.headquarters}.`,
  "It makes familiar Indian sweets and snacks with cleaner, simpler ingredients — keeping the taste, changing the ingredients and the way they're made.",
  "It is internet-first and D2C: it sells directly to customers through its own website.",
  "Its four categories: sweets & laddoos, namkeens, nuts & mixes, and combos & gifting.",
];

const ACTIVITIES: { id: ActivityId; label: string }[] = [
  { id: "keepChange", label: "Keep or change?" },
  { id: "routes", label: "Decision lab — three D2C advantages" },
  { id: "shelf", label: "Stock the shelves" },
  { id: "reflect", label: "Think & Discuss" },
];

export function Conclusion() {
  const done = useActivities((s) => s.done);
  const count = ACTIVITIES.filter((a) => done[a.id]).length;

  return (
    <section id="wrap-up" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="peach" reveal="up" width="max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.1 · Wrap-up</div>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.04] text-cocoa">You&apos;ve met Eat Better Co</h2>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[28px] bg-cream p-6 sm:p-8">
            <h3 className="font-display text-[1.4rem] font-semibold text-cocoa">What you now know</h3>
            <ul className="mt-5 space-y-4">
              {RECAP.map((r, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-3 text-[1.08rem] leading-relaxed text-cocoa">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-orange text-[0.85rem] font-bold text-white">{i + 1}</span>
                  {r}
                </motion.li>
              ))}
            </ul>
            <div className="mt-7 border-t border-line pt-6">
              <div className="text-[0.95rem] font-bold text-cocoa">Why D2C helps — the three advantages</div>
              <ul className="mt-3 space-y-2">
                {D2C.advantages.map((a) => (
                  <li key={a.id} className="flex gap-2.5 text-[1.02rem] leading-snug text-cocoa-2">
                    <Check className="mt-0.5 size-5 shrink-0 text-success" /> {a.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[28px] bg-[#3a0b0d] p-6 text-cream sm:p-8">
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Remember</div>
              <p className="mt-3 font-display text-[1.45rem] font-semibold leading-snug">&ldquo;{TAKEAWAY}&rdquo;</p>
            </div>
            <div className="rounded-[28px] bg-cream p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[1.25rem] font-semibold text-cocoa">Activities on this page</h3>
                <span className="text-[1rem] font-bold text-cocoa-2">
                  {count}/{ACTIVITIES.length}
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {ACTIVITIES.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 text-[1.02rem] text-cocoa">
                    {done[a.id] ? <Check className="size-5 text-success" strokeWidth={3} /> : <Circle className="size-5 text-cocoa-2/40" />}
                    <a href={`#${a.id === "keepChange" ? "what-is" : a.id === "routes" ? "d2c" : a.id === "shelf" ? "products" : "think"}`} className="underline-offset-2 hover:underline">
                      {a.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.9rem] leading-snug text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co" width={110} height={53} />
          <p className="text-[0.95rem] text-cocoa-2">SkilliZee × Eat Better Co · 360° Internship</p>
        </div>
      </Panel>
    </section>
  );
}
