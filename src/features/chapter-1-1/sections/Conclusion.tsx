"use client";

import { GlossaryText } from "@/components/chapter/Glossary";
import { Panel } from "@/components/chapter/Panel";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, Circle, Globe2, MessageCircle, Tag } from "lucide-react";
import { D2C, GLANCE, TAKEAWAY } from "../content";
import { useActivities, type ActivityId } from "../activityStore";

/** Picture-card recap: one image + one short line per idea. */
const RECAP: { title: string; text: string; img?: string; alt?: string; mosaic?: string[]; credit?: string }[] = [
  {
    title: "Who & where",
    text: `${GLANCE.name} (${GLANCE.legalName}), founded ${GLANCE.founded} in ${GLANCE.headquarters}.`,
    img: "/chapter-1-1/art/jaipur.webp",
    alt: "Illustration of Jaipur's pink sandstone buildings",
  },
  {
    title: "What it believes",
    text: "Keep the taste. Change the ingredients and the way snacks are made.",
    img: "/chapter-1-1/art/balance.webp",
    alt: "Illustration of a brass scale balancing snacks and whole ingredients",
  },
  {
    title: "How it sells",
    text: "Internet-first and D2C — straight to customers through its own website.",
    img: "/chapter-1-1/art/doorstep.webp",
    alt: "Illustration of a parcel being delivered to a front door",
  },
  {
    title: "What it makes",
    text: "Sweets & laddoos · namkeens · nuts & mixes · combos & gifting.",
    mosaic: ["/brand/products/hazelnut-laddoo-0.webp", "/brand/products/millet-bhujia-0.webp", "/brand/products/nut-mix-0.webp", "/brand/products/snack-box-0.webp"],
    credit: "Official product photos",
  },
];

const ADV_ICONS = { feedback: MessageCircle, reach: Globe2, control: Tag } as const;

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
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.1 · Wrap-up</div>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.04] text-cocoa">You&apos;ve met Eat Better Co</h2>
        </motion.div>

        {/* what you now know — picture cards */}
        <h3 className="mt-8 font-display text-[1.4rem] font-semibold text-cocoa">What you now know</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECAP.map((r, i) => (
            <motion.figure
              key={r.title}
              initial={{ opacity: 0, y: 26, rotate: i % 2 ? 1.5 : -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 140, damping: 18 }}
              whileHover={{ y: -4 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-peach">
                {r.img ? (
                  <Image src={r.img} alt={r.alt ?? ""} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                ) : (
                  <div className="grid size-full grid-cols-2 grid-rows-2">
                    {r.mosaic?.map((m) => (
                      <div key={m} className="relative">
                        <Image src={m} alt="" fill sizes="12vw" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full border border-cocoa bg-orange font-display text-[1rem] font-semibold text-white">{i + 1}</span>
              </div>
              <figcaption className="flex flex-1 flex-col gap-1 p-4">
                <span className="font-display text-[1.15rem] font-semibold leading-tight text-cocoa">{r.title}</span>
                <span className="text-[1rem] leading-snug text-cocoa">
                  <GlossaryText>{r.text}</GlossaryText>
                </span>
                {r.credit && <span className="mt-auto pt-2 text-[0.8rem] text-cocoa-2/70">{r.credit}</span>}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-6">
            {/* three advantages as icon tiles */}
            <div className="rounded-[24px] bg-cream p-5 sm:p-6">
              <div className="font-display text-[1.2rem] font-semibold text-cocoa">Why D2C helps</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {D2C.advantages.map((a) => {
                  const Icon = ADV_ICONS[a.id as keyof typeof ADV_ICONS];
                  return (
                    <div key={a.id} className="rounded-2xl border border-cocoa/15 bg-white p-4">
                      <span className="grid size-10 place-items-center rounded-xl bg-orange text-white">
                        <Icon className="size-5" />
                      </span>
                      <div className="mt-2.5 text-[0.98rem] leading-snug text-cocoa">
                        <GlossaryText>{a.text}</GlossaryText>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[24px] bg-[#3a0b0d] p-6 text-cream sm:p-7">
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Remember</div>
              <p className="mt-3 font-display text-[1.4rem] font-semibold leading-snug">&ldquo;{TAKEAWAY}&rdquo;</p>
            </div>
          </div>

          <div className="rounded-[24px] bg-cream p-6 sm:p-7">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-[1.25rem] font-semibold text-cocoa">Activities on this page</h3>
              <span className="text-[1rem] font-bold text-cocoa-2">
                {count}/{ACTIVITIES.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {ACTIVITIES.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-[1.02rem] text-cocoa">
                  {done[a.id] ? <Check className="size-5 shrink-0 text-success" strokeWidth={3} /> : <Circle className="size-5 shrink-0 text-cocoa-2/40" />}
                  <span>{a.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.9rem] leading-snug text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
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
