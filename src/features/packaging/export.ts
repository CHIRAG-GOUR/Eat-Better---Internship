"use client";

import { getProduct } from "@/lib/brand";
import { fredoka, figtree } from "@/lib/fonts";
import { drawPackArtwork } from "./art/drawArtwork";
import type { CheckResult } from "./checks";
import { captureRef } from "./three/StudioScene";
import type { PackDesign } from "./types";
import { FORMATS } from "./presets";

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Builds a 1800×1000 PNG: 3D render + flat front panel + brief results + concept disclaimer. */
export async function exportConceptCard(design: PackDesign, checks: CheckResult[]) {
  const W = 1800;
  const H = 1000;
  const card = document.createElement("canvas");
  card.width = W;
  card.height = H;
  const g = card.getContext("2d")!;
  const display = fredoka.style.fontFamily;
  const body = figtree.style.fontFamily;
  const p = getProduct(design.productId);

  g.fillStyle = "#FFF5EE";
  g.fillRect(0, 0, W, H);

  // 3D render (cover-fit into the left square)
  const shotUrl = captureRef.current?.();
  const shot = shotUrl ? await loadImage(shotUrl) : null;
  if (shot) {
    const box = 1000;
    const s = Math.max(box / shot.width, box / shot.height);
    const sw = box / s;
    const sh = box / s;
    g.drawImage(shot, (shot.width - sw) / 2, (shot.height - sh) / 2, sw, sh, 0, 0, box, box);
  }

  // clean artwork (no selection outline)
  const art = document.createElement("canvas");
  const { atlas } = drawPackArtwork(art, design);
  const f = atlas.front;
  const fh = 520;
  const fw = (fh * f.w) / f.h;
  const x0 = 1060;
  g.fillStyle = "#FF5C00";
  g.font = `800 22px ${body}`;
  g.fillText("STUDENT PACKAGING CONCEPT", x0, 78);
  g.fillStyle = "#2F1C1A";
  g.font = `600 52px ${display}`;
  g.fillText(design.name || p.name, x0, 136, 700);
  g.font = `500 24px ${body}`;
  g.fillStyle = "#4A3230";
  g.fillText(`${FORMATS[design.format].label} · for ${p.name} (Eat Better Co)`, x0, 176, 700);

  g.save();
  g.shadowColor = "rgba(47,28,26,0.25)";
  g.shadowBlur = 30;
  g.shadowOffsetY = 12;
  g.drawImage(art, f.x, f.y, f.w, f.h, x0, 220, fw, fh);
  g.restore();

  // brief results
  let y = 240;
  const cx = x0 + fw + 40;
  g.font = `800 18px ${body}`;
  g.fillStyle = "#FF5C00";
  g.fillText("BRIEF CHECKS", cx, y);
  y += 34;
  for (const c of checks) {
    g.fillStyle = c.pass ? "#00A341" : "#F83A3A";
    g.beginPath();
    g.arc(cx + 10, y - 7, 10, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2F1C1A";
    g.font = `600 22px ${body}`;
    g.fillText(c.title, cx + 30, y, W - cx - 60);
    y += 44;
  }

  g.fillStyle = "#2F1C1A";
  g.fillRect(0, H - 80, W, 80);
  g.fillStyle = "#FFF5EE";
  g.font = `500 21px ${body}`;
  g.fillText(
    "A learning exercise from the SkilliZee × Eat Better Co internship — not an official Eat Better Co product or package.",
    40,
    H - 32,
    W - 80,
  );

  const url = card.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `concept-${p.id}-${design.format}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
