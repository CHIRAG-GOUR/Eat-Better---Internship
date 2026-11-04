import type { SVGProps } from "react";

/**
 * Eat Better custom icon set — hand-drawn to sit beside lucide icons (24×24, 2px rounded strokes,
 * currentColor), so they inherit size and colour from className ("size-5 text-orange").
 * Motifs come from the brand: the leaf in the logo, laddoos, the warm underline swoosh.
 */

type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number };

function Base({ children, strokeWidth = 2, ...p }: IconProps & { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {children}
    </svg>
  );
}

/** Two leaves on a stem — growth, beginnings (the logo's leaf motif). */
export function Sprout(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4.2 2.8-7 7.5-7 0 4.4-2.9 7-7.5 7Z" />
      <path d="M12 15.5c0-3.4-2.3-5.6-6.3-5.6 0 3.6 2.4 5.6 6.3 5.6Z" />
      <path d="M8 21h8" />
    </Base>
  );
}

/** A lightbulb whose filament is a leaf — lessons, insights, key concepts. */
export function LeafBulb(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M8.6 15.2A6.5 6.5 0 1 1 15.4 15.2c-.6.5-.9 1.1-.9 1.8V18h-5v-1c0-.7-.3-1.3-.9-1.8Z" />
      <path d="M12 14V11" />
      <path d="M12 11c0-2 1.3-3.3 3.2-3.3 0 2-1.3 3.3-3.2 3.3Z" />
    </Base>
  );
}

/** A leaf inside a rounded badge — positioning, a brand promise. */
export function LeafBadge(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 2.8 14.2 4.4l2.7-.2.9 2.6 2.3 1.4-.8 2.6.8 2.6-2.3 1.4-.9 2.6-2.7-.2L12 19.2 9.8 17.6l-2.7.2-.9-2.6-2.3-1.4.8-2.6-.8-2.6 2.3-1.4.9-2.6 2.7.2Z" />
      <path d="M9 13.5c0-2.9 1.9-4.8 5.4-4.8 0 3-2 4.8-5.4 4.8Z" />
      <path d="M9 13.5 12 10.8" />
      <path d="M9.5 21.2 12 19.2l2.5 2" />
    </Base>
  );
}

/** A laddoo with an echo ring — something that sticks in memory. */
export function EchoMark(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="9" cy="12" r="4.5" />
      <path d="M7.4 10.6h.01M10.3 11.2h.01M8.6 13.6h.01" strokeWidth={2.6} />
      <path d="M16 7.5a6.5 6.5 0 0 1 0 9" />
      <path d="M19 5a10 10 0 0 1 0 14" />
    </Base>
  );
}

/** A heart with a leaf — emotional connection with a brand. */
export function HeartLeaf(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" />
      <path d="M12 7.4c.2-2.4 1.8-4 4.3-4.1-.1 2.4-1.8 4-4.3 4.1Z" />
    </Base>
  );
}

/** A drop with a shine line — surface finish (gloss, matte). */
export function ShineDrop(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z" />
      <path d="M9.3 14.6a2.8 2.8 0 0 0 2.4 2.6" />
    </Base>
  );
}

/** A flag on a hill with the brand swoosh — a learning goal. */
export function GoalFlag(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M8 21V4" />
      <path d="M8 4.5c2.5-1.2 4.3 1 7 0v6c-2.7 1-4.5-1.2-7 0" />
      <path d="M3 21c3-2.2 6-2.2 9 0s6 2.2 9 0" />
    </Base>
  );
}
