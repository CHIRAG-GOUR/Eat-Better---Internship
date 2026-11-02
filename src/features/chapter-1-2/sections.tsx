"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Circle, ClipboardCopy, Flag, Footprints, Hand, MapPin, Users, X } from "lucide-react";
import { Panel } from "@/components/chapter/Panel";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { GlossaryText } from "@/components/chapter/Glossary";
import { VideoBlock } from "@/components/chapter/VideoBlock";
import { createActivityStore } from "@/lib/activities";
import { detectWebGL, useClientValue, useMediaQuery } from "@/lib/useClient";
import { CHANNELS, IDENTITY, MISSION, PRACTICES, PRODUCT_LINES, TAKEAWAY, THINK, VALUES, VIDEO, VISION } from "./content";

export const useActivities12 = createActivityStore(["sort", "filter", "reflect"] as const);

const VisionFilter = dynamic(() => import("./three/VisionFilter"), {
  ssr: false,
  loading: () => <div className="h-[340px] animate-pulse rounded-[24px] bg-[#FBE6D3] sm:h-[440px]" />,
});

/* ── 1 · Watch + brand identity ───────────────────────────────── */

export function Identity() {
  return (
    <section id="identity" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="up" width="max-w-7xl">
        <SectionIntro index="1" kicker="Brand identity & philosophy" title="What Eat Better stands for" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
          <VideoBlock kind="file" portrait h264={VIDEO.src} poster={VIDEO.poster} title={VIDEO.title} caption={VIDEO.caption} />
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="rounded-[24px] bg-orange p-7 text-white shadow-[0_30px_60px_-30px_rgba(255,92,0,0.9)]"
            >
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-white/85">Brand idea</div>
              <p className="mt-2 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.05]">&ldquo;{IDENTITY.brandIdea}&rdquo;</p>
            </motion.div>
            <motion.figure
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[24px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[16/8]">
                <Image src="/chapter-1-1/art/balance.webp" alt="A brass scale balancing snacks and whole ingredients" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              </div>
              <figcaption className="bg-cocoa p-5 text-cream">
                <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Core belief</div>
                <p className="mt-1.5 text-[1.08rem] leading-relaxed">
                  <GlossaryText>{IDENTITY.coreBelief}</GlossaryText>
                </p>
              </figcaption>
            </motion.figure>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-peach/70 p-4">
                <MapPin className="mt-0.5 size-6 shrink-0 text-orange" />
                <div>
                  <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">Headquarters</div>
                  <div className="text-[1.1rem] font-bold text-cocoa">{IDENTITY.headquarters}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-peach/70 p-4">
                <Users className="mt-0.5 size-6 shrink-0 text-orange" />
                <div>
                  <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">Founders</div>
                  <div className="text-[1.02rem] font-bold leading-snug text-cocoa">{IDENTITY.founders.join(", ")}</div>
                  <div className="text-[0.92rem] text-cocoa-2">{IDENTITY.foundersNote}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 2 · Vision vs mission: destination or daily step? ────────── */

type Bin = "vision" | "mission";
const SORT_ITEMS: { id: string; text: string; bin: Bin; label: string }[] = [
  { id: "pv", text: VISION.publicVision, bin: "vision", label: "Publicly stated vision" },
  { id: "lv", text: VISION.longTermVision, bin: "vision", label: "Long-term strategic vision" },
  { id: "m", text: MISSION.text, bin: "mission", label: "Mission" },
  ...PRACTICES.map((p) => ({ id: p.id, text: p.title, bin: "mission" as Bin, label: "Daily practice" })),
];
const SORT_ORDER = ["sweet", "pv", "qa", "m", "lv", "roast", "clean"];

export function Direction() {
  const [placed, setPlaced] = useState<Record<string, Bin>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [over, setOver] = useState<Bin | null>(null);
  const bins = useRef<Partial<Record<Bin, HTMLDivElement | null>>>({});
  const canDrag = useMediaQuery("(hover: hover) and (pointer: fine)");
  const complete = useActivities12((s) => s.complete);
  const items = useMemo(() => SORT_ORDER.map((id) => SORT_ITEMS.find((s) => s.id === id)!), []);
  const left = items.filter((i) => !placed[i.id]);
  useEffect(() => {
    if (left.length === 0) complete("sort");
  }, [left.length, complete]);

  const place = (id: string, bin: Bin) => {
    const it = SORT_ITEMS.find((s) => s.id === id)!;
    if (it.bin === bin) {
      setPlaced((p) => ({ ...p, [id]: bin }));
      setSel(null);
      setMiss(null);
    } else {
      setSel(id);
      setMiss(id);
    }
  };
  const binAt = (x: number, y: number): Bin | null => {
    for (const b of ["vision", "mission"] as Bin[]) {
      const r = bins.current[b]?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return b;
    }
    return null;
  };
  const selItem = SORT_ITEMS.find((s) => s.id === sel);

  const binCard = (bin: Bin) => {
    const isV = bin === "vision";
    const its = SORT_ITEMS.filter((s) => placed[s.id] === bin);
    return (
      <div
        ref={(el) => {
          bins.current[bin] = el;
        }}
        onClick={() => sel && place(sel, bin)}
        className={`relative flex min-h-[260px] flex-col overflow-hidden rounded-[22px] border-2 transition-[box-shadow,transform] ${over === bin ? "scale-[1.01] border-orange" : "border-cocoa/15"} ${sel ? "cursor-pointer" : ""}`}
      >
        <div className="relative h-28 sm:h-32">
          <Image src={isV ? "/chapter-1-1/art/across-india.webp" : "/chapter-1-1/art/family-kitchen.webp"} alt="" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/85 to-cocoa/10" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-cream">
            <div>
              <div className="flex items-center gap-2 font-display text-[1.45rem] font-semibold">
                {isV ? <Flag className="size-5 text-haldi" /> : <Footprints className="size-5 text-haldi" />}
                {isV ? "Vision" : "Mission"}
              </div>
              <div className="text-[0.95rem] text-cream/90">{isV ? VISION.meaning : MISSION.meaning}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 bg-white p-3">
          <AnimatePresence>
            {its.map((it) => (
              <motion.div key={it.id} layoutId={`sort-${it.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl px-3 py-2 ${isV ? "bg-orange/10" : "bg-peach"}`}>
                <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{it.label}</div>
                <div className="text-[0.98rem] font-semibold leading-snug text-cocoa">
                  <GlossaryText>{it.text}</GlossaryText>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {selItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                place(selItem.id, bin);
              }}
              className="eb-btn eb-btn-primary mt-auto self-start !py-2 !text-[0.9rem] !normal-case"
            >
              Put it here
            </button>
          )}
          {!its.length && !selItem && <span className="m-auto text-[0.95rem] text-cocoa-2/70">{canDrag ? "Drop cards here" : "Tap a card, then this box"}</span>}
        </div>
      </div>
    );
  };

  return (
    <section id="direction" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="Strategic direction" title="Where it's going — and how it gets there">
          A <strong>vision</strong> is the destination. A <strong>mission</strong> is what the brand does every day to get there. Sort each card into the right box.
        </SectionIntro>

        <div className="mt-6 rounded-[22px] bg-cream p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ActivityLabel done={left.length === 0}>Activity · Destination or daily step?</ActivityLabel>
            <span className="text-[0.98rem] font-bold text-cocoa-2">{left.length ? `${left.length} cards left` : "All sorted!"}</span>
          </div>
          <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
            <AnimatePresence>
              {left.map((it) => {
                const on = sel === it.id;
                return (
                  <motion.button
                    key={it.id}
                    layoutId={`sort-${it.id}`}
                    drag={canDrag}
                    dragSnapToOrigin
                    whileDrag={{ scale: 1.05, zIndex: 50, rotate: -2 }}
                    onDragStart={() => setSel(it.id)}
                    onDrag={(e) => setOver(binAt((e as PointerEvent).clientX, (e as PointerEvent).clientY))}
                    onDragEnd={(e) => {
                      const b = binAt((e as PointerEvent).clientX, (e as PointerEvent).clientY);
                      setOver(null);
                      if (b) place(it.id, b);
                    }}
                    onTap={() => {
                      setSel(on ? null : it.id);
                      setMiss(null);
                    }}
                    animate={miss === it.id ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    aria-pressed={on}
                    className={`w-[230px] shrink-0 snap-start rounded-2xl border bg-white p-3 text-left ${canDrag ? "cursor-grab touch-none" : ""} ${on ? "border-orange shadow-[0_0_0_3px_rgba(255,92,0,0.3)]" : "border-cocoa/20 hover:border-cocoa"}`}
                  >
                    <span className="block text-[0.98rem] font-semibold leading-snug text-cocoa">{it.text}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="mt-2 min-h-[1.5em] text-[0.98rem]">
            {miss && selItem ? (
              <span className="font-bold text-error">Not quite — is this where the brand wants to end up, or something it does every day?</span>
            ) : selItem ? (
              <span className="text-cocoa">Now tap the box it belongs in.</span>
            ) : left.length ? (
              <span className="flex items-center gap-1.5 text-cocoa-2">
                <Hand className="size-4" /> {canDrag ? "Drag a card into a box — or tap it, then tap a box." : "Tap a card, then tap a box."}
              </span>
            ) : (
              <span className="font-bold text-success">The vision is the destination; the mission and its daily practices are the steps on the way.</span>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {binCard("vision")}
          {binCard("mission")}
        </div>
      </Panel>
    </section>
  );
}

/* ── 3 · Core values ──────────────────────────────────────────── */

export function Values() {
  return (
    <section id="values" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="3" kicker="Core brand values" title="Three values behind every snack" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <motion.figure
              key={v.id}
              initial={{ opacity: 0, y: 30, rotate: i === 1 ? 0 : i === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 130, damping: 18 }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-[22px] border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[4/3]">
                <Image src={v.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full border border-cocoa bg-haldi px-3 py-1 text-[0.85rem] font-extrabold text-cocoa">Value {i + 1}</span>
              </div>
              <figcaption className="p-5">
                <div className="font-display text-[1.45rem] font-semibold text-cocoa">{v.name}</div>
                <p className="mt-1.5 text-[1.05rem] leading-relaxed text-cocoa">
                  <GlossaryText>{v.meaning}</GlossaryText>
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ── 4 · Operationalising the vision + Vision Filter ──────────── */

export function Practices() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  const complete = useActivities12((s) => s.complete);
  return (
    <section id="practices" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <SectionIntro index="4" kicker="Operationalising the vision" title="Turning the vision into decisions" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRACTICES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-cocoa/15 bg-cream p-4"
            >
              <span className="grid size-8 place-items-center rounded-full bg-orange font-display text-[1rem] font-semibold text-white">{i + 1}</span>
              <div className="mt-2 font-display text-[1.15rem] font-semibold leading-tight text-cocoa">{p.title}</div>
              <p className="mt-1 text-[0.98rem] leading-snug text-cocoa">
                <GlossaryText>{p.text}</GlossaryText>
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <ActivityLabel>Activity · The vision filter</ActivityLabel>
          <p className="mt-1.5 max-w-3xl text-[1.05rem] text-cocoa">Decide whether each choice gets through the filter — then watch it drop.</p>
          <div className="mt-4">
            {webgl === false ? (
              <p className="rounded-2xl bg-white p-4 text-[1rem] text-cocoa">This activity needs 3D graphics, which this device doesn&apos;t support. Ask yourself for each practice above: does it keep snacks tasty <em>and</em> better for you?</p>
            ) : (
              <VisionFilter onComplete={() => complete("filter")} />
            )}
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ── 5 · Products & distribution ──────────────────────────────── */

export function Offerings() {
  const [ch, setCh] = useState(0);
  const c = CHANNELS[ch];
  return (
    <section id="offerings" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="left" width="max-w-7xl">
        <SectionIntro index="5" kicker="Product offerings & distribution" title="What it sells — and where" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PRODUCT_LINES.map((p, i) => (
            <motion.figure
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -5 }}
              className="overflow-hidden rounded-2xl border border-cocoa bg-white shadow-[2px_2px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-square">
                <Image src={p.img} alt={`${p.name} — official Eat Better Co photo`} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
              </div>
              <figcaption className="px-3 py-2.5 font-display text-[1.05rem] font-semibold leading-tight text-cocoa">
                <GlossaryText>{p.name}</GlossaryText>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="mt-2 text-[0.85rem] text-cocoa-2/75">Key product lines · official Eat Better Co photos.</p>

        <div className="mt-8 font-display text-[1.35rem] font-semibold text-cocoa">Where shoppers find Eat Better</div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-2" role="tablist" aria-label="Distribution channels">
            {CHANNELS.map((x, i) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={i === ch}
                onClick={() => setCh(i)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-colors ${i === ch ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}
              >
                <div className="font-display text-[1.15rem] font-semibold text-cocoa">{x.name}</div>
                <div className="text-[0.95rem] text-cocoa-2">{x.detail}</div>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.figure key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="overflow-hidden rounded-[22px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]">
              <div className="relative aspect-[16/9]">
                <Image src={c.img} alt="" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              </div>
              <figcaption className="bg-cream p-4 text-[1.02rem] leading-relaxed text-cocoa">
                <strong>
                  <GlossaryText>{c.name}</GlossaryText>:
                </strong>{" "}
                {c.general} <span className="text-cocoa-2">(general explanation)</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </Panel>
    </section>
  );
}

/* ── Think & discuss ──────────────────────────────────────────── */

const KEY = "ebc-1.2-reflection";
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function Think() {
  const [vision, setVision] = useState("");
  const [value, setValue] = useState<string | null>(null);
  const [decision, setDecision] = useState("");
  const [passes, setPasses] = useState<boolean | null>(null);
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const complete = useActivities12((s) => s.complete);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (s) {
        setVision(s.vision ?? "");
        setValue(s.value ?? null);
        setDecision(s.decision ?? "");
      }
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ vision, value, decision }));
    } catch {
      /* ignore */
    }
  }, [vision, value, decision, restored]);

  const wc = words(vision);
  const q1ok = wc > 0 && wc <= 20;
  const q2ok = !!value && decision.trim().length >= 15;
  useEffect(() => {
    if (q1ok && q2ok) complete("reflect");
  }, [q1ok, q2ok, complete]);

  const summary = `Eat Better Co — Chapter 1.2 · Think & Discuss\n\n1. ${THINK.q1}\n   ${vision.trim() || "—"} (${wc} words)\n\n2. ${THINK.q2}\n   Value: ${value ?? "—"}\n   Decision: ${decision.trim() || "—"}`;

  return (
    <section id="think" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="light" reveal="right" width="max-w-7xl">
        <SectionIntro index="6" kicker="Think & Discuss" title="Your turn to lead" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
            <ActivityLabel done={q1ok}>Question 1</ActivityLabel>
            <h3 className="mt-2 font-display text-[1.4rem] font-semibold leading-snug text-cocoa">{THINK.q1}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["To become…", "To bring…", "To make every…"].map((s) => (
                <button key={s} onClick={() => !vision && setVision(s.replace("…", " "))} className="rounded-full border border-cocoa/25 bg-peach/60 px-3 py-1.5 text-[0.92rem] font-bold text-cocoa hover:border-cocoa">
                  Start with “{s}”
                </button>
              ))}
            </div>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              rows={3}
              aria-label="Your vision statement"
              placeholder="To become…"
              className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.1rem] leading-relaxed text-cocoa outline-none focus:border-orange"
            />
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-cocoa/10">
                <motion.div className={`h-full rounded-full ${wc > 20 ? "bg-error" : "bg-orange"}`} animate={{ width: `${Math.min(100, (wc / 20) * 100)}%` }} />
              </div>
              <span className={`text-[0.98rem] font-bold tabular-nums ${wc > 20 ? "text-error" : "text-cocoa-2"}`}>{wc}/20 words</span>
            </div>
            {wc > 20 && <p className="mt-1 text-[0.95rem] font-bold text-error">A vision should be short enough to remember. Cut it to 20 words.</p>}
          </div>

          <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
            <ActivityLabel done={q2ok}>Question 2</ActivityLabel>
            <h3 className="mt-2 font-display text-[1.4rem] font-semibold leading-snug text-cocoa">{THINK.q2}</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {VALUES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setValue(v.name)}
                  aria-pressed={value === v.name}
                  className={`overflow-hidden rounded-2xl border-2 text-left ${value === v.name ? "border-orange" : "border-cocoa/15 hover:border-cocoa"}`}
                >
                  <span className="relative block aspect-[4/3]">
                    <Image src={v.img} alt="" fill sizes="160px" className="object-cover" />
                  </span>
                  <span className="block px-2 py-1.5 text-[0.88rem] font-bold leading-tight text-cocoa">{v.name}</span>
                </button>
              ))}
            </div>
            <textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={3}
              aria-label="A decision a snack brand would make because of this value"
              placeholder={value ? `Because of “${value}”, a snack brand would…` : "Pick a value first…"}
              className="mt-3 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.05rem] leading-relaxed text-cocoa outline-none focus:border-orange"
            />
            {decision.trim().length >= 15 && (
              <div className="mt-2 rounded-2xl bg-peach/60 p-3">
                <div className="text-[0.98rem] font-bold text-cocoa">Run it through the filter: does your decision keep snacks tasty <em>and</em> better for you?</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setPasses(true)} className={`eb-btn !py-1.5 !text-[0.9rem] !normal-case ${passes === true ? "eb-btn-primary" : "eb-btn-secondary"}`}>
                    <Check className="size-4" /> Yes
                  </button>
                  <button onClick={() => setPasses(false)} className={`eb-btn !py-1.5 !text-[0.9rem] !normal-case ${passes === false ? "eb-btn-dark" : "eb-btn-secondary"}`}>
                    <X className="size-4" /> Not really
                  </button>
                </div>
                {passes === false && <p className="mt-2 text-[0.95rem] text-cocoa">Then it wouldn&apos;t pass Eat Better&apos;s filter — can you change it so it does?</p>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[22px] bg-cocoa p-5 text-cream sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">Your answers</div>
              <p className="text-[0.95rem] text-cream/80">Saved on this device only. Copy them into your discussion or LMS submission.</p>
            </div>
            <button
              disabled={!(q1ok && q2ok)}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard blocked */
                }
              }}
              className="eb-btn eb-btn-primary"
            >
              {copied ? <Check className="size-5" /> : <ClipboardCopy className="size-5" />} {copied ? "Copied" : "Copy my answers"}
            </button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/25 p-4 font-sans text-[1rem] leading-relaxed">{summary}</pre>
        </div>
      </Panel>
    </section>
  );
}

/* ── Wrap-up ──────────────────────────────────────────────────── */

const RECAP = [
  { title: "Vision", text: VISION.publicVision, img: "/chapter-1-1/art/across-india.webp" },
  { title: "Mission", text: MISSION.text, img: "/chapter-1-1/art/doorstep.webp" },
  { title: "Values", text: "Familiar Taste · Better Ingredients · Honest Processes", img: "/chapter-1-2/better-ingredients.webp" },
  { title: "The filter", text: TAKEAWAY, img: "/chapter-1-2/frames/shipping-box.webp" },
];
const ACT: { id: "sort" | "filter" | "reflect"; label: string }[] = [
  { id: "sort", label: "Destination or daily step?" },
  { id: "filter", label: "The vision filter" },
  { id: "reflect", label: "Think & Discuss" },
];

export function WrapUp() {
  const done = useActivities12((s) => s.done);
  const n = ACT.filter((a) => done[a.id]).length;
  return (
    <section id="wrap-up" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">Chapter 1.2 · Wrap-up</div>
        <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.04] text-cocoa">The compass behind every snack</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECAP.map((r, i) => (
            <motion.figure
              key={r.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 140, damping: 18 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]"
            >
              <div className="relative aspect-[16/10]">
                <Image src={r.img} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full border border-cocoa bg-orange font-display font-semibold text-white">{i + 1}</span>
              </div>
              <figcaption className="p-4">
                <div className="font-display text-[1.15rem] font-semibold text-cocoa">{r.title}</div>
                <p className="mt-1 text-[0.98rem] leading-snug text-cocoa">
                  <GlossaryText>{r.text}</GlossaryText>
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <div className="mt-6 rounded-[22px] bg-cream p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[1.2rem] font-semibold text-cocoa">Activities on this page</span>
            <span className="font-bold text-cocoa-2">
              {n}/{ACT.length}
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {ACT.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-[1rem] text-cocoa">
                {done[a.id] ? <Check className="size-5 shrink-0 text-success" strokeWidth={3} /> : <Circle className="size-5 shrink-0 text-cocoa-2/40" />}
                {a.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.9rem] text-cocoa-2/80">Shown for this visit only. This page doesn&apos;t record progress in the LMS.</p>
        </div>
      </Panel>
    </section>
  );
}

export { TAKEAWAY };
