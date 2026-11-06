"use client";

import { motion } from "motion/react";
import { Building2, Coins, Factory, Gift, Handshake, HeartHandshake, Megaphone, Receipt, Users, type LucideIcon } from "lucide-react";

/**
 * The Business Model Canvas (9 blocks, standard layout) as a picture. Highlight the blocks a chapter covers and,
 * optionally, list that chapter's items inside them. On phones it becomes a stacked list in canvas order.
 */

export type BlockId = "partners" | "activities" | "resources" | "value" | "relationships" | "channels" | "segments" | "costs" | "revenue";

const BLOCKS: { id: BlockId; label: string; icon: LucideIcon; area: string }[] = [
  { id: "partners", label: "Key Partners", icon: Handshake, area: "1 / 1 / 3 / 3" },
  { id: "activities", label: "Key Activities", icon: Factory, area: "1 / 3 / 2 / 5" },
  { id: "resources", label: "Key Resources", icon: Building2, area: "2 / 3 / 3 / 5" },
  { id: "value", label: "Value Propositions", icon: Gift, area: "1 / 5 / 3 / 7" },
  { id: "relationships", label: "Customer Relationships", icon: HeartHandshake, area: "1 / 7 / 2 / 9" },
  { id: "channels", label: "Channels", icon: Megaphone, area: "2 / 7 / 3 / 9" },
  { id: "segments", label: "Customer Segments", icon: Users, area: "1 / 9 / 3 / 11" },
  { id: "costs", label: "Cost Structure", icon: Receipt, area: "3 / 1 / 4 / 6" },
  { id: "revenue", label: "Revenue Streams", icon: Coins, area: "3 / 6 / 4 / 11" },
];

export function BizCanvas({ highlight = [], items = {}, labels = {}, caption }: { highlight?: BlockId[]; items?: Partial<Record<BlockId, string[]>>; labels?: Partial<Record<BlockId, string>>; caption?: string }) {
  const on = (id: BlockId) => highlight.includes(id);
  return (
    <figure className="min-w-0">
      {/* full canvas */}
      <div className="hidden gap-1.5 rounded-[22px] border border-cocoa bg-cocoa p-1.5 shadow-[3px_3px_0_0_#2f1c1a] sm:grid" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gridTemplateRows: "minmax(8.5rem, auto) minmax(8.5rem, auto) minmax(4.5rem, auto)" }}>
        {BLOCKS.map((b, i) => {
          const Icon = b.icon;
          const lit = on(b.id);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{ gridArea: b.area }}
              className={`flex min-w-0 flex-col rounded-[16px] p-3 ${lit ? "bg-orange text-white" : "bg-cream text-cocoa-2/70"}`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`size-4 shrink-0 ${lit ? "text-white" : "text-cocoa-2/50"}`} />
                <span className={`text-[0.82rem] font-extrabold uppercase leading-tight tracking-[0.06em] ${lit ? "text-white" : ""}`}>{labels[b.id] ?? b.label}</span>
              </div>
              {lit && items[b.id]?.length ? (
                <ul className="mt-2 space-y-1 text-[0.86rem] leading-snug text-white/95">
                  {items[b.id]!.map((t) => (
                    <li key={t} className="flex gap-1.5">
                      <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-haldi" />
                      <span className="min-w-0">{t}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          );
        })}
      </div>
      {/* phones: stacked in canvas order */}
      <ol className="grid gap-2 sm:hidden">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          const lit = on(b.id);
          return (
            <li key={b.id} className={`rounded-2xl border px-3.5 py-2.5 ${lit ? "border-cocoa bg-orange text-white shadow-[2px_2px_0_0_#2f1c1a]" : "border-cocoa/15 bg-cream text-cocoa-2/70"}`}>
              <div className="flex items-center gap-2">
                <Icon className="size-4 shrink-0" />
                <span className="text-[0.88rem] font-extrabold uppercase tracking-[0.06em]">{labels[b.id] ?? b.label}</span>
              </div>
              {lit && items[b.id]?.length ? <p className="mt-1 text-[0.92rem] leading-snug text-white/95">{items[b.id]!.join(" · ")}</p> : null}
            </li>
          );
        })}
      </ol>
      {caption && <figcaption className="mt-2 text-[0.9rem] text-cocoa-2">{caption}</figcaption>}
    </figure>
  );
}
