"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useId, type ReactNode } from "react";
import { contrastRatio } from "../art/color";

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-display text-[1.2rem] font-semibold leading-tight text-cocoa">{title}</h3>
        {hint && <p className="mt-1 text-[0.95rem] leading-snug text-cocoa-2/80">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  name,
}: {
  value: T;
  options: { id: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  name: string;
}) {
  const layoutId = useId();
  const active = options.find((o) => o.id === value);
  return (
    <div>
      <div role="radiogroup" aria-label={name} className="relative grid gap-1 rounded-2xl bg-surface-sunk p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              className={`relative z-0 rounded-xl px-2 py-2.5 text-[0.95rem] font-semibold transition-colors ${on ? "text-cream" : "text-cocoa-2 hover:text-cocoa"}`}
            >
              {on && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 -z-10 rounded-xl bg-cocoa shadow-[0_6px_16px_-6px_rgba(47,28,26,0.6)]"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              )}
              {o.label}
            </button>
          );
        })}
      </div>
      {active?.hint && <p className="mt-2 text-[0.95rem] leading-snug text-cocoa-2/85">{active.hint}</p>}
    </div>
  );
}

export function SwatchRow({
  swatches,
  value,
  onPick,
}: {
  swatches: { name: string; hex: string }[];
  value: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((s) => {
        const on = s.hex.toLowerCase() === value.toLowerCase();
        const dark = contrastRatio("#FFFFFF", s.hex) > 3;
        return (
          <motion.button
            key={s.hex + s.name}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPick(s.hex)}
            title={`${s.name} ${s.hex}`}
            aria-label={`${s.name} ${s.hex}`}
            aria-pressed={on}
            className={`relative grid size-9 place-items-center rounded-[10px] border ${on ? "border-cocoa ring-2 ring-orange ring-offset-2 ring-offset-surface" : "border-line-strong"}`}
            style={{ background: s.hex }}
          >
            {on && <Check className={`size-4 ${dark ? "text-white" : "text-cocoa"}`} strokeWidth={3} />}
          </motion.button>
        );
      })}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  onCommit,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit: () => void;
  format?: (v: number) => string;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[0.95rem] font-semibold text-cocoa">
          {label}
        </label>
        <span className="font-mono text-[0.9rem] tabular-nums text-cocoa-2">{format ? format(value) : value.toFixed(2)}</span>
      </div>
      <input
        id={id}
        type="range"
        className="eb-range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
      />
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-white/60 px-4 py-3 text-left transition-colors hover:border-line-strong"
    >
      <span>
        <span className="block text-[1rem] font-semibold text-cocoa">{label}</span>
        {hint && <span className="block text-[0.9rem] leading-snug text-cocoa-2/80">{hint}</span>}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-success" : "bg-line-strong"}`}>
        <motion.span
          className="absolute top-1 size-5 rounded-full bg-white shadow"
          animate={{ left: checked ? 24 : 4 }}
          transition={{ type: "spring", stiffness: 600, damping: 34 }}
        />
      </span>
    </button>
  );
}

export function TextField({
  label,
  value,
  onChange,
  maxLength = 40,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[0.95rem] font-semibold text-cocoa">
          {label}
        </label>
        <span className="text-[0.85rem] tabular-nums text-cocoa-2/70">
          {value.length}/{maxLength}
        </span>
      </div>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-[1.05rem] text-cocoa outline-none transition-shadow focus:border-orange focus:shadow-[0_0_0_4px_rgba(255,92,0,0.15)]"
      />
    </div>
  );
}
