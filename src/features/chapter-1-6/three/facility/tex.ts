import * as THREE from "three";

export function brandFont() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

export type Line = { text: string; size: number; color: string; y: number; weight?: number; x?: number; align?: CanvasTextAlign };

/** Canvas texture with lines of text (brand font). */
export function textTexture(w: number, h: number, bg: string, lines: Line[], border?: string) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border) {
    g.strokeStyle = border;
    g.lineWidth = Math.max(6, h * 0.04);
    g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
  }
  const fam = brandFont();
  g.textBaseline = "middle";
  for (const l of lines) {
    g.fillStyle = l.color;
    g.textAlign = l.align ?? "center";
    g.font = `${l.weight ?? 800} ${l.size}px ${fam}`;
    g.fillText(l.text, l.x ?? w / 2, l.y, w * 0.94);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function epoxyTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#BFC6C0";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${90 + ((i * 37) % 60)},${100 + ((i * 53) % 50)},${95 + ((i * 29) % 50)},0.08)`;
    g.fillRect((i * 97) % 256, (i * 61) % 256, 2, 2);
  }
  g.strokeStyle = "rgba(60,70,65,0.12)";
  g.lineWidth = 2;
  g.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 6);
  t.anisotropy = 8;
  return t;
}

export function stripeTexture(a: string, b: string, n = 8) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 32;
  const g = c.getContext("2d")!;
  const w = 256 / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? a : b;
    g.beginPath();
    g.moveTo(i * w, 0);
    g.lineTo(i * w + w, 0);
    g.lineTo(i * w + w - 10, 32);
    g.lineTo(i * w - 10, 32);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
