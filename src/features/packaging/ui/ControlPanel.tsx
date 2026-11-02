"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpToLine,
  Box,
  Brush,
  Copy,
  GitCompareArrows,
  Layers,
  LayoutTemplate,
  Palette,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { PRODUCTS, getProduct, type PackFormat } from "@/lib/brand";
import { useStudio } from "../store";
import { ELEMENT_LIBRARY, FINISHES, FORMATS, SWATCH_GROUPS, TEMPLATES, TYPEFACES } from "../presets";
import { drawIllustration } from "../art/illustrations";
import { contrastRatio } from "../art/color";
import { MIN_CONTRAST } from "../checks";
import type { ArtworkMetrics, ElementKind, LogoTone, PackDesign } from "../types";
import { Section, Segmented, Slider, SwatchRow, TextField, Toggle } from "./primitives";

type TabId = "product" | "layout" | "colour" | "words" | "art" | "finish" | "versions";
const TABS: { id: TabId; label: string; icon: typeof Box }[] = [
  { id: "product", label: "Product", icon: Box },
  { id: "layout", label: "Layout", icon: LayoutTemplate },
  { id: "colour", label: "Colour", icon: Palette },
  { id: "words", label: "Words", icon: Type },
  { id: "art", label: "Art", icon: Brush },
  { id: "finish", label: "Finish", icon: Sparkles },
  { id: "versions", label: "Versions", icon: GitCompareArrows },
];

/* ── Product ──────────────────────────────────────────────────── */

function ProductTab({ d }: { d: PackDesign }) {
  const selectProduct = useStudio((s) => s.selectProduct);
  const setFormat = useStudio((s) => s.setFormat);
  const p = getProduct(d.productId);
  const official = FORMATS[p.officialFormat];
  return (
    <div className="space-y-8">
      <Section title="Choose a real product" hint="Every product here is sold by Eat Better Co. You're designing a new concept pack for it.">
        <div className="grid grid-cols-2 gap-2.5">
          {PRODUCTS.map((x) => {
            const on = x.id === d.productId;
            return (
              <motion.button
                key={x.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => !on && selectProduct(x.id)}
                aria-pressed={on}
                className={`group overflow-hidden rounded-2xl border bg-white text-left transition-shadow ${on ? "border-orange shadow-[0_0_0_3px_rgba(255,92,0,0.25)]" : "border-line hover:shadow-lg"}`}
              >
                <div className="relative aspect-square overflow-hidden bg-peach">
                  <Image src={x.images[0]} alt={`${x.name} — official Eat Better Co pack`} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-[0.95rem] font-semibold leading-tight text-cocoa">{x.name}</div>
                  <div className="text-[0.82rem] text-cocoa-2/75">{FORMATS[x.officialFormat].label}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title="Pack format" hint={`Eat Better Co sells ${p.name} in a ${official.label.toLowerCase()}.`}>
        <Segmented<PackFormat>
          name="Pack format"
          value={d.format}
          onChange={setFormat}
          options={(Object.keys(FORMATS) as PackFormat[]).map((k) => ({ id: k, label: FORMATS[k].label.split(" ").pop()!.replace(/^./, (c) => c.toUpperCase()), hint: FORMATS[k].blurb }))}
        />
        <p className="rounded-xl bg-peach/70 px-3.5 py-2.5 text-[0.95rem] leading-snug text-cocoa">
          <strong className="font-semibold">Used by Eat Better Co for:</strong> {FORMATS[d.format].usedFor}.
          {d.format !== p.officialFormat && <> This product officially ships in a {official.label.toLowerCase()} — what would change if it didn&apos;t?</>}
        </p>
      </Section>
    </div>
  );
}

/* ── Layout ───────────────────────────────────────────────────── */

function LayoutTab({ d }: { d: PackDesign }) {
  const update = useStudio((s) => s.update);
  const commit = useStudio((s) => s.commit);
  return (
    <div className="space-y-8">
      <Section title="Front layout">
        <Segmented name="Template" value={d.template} options={TEMPLATES} onChange={(v) => update((x) => ({ ...x, template: v }))} />
      </Section>
      <Section title="Typeface">
        <Segmented name="Typeface" value={d.typeface} options={TYPEFACES} onChange={(v) => update((x) => ({ ...x, typeface: v }))} />
      </Section>
      <Section title="Name size" hint="The name is the first thing a shopper reads. How big is big enough from the aisle?">
        <Slider
          label="Product name"
          value={d.nameScale}
          min={0.5}
          max={1.6}
          onChange={(v) => update((x) => ({ ...x, nameScale: v }), true)}
          onCommit={commit}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </Section>
    </div>
  );
}

/* ── Colour ───────────────────────────────────────────────────── */

type Role = keyof PackDesign["colors"];
const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: "base", label: "Base", hint: "The main colour of the pack." },
  { id: "band", label: "Band", hint: "The second block, ribbon or shape behind the artwork." },
  { id: "text", label: "Name", hint: "Colour of the product name." },
  { id: "accent", label: "Accent", hint: "Flavour line and claim chips." },
];

function ColourTab({ d, metrics }: { d: PackDesign; metrics: ArtworkMetrics | null }) {
  const [role, setRole] = useState<Role>("base");
  const update = useStudio((s) => s.update);
  const commit = useStudio((s) => s.commit);
  const value = d.colors[role];
  const set = (hex: string, transient = false) => update((x) => ({ ...x, colors: { ...x.colors, [role]: hex } }), transient);
  const c = metrics?.nameContrast ?? contrastRatio(d.colors.text, d.colors.base);
  const ok = c >= MIN_CONTRAST;

  return (
    <div className="space-y-7">
      <Section title="Colour role">
        <Segmented name="Colour role" value={role} options={ROLES} onChange={setRole} />
      </Section>

      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/70 p-3">
        <div className="grid size-14 shrink-0 place-items-center rounded-xl font-display text-xl font-bold" style={{ background: d.template === "block" ? d.colors.band : d.colors.base, color: d.colors.text }}>
          Aa
        </div>
        <div className="min-w-0">
          <div className="text-[0.95rem] font-semibold text-cocoa">
            Name contrast <span className={`tabular-nums ${ok ? "text-success" : "text-error"}`}>{c.toFixed(1)}:1</span>
          </div>
          <p className="text-[0.9rem] leading-snug text-cocoa-2/85">
            {ok ? "Comfortably readable." : `Below ${MIN_CONTRAST}:1 — shoppers will struggle to read it.`} Measured from the actual artwork behind the name.
          </p>
        </div>
      </div>

      {SWATCH_GROUPS.map((g) => (
        <div key={g.label}>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[0.95rem] font-semibold text-cocoa">{g.label}</span>
            <span className="text-[0.82rem] text-cocoa-2/70">{g.note}</span>
          </div>
          <SwatchRow swatches={g.swatches} value={value} onPick={(hex) => set(hex)} />
        </div>
      ))}
      <label className="flex items-center gap-3 text-[0.95rem] font-semibold text-cocoa">
        <input
          type="color"
          value={value}
          onChange={(e) => set(e.target.value.toUpperCase(), true)}
          onBlur={commit}
          className="size-10 cursor-pointer rounded-lg border border-line-strong bg-transparent"
        />
        Custom colour <span className="font-mono text-[0.9rem] font-normal text-cocoa-2">{value.toUpperCase()}</span>
      </label>
    </div>
  );
}

/* ── Words ────────────────────────────────────────────────────── */

function WordsTab({ d }: { d: PackDesign }) {
  const update = useStudio((s) => s.update);
  const p = getProduct(d.productId);
  // text inputs: record one history step per typing pause
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commit = useStudio((s) => s.commit);
  const setText = (k: "name" | "flavour" | "tagline", v: string) => {
    update((x) => ({ ...x, [k]: v }), true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(commit, 600);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toggleClaim = (c: string) =>
    update((x) => ({ ...x, claims: x.claims.includes(c) ? x.claims.filter((y) => y !== c) : [...x.claims, c] }));

  return (
    <div className="space-y-8">
      <Section title="Name & flavour">
        <TextField label="Product name" value={d.name} onChange={(v) => setText("name", v)} maxLength={34} />
        <TextField label="Flavour line" value={d.flavour} onChange={(v) => setText("flavour", v)} maxLength={30} />
        <TextField label="Tagline" value={d.tagline} onChange={(v) => setText("tagline", v)} maxLength={32} placeholder="e.g. Eat what you love" />
      </Section>

      <Section title="Claims" hint={`From the official ${p.name} page. Pick the ones that matter most for the front.`}>
        <div className="flex flex-wrap gap-2">
          {p.claims.map((c) => {
            const on = d.claims.includes(c);
            return (
              <motion.button
                key={c}
                layout
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleClaim(c)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-2 text-[0.95rem] font-semibold transition-colors ${on ? "border-cocoa bg-cocoa text-cream" : "border-line-strong bg-white text-cocoa hover:border-cocoa"}`}
              >
                {c}
              </motion.button>
            );
          })}
        </div>
      </Section>

      <Section title="Required on the front">
        <Toggle
          label="Veg mark"
          hint="Green square with a dot — required on vegetarian food in India."
          checked={d.showVegMark}
          onChange={(v) => update((x) => ({ ...x, showVegMark: v }))}
        />
        <div>
          <div className="mb-2 text-[0.95rem] font-semibold text-cocoa">Net quantity</div>
          <div className="flex flex-wrap gap-2">
            {[null, ...p.netQuantities].map((q) => {
              const on = d.netQty === q;
              return (
                <button
                  key={q ?? "none"}
                  onClick={() => update((x) => ({ ...x, netQty: q }))}
                  aria-pressed={on}
                  className={`rounded-xl border px-3.5 py-2 text-[0.95rem] font-semibold ${on ? "border-orange bg-orange text-white" : "border-line-strong bg-white text-cocoa hover:border-cocoa"}`}
                >
                  {q ?? "Not shown"}
                </button>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ── Art ──────────────────────────────────────────────────────── */

function ElementPreview({ kind }: { kind: Exclude<ElementKind, "logo"> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 96, 96);
    g.save();
    g.translate(48, 48);
    drawIllustration(g, kind, 74, `preview-${kind}`);
    g.restore();
  }, [kind]);
  return <canvas ref={ref} width={96} height={96} className="size-12" aria-hidden />;
}

const LOGO_TONES: { id: LogoTone; label: string }[] = [
  { id: "chocolate", label: "Chocolate" },
  { id: "cocoa", label: "Cocoa" },
  { id: "white", label: "White" },
];

function ArtTab({ d }: { d: PackDesign }) {
  const { addElement, removeElement, patchElement, commit, select, bringForward, update } = useStudio.getState();
  const selectedId = useStudio((s) => s.selectedId);
  const sel = d.elements.find((e) => e.id === selectedId) ?? null;
  const labelOf = (k: ElementKind) => (k === "logo" ? "Eat Better Co logo" : ELEMENT_LIBRARY.find((x) => x.kind === k)?.label ?? k);

  return (
    <div className="space-y-8">
      <Section title="Add artwork" hint="Tap to add, then drag it directly on the 3D pack.">
        <div className="grid grid-cols-4 gap-2">
          {ELEMENT_LIBRARY.map((x) => (
            <motion.button
              key={x.kind}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => addElement(x.kind)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-white py-2 text-[0.8rem] font-semibold text-cocoa hover:border-cocoa"
            >
              <ElementPreview kind={x.kind} />
              {x.label}
            </motion.button>
          ))}
        </div>
      </Section>

      <Section title="On your pack">
        <div className="flex flex-wrap gap-2">
          {d.elements.map((e) => (
            <button
              key={e.id}
              onClick={() => select(e.id === selectedId ? null : e.id)}
              aria-pressed={e.id === selectedId}
              className={`rounded-full border px-3 py-1.5 text-[0.9rem] font-semibold ${e.id === selectedId ? "border-orange bg-orange text-white" : "border-line-strong bg-white text-cocoa hover:border-cocoa"}`}
            >
              {labelOf(e.kind)}
            </button>
          ))}
          {!d.elements.length && <p className="text-[0.95rem] text-cocoa-2/80">Nothing yet.</p>}
        </div>

        <AnimatePresence mode="popLayout">
          {sel ? (
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 rounded-2xl border border-line bg-white/70 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[1.05rem] font-semibold">{labelOf(sel.kind)}</span>
                <div className="flex gap-1">
                  <button onClick={() => bringForward(sel.id)} className="rounded-lg p-2 text-cocoa hover:bg-peach" aria-label="Bring to front" title="Bring to front">
                    <ArrowUpToLine className="size-5" />
                  </button>
                  <button
                    onClick={() => {
                      const copy = { ...sel, id: `${sel.id}-c${Date.now().toString(36)}`, x: Math.min(1, sel.x + 0.06), y: Math.min(1, sel.y + 0.04) };
                      update((x) => ({ ...x, elements: [...x.elements, copy] }));
                      select(copy.id);
                    }}
                    className="rounded-lg p-2 text-cocoa hover:bg-peach"
                    aria-label="Duplicate"
                    title="Duplicate"
                  >
                    <Copy className="size-5" />
                  </button>
                  <button onClick={() => removeElement(sel.id)} className="rounded-lg p-2 text-error hover:bg-error/10" aria-label="Delete" title="Delete">
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
              <Slider label="Size" value={sel.scale} min={0.3} max={2.4} onChange={(v) => patchElement(sel.id, { scale: v }, true)} onCommit={commit} format={(v) => `${Math.round(v * 100)}%`} />
              <Slider label="Rotation" value={sel.rotation} min={-180} max={180} step={1} onChange={(v) => patchElement(sel.id, { rotation: v }, true)} onCommit={commit} format={(v) => `${Math.round(v)}°`} />
              <p className="text-[0.88rem] text-cocoa-2/80">Keyboard: arrow keys nudge · Shift for bigger steps · Delete removes</p>
            </motion.div>
          ) : (
            <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[0.95rem] text-cocoa-2/80">
              Select an item above, or grab it on the pack.
            </motion.p>
          )}
        </AnimatePresence>
      </Section>

      <Section title="Logo colour" hint="The official wordmark. Pick the tone that stays clear on your base colour.">
        <Segmented name="Logo colour" value={d.logoTone} options={LOGO_TONES} onChange={(v) => update((x) => ({ ...x, logoTone: v }))} />
      </Section>
    </div>
  );
}

/* ── Finish ───────────────────────────────────────────────────── */

function FinishTab({ d }: { d: PackDesign }) {
  const update = useStudio((s) => s.update);
  const lidOpen = useStudio((s) => s.lidOpen);
  const setLidOpen = useStudio((s) => s.setLidOpen);
  return (
    <div className="space-y-8">
      <Section title="Material finish" hint="Rotate the pack under the studio lights to see how each finish catches light.">
        <Segmented name="Finish" value={d.finish} options={FINISHES} onChange={(v) => update((x) => ({ ...x, finish: v }))} />
      </Section>
      {d.format === "carton" && (
        <Section title="Unboxing">
          <Toggle label="Open the lid" hint="Inside: six flavour packs (simplified)." checked={lidOpen} onChange={setLidOpen} />
        </Section>
      )}
    </div>
  );
}

/* ── Versions ─────────────────────────────────────────────────── */

function VersionsTab({ onSave, onExport }: { onSave: () => void; onExport: () => void }) {
  const snapshots = useStudio((s) => s.snapshots);
  const compareId = useStudio((s) => s.compareId);
  const { setCompare, restoreSnapshot, deleteSnapshot } = useStudio.getState();
  return (
    <div className="space-y-8">
      <Section title="Save & compare" hint="Designers never stop at one idea. Save a version, try something bolder, then compare them side by side in the studio.">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onSave} className="flex items-center justify-center gap-2 rounded-xl bg-cocoa px-3 py-3 text-[0.95rem] font-semibold text-cream hover:bg-cocoa-2">
            <Layers className="size-5" /> Save version
          </button>
          <button onClick={onExport} className="flex items-center justify-center gap-2 rounded-xl border border-cocoa px-3 py-3 text-[0.95rem] font-semibold text-cocoa hover:bg-peach">
            Export concept card
          </button>
        </div>
      </Section>
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {snapshots.map((s) => {
            const on = s.id === compareId;
            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`flex gap-3 rounded-2xl border bg-white p-2.5 ${on ? "border-orange" : "border-line"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.thumb} alt={`${s.label} front panel`} className="h-24 w-auto rounded-lg border border-line object-contain" />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="font-display text-[1.05rem] font-semibold">{s.label}</div>
                    <div className="truncate text-[0.88rem] text-cocoa-2/80">
                      {FORMATS[s.design.format].label} · {TEMPLATES.find((t) => t.id === s.design.template)?.label}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setCompare(on ? null : s.id)} className={`rounded-lg px-2.5 py-1.5 text-[0.85rem] font-semibold ${on ? "bg-orange text-white" : "bg-peach text-cocoa hover:bg-peach/70"}`}>
                      {on ? "Stop comparing" : "Compare"}
                    </button>
                    <button onClick={() => restoreSnapshot(s.id)} className="flex items-center gap-1 rounded-lg bg-peach px-2.5 py-1.5 text-[0.85rem] font-semibold text-cocoa hover:bg-peach/70">
                      <RotateCcw className="size-3.5" /> Restore
                    </button>
                    <button onClick={() => deleteSnapshot(s.id)} className="rounded-lg px-2 py-1.5 text-error hover:bg-error/10" aria-label={`Delete ${s.label}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!snapshots.length && <p className="text-[0.95rem] text-cocoa-2/80">No saved versions yet. You can keep up to four.</p>}
      </div>
    </div>
  );
}

/* ── Panel shell ──────────────────────────────────────────────── */

export function ControlPanel({
  design,
  metrics,
  onSave,
  onExport,
}: {
  design: PackDesign;
  metrics: ArtworkMetrics | null;
  onSave: () => void;
  onExport: () => void;
}) {
  const [tab, setTab] = useState<TabId>("product");
  const [dir, setDir] = useState(1);
  const selectedId = useStudio((s) => s.selectedId);
  const prevSel = useRef(selectedId);
  useEffect(() => {
    // grabbing an element on the pack jumps to the Art tab
    if (selectedId && selectedId !== prevSel.current) {
      setDir(1);
      setTab("art");
    }
    prevSel.current = selectedId;
  }, [selectedId]);

  const go = (t: TabId) => {
    setDir(TABS.findIndex((x) => x.id === t) > TABS.findIndex((x) => x.id === tab) ? 1 : -1);
    setTab(t);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav aria-label="Studio tools" className="no-scrollbar grid shrink-0 grid-cols-7 overflow-x-auto border-b border-line px-1.5 pt-1.5">
        {TABS.map((t) => {
          const on = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              aria-current={on ? "page" : undefined}
              className={`relative flex min-w-[56px] flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[0.85rem] font-semibold transition-colors ${on ? "text-cocoa" : "text-cocoa-2/70 hover:text-cocoa"}`}
            >
              <Icon className="size-5" />
              {t.label}
              {on && <motion.span layoutId="tab-underline" className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-orange" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            </button>
          );
        })}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
        {/* content swaps instantly and animates in — never blocked behind an exit animation */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: dir * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
            {tab === "product" && <ProductTab d={design} />}
            {tab === "layout" && <LayoutTab d={design} />}
            {tab === "colour" && <ColourTab d={design} metrics={metrics} />}
            {tab === "words" && <WordsTab d={design} />}
            {tab === "art" && <ArtTab d={design} />}
            {tab === "finish" && <FinishTab d={design} />}
            {tab === "versions" && <VersionsTab onSave={onSave} onExport={onExport} />}
        </motion.div>
      </div>
    </div>
  );
}
