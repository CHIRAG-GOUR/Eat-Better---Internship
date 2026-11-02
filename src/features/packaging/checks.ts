import type { ArtworkMetrics, PackDesign, Rect } from "./types";

export type CheckResult = {
  id: string;
  title: string;
  pass: boolean;
  /** what the student sees right now — specific, measured */
  detail: string;
  /** why it matters on a real shelf */
  why: string;
};

const inside = (a: Rect, b: Rect) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
const overlapArea = (a: Rect, b: Rect) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

export const MIN_CONTRAST = 4.5;
/** Name cap-size as a fraction of pack height that stays legible at ~2 m (demo threshold). */
export const MIN_NAME_RATIO = 0.055;

/**
 * DEMO BRIEF — demonstrates the feedback engine. The real brief, wording and
 * thresholds will come from the Module 1 · Chapter 1 material.
 */
export function evaluateBrief(d: PackDesign, m: ArtworkMetrics): CheckResult[] {
  const results: CheckResult[] = [];

  // 1 — brand recognition
  const logo = m.logoBox;
  const logoWidthRatio = logo ? logo.w / m.front.w : 0;
  const logoInSafe = !!logo && inside(logo, m.safe);
  results.push({
    id: "brand",
    title: "Brand is easy to spot",
    pass: !!logo && logoInSafe && logoWidthRatio >= 0.22,
    detail: !logo
      ? "The Eat Better Co logo is missing from the front."
      : !logoInSafe
        ? "Part of the logo sits outside the safe area — it may be cut by the seal or fold."
        : logoWidthRatio < 0.22
          ? `Logo is ${Math.round(logoWidthRatio * 100)}% of the pack width — make it at least 22%.`
          : `Logo is ${Math.round(logoWidthRatio * 100)}% of the width and inside the safe area.`,
    why: "Shoppers scan for brands they trust first. A clear logo lets a returning customer find you in a second.",
  });

  // 2 — shelf legibility (measured from the rendered artwork)
  const nameRatio = m.namePx / m.front.h;
  const contrastOk = m.nameContrast >= MIN_CONTRAST;
  const sizeOk = nameRatio >= MIN_NAME_RATIO;
  const calm = m.nameBackgroundBusy < 0.14;
  results.push({
    id: "legibility",
    title: "Name reads from 2 metres",
    pass: contrastOk && sizeOk && calm && !!m.nameBox,
    detail: !m.nameBox
      ? "There is no product name on the front."
      : !contrastOk
        ? `Contrast is ${m.nameContrast.toFixed(1)}:1 — it needs at least ${MIN_CONTRAST}:1. Change the text or background colour.`
        : !sizeOk
          ? "The name is too small to read from the aisle. Increase the name size."
          : !calm
            ? "The background behind the name is busy. Move artwork away from the name or simplify it."
            : `Contrast ${m.nameContrast.toFixed(1)}:1 and a strong size — readable at shelf distance.`,
    why: "Most buying decisions happen in a few seconds, from a distance. If the name can't be read, the pack doesn't get picked up.",
  });

  // 3 — hierarchy & clear space
  const nameBiggest = m.namePx >= m.flavourPx * 1.4 && m.namePx >= m.taglinePx * 1.4;
  const protectedBoxes = [m.nameBox, m.logoBox].filter(Boolean) as Rect[];
  const art = m.elementBoxes.filter((e) => e.kind !== "logo");
  const clash = art.find((e) =>
    protectedBoxes.some((p) => overlapArea(e.box, p) > Math.min(e.box.w * e.box.h, p.w * p.h) * 0.12),
  );
  results.push({
    id: "hierarchy",
    title: "Clear hierarchy",
    pass: nameBiggest && !clash,
    detail: !nameBiggest
      ? "The product name should be the biggest words on the pack."
      : clash
        ? `The ${clash.kind} artwork overlaps the name or logo. Give them clear space.`
        : "Name first, flavour second, details last — and nothing crowds the name or logo.",
    why: "The eye reads the biggest, clearest thing first. Good hierarchy tells the shopper what it is before how it's different.",
  });

  // 4 — claims
  const n = d.claims.length;
  results.push({
    id: "claims",
    title: "Two or three key claims",
    pass: n >= 2 && n <= 3,
    detail:
      n < 2
        ? `Add ${2 - n} more claim${n === 1 ? "" : "s"} that make this snack better for you.`
        : n > 3
          ? `${n} claims is crowded — keep the strongest three for the front.`
          : `${n} focused claims on the front.`,
    why: "Claims like 'Roasted not fried' explain why to choose this snack — but too many and none of them stand out.",
  });

  // 5 — mandatory front-of-pack information
  const missing = [!d.showVegMark && "veg mark", !d.netQty && "net quantity"].filter(Boolean) as string[];
  results.push({
    id: "mandatory",
    title: "Required information",
    pass: missing.length === 0,
    detail: missing.length ? `Missing on the front: ${missing.join(" and ")}.` : "Veg mark and net quantity are on the front panel.",
    why: "In India, packaged food must show the veg/non-veg symbol and net quantity on the front (principal display) panel.",
  });

  return results;
}
