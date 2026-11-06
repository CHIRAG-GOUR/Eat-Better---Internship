"use client";
/* eslint-disable react-hooks/immutability -- three.js textures are animated inside useFrame by design */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { blocked, canvasTexture, groundHeight, mat, PLOTS, inPlot, rng, RIVER_Z, roadY, ss, TERRACE, vnoise } from "./kit";
import { Instanced, type Inst } from "./parts";

/* ── sky ──────────────────────────────────────────────────────── */

export function Sky({ top, horizon, low }: { top: string; horizon: string; low: string }) {
  const tex = useMemo(
    () =>
      canvasTexture(4, 512, (g) => {
        const grd = g.createLinearGradient(0, 0, 0, 512);
        grd.addColorStop(0, top);
        grd.addColorStop(0.42, top);
        grd.addColorStop(0.52, horizon);
        grd.addColorStop(1, low);
        g.fillStyle = grd;
        g.fillRect(0, 0, 4, 512);
      }),
    [top, horizon, low],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[270, 32, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

/** Soft cumulus puffs high over the valley (not fogged). */
export function Clouds({ tint, compact }: { tint: string; compact: boolean }) {
  const items = useMemo(() => {
    const r = rng(77);
    const out: Inst[] = [];
    const n = compact ? 7 : 12;
    for (let k = 0; k < n; k++) {
      const cx = (r() - 0.5) * 300;
      const cz = 20 - r() * 260;
      const cy = 55 + r() * 30;
      const puffs = 4 + Math.floor(r() * 3);
      for (let i = 0; i < puffs; i++) {
        const s = 6 + r() * 7;
        out.push({ p: [cx + (i - puffs / 2) * 6 + r() * 3, cy + r() * 3, cz + (r() - 0.5) * 6], s: [s * 1.4, s * 0.55, s] });
      }
    }
    return out;
  }, [compact]);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 14, 10), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: tint, fog: false, transparent: true, opacity: 0.85, depthWrite: false }), [tint]);
  useEffect(
    () => () => {
      geo.dispose();
      material.dispose();
    },
    [geo, material],
  );
  return <Instanced geometry={geo} material={material} items={items} />;
}

/** Layered hill silhouettes beyond the valley, tinted towards the horizon (aerial perspective). */
export function FarHills({ near, far }: { near: string; far: string }) {
  const geo = useMemo(() => new THREE.ConeGeometry(1, 1, 7, 1), []);
  const [a, b] = useMemo(() => {
    const r = rng(404);
    const ring = (n: number, rad: number, hMin: number, hMax: number) =>
      Array.from({ length: n }, (_, i): Inst => {
        const ang = (i / n) * Math.PI * 2 + r() * 0.2;
        const w = 40 + r() * 50;
        return { p: [Math.sin(ang) * rad, -2, -70 + Math.cos(ang) * rad * 1.15], r: [0, r() * 3, 0], s: [w, hMin + r() * (hMax - hMin), w * 0.8] };
      });
    return [ring(26, 175, 22, 40), ring(22, 220, 38, 62)];
  }, []);
  const mNear = useMemo(() => new THREE.MeshBasicMaterial({ color: near, fog: false }), [near]);
  const mFar = useMemo(() => new THREE.MeshBasicMaterial({ color: far, fog: false }), [far]);
  useEffect(
    () => () => {
      geo.dispose();
      mNear.dispose();
      mFar.dispose();
    },
    [geo, mNear, mFar],
  );
  return (
    <group>
      <Instanced geometry={geo} material={mFar} items={b} />
      <Instanced geometry={geo} material={mNear} items={a} />
    </group>
  );
}

/* ── ground ───────────────────────────────────────────────────── */

const C = (h: string) => new THREE.Color(h);
const PAL = {
  grass: C("#7FA04B"),
  dry: C("#B3A562"),
  hill: C("#8E975A"),
  rock: C("#A39176"),
  soil: C("#7C5B3C"),
  soilWet: C("#6A4B31"),
  stubble: C("#C9AA6A"),
  yard: C("#BDA27C"),
  dust: C("#B69D78"),
  sand: C("#C6B088"),
  bed: C("#7D6F57"),
  terrace: C("#86A452"),
};

export function Ground({ compact }: { compact: boolean }) {
  const geo = useMemo(() => {
    const W = 260;
    const L = 320;
    const g = new THREE.PlaneGeometry(W, L, compact ? 120 : 200, compact ? 150 : 250);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -100);
    const p = g.attributes.position;
    const cols = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const h = groundHeight(x, z);
      p.setY(i, h);
      const n = vnoise(x * 0.06, z * 0.06);
      const n2 = vnoise(x * 0.31 + 9, z * 0.31);
      c.copy(PAL.grass).lerp(PAL.dry, ss(0.35, 0.8, n) * 0.85);
      // hills: olive scrub with rocky patches
      const hill = ss(1.2, 5, h) * (Math.abs(x) > 30 || z < -150 ? 1 : 0.4);
      c.lerp(PAL.hill, hill * 0.7);
      c.lerp(PAL.rock, hill * ss(0.62, 0.8, n2) * 0.8);
      // terrace mound gets well-kept grass
      if (x < -18 && x > -42 && z < -46 && z > -86) c.lerp(PAL.terrace, 0.6 * ss(0.5, 2, h));
      // dusty verges along the road + town lanes
      const ax = Math.abs(x);
      c.lerp(PAL.dust, ss(6.5, 3.5, ax) * 0.9);
      if (z < -86 && z > -156) c.lerp(PAL.dust, 0.35);
      // field plots
      for (const pl of PLOTS) {
        if (!inPlot(pl, x, z, 0.4)) continue;
        if (pl.crop === "stubble") c.copy(PAL.stubble).lerp(PAL.soil, n2 * 0.35);
        else if (pl.crop === "yard") c.copy(PAL.yard).lerp(PAL.dust, n2 * 0.5);
        else c.copy(PAL.soil).lerp(PAL.soilWet, n2 * 0.6);
      }
      // river banks
      const d = Math.abs(z - RIVER_Z);
      if (d < 8) {
        c.lerp(PAL.sand, ss(7.5, 5.2, d) * 0.85);
        c.lerp(PAL.bed, ss(-0.4, -1.4, h));
      }
      // tiny brightness jitter so big areas are not flat
      c.multiplyScalar(0.94 + n2 * 0.12);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, [compact]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={mat("#FFFFFF", 0.97, 0, { vc: true })} receiveShadow />;
}

/** The river: a moving ripple texture on a water plane in the trench. */
export function River() {
  const tex = useMemo(() => {
    const t = canvasTexture(256, 256, (g) => {
      g.fillStyle = "#5E9AAE";
      g.fillRect(0, 0, 256, 256);
      const r = rng(5);
      for (let i = 0; i < 160; i++) {
        g.strokeStyle = `rgba(255,255,255,${0.08 + r() * 0.18})`;
        g.lineWidth = 1 + r() * 2;
        const x = r() * 256;
        const y = r() * 256;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 12, y - 3, x + 24 + r() * 20, y);
        g.stroke();
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(40, 2);
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame((_, dt) => {
    tex.offset.x -= dt * 0.03;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, RIVER_Z]}>
      <planeGeometry args={[260, 11]} />
      <meshStandardMaterial map={tex} color="#BFE3EC" roughness={0.12} metalness={0.25} />
    </mesh>
  );
}

/* ── the road + bridge ────────────────────────────────────────── */

export function Road() {
  const tex = useMemo(() => {
    const t = canvasTexture(256, 512, (g) => {
      g.fillStyle = "#6E6A66";
      g.fillRect(0, 0, 256, 512);
      const r = rng(11);
      for (let i = 0; i < 3000; i++) {
        const v = r() > 0.5 ? 255 : 0;
        g.fillStyle = `rgba(${v},${v},${v},0.05)`;
        g.fillRect(r() * 256, r() * 512, 2, 2);
      }
      g.fillStyle = "#EDE6D3";
      g.fillRect(8, 0, 6, 512);
      g.fillRect(242, 0, 6, 512);
      g.fillStyle = "#F2D16B";
      g.fillRect(124, 40, 8, 170);
      g.fillRect(124, 296, 8, 170);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 36);
    return t;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(6, 220, 1, 220);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -70);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, roadY(p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(
    () => () => {
      tex.dispose();
      geo.dispose();
    },
    [tex, geo],
  );
  const stone = mat("#B9AE9C", 0.9);
  const concrete = mat("#C9C3B8", 0.85);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.93} />
      </mesh>
      {/* bridge deck, parapets and piers */}
      <mesh position={[0, 0.12, RIVER_Z]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[6.8, 0.7, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 3.25, 0.82, RIVER_Z]} material={stone} castShadow>
            <boxGeometry args={[0.32, 0.62, 16]} />
          </mesh>
          {[-6, -2, 2, 6].map((dz) => (
            <mesh key={dz} position={[s * 3.25, 1.2, RIVER_Z + dz]} material={concrete}>
              <boxGeometry args={[0.42, 0.16, 0.42]} />
            </mesh>
          ))}
        </group>
      ))}
      {[-2.6, 2.6].map((dz) =>
        [-2, 2].map((x) => (
          <mesh key={`${dz}${x}`} position={[x, -1.0, RIVER_Z + dz]} material={stone} castShadow>
            <cylinderGeometry args={[0.55, 0.7, 2.2, 14]} />
          </mesh>
        )),
      )}
    </group>
  );
}

/* ── trees, shrubs, reeds ─────────────────────────────────────── */

export function Vegetation({ compact }: { compact: boolean }) {
  const geos = useMemo(
    () => ({
      trunk: new THREE.CylinderGeometry(0.12, 0.2, 1, 7),
      neem: new THREE.IcosahedronGeometry(1, 1),
      khejri: new THREE.SphereGeometry(1, 9, 6),
      shrub: new THREE.IcosahedronGeometry(1, 0),
      reed: new THREE.ConeGeometry(0.06, 1, 4),
    }),
    [],
  );
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  const sets = useMemo(() => {
    const r = rng(2027);
    const trunks: Inst[] = [];
    const neem: Inst[] = [];
    const khejri: Inst[] = [];
    const shrubs: Inst[] = [];
    const reeds: Inst[] = [];
    const greens = ["#5F8A3A", "#6C9442", "#557F35", "#78994A"];
    const tree = (x: number, z: number, scale: number) => {
      const y = groundHeight(x, z);
      const h = (2.6 + r() * 1.6) * scale;
      trunks.push({ p: [x, y + h / 2 - 0.1, z], s: [scale, h, scale], r: [0, 0, (r() - 0.5) * 0.12] });
      if (r() > 0.4) neem.push({ p: [x, y + h + 0.9 * scale, z], s: [2 * scale, 1.55 * scale, 2 * scale], r: [0, r() * 3, 0], c: greens[Math.floor(r() * 4)] });
      else khejri.push({ p: [x, y + h + 0.3 * scale, z], s: [2.6 * scale, 0.75 * scale, 2.4 * scale], r: [0, r() * 3, 0], c: greens[Math.floor(r() * 4)] });
    };
    // scattered over the valley + hills
    const n = compact ? 150 : 340;
    let tries = 0;
    while (trunks.length < n && tries++ < n * 12) {
      const x = (r() - 0.5) * 220;
      const z = 34 - r() * 220;
      if (blocked(x, z)) continue;
      // fewer trees on the open floor, more on the hills
      const onHill = Math.abs(x) > 34 || z < -160;
      if (!onHill && r() > 0.35) continue;
      tree(x, z, 0.8 + r() * 0.6);
    }
    // field-edge rows
    for (const z of [17.5, -27.5]) for (let x = 7; x < 36; x += compact ? 7 : 4.5) tree((z > 0 ? 1 : -1) * 0 + x * (r() > 0.5 ? 1 : -1), z + (r() - 0.5), 0.9 + r() * 0.3);
    // town street trees
    for (const [x, z] of [
      [6.6, -100.5],
      [-7.2, -99.5],
      [-7.4, -110],
      [11, -125.5],
      [-17, -134],
      [26, -126],
      [-16.5, -90.5],
    ] as [number, number][])
      tree(x, z, 0.95);
    // shrubs
    const sN = compact ? 120 : 320;
    tries = 0;
    while (shrubs.length < sN && tries++ < sN * 10) {
      const x = (r() - 0.5) * 200;
      const z = 30 - r() * 200;
      if (blocked(x, z) && !(Math.abs(x) > 4 && Math.abs(x) < 6.2 && Math.abs(z - RIVER_Z) > 9 && (z > -42 || z < -90))) continue;
      const s = 0.35 + r() * 0.6;
      shrubs.push({ p: [x, groundHeight(x, z) + s * 0.5, z], s: [s * 1.3, s, s * 1.2], r: [0, r() * 3, 0], c: greens[Math.floor(r() * 4)] });
    }
    // reeds along the river banks
    const rN = compact ? 90 : 240;
    for (let i = 0; i < rN; i++) {
      const x = (r() - 0.5) * 120;
      if (Math.abs(x) < 4.5) continue;
      const side = r() > 0.5 ? 1 : -1;
      const z = RIVER_Z + side * (4.6 + r() * 1.2);
      const h = 0.7 + r() * 0.9;
      reeds.push({ p: [x, groundHeight(x, z) + h / 2 - 0.05, z], s: [1, h, 1], r: [(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3], c: r() > 0.5 ? "#6F8F3E" : "#9AA053" });
    }
    return { trunks, neem, khejri, shrubs, reeds };
  }, [compact]);
  const leaf = mat("#FFFFFF", 0.88, 0, { flat: true });
  return (
    <group>
      <Instanced geometry={geos.trunk} material={mat("#6B4A30", 0.9)} items={sets.trunks} castShadow={!compact} />
      <Instanced geometry={geos.neem} material={leaf} items={sets.neem} castShadow={!compact} />
      <Instanced geometry={geos.khejri} material={leaf} items={sets.khejri} castShadow={!compact} />
      <Instanced geometry={geos.shrub} material={leaf} items={sets.shrubs} />
      <Instanced geometry={geos.reed} material={mat("#FFFFFF", 0.9)} items={sets.reeds} />
    </group>
  );
}

/** Terrace foot retaining wall so the canvas hill reads as built, not floating. */
export function TerraceWall() {
  return (
    <mesh position={[TERRACE.footX + 0.15, 0.2, TERRACE.zc]} material={mat("#B7A47F", 0.9)} receiveShadow>
      <boxGeometry args={[0.5, 0.5, TERRACE.width + 1.5]} />
    </mesh>
  );
}
