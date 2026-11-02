import { getProduct, type ProductRef } from "@/lib/brand";
import { ELEMENT_BASE, FORMATS, LOGO_ASPECT } from "../presets";
import type { ArtElement, ArtworkMetrics, LogoTone, PackDesign, Rect, TypefaceId } from "../types";
import { getAtlas, type AtlasLayout } from "./atlas";
import { ELEMENT_ASPECT, drawIllustration, seeded } from "./illustrations";
import { contrastRatio, mixHex, pickReadable, relLuminance, hexToRgb } from "./color";

type Ctx = CanvasRenderingContext2D;

/* ── fonts ────────────────────────────────────────────────────── */

let FONT_FAMILIES: Record<TypefaceId, string> = {
  rounded: "Fredoka, ui-rounded, system-ui, sans-serif",
  clean: "Figtree, system-ui, sans-serif",
  classic: 'Georgia, "Times New Roman", serif',
};
const FONT_WEIGHT: Record<TypefaceId, number> = { rounded: 700, clean: 800, classic: 700 };

/** next/font generates hashed family names — the studio passes them in once loaded. */
export function setFontFamilies(map: Partial<Record<TypefaceId, string>>) {
  FONT_FAMILIES = { ...FONT_FAMILIES, ...map };
}
export const fontFamilyFor = (t: TypefaceId) => FONT_FAMILIES[t];
const bodyFamily = () => FONT_FAMILIES.clean;

/* ── logo ─────────────────────────────────────────────────────── */

const LOGO_TONES: Record<LogoTone, string | null> = { chocolate: null, white: "#FFFFFF", cocoa: "#2F1C1A" };
let logoImg: HTMLImageElement | null = null;
const tinted = new Map<LogoTone, HTMLCanvasElement>();

export function loadLogo(): Promise<void> {
  if (logoImg?.complete) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      logoImg = img;
      tinted.clear();
      resolve();
    };
    img.onerror = () => resolve();
    img.src = "/brand/eat-better-logo.svg";
  });
}

function logoCanvas(tone: LogoTone): CanvasImageSource | null {
  if (!logoImg) return null;
  const cached = tinted.get(tone);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = 830;
  c.height = 400;
  const g = c.getContext("2d")!;
  g.drawImage(logoImg, 0, 0, c.width, c.height);
  const col = LOGO_TONES[tone];
  if (col) {
    g.globalCompositeOperation = "source-in";
    g.fillStyle = col;
    g.fillRect(0, 0, c.width, c.height);
  }
  tinted.set(tone, c);
  return c;
}

/* ── kraft paper texture (generated once) ─────────────────────── */

let kraftPattern: HTMLCanvasElement | null = null;
function kraft(): HTMLCanvasElement {
  if (kraftPattern) return kraftPattern;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c7a378";
  g.fillRect(0, 0, 256, 256);
  const rnd = seeded("kraft");
  for (let i = 0; i < 1400; i++) {
    const x = rnd() * 256;
    const y = rnd() * 256;
    const l = 4 + rnd() * 14;
    const a = rnd() * Math.PI;
    g.strokeStyle = rnd() < 0.5 ? "rgba(90,60,30,0.18)" : "rgba(255,240,210,0.16)";
    g.lineWidth = 0.6 + rnd();
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  kraftPattern = c;
  return c;
}

/* ── helpers ──────────────────────────────────────────────────── */

const at = (r: Rect, nx: number, ny: number) => ({ x: r.x + r.w * nx, y: r.y + r.h * ny });

function safeRect(front: Rect, design: PackDesign): Rect {
  const s = FORMATS[design.format].safe;
  return {
    x: front.x + front.w * s.left,
    y: front.y + front.h * s.top,
    w: front.w * (1 - s.left - s.right),
    h: front.h * (1 - s.top - s.bottom),
  };
}

function wrapLines(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Fit text into maxW using a starting px size, shrinking only if a single word overflows. */
function layoutText(ctx: Ctx, text: string, family: string, weight: number, px: number, maxW: number, maxLines = 3) {
  let size = px;
  for (let i = 0; i < 30; i++) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrapLines(ctx, text, maxW);
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width), 0);
    if (widest <= maxW && lines.length <= maxLines) return { lines, size, widest };
    size *= 0.93;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  const lines = wrapLines(ctx, text, maxW);
  return { lines, size, widest: Math.max(...lines.map((l) => ctx.measureText(l).width), 0) };
}

function sampleBackground(ctx: Ctx, box: Rect) {
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const w = Math.max(1, Math.floor(box.w));
  const h = Math.max(1, Math.floor(box.h));
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(x, y, w, h).data;
  } catch {
    return { hex: "#000000", busy: 0 };
  }
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const lums: number[] = [];
  const step = 4 * 6; // sample every 6th pixel
  for (let i = 0; i < data.length; i += step) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
    lums.push(relLuminance([data[i], data[i + 1], data[i + 2]]));
  }
  r /= n;
  g /= n;
  b /= n;
  const mean = lums.reduce((a, v) => a + v, 0) / lums.length;
  const sd = Math.sqrt(lums.reduce((a, v) => a + (v - mean) ** 2, 0) / lums.length);
  const hex = "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  return { hex, busy: sd };
}

export function elementBox(el: ArtElement, front: Rect): Rect {
  const w = front.w * ELEMENT_BASE[el.kind] * el.scale;
  const aspect = el.kind === "logo" ? LOGO_ASPECT : ELEMENT_ASPECT[el.kind];
  const h = w * aspect;
  const c = at(front, el.x, el.y);
  // rotation-aware axis-aligned bounds
  const rad = (el.rotation * Math.PI) / 180;
  const bw = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
  const bh = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
  return { x: c.x - bw / 2, y: c.y - bh / 2, w: bw, h: bh };
}

function drawElement(ctx: Ctx, el: ArtElement, front: Rect, tone: LogoTone) {
  const w = front.w * ELEMENT_BASE[el.kind] * el.scale;
  const c = at(front, el.x, el.y);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate((el.rotation * Math.PI) / 180);
  if (el.kind === "logo") {
    const img = logoCanvas(tone);
    const h = w * LOGO_ASPECT;
    if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    drawIllustration(ctx, el.kind, w, el.id);
  }
  ctx.restore();
}

function crimp(ctx: Ctx, r: Rect, y0: number, y1: number, base: string) {
  ctx.save();
  ctx.fillStyle = mixHex(base, "#000000", 0.06);
  ctx.fillRect(r.x, y0, r.w, y1 - y0);
  const step = r.w / 70;
  for (let x = r.x; x < r.x + r.w; x += step) {
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillRect(x, y0, step * 0.45, y1 - y0);
  }
  ctx.restore();
}

function vegMark(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "#008A3E";
  ctx.lineWidth = s * 0.1;
  ctx.strokeRect(x + s * 0.05, y + s * 0.05, s * 0.9, s * 0.9);
  ctx.fillStyle = "#008A3E";
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function textLines(ctx: Ctx, lines: string[], cx: number, topY: number, size: number, lh = 1.02) {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, cx, topY + i * size * lh));
}

/* ── front panel ──────────────────────────────────────────────── */

/**
 * Text positions are fractions of the SAFE area (so seals and folds never clip them);
 * bandTop and the ribbon's claims follow the background shapes, so they use the full panel.
 */
type TemplateLayout = { name: number; tagline: number; claims: number; bandTop: number };
const TEMPLATE_Y: Record<PackDesign["template"], TemplateLayout> = {
  block: { tagline: 0.51, name: 0.72, claims: 0.87, bandTop: 0.6 },
  ribbon: { tagline: 0.24, name: 0.6, claims: 0.885, bandTop: 0 },
  window: { tagline: 0.6, name: 0.72, claims: 0.89, bandTop: 0 },
};

function drawFrontBackground(ctx: Ctx, front: Rect, d: PackDesign) {
  const { base, band } = d.colors;
  ctx.fillStyle = base;
  ctx.fillRect(front.x, front.y, front.w, front.h);
  const L = TEMPLATE_Y[d.template];
  if (d.template === "block") {
    const y = front.y + front.h * L.bandTop;
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.moveTo(front.x, y + front.h * 0.02);
    ctx.bezierCurveTo(front.x + front.w * 0.35, y - front.h * 0.03, front.x + front.w * 0.65, y + front.h * 0.04, front.x + front.w, y - front.h * 0.01);
    ctx.lineTo(front.x + front.w, front.y + front.h);
    ctx.lineTo(front.x, front.y + front.h);
    ctx.closePath();
    ctx.fill();
  } else if (d.template === "ribbon") {
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.moveTo(front.x - 4, front.y + front.h * 0.93);
    ctx.lineTo(front.x + front.w + 4, front.y + front.h * 0.78);
    ctx.lineTo(front.x + front.w + 4, front.y + front.h * 0.88);
    ctx.lineTo(front.x - 4, front.y + front.h * 1.03);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = band;
    const c = at(front, 0.5, 0.38);
    const r = front.w * 0.46;
    ctx.beginPath();
    ctx.moveTo(c.x - r, c.y);
    ctx.bezierCurveTo(c.x - r, c.y - r * 1.15, c.x + r * 0.9, c.y - r * 1.25, c.x + r, c.y - r * 0.1);
    ctx.bezierCurveTo(c.x + r * 1.1, c.y + r * 0.9, c.x - r * 0.6, c.y + r * 1.1, c.x - r, c.y);
    ctx.fill();
  }
}

function applyKraft(ctx: Ctx, r: Rect) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.85;
  const pat = ctx.createPattern(kraft(), "repeat");
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  ctx.restore();
}

function drawFront(ctx: Ctx, front: Rect, d: PackDesign): ArtworkMetrics {
  const safe = safeRect(front, d);
  const L = TEMPLATE_Y[d.template];
  const fam = fontFamilyFor(d.typeface);
  const weight = FONT_WEIGHT[d.typeface];

  ctx.save();
  ctx.beginPath();
  ctx.rect(front.x, front.y, front.w, front.h);
  ctx.clip();

  drawFrontBackground(ctx, front, d);
  if (d.finish === "kraft") applyKraft(ctx, front);

  if (d.format === "pouch") {
    crimp(ctx, front, front.y, front.y + front.h * 0.085, d.colors.base);
    // zipper track
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(front.x, front.y + front.h * 0.11, front.w, front.h * 0.006);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(front.x, front.y + front.h * 0.117, front.w, front.h * 0.003);
  } else if (d.format === "sachet") {
    crimp(ctx, front, front.y, front.y + front.h * 0.08, d.colors.base);
    crimp(ctx, front, front.y + front.h * 0.92, front.y + front.h, d.colors.band);
  }

  // artwork elements in stacking order
  const elementBoxes: ArtworkMetrics["elementBoxes"] = [];
  let logoBox: Rect | null = null;
  for (const el of d.elements) {
    drawElement(ctx, el, front, d.logoTone);
    const box = elementBox(el, front);
    elementBoxes.push({ id: el.id, kind: el.kind, box });
    if (el.kind === "logo") logoBox = box;
  }

  /* ---- name: lay out, measure the background behind it, then draw ---- */
  const namePxBase = front.h * 0.072 * d.nameScale;
  const maxW = safe.w * 0.94;
  const name = layoutText(ctx, d.name.toUpperCase(), fam, weight, namePxBase, maxW, 3);
  const nameH = name.lines.length * name.size * 1.02;
  const nameTop = safe.y + safe.h * L.name - nameH / 2;
  const nameBox: Rect | null = d.name.trim()
    ? { x: front.x + front.w / 2 - name.widest / 2, y: nameTop, w: name.widest, h: nameH }
    : null;
  const sample = nameBox ? sampleBackground(ctx, nameBox) : { hex: d.colors.base, busy: 0 };
  const nameContrast = contrastRatio(d.colors.text, sample.hex);

  ctx.fillStyle = d.colors.text;
  ctx.font = `${weight} ${name.size}px ${fam}`;
  textLines(ctx, name.lines, front.x + front.w / 2, nameTop, name.size);

  // flavour (accent colour, below the name)
  const flavourPx = front.h * 0.034;
  ctx.font = `600 ${flavourPx}px ${bodyFamily()}`;
  const flavourY = nameTop + nameH + flavourPx * 0.35;
  const flavourBg = sampleBackground(ctx, { x: front.x + front.w * 0.3, y: flavourY, w: front.w * 0.4, h: flavourPx }).hex;
  ctx.fillStyle = contrastRatio(d.colors.accent, flavourBg) >= 3 ? d.colors.accent : pickReadable(flavourBg);
  textLines(ctx, [d.flavour.toUpperCase()], front.x + front.w / 2, flavourY, flavourPx);

  // tagline (auto-readable colour against what's behind it)
  const taglinePx = front.h * 0.027;
  if (d.tagline.trim()) {
    ctx.font = `600 ${taglinePx}px ${bodyFamily()}`;
    const ty = safe.y + safe.h * L.tagline;
    const bg = sampleBackground(ctx, { x: front.x + front.w * 0.25, y: ty, w: front.w * 0.5, h: taglinePx }).hex;
    ctx.fillStyle = pickReadable(bg);
    // tracked caps; canvas letterSpacing is supported in current Chrome, Safari and Firefox
    const c2 = ctx as Ctx & { letterSpacing?: string };
    c2.letterSpacing = `${(taglinePx * 0.18).toFixed(1)}px`;
    textLines(ctx, wrapLines(ctx, d.tagline.toUpperCase(), safe.w), front.x + front.w / 2, ty, taglinePx);
    c2.letterSpacing = "0px";
  }

  // claims
  if (d.claims.length) {
    const cpx = front.h * (d.claims.length > 3 ? 0.019 : 0.023);
    ctx.font = `700 ${cpx}px ${bodyFamily()}`;
    const label = d.claims.map((c) => c.toUpperCase()).join("  |  ");
    const cy = d.template === "ribbon" ? front.y + front.h * L.claims : safe.y + safe.h * L.claims;
    if (d.template === "ribbon") {
      ctx.save();
      const ang = Math.atan2(-front.h * 0.15, front.w);
      ctx.translate(front.x + front.w / 2, cy);
      ctx.rotate(ang);
      ctx.fillStyle = pickReadable(d.colors.band);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = wrapLines(ctx, label, front.w * 0.92);
      lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 0, (i - (Math.min(2, lines.length) - 1) / 2) * cpx * 1.15));
      ctx.restore();
    } else if (d.template === "window") {
      // pill chips
      ctx.textBaseline = "middle";
      const padX = cpx * 0.7;
      const widths = d.claims.map((c) => ctx.measureText(c.toUpperCase()).width + padX * 2);
      const rows: number[][] = [[]];
      let rowW = 0;
      widths.forEach((w, i) => {
        if (rowW + w > safe.w && rows[rows.length - 1].length) {
          rows.push([]);
          rowW = 0;
        }
        rows[rows.length - 1].push(i);
        rowW += w + cpx * 0.5;
      });
      const pillH = cpx * 1.9;
      rows.forEach((row, ri) => {
        const total = row.reduce((a, i) => a + widths[i], 0) + (row.length - 1) * cpx * 0.5;
        let x = front.x + front.w / 2 - total / 2;
        const y = cy - ((rows.length - 1) * pillH * 1.15) / 2 + ri * pillH * 1.15;
        row.forEach((i) => {
          ctx.fillStyle = d.colors.accent;
          ctx.beginPath();
          ctx.roundRect(x, y - pillH / 2, widths[i], pillH, pillH / 2);
          ctx.fill();
          ctx.fillStyle = pickReadable(d.colors.accent);
          ctx.textAlign = "center";
          ctx.fillText(d.claims[i].toUpperCase(), x + widths[i] / 2, y + cpx * 0.05);
          x += widths[i] + cpx * 0.5;
        });
      });
    } else {
      const bg = sampleBackground(ctx, { x: front.x + front.w * 0.2, y: cy - cpx, w: front.w * 0.6, h: cpx * 2 }).hex;
      ctx.fillStyle = pickReadable(bg);
      const lines = wrapLines(ctx, label, safe.w);
      textLines(ctx, lines.slice(0, 2), front.x + front.w / 2, cy - (lines.length > 1 ? cpx * 1.1 : cpx / 2), cpx, 1.15);
    }
  }

  // veg mark — principal display panel, top-right of the safe area
  if (d.showVegMark) {
    const s = front.w * 0.075;
    vegMark(ctx, safe.x + safe.w - s, safe.y, s);
  }

  // net quantity — bottom-left of the safe area (top-left on the ribbon, which owns the bottom)
  if (d.netQty) {
    const npx = front.h * 0.02;
    ctx.font = `700 ${npx}px ${bodyFamily()}`;
    const ny = d.template === "ribbon" ? safe.y + npx * 0.2 : safe.y + safe.h - npx * 1.3;
    const bg = sampleBackground(ctx, { x: safe.x, y: ny, w: front.w * 0.3, h: npx }).hex;
    ctx.fillStyle = pickReadable(bg);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`NET WT. ${d.netQty.toUpperCase()}`, safe.x, ny);
  }

  ctx.restore();

  return {
    front,
    safe,
    nameBox,
    namePx: name.size,
    flavourPx,
    taglinePx,
    nameContrast,
    nameBackgroundBusy: sample.busy,
    logoBox,
    elementBoxes,
  };
}

/* ── back / sides / tin lid ───────────────────────────────────── */

const CONCEPT_NOTE =
  "Student design concept created in the SkilliZee × Eat Better Co internship. A learning exercise — not an official Eat Better Co product or package.";

function drawBack(ctx: Ctx, r: Rect, d: PackDesign, p: ProductRef) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.fillStyle = d.colors.base;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  if (d.finish === "kraft") applyKraft(ctx, r);
  if (d.format === "pouch") crimp(ctx, r, r.y, r.y + r.h * 0.085, d.colors.base);
  if (d.format === "sachet") {
    crimp(ctx, r, r.y, r.y + r.h * 0.08, d.colors.base);
    crimp(ctx, r, r.y + r.h * 0.92, r.y + r.h, d.colors.base);
    // fin seal down the middle of the back
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(r.x + r.w * 0.47, r.y, r.w * 0.06, r.h);
  }
  const ink = pickReadable(d.colors.base);
  const pad = r.w * 0.1;
  const x = r.x + pad;
  const w = r.w - pad * 2;
  let y = r.y + r.h * (d.format === "tin" ? 0.1 : 0.16);

  // concept banner
  const bh = r.h * 0.05;
  ctx.fillStyle = "#FED300";
  ctx.fillRect(r.x, y, r.w, bh);
  ctx.fillStyle = "#2F1C1A";
  ctx.font = `800 ${bh * 0.5}px ${bodyFamily()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("STUDENT DESIGN CONCEPT", r.x + r.w / 2, y + bh / 2 + 1);
  y += bh * 1.7;

  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const hpx = r.h * 0.04;
  ctx.font = `${FONT_WEIGHT[d.typeface]} ${hpx}px ${fontFamilyFor(d.typeface)}`;
  wrapLines(ctx, d.name.toUpperCase(), w).forEach((l) => {
    ctx.fillText(l, x, y);
    y += hpx * 1.05;
  });
  y += hpx * 0.4;

  const bpx = r.h * 0.022;
  const para = (label: string, text: string) => {
    ctx.font = `800 ${bpx}px ${bodyFamily()}`;
    ctx.fillText(label, x, y);
    y += bpx * 1.35;
    ctx.font = `500 ${bpx}px ${bodyFamily()}`;
    wrapLines(ctx, text, w).forEach((l) => {
      ctx.fillText(l, x, y);
      y += bpx * 1.35;
    });
    y += bpx * 0.8;
  };
  para("WHAT'S INSIDE", p.keyIngredients + ".");
  para("WHY IT'S BETTER", p.claims.join(" · ") + ".");
  ctx.globalAlpha = 0.85;
  para("ABOUT THIS PACK", CONCEPT_NOTE);
  ctx.globalAlpha = 1;

  const lw = Math.min(w * 0.42, r.h * 0.2);
  const logo = logoCanvas(d.logoTone);
  if (logo) ctx.drawImage(logo, x, r.y + r.h * 0.9 - lw * LOGO_ASPECT, lw, lw * LOGO_ASPECT);
  ctx.restore();
}

function drawSide(ctx: Ctx, r: Rect, d: PackDesign) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.fillStyle = d.colors.band;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  if (d.finish === "kraft") applyKraft(ctx, r);
  ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = pickReadable(d.colors.band);
  ctx.font = `${FONT_WEIGHT[d.typeface]} ${r.w * 0.24}px ${fontFamilyFor(d.typeface)}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name.toUpperCase(), 0, -r.w * 0.06, r.h * 0.9);
  ctx.font = `700 ${r.w * 0.08}px ${bodyFamily()}`;
  ctx.fillText("STUDENT DESIGN CONCEPT", 0, r.w * 0.22, r.h * 0.9);
  ctx.restore();
}

function drawLid(ctx: Ctx, r: Rect, d: PackDesign) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.fillStyle = d.colors.base;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  if (d.finish === "kraft") applyKraft(ctx, r);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const isTin = d.format === "tin";
  if (isTin) {
    const R = r.w / 2;
    ctx.fillStyle = d.colors.band;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.98, 0, Math.PI * 2);
    ctx.arc(cx, cy, R * 0.74, 0, Math.PI * 2, true);
    ctx.fill();
    // circular tagline
    const text = ` ${(d.tagline || "Eat what you love").toUpperCase()}  ·  ${d.name.toUpperCase()}  · `;
    ctx.fillStyle = pickReadable(d.colors.band);
    ctx.font = `700 ${R * 0.085}px ${bodyFamily()}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const total = ctx.measureText(text).width;
    const radius = R * 0.86;
    const fit = Math.min(1, (Math.PI * 2 * radius * 0.96) / total);
    let ang = -Math.PI / 2 - ((total * fit) / radius) / 2;
    for (const ch of text) {
      const cw = ctx.measureText(ch).width * fit;
      ang += cw / 2 / radius;
      ctx.save();
      ctx.translate(cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      ang += cw / 2 / radius;
    }
  }
  const lw = r.w * (isTin ? 0.5 : 0.42);
  const logo = logoCanvas(d.logoTone);
  if (logo) ctx.drawImage(logo, cx - lw / 2, cy - (lw * LOGO_ASPECT) / 2, lw, lw * LOGO_ASPECT);
  ctx.restore();
}

function drawTinBand(ctx: Ctx, band: Rect, d: PackDesign) {
  ctx.fillStyle = d.colors.base;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  if (d.finish === "kraft") applyKraft(ctx, band);
  // printed rim stripes
  ctx.fillStyle = d.colors.band;
  ctx.fillRect(band.x, band.y, band.w, band.h * 0.05);
  ctx.fillRect(band.x, band.y + band.h * 0.95, band.w, band.h * 0.05);
  // a quiet repeating motif around the back of the tin
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = pickReadable(d.colors.base);
  for (let i = 0; i < 26; i++) {
    const x = band.x + (i / 26) * band.w;
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc(x + (j % 2) * (band.w / 52), band.y + band.h * (0.2 + j * 0.2), band.h * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ── public API ───────────────────────────────────────────────── */

function drawSelection(ctx: Ctx, box: Rect, front: Rect) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(front.x, front.y, front.w, front.h);
  ctx.clip();
  const pad = front.w * 0.012;
  ctx.lineWidth = Math.max(3, front.w * 0.006);
  ctx.setLineDash([front.w * 0.02, front.w * 0.012]);
  ctx.strokeStyle = "#FF5C00";
  ctx.strokeRect(box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2);
  ctx.setLineDash([]);
  ctx.fillStyle = "#FF5C00";
  const k = front.w * 0.018;
  for (const [cx, cy] of [
    [box.x - pad, box.y - pad],
    [box.x + box.w + pad, box.y - pad],
    [box.x - pad, box.y + box.h + pad],
    [box.x + box.w + pad, box.y + box.h + pad],
  ]) {
    ctx.fillRect(cx - k / 2, cy - k / 2, k, k);
  }
  ctx.restore();
}

export function drawPackArtwork(
  canvas: HTMLCanvasElement,
  d: PackDesign,
  opts: { selectedId?: string | null } = {},
): { atlas: AtlasLayout; metrics: ArtworkMetrics } {
  const atlas = getAtlas(d.format);
  if (canvas.width !== atlas.width) canvas.width = atlas.width;
  if (canvas.height !== atlas.height) canvas.height = atlas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const p = getProduct(d.productId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (d.format === "tin" && atlas.band) {
    drawTinBand(ctx, atlas.band, d);
    drawBack(ctx, atlas.back, d, p);
  } else {
    drawBack(ctx, atlas.back, d, p);
  }
  const metrics = drawFront(ctx, atlas.front, d);
  if (atlas.left) drawSide(ctx, atlas.left, d);
  if (atlas.right) drawSide(ctx, atlas.right, d);
  if (atlas.top) drawLid(ctx, atlas.top, d);
  if (atlas.bottom) {
    ctx.fillStyle = mixHex(d.colors.band, "#000000", 0.1);
    ctx.fillRect(atlas.bottom.x, atlas.bottom.y, atlas.bottom.w, atlas.bottom.h);
  }
  if (atlas.lid) drawLid(ctx, atlas.lid, d);
  if (opts.selectedId) {
    const sel = metrics.elementBoxes.find((e) => e.id === opts.selectedId);
    if (sel) drawSelection(ctx, sel.box, atlas.front);
  }
  return { atlas, metrics };
}

/** Small image of the front panel, used for version thumbnails and exports. */
export function frontThumbnail(source: HTMLCanvasElement, front: Rect, width = 240): string {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = Math.round((width * front.h) / front.w);
  c.getContext("2d")!.drawImage(source, front.x, front.y, front.w, front.h, 0, 0, c.width, c.height);
  return c.toDataURL("image/png");
}

export { hexToRgb };
