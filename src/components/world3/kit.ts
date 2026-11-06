import * as THREE from "three";

/**
 * Shared layout, terrain maths and resources for the Module 3 world ("Value Chain Valley").
 *
 * The valley runs along -z. A two-lane road follows x = 0 (|x| < 3, lanes at x = ±1.4) from the
 * supplier fields (z +16 … -26), over the river bridge (river at z = -34), past the kitchen &
 * production facility (right, x 11–41, z -46 … -64) and the warehouse (right, z -68 … -84), to the
 * customer town (z -88 … -150). The Business Model Canvas terrace lies on the left hillside
 * (x -20 … -37, z -51 … -81). 1 unit = 1 metre.
 */

export const RIVER_Z = -34;
/** BMC terrace: slope angle, foot line and extent */
export const TERRACE = { footX: -20, zc: -66, width: 30, length: 20, theta: Math.atan(0.6) };

export const rng = (seed: number) => {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** smoothstep that also works with e0 > e1 (falling edge) */
export const ss = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function hash(i: number, j: number) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
/** smooth value noise 0..1 */
export function vnoise(x: number, y: number) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j) + (hash(i + 1, j) - hash(i, j)) * u;
  const b = hash(i, j + 1) + (hash(i + 1, j + 1) - hash(i, j + 1)) * u;
  return a + (b - a) * v;
}

/** Ground height of the valley at (x, z). */
export function groundHeight(x: number, z: number) {
  const ax = Math.abs(x);
  // valley walls + far hills
  let h = ss(34, 82, ax) * (11 + 7 * vnoise(x * 0.035 + 3, z * 0.035));
  h += ss(-160, -225, z) * 22;
  h += ss(30, 62, z) * 10;
  // the town hillside (left)
  h += ss(-86, -100, z) * ss(16, 48, -x) * 10;
  // the BMC terrace mound (left): a plane of slope tan(theta), then a plateau
  const mask = ss(-46, -50.5, z) * ss(-86, -81.5, z);
  if (mask > 0) {
    const k = Math.tan(TERRACE.theta);
    const run = TERRACE.length * Math.cos(TERRACE.theta);
    const mound = k * clamp(TERRACE.footX - x, 0, run) + clamp(TERRACE.footX - run - x, 0, 40) * 0.12;
    h = Math.max(h, mound * mask);
  }
  // gentle undulation off the flat valley floor
  h += (vnoise(x * 0.09, z * 0.09) - 0.5) * 1.4 * ss(30, 46, ax);
  // river trench
  h -= 1.75 * (1 - ss(3.2, 6.6, Math.abs(z - RIVER_Z)));
  return h;
}

/** Top of the road surface (raised over the bridge). */
export const roadY = (z: number) => 0.04 + 0.48 * ss(-20.5, -26.5, z) * ss(-47.5, -41.5, z);

/* ── field plots ───────────────────────────────────────────────── */

export type Plot = { x0: number; x1: number; z0: number; z1: number; crop: "bajra" | "ragi" | "stubble" | "yard"; path?: number };
export const PLOTS: Plot[] = [
  { x0: 5, x1: 18, z0: 15, z1: -2, crop: "bajra", path: 11.5 },
  { x0: 20, x1: 33, z0: 15, z1: -2, crop: "ragi" },
  { x0: 5, x1: 18, z0: -4, z1: -25, crop: "ragi", path: 12 },
  { x0: 20, x1: 33, z0: -4, z1: -25, crop: "stubble" },
  { x0: -5, x1: -19, z0: 15, z1: -5, crop: "ragi", path: -12 },
  { x0: -21, x1: -33, z0: 15, z1: -25, crop: "bajra" },
  { x0: -5, x1: -19, z0: -7, z1: -25, crop: "yard" },
];
export const inPlot = (p: Plot, x: number, z: number, pad = 0) =>
  x > Math.min(p.x0, p.x1) - pad && x < Math.max(p.x0, p.x1) + pad && z < Math.max(p.z0, p.z1) + pad && z > Math.min(p.z0, p.z1) - pad;

/** Areas kept free of scattered trees (buildings, fields, road, river). */
export function blocked(x: number, z: number) {
  if (Math.abs(x) < 5.5) return true;
  if (Math.abs(z - RIVER_Z) < 6.5) return true;
  if (PLOTS.some((p) => inPlot(p, x, z, 1.5))) return true;
  if (x > 2 && x < 46 && z < -40 && z > -90) return true; // facility + warehouse
  if (x < -16 && x > -42 && z < -44 && z > -88) return true; // BMC terrace
  if (x > -48 && x < 32 && z < -86 && z > -158) return true; // town
  return false;
}

/* ── shared materials ─────────────────────────────────────────── */

const MATS = new Map<string, THREE.MeshStandardMaterial>();
/** Cached standard material (shared across the world; never disposed). */
export function mat(color: string, roughness = 0.8, metalness = 0, extra?: { emissive?: string; ei?: number; opacity?: number; side?: THREE.Side; flat?: boolean; vc?: boolean }) {
  const k = `${color}|${roughness}|${metalness}|${extra ? JSON.stringify(extra) : ""}`;
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (extra?.emissive) {
      m.emissive = new THREE.Color(extra.emissive);
      m.emissiveIntensity = extra.ei ?? 1;
    }
    if (extra?.opacity !== undefined && extra.opacity < 1) {
      m.transparent = true;
      m.opacity = extra.opacity;
      m.depthWrite = false;
    }
    if (extra?.side !== undefined) m.side = extra.side;
    if (extra?.flat) m.flatShading = true;
    if (extra?.vc) m.vertexColors = true;
    MATS.set(k, m);
  }
  return m;
}

/* ── canvas textures ──────────────────────────────────────────── */

export function fontFamily() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Fit one or more lines of bold text into a box. */
export function drawText(g: CanvasRenderingContext2D, lines: string[], cx: number, cy: number, maxW: number, maxH: number, color: string, weight = 800) {
  let size = Math.min(maxH / (lines.length * 1.15), 200);
  const fam = fontFamily();
  const fits = () => {
    g.font = `${weight} ${size}px ${fam}`;
    return lines.every((l) => g.measureText(l).width <= maxW);
  };
  while (!fits() && size > 8) size -= 2;
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const lh = size * 1.12;
  lines.forEach((l, i) => g.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh + size * 0.04));
}

/** Generic sign texture (rounded panel, bold text). */
export function signTex(text: string, bg = "#2F1C1A", fg = "#FFF5EE", w = 1024, h = 192, border?: string) {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = h * 0.06;
      g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
    }
    drawText(g, text.split("\n"), w / 2, h / 2, w * 0.88, h * 0.78, fg);
  });
}

/** A five-point star path. */
export function star(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  g.closePath();
}

/** Shortest signed angle from a to b. */
export const angleDelta = (a: number, b: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

/** Walk a polyline at distance d (looping). Returns position + heading (rotation.y for a +z-facing model). */
export function along(points: [number, number][], d: number, loop = true) {
  let total = 0;
  const segs: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const l = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    segs.push(l);
    total += l;
  }
  let r = loop ? ((d % total) + total) % total : clamp(d, 0, total);
  for (let i = 0; i < segs.length; i++) {
    if (r <= segs[i] || i === segs.length - 1) {
      const t = segs[i] > 0 ? Math.min(1, r / segs[i]) : 0;
      const [ax, az] = points[i];
      const [bx, bz] = points[i + 1];
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, heading: Math.atan2(bx - ax, bz - az), total };
    }
    r -= segs[i];
  }
  return { x: points[0][0], z: points[0][1], heading: 0, total };
}
