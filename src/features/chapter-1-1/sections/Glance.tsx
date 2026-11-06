"use client";

import { Panel } from "@/components/chapter/Panel";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Building2, CalendarDays, Globe2, Info, MapPin, Quote, Store } from "lucide-react";
import { GLANCE, GLANCE_TERMS, ROLE_EXPLAINERS } from "../content";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { NewsBlog } from "./NewsBlog";

const FACTS = [
  { key: "name", label: "Name", value: GLANCE.name, icon: Store },
  { key: "legalName", label: "Legal name", value: GLANCE.legalName, icon: Building2 },
  { key: "founded", label: "Founded", value: GLANCE.founded, icon: CalendarDays },
  { key: "headquarters", label: "Headquarters", value: GLANCE.headquarters, icon: MapPin },
  { key: "type", label: "Type of brand", value: GLANCE.type, icon: Globe2 },
] as const;

export function Glance() {
  const [open, setOpen] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  return (
    <section id="glance" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Company at a glance" title="Meet the company">
          Open each line of the company file. The grey notes explain what each term means in business.
        </SectionIntro>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="space-y-5">
          {/* brand line card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative self-start overflow-hidden rounded-[28px] bg-orange p-8 text-white shadow-[0_30px_60px_-30px_rgba(255,92,0,0.9)] sm:p-10"
          >
            <div className="grain absolute inset-0 opacity-60" aria-hidden />
            <Quote className="relative size-10 text-white/60" />
            <p className="relative mt-4 font-display text-[clamp(2rem,4.5vw,3.1rem)] font-semibold leading-[1.05]">&ldquo;{GLANCE.brandLine}&rdquo;</p>
            <div className="relative mt-6 flex items-center justify-between gap-4">
              <span className="text-[0.95rem] font-bold uppercase tracking-[0.12em] text-white/85">Brand line</span>
              <button
                onClick={() => setOpen(open === "brandLine" ? null : "brandLine")}
                aria-expanded={open === "brandLine"}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[0.95rem] font-bold hover:bg-white/25"
              >
                <Info className="size-4" /> What is a brand line?
              </button>
            </div>
            <AnimatePresence>
              {open === "brandLine" && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative overflow-hidden pt-3 text-[1.02rem] leading-relaxed text-white/95">
                  {GLANCE_TERMS.brandLine}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

            <motion.figure
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative aspect-[16/9] overflow-hidden rounded-[24px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <Image src="/chapter-1-1/art/jaipur.webp" alt="Illustration of Jaipur's pink sandstone architecture" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
              <figcaption className="absolute bottom-3 left-3 rounded-lg bg-cream/95 px-3 py-1.5 text-[0.95rem] font-bold text-cocoa">Headquarters · Jaipur, Rajasthan</figcaption>
            </motion.figure>
          </div>

          {/* fact ledger */}
          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-white"
          >
            {FACTS.map((f) => {
              const Icon = f.icon;
              const isOpen = open === f.key;
              return (
                <motion.li key={f.key} variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : f.key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-peach/50 sm:px-6"
                  >
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-peach text-orange">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2/75">{f.label}</span>
                      <span className="block text-[1.15rem] font-bold leading-snug text-cocoa">{f.value}</span>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="block overflow-hidden"
                          >
                            <span className="mt-2 block rounded-xl bg-surface-sunk px-3 py-2 text-[1rem] leading-relaxed text-cocoa-2">{GLANCE_TERMS[f.key]}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <Info className={`mt-1 size-5 shrink-0 transition-colors ${isOpen ? "text-orange" : "text-cocoa-2/40"}`} aria-hidden />
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* founders */}
        <div className="mt-12">
          <NewsBlog />
          <h3 className="font-display text-[1.75rem] font-medium uppercase text-cocoa">The founding team</h3>
          <p className="mt-2 max-w-2xl text-[1.1rem] text-cocoa-2">Select a person to see what their role means.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {GLANCE.founders.map((f, i) => {
              const on = role === f.name;
              return (
                <motion.button
                  key={f.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 160, damping: 22 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setRole(on ? null : f.name)}
                  aria-expanded={on}
                  className={`relative overflow-hidden rounded-[24px] border p-6 text-left transition-colors ${on ? "border-cocoa bg-cocoa text-cream" : "border-line bg-white text-cocoa hover:border-line-strong"}`}
                >
                  <span className={`grid size-16 place-items-center rounded-full font-display text-[1.4rem] font-semibold ${on ? "bg-haldi text-cocoa" : "bg-peach text-logo"}`}>{f.initials}</span>
                  <span className="mt-5 block font-display text-[1.4rem] font-semibold leading-tight">{f.name}</span>
                  <span className={`mt-1 block text-[1.05rem] font-bold ${on ? "text-haldi" : "text-orange"}`}>{f.role}</span>
                  <AnimatePresence>
                    {on && (
                      <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden">
                        <span className="mt-3 block text-[1rem] leading-relaxed text-cream/90">{ROLE_EXPLAINERS[f.role]}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Panel>
    </section>
  );
}
