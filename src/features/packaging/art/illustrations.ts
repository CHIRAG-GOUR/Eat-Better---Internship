import type { ElementKind } from "../types";

/** Deterministic PRNG so an element always draws identically for a given id. */
export function seeded(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

/** Height/width ratio of each illustration's bounding box. */
export const ELEMENT_ASPECT: Record<Exclude<ElementKind, "logo">, number> = {
  laddoo: 1,
  hazelnut: 1.05,
  almond: 0.62,
  mint: 0.62,
  chilli: 0.42,
  bhujia: 0.62,
  millet: 0.7,
  marigold: 1,
};

function shadow(ctx: Ctx, s: number) {
  ctx.shadowColor = "rgba(30,12,6,0.35)";
  ctx.shadowBlur = s * 0.08;
  ctx.shadowOffsetY = s * 0.04;
}
function noShadow(ctx: Ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawLaddoo(ctx: Ctx, s: number, rnd: () => number) {
  const r = s / 2;
  shadow(ctx, s);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, "#8a5a3a");
  g.addColorStop(0.55, "#5a3322");
  g.addColorStop(1, "#2e170e");
  ctx.fillStyle = g;
  ctx.beginPath();
  // slightly irregular hand-rolled outline
  const pts = 28;
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = r * (0.96 + rnd() * 0.06);
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  noShadow(ctx);
  // nut & seed specks
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.88;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const k = rnd();
    ctx.fillStyle = k < 0.45 ? "#c99668" : k < 0.75 ? "#e8c9a0" : "#1d0f09";
    ctx.beginPath();
    ctx.ellipse(x, y, r * (0.02 + rnd() * 0.05), r * (0.015 + rnd() * 0.03), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // soft highlight
  const hl = ctx.createRadialGradient(-r * 0.35, -r * 0.45, 0, -r * 0.35, -r * 0.45, r * 0.6);
  hl.addColorStop(0, "rgba(255,230,200,0.35)");
  hl.addColorStop(1, "rgba(255,230,200,0)");
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawHazelnut(ctx: Ctx, s: number) {
  const w = s / 2;
  const h = (s * ELEMENT_ASPECT.hazelnut) / 2;
  shadow(ctx, s);
  const g = ctx.createRadialGradient(-w * 0.3, -h * 0.1, w * 0.1, 0, h * 0.1, w * 1.1);
  g.addColorStop(0, "#c98a4b");
  g.addColorStop(0.7, "#8f5326");
  g.addColorStop(1, "#5a3014");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.bezierCurveTo(w * 0.9, -h * 0.75, w, h * 0.55, 0, h);
  ctx.bezierCurveTo(-w, h * 0.55, -w * 0.9, -h * 0.75, 0, -h);
  ctx.fill();
  noShadow(ctx);
  // pale cap
  ctx.fillStyle = "#e3c39a";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.62, w * 0.62, h * 0.32, 0, Math.PI * 1.05, Math.PI * 1.95, true);
  ctx.fill();
  ctx.strokeStyle = "rgba(60,30,10,0.35)";
  ctx.lineWidth = s * 0.012;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * w * 0.18, -h * 0.85);
    ctx.quadraticCurveTo(i * w * 0.32, 0, i * w * 0.2, h * 0.4);
    ctx.stroke();
  }
}

function drawAlmond(ctx: Ctx, s: number) {
  const w = s / 2;
  const h = (s * ELEMENT_ASPECT.almond) / 2;
  shadow(ctx, s);
  const g = ctx.createLinearGradient(-w, -h, w, h);
  g.addColorStop(0, "#c88a52");
  g.addColorStop(0.6, "#9c5e2c");
  g.addColorStop(1, "#6e3c18");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.bezierCurveTo(-w * 0.4, -h * 1.15, w * 0.55, -h * 0.9, w, 0);
  ctx.bezierCurveTo(w * 0.55, h * 0.9, -w * 0.4, h * 1.15, -w, 0);
  ctx.fill();
  noShadow(ctx);
  ctx.strokeStyle = "rgba(70,35,12,0.4)";
  ctx.lineWidth = s * 0.01;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.75, i * h * 0.1);
    ctx.quadraticCurveTo(0, i * h * 0.28, w * 0.8, i * h * 0.05);
    ctx.stroke();
  }
}

function drawMint(ctx: Ctx, s: number) {
  const w = s / 2;
  const h = (s * ELEMENT_ASPECT.mint) / 2;
  shadow(ctx, s);
  const g = ctx.createLinearGradient(-w, 0, w, 0);
  g.addColorStop(0, "#2f7a35");
  g.addColorStop(1, "#5fae46");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.bezierCurveTo(-w * 0.4, -h * 1.3, w * 0.6, -h, w, 0);
  ctx.bezierCurveTo(w * 0.6, h, -w * 0.4, h * 1.3, -w, 0);
  ctx.fill();
  noShadow(ctx);
  ctx.strokeStyle = "rgba(220,255,200,0.55)";
  ctx.lineWidth = s * 0.018;
  ctx.beginPath();
  ctx.moveTo(-w * 0.95, 0);
  ctx.quadraticCurveTo(0, -h * 0.08, w * 0.9, 0);
  ctx.stroke();
  ctx.lineWidth = s * 0.01;
  for (let i = 1; i <= 4; i++) {
    const x = -w + (i / 5) * w * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + w * 0.22, -h * 0.55);
    ctx.moveTo(x, 0);
    ctx.lineTo(x + w * 0.22, h * 0.55);
    ctx.stroke();
  }
}

function drawChilli(ctx: Ctx, s: number) {
  const w = s / 2;
  const h = (s * ELEMENT_ASPECT.chilli) / 2;
  shadow(ctx, s);
  const g = ctx.createLinearGradient(0, -h, 0, h);
  g.addColorStop(0, "#ff4a2a");
  g.addColorStop(1, "#b3150b");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w * 0.72, -h * 0.35);
  ctx.bezierCurveTo(-w * 0.1, -h * 0.9, w * 0.5, -h * 0.2, w, h * 0.85);
  ctx.bezierCurveTo(w * 0.35, h * 0.35, -w * 0.2, h * 0.5, -w * 0.72, h * 0.2);
  ctx.closePath();
  ctx.fill();
  noShadow(ctx);
  ctx.fillStyle = "#3d7a2a";
  ctx.beginPath();
  ctx.ellipse(-w * 0.76, -h * 0.08, w * 0.1, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3d7a2a";
  ctx.lineWidth = s * 0.03;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-w * 0.8, -h * 0.1);
  ctx.quadraticCurveTo(-w * 0.98, -h * 0.3, -w * 0.95, -h * 0.85);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,220,200,0.55)";
  ctx.lineWidth = s * 0.015;
  ctx.beginPath();
  ctx.moveTo(-w * 0.45, -h * 0.35);
  ctx.quadraticCurveTo(w * 0.1, -h * 0.5, w * 0.6, h * 0.2);
  ctx.stroke();
}

function drawBhujia(ctx: Ctx, s: number, rnd: () => number) {
  const w = s / 2;
  const h = (s * ELEMENT_ASPECT.bhujia) / 2;
  ctx.lineCap = "round";
  // shadow mound
  const sg = ctx.createRadialGradient(0, h * 0.55, 0, 0, h * 0.55, w);
  sg.addColorStop(0, "rgba(40,20,5,0.35)");
  sg.addColorStop(1, "rgba(40,20,5,0)");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.6, w, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  const tones = ["#d8902a", "#e9a83a", "#c27a1c", "#f2c060", "#b86c18"];
  for (let i = 0; i < 260; i++) {
    const t = rnd();
    // strands piled into a dome
    const x0 = (rnd() * 2 - 1) * w * 0.92;
    const dome = Math.sqrt(Math.max(0, 1 - (x0 / w) ** 2));
    const y0 = h * 0.75 - rnd() * dome * h * 1.55;
    const len = s * (0.06 + rnd() * 0.1);
    const a = rnd() * Math.PI * 2;
    ctx.strokeStyle = tones[Math.floor(t * tones.length)];
    ctx.lineWidth = s * (0.008 + rnd() * 0.006);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(
      x0 + Math.cos(a + 1) * len * 0.6,
      y0 + Math.sin(a + 1) * len * 0.6,
      x0 + Math.cos(a) * len,
      y0 + Math.sin(a) * len,
    );
    ctx.stroke();
  }
}

function drawMillet(ctx: Ctx, s: number, rnd: () => number) {
  const w = s / 2;
  const h = (s * ELEMENT_ASPECT.millet) / 2;
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd());
    const x = Math.cos(a) * d * w * 0.95;
    const y = Math.sin(a) * d * h * 0.95;
    const r = s * (0.022 + rnd() * 0.012);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    g.addColorStop(0, "#fff0b8");
    g.addColorStop(1, rnd() < 0.5 ? "#d9a441" : "#c58b2b");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMarigold(ctx: Ctx, s: number, rnd: () => number) {
  const r = s / 2;
  shadow(ctx, s);
  for (let ring = 0; ring < 4; ring++) {
    const rr = r * (1 - ring * 0.2);
    const n = 22 - ring * 3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.4 + rnd() * 0.08;
      ctx.fillStyle = ring % 2 ? "#ff9a12" : "#f57c00";
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * rr * 0.62, Math.sin(a) * rr * 0.62, rr * 0.36, rr * 0.2, a, 0, Math.PI * 2);
      ctx.fill();
    }
    noShadow(ctx);
  }
  ctx.fillStyle = "#c25400";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

export function drawIllustration(ctx: Ctx, kind: Exclude<ElementKind, "logo">, size: number, seed: string) {
  const rnd = seeded(seed);
  ctx.save();
  switch (kind) {
    case "laddoo":
      drawLaddoo(ctx, size, rnd);
      break;
    case "hazelnut":
      drawHazelnut(ctx, size);
      break;
    case "almond":
      drawAlmond(ctx, size);
      break;
    case "mint":
      drawMint(ctx, size);
      break;
    case "chilli":
      drawChilli(ctx, size);
      break;
    case "bhujia":
      drawBhujia(ctx, size, rnd);
      break;
    case "millet":
      drawMillet(ctx, size, rnd);
      break;
    case "marigold":
      drawMarigold(ctx, size, rnd);
      break;
  }
  ctx.restore();
}
