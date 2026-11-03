import type { CategoryId, Format } from "../../content";

/** Shared pack-art drawing for the 3D pack and the report. A student design exercise, clearly labelled. */
export type PackArt = {
  name: string;
  color: string;
  namePos: "top" | "middle" | "bottom";
  claims: string[];
  category: CategoryId | null;
  format: Format;
  ingredientColors: string[];
};

let logoImg: HTMLImageElement | null = null;
let logoReady = false;
const waiters: (() => void)[] = [];
/** Load the official logo once; resolves when it can be drawn. */
export function onLogo(cb: () => void) {
  if (typeof window === "undefined") return;
  if (logoReady) return cb();
  waiters.push(cb);
  if (!logoImg) {
    logoImg = new Image();
    logoImg.onload = () => {
      logoReady = true;
      waiters.splice(0).forEach((f) => f());
    };
    logoImg.src = "/brand/eat-better-logo.svg";
  }
}

function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function font() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (g.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/** Draws the pack front onto a canvas (w×h). */
export function drawPack(c: HTMLCanvasElement, a: PackArt) {
  const g = c.getContext("2d")!;
  const W = c.width;
  const H = c.height;
  const dark = lum(a.color) < 0.55;
  const ink = dark ? "#FFF5EE" : "#2F1C1A";
  const fam = font();
  g.clearRect(0, 0, W, H);
  g.fillStyle = a.color;
  g.fillRect(0, 0, W, H);
  // soft diagonal texture
  g.globalAlpha = 0.08;
  g.fillStyle = dark ? "#FFFFFF" : "#2F1C1A";
  for (let i = -H; i < W; i += 46) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 18, 0);
    g.lineTo(i + 18 + H, H);
    g.lineTo(i + H, H);
    g.fill();
  }
  g.globalAlpha = 1;

  // layout: wide box faces get a horizontal layout, pouches/sachets a vertical one
  const wide = W > H;
  const L = wide
    ? {
        bh: H * 0.2,
        bwMax: W * 0.4,
        bx: () => W * 0.05,
        by: H * 0.07,
        cx: W * 0.76,
        cy: H * 0.48,
        r: H * 0.27,
        tx: W * 0.31,
        tw: W * 0.52,
        ny: a.namePos === "top" ? H * 0.42 : a.namePos === "middle" ? H * 0.53 : H * 0.66,
        size: H * 0.13,
        cTop: H * 0.86,
        cFont: H * 0.045,
        ch: H * 0.075,
        cw: W * 0.58,
      }
    : {
        bh: H * 0.16,
        bwMax: W * 0.62,
        bx: (bw: number) => (W - bw) / 2,
        by: H * 0.045,
        cx: W / 2,
        cy: a.namePos === "top" ? H * 0.56 : a.namePos === "middle" ? H * 0.67 : H * 0.4,
        r: Math.min(W, H) * 0.17,
        tx: W / 2,
        tw: W * 0.84,
        ny: a.namePos === "top" ? H * 0.3 : a.namePos === "middle" ? H * 0.45 : H * 0.7,
        size: W * 0.12,
        cTop: H * 0.875,
        cFont: W * 0.042,
        ch: W * 0.07,
        cw: W * 0.9,
      };

  // logo badge
  const bh = L.bh;
  const bw = Math.min(bh / 0.46, L.bwMax);
  const bx = L.bx(bw);
  g.fillStyle = "#FFF5EE";
  g.beginPath();
  g.roundRect(bx, L.by, bw, bh, bh * 0.22);
  g.fill();
  if (logoImg && logoReady) {
    const lw = Math.min(bw * 0.82, (bh * 0.8 * 83) / 40);
    g.drawImage(logoImg, bx + (bw - lw) / 2, L.by + (bh - lw * (40 / 83)) / 2, lw, lw * (40 / 83));
  }

  // product visual: a circle "window" showing the concept
  const { cx, cy, r } = L;
  g.fillStyle = dark ? "rgba(255,245,238,0.92)" : "rgba(255,255,255,0.75)";
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  const cols = a.ingredientColors.length ? a.ingredientColors : ["#B07A47"];
  for (let i = 0; i < 26; i++) {
    const ang = i * 2.399;
    const rr = Math.sqrt(i / 26) * r * 0.78;
    const x = cx + Math.cos(ang) * rr;
    const y = cy + Math.sin(ang) * rr;
    g.fillStyle = cols[i % cols.length];
    g.beginPath();
    if (a.category === "namkeens") g.ellipse(x, y, r * 0.16, r * 0.05, ang, 0, Math.PI * 2);
    else if (a.category === "laddoos") g.arc(x, y, r * 0.13, 0, Math.PI * 2);
    else g.ellipse(x, y, r * 0.11, r * 0.07, ang, 0, Math.PI * 2);
    g.fill();
  }

  // name
  const name = (a.name || "Your product").toUpperCase();
  let size = Math.round(L.size);
  g.font = `800 ${size}px ${fam}`;
  let lines = wrap(g, name, L.tw);
  while ((lines.length > 2 || lines.some((l) => g.measureText(l).width > L.tw)) && size > L.size * 0.55) {
    size -= 3;
    g.font = `800 ${size}px ${fam}`;
    lines = wrap(g, name, L.tw);
  }
  g.fillStyle = ink;
  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((l, i) => g.fillText(l, L.tx, L.ny + (i - (lines.length - 1) / 2) * size * 1.05, L.tw));

  // claims
  const claims = a.claims.slice(0, 3);
  g.font = `700 ${Math.round(L.cFont)}px ${fam}`;
  const pad = L.cFont * 1.2;
  const gap = L.cFont * 0.5;
  const rows: string[][] = [[]];
  let rowW = 0;
  claims.forEach((t) => {
    const w = g.measureText(t).width + pad;
    if (rowW + w > L.cw && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push(t);
    rowW += w + gap;
  });
  const ch = L.ch;
  rows.forEach((row, ri) => {
    const total = row.reduce((sum, t) => sum + g.measureText(t).width + pad, 0) + gap * (row.length - 1);
    let x = L.tx - total / 2;
    const y = L.cTop - (rows.length - 1) * (ch + gap) + ri * (ch + gap) - ch / 2;
    row.forEach((t) => {
      const w = g.measureText(t).width + pad;
      g.fillStyle = dark ? "#FED300" : "#2F1C1A";
      g.beginPath();
      g.roundRect(x, y, w, ch, ch / 2);
      g.fill();
      g.fillStyle = dark ? "#2F1C1A" : "#FFF5EE";
      g.fillText(t, x + w / 2, y + ch / 2 + 1);
      x += w + gap;
    });
  });

  // design-exercise strip
  g.fillStyle = "rgba(47,28,26,0.85)";
  g.fillRect(0, H - H * 0.045, W, H * 0.045);
  g.fillStyle = "#FFF5EE";
  g.font = `700 ${Math.round(H * 0.024)}px ${fam}`;
  g.fillText("STUDENT CONCEPT · DESIGN EXERCISE", W / 2, H - H * 0.0225, W * 0.94);
}

export function packCanvasSize(format: Format) {
  if (format === "box") return { w: 900, h: 600 };
  if (format === "sachet") return { w: 420, h: 760 };
  return { w: 620, h: 780 };
}
