"use client";
 

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Human, type HumanLook } from "@/components/world2/Human";
import { Hoverable } from "@/components/world/hover";
import { angleDelta, mat, PLOTS, rng, signTex } from "./kit";
import { Instanced, Near, SACK, Walker, Wheel, Worker, type Inst } from "./parts";

/* ── crop clumps (one merged, vertex-coloured geometry per crop) ── */

function painted(g: THREE.BufferGeometry, hex: string) {
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    a[i * 3] = c.r;
    a[i * 3 + 1] = c.g;
    a[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(a, 3));
  g.deleteAttribute("uv");
  return g;
}

function leafBlade(len: number, wid: number, tilt: number, yaw: number, y: number, hex: string) {
  const g = new THREE.PlaneGeometry(wid, len, 1, 2);
  // bend the blade outwards
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) + len / 2) / len;
    p.setZ(i, t * t * len * 0.35);
  }
  g.translate(0, len / 2, 0);
  g.rotateX(-tilt);
  g.rotateY(yaw);
  g.translate(0, y, 0);
  return painted(g.toNonIndexed(), hex);
}

/** Pearl millet (bajra): tall stalks with golden candle-shaped heads. */
function bajraGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const r = rng(9);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const ox = Math.cos(a) * 0.07;
    const oz = Math.sin(a) * 0.07;
    const h = 1.35 + r() * 0.3;
    const lean = (r() - 0.5) * 0.12;
    const stalk = new THREE.CylinderGeometry(0.012, 0.018, h, 4, 1);
    stalk.translate(0, h / 2, 0);
    stalk.rotateZ(lean);
    stalk.translate(ox, 0, oz);
    parts.push(painted(stalk.toNonIndexed(), "#6E8B3A"));
    const head = new THREE.CapsuleGeometry(0.032, 0.24, 2, 6);
    head.translate(0, h + 0.14, 0);
    head.rotateZ(lean);
    head.translate(ox, 0, oz);
    parts.push(painted(head.toNonIndexed(), k === 1 ? "#B98E4E" : "#C9A15C"));
  }
  for (let k = 0; k < 4; k++) parts.push(leafBlade(0.75, 0.07, 0.75 + k * 0.08, (k / 4) * Math.PI * 2 + 0.4, 0.25 + k * 0.18, k % 2 ? "#7FA046" : "#6F9440"));
  const g = mergeGeometries(parts)!;
  g.computeVertexNormals();
  parts.forEach((p) => p.dispose());
  return g;
}

/** Finger millet (ragi): low leafy clump with brown finger-like heads. */
function ragiGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) parts.push(leafBlade(0.55, 0.06, 0.55 + (k % 3) * 0.2, (k / 6) * Math.PI * 2, 0.02, k % 2 ? "#5E8A3A" : "#6E9A44"));
  for (let s = 0; s < 2; s++) {
    const ox = s ? 0.05 : -0.05;
    const h = 0.62 + s * 0.08;
    const stalk = new THREE.CylinderGeometry(0.01, 0.014, h, 4, 1);
    stalk.translate(ox, h / 2, 0);
    parts.push(painted(stalk.toNonIndexed(), "#6B8A3C"));
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.CapsuleGeometry(0.016, 0.1, 2, 5);
      finger.translate(0, 0.06, 0);
      finger.rotateZ(0.55);
      finger.rotateY((f / 4) * Math.PI * 2 + s);
      finger.translate(ox, h, 0);
      parts.push(painted(finger.toNonIndexed(), f % 2 ? "#7A4A2C" : "#8A5634"));
    }
  }
  const g = mergeGeometries(parts)!;
  g.computeVertexNormals();
  parts.forEach((p) => p.dispose());
  return g;
}

export function Crops({ compact }: { compact: boolean }) {
  const geos = useMemo(() => ({ bajra: bajraGeometry(), ragi: ragiGeometry(), bund: new THREE.BoxGeometry(1, 1, 1), stack: new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55) }), []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  const sets = useMemo(() => {
    const r = rng(31);
    const bajra: Inst[] = [];
    const ragi: Inst[] = [];
    const bunds: Inst[] = [];
    const stacks: Inst[] = [];
    const rowGap = compact ? 1.7 : 1.15;
    for (const p of PLOTS) {
      const x0 = Math.min(p.x0, p.x1);
      const x1 = Math.max(p.x0, p.x1);
      const z0 = Math.max(p.z0, p.z1);
      const z1 = Math.min(p.z0, p.z1);
      // mud bunds around each plot
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      bunds.push({ p: [cx, 0.08, z0 + 0.6], s: [x1 - x0 + 1.4, 0.24, 0.45] }, { p: [cx, 0.08, z1 - 0.6], s: [x1 - x0 + 1.4, 0.24, 0.45] });
      bunds.push({ p: [x0 - 0.6, 0.08, cz], s: [0.45, 0.24, z0 - z1 + 1.4] }, { p: [x1 + 0.6, 0.08, cz], s: [0.45, 0.24, z0 - z1 + 1.4] });
      if (p.crop === "stubble") {
        for (let i = 0; i < (compact ? 5 : 9); i++) {
          const x = x0 + 2 + r() * (x1 - x0 - 4);
          const z = z1 + 2 + r() * (z0 - z1 - 4);
          if (Math.abs(x - 27) < 2.5) continue; // tractor lane
          const s = 0.9 + r() * 0.4;
          stacks.push({ p: [x, -0.05, z], s: [1.2 * s, 1.9 * s, 1.2 * s], r: [0, r() * 3, 0], c: r() > 0.5 ? "#D8B562" : "#CBA552" });
        }
        continue;
      }
      if (p.crop === "yard") continue;
      const list = p.crop === "bajra" ? bajra : ragi;
      const step = p.crop === "bajra" ? (compact ? 0.95 : 0.62) : compact ? 0.8 : 0.5;
      for (let x = x0 + 0.4; x <= x1 - 0.3; x += rowGap) {
        if (p.path !== undefined && Math.abs(x - p.path) < 0.75) continue; // walking path between rows
        for (let z = z1 + 0.3; z <= z0 - 0.3; z += step) {
          const s = 0.85 + r() * 0.3;
          list.push({ p: [x + (r() - 0.5) * 0.18, 0, z + (r() - 0.5) * 0.15], r: [(r() - 0.5) * 0.1, r() * 6.28, (r() - 0.5) * 0.1], s });
        }
      }
    }
    return { bajra, ragi, bunds, stacks };
  }, [compact]);
  const veg = mat("#FFFFFF", 0.85, 0, { vc: true, side: THREE.DoubleSide });
  return (
    <group>
      <Hoverable label="Supplier farms: millet and ragi, the raw ingredients (Key Partners)">
        <Instanced geometry={geos.bajra} material={veg} items={sets.bajra} castShadow={!compact} />
        <Instanced geometry={geos.ragi} material={veg} items={sets.ragi} />
      </Hoverable>
      <Instanced geometry={geos.bund} material={mat("#8C7350", 0.95)} items={sets.bunds} receiveShadow />
      <Instanced geometry={geos.stack} material={mat("#FFFFFF", 0.95)} items={sets.stacks} castShadow={!compact} />
    </group>
  );
}

/* ── collection shed ──────────────────────────────────────────── */

export function CollectionShed({ compact }: { compact: boolean }) {
  const sign = useMemo(() => signTex("COLLECTION CENTRE", "#2E5E3A", "#FFF5EE", 1024, 160), []);
  const roofTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 8;
    const g = c.getContext("2d")!;
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? "#9AA3A6" : "#B9C1C3";
      g.fillRect(i * 8, 0, 8, 8);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(10, 1);
    return t;
  }, []);
  useEffect(
    () => () => {
      sign.dispose();
      roofTex.dispose();
    },
    [sign, roofTex],
  );
  const sacks = useMemo(() => {
    const out: Inst[] = [];
    const r = rng(3);
    // a stacked pile inside the shed (x -14..-9, z -15..-19)
    for (let l = 0; l < 3; l++)
      for (let i = 0; i < 4 - l; i++)
        for (let j = 0; j < 3; j++) out.push({ p: [-14.2 + i * 0.95 + l * 0.45, 0.45 + l * 0.42, -18.4 + j * 0.62], s: [0.46, 0.24, 0.3], r: [0, (r() - 0.5) * 0.3, 0], c: r() > 0.3 ? "#C9A66B" : "#D8BC86" });
    // sacks waiting by the track
    for (let i = 0; i < (compact ? 3 : 6); i++) out.push({ p: [-8.6 + (i % 3) * 0.75, 0.24 + Math.floor(i / 3) * 0.42, -13.2 - (i % 2) * 0.2], s: [0.46, 0.24, 0.3], r: [0, r(), 0], c: "#C9A66B" });
    return out;
  }, [compact]);
  const post = mat("#5A5048", 0.6, 0.4);
  return (
    <Hoverable label="Collection centre: sacks of millet weighed and graded before they go to the kitchen">
      <group>
        {/* floor slab */}
        <mesh position={[-12, 0.1, -17]} material={mat("#C8C2B6", 0.9)} receiveShadow>
          <boxGeometry args={[8, 0.2, 6]} />
        </mesh>
        {[-15.8, -12, -8.2].flatMap((x) =>
          [-14.2, -19.8].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 1.75, z]} material={post} castShadow>
              <boxGeometry args={[0.16, 3.3, 0.16]} />
            </mesh>
          )),
        )}
        {/* back wall (half-height brick) */}
        <mesh position={[-15.8, 0.9, -17]} material={mat("#B5654A", 0.9)} castShadow>
          <boxGeometry args={[0.25, 1.6, 5.6]} />
        </mesh>
        {/* corrugated roof, sloping to the back */}
        <mesh position={[-12, 3.5, -17]} rotation={[0, 0, 0.12]} castShadow>
          <boxGeometry args={[8.6, 0.08, 6.6]} />
          <meshStandardMaterial map={roofTex} roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[-8.12, 3.0, -17]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[4.2, 0.62]} />
          <meshStandardMaterial map={sign} roughness={0.7} />
        </mesh>
        <mesh position={[-8.18, 3.0, -17]} material={mat("#2E5E3A", 0.7)}>
          <boxGeometry args={[0.08, 0.7, 4.3]} />
        </mesh>
        <Instanced geometry={SACK} material={mat("#FFFFFF", 0.95)} items={sacks} castShadow={!compact} />
        {/* platform weighing scale */}
        <group position={[-10.2, 0.2, -15.4]}>
          <mesh material={mat("#3C4A57", 0.5, 0.5)} position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.9, 0.12, 0.7]} />
          </mesh>
          <mesh material={mat("#3C4A57", 0.5, 0.5)} position={[0, 0.6, -0.32]}>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
          </mesh>
          <mesh material={mat("#F4F1EA", 0.4)} position={[0, 1.1, -0.3]}>
            <boxGeometry args={[0.36, 0.26, 0.1]} />
          </mesh>
        </group>
      </group>
    </Hoverable>
  );
}

/* ── bullock cart ─────────────────────────────────────────────── */

function Ox({ phase, reduced }: { phase: number; reduced: boolean }) {
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime + phase;
    if (head.current) head.current.rotation.x = Math.sin(t * 0.7) * 0.08 + 0.1;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 1.6) * 0.25;
  });
  const hide = mat("#E7E1D6", 0.85);
  const shade = mat("#CFC6B8", 0.85);
  const horn = mat("#4A3B2E", 0.6);
  return (
    <group>
      <mesh material={hide} position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.92]} castShadow>
        <capsuleGeometry args={[0.36, 0.95, 6, 14]} />
      </mesh>
      {/* hump + dewlap */}
      <mesh material={hide} position={[0, 1.42, 0.42]} scale={[0.26, 0.24, 0.3]}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      <mesh material={shade} position={[0, 0.82, 0.62]} scale={[0.12, 0.26, 0.28]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {[-0.2, 0.2].flatMap((x) =>
        [0.5, -0.5].map((z) => (
          <mesh key={`${x}${z}`} material={shade} position={[x, 0.42, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.055, 0.86, 8]} />
          </mesh>
        )),
      )}
      <group ref={head} position={[0, 1.28, 0.86]}>
        <mesh material={hide} position={[0, -0.06, 0.2]} rotation={[0.5, 0, 0]} scale={[0.18, 0.2, 0.34]} castShadow>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        <mesh material={mat("#3E3530", 0.6)} position={[0, -0.2, 0.48]} scale={[0.13, 0.1, 0.08]}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={horn} position={[s * 0.12, 0.16, 0.1]} rotation={[0.2, 0, s * -0.5]}>
            <coneGeometry args={[0.035, 0.32, 8]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`e${s}`} material={shade} position={[s * 0.18, 0.02, 0.08]} rotation={[0, 0, s * 1.2]} scale={[0.04, 0.1, 0.06]}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        ))}
      </group>
      <mesh ref={tail} material={shade} position={[0, 1.0, -0.82]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
      </mesh>
    </group>
  );
}

const CARTER: HumanLook = { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "kurta", top: "#F1ECE2", bottom: "#EDE6D8", facial: "moustache" };

/** Bullock cart loaded with sacks, parked on the farm track. Faces +z. */
export function BullockCart({ reduced }: { reduced: boolean }) {
  const wood = mat("#7A5233", 0.85);
  const sacks = useMemo<Inst[]>(
    () => [
      { p: [-0.35, 1.25, -0.6], s: [0.46, 0.24, 0.3], r: [0, 0.2, 0], c: "#C9A66B" },
      { p: [0.35, 1.25, -0.6], s: [0.46, 0.24, 0.3], r: [0, -0.1, 0], c: "#D8BC86" },
      { p: [-0.35, 1.25, -1.3], s: [0.46, 0.24, 0.3], c: "#C9A66B" },
      { p: [0.35, 1.25, -1.3], s: [0.46, 0.24, 0.3], r: [0, 0.3, 0], c: "#C9A66B" },
      { p: [0, 1.65, -0.95], s: [0.46, 0.24, 0.3], r: [0, 1.4, 0], c: "#D8BC86" },
    ],
    [],
  );
  return (
    <Hoverable label="Bullock cart bringing grain from the farm (ingredient supply)">
      <group>
        {[-0.75, 0.75].map((x, i) => (
          <group key={x} position={[x, 0, 2.3]}>
            <Ox phase={i * 1.7} reduced={reduced} />
          </group>
        ))}
        {/* yoke + shafts */}
        <mesh material={wood} position={[0, 1.5, 2.85]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 2.3, 8]} />
        </mesh>
        <mesh material={wood} position={[0, 1.15, 1.4]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 3.2, 8]} />
        </mesh>
        {/* cart bed + side rails */}
        <mesh material={wood} position={[0, 0.98, -0.9]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.12, 2.2]} />
        </mesh>
        {[-0.72, 0.72].map((x) => (
          <mesh key={x} material={wood} position={[x, 1.2, -0.9]}>
            <boxGeometry args={[0.06, 0.32, 2.2]} />
          </mesh>
        ))}
        <Instanced geometry={SACK} material={mat("#FFFFFF", 0.95)} items={sacks} castShadow />
        {/* big wooden wheels */}
        {[-0.92, 0.92].map((x) => (
          <group key={x} position={[x, 0.78, -0.9]}>
            <mesh material={wood} rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.72, 0.06, 8, 28]} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <mesh key={k} material={wood} rotation={[(k / 6) * Math.PI, 0, 0]}>
                <boxGeometry args={[0.05, 1.42, 0.06]} />
              </mesh>
            ))}
            <mesh material={mat("#4A3424", 0.8)} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.2, 10]} />
            </mesh>
          </group>
        ))}
        {/* driver sitting at the front of the bed */}
        <group position={[0, 0.13, 0.0]}>
          <Human look={CARTER} mode="drive" />
        </group>
      </group>
    </Hoverable>
  );
}

/* ── tractor (ploughing the harvested plot) ───────────────────── */

const TRACTOR_DRIVER: HumanLook = { skin: "#A06A44", hair: "#1E1410", hairStyle: "short", outfit: "shirt", top: "#5D7A99", bottom: "#3B3B3B", accent: "#4D6A88", facial: "moustache" };

function TractorBody({ spin }: { spin: React.RefObject<number> }) {
  const paint = mat("#B8322A", 0.35, 0.3);
  const dark = mat("#2A2827", 0.6, 0.4);
  return (
    <group>
      {[-0.82, 0.82].map((x) => (
        <group key={x} position={[x, 0.78, -0.55]}>
          <Wheel r={0.78} w={0.42} spin={spin} />
        </group>
      ))}
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.42, 1.45]}>
          <Wheel r={0.42} w={0.22} spin={spin} />
        </group>
      ))}
      {/* chassis + hood + grille */}
      <RoundedBox args={[0.82, 0.72, 2.1]} radius={0.1} position={[0, 0.98, 0.75]} material={paint} castShadow />
      <mesh position={[0, 0.95, 1.81]} material={mat("#3A3A3A", 0.5, 0.5)}>
        <boxGeometry args={[0.66, 0.5, 0.04]} />
      </mesh>
      {[-0.26, 0.26].map((x) => (
        <mesh key={x} position={[x, 1.2, 1.82]} material={mat("#FFF3C4", 0.3, 0, { emissive: "#FFE08A", ei: 0.4 })}>
          <circleGeometry args={[0.07, 12]} />
        </mesh>
      ))}
      {/* exhaust */}
      <mesh position={[0.3, 1.75, 1.2]} material={dark}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
      </mesh>
      {/* mudguards over the rear wheels */}
      {[-0.82, 0.82].map((x) => (
        <mesh key={x} position={[x, 1.25, -0.55]} rotation={[0, Math.PI / 2, 0]} material={paint} castShadow>
          <torusGeometry args={[0.86, 0.05, 6, 16, Math.PI]} />
        </mesh>
      ))}
      {[-0.82, 0.82].map((x) => (
        <mesh key={`f${x}`} position={[x, 1.66, -0.55]} material={paint}>
          <boxGeometry args={[0.44, 0.05, 1.2]} />
        </mesh>
      ))}
      {/* seat, steering */}
      <mesh position={[0, 1.36, -0.65]} material={dark}>
        <boxGeometry args={[0.5, 0.1, 0.45]} />
      </mesh>
      <mesh position={[0, 1.66, 0.1]} rotation={[-0.9, 0, 0]} material={dark}>
        <torusGeometry args={[0.18, 0.02, 6, 16]} />
      </mesh>
      <mesh position={[0, 1.45, 0.2]} rotation={[-0.6, 0, 0]} material={dark}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
      </mesh>
      <group position={[0, 0.5, -0.55]}>
        <Human look={TRACTOR_DRIVER} mode="drive" />
      </group>
      {/* plough frame at the back */}
      <mesh position={[0, 0.4, -1.55]} material={dark}>
        <boxGeometry args={[1.6, 0.12, 0.2]} />
      </mesh>
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.22, -1.62]} rotation={[0.5, 0, 0]} material={mat("#8B8F93", 0.4, 0.7)}>
          <boxGeometry args={[0.08, 0.4, 0.14]} />
        </mesh>
      ))}
    </group>
  );
}

export function Tractor({ reduced }: { reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const heading = useRef(Math.PI);
  useFrame(({ clock }, dt) => {
    const grp = g.current;
    if (!grp) return;
    const a = -6;
    const b = -23;
    const len = Math.abs(b - a);
    const cyc = reduced ? 0.4 : ((clock.elapsedTime * 1.6) / len) % 2;
    const f = cyc < 1 ? cyc : 2 - cyc;
    grp.position.set(27, 0, a + (b - a) * f);
    const goal = cyc < 1 ? Math.PI : 0;
    heading.current += angleDelta(heading.current, goal) * Math.min(1, dt * 2.5);
    grp.rotation.y = heading.current;
    if (!reduced) spin.current += (1.6 / 0.78) * dt;
  });
  return (
    <Hoverable label="Tractor ploughing a harvested plot on a supplier farm">
      <group ref={g}>
        <TractorBody spin={spin} />
      </group>
    </Hoverable>
  );
}

/* ── farm people ──────────────────────────────────────────────── */

const FARM: Record<string, HumanLook> = {
  walkerA: { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "kurta", top: "#F3EEE4", bottom: "#E9E1D2", facial: "moustache" },
  walkerB: { skin: "#9C6644", hair: "#140C08", hairStyle: "braid", outfit: "saree", top: "#C2551B", bottom: "#C2551B", accent: "#F2B33A", bindi: true, slim: true, height: 0.95 },
  shed: { skin: "#7E5034", hair: "#BDB5AC", hairStyle: "short", outfit: "kurta", top: "#F4F0E8", bottom: "#F4F0E8", facial: "beard" },
  buyer: { skin: "#B07A4E", hair: "#1E1410", hairStyle: "side", outfit: "shirt", top: "#7FA3C4", bottom: "#3B3B3B", accent: "#E8EEF4", glasses: "#2A2A2A", bag: { kind: "shoulder", color: "#5A3B28" } },
  field: { skin: "#94603E", hair: "#140C08", hairStyle: "long", outfit: "salwar", top: "#2E8B57", bottom: "#E9D9BD", accent: "#F2C14E", bindi: true, slim: true, height: 0.94 },
};

export function FarmLife({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  return (
    <>
      <Near at={[10, 4]} r={70}>
        <Walker look={FARM.walkerA} a={[11.5, 13]} b={[11.5, -1]} speed={0.9} reduced={reduced} y={0} />
        {!compact && <Walker look={FARM.walkerB} a={[-12, 13.5]} b={[-12, -3.5]} speed={0.8} phase={0.6} reduced={reduced} y={0} />}
        {!compact && <Worker look={FARM.field} at={[12, -9]} face={-0.6} reduced={reduced} y={0} phase={2} />}
      </Near>
      <Near at={[-10, -15]} r={70}>
        <Worker look={FARM.shed} at={[-10.4, -12.6]} face={2.2} headwear="turban" hwColor="#E0582B" reduced={reduced} y={0.2} />
        {!compact && <Worker look={FARM.buyer} at={[-9.4, -14.5]} face={-1.2} reduced={reduced} y={0.2} phase={1} />}
        <group position={[-6.3, 0, -9.5]} rotation={[0, Math.PI / 2 + 0.25, 0]}>
          <BullockCart reduced={reduced} />
        </group>
      </Near>
      <Near at={[27, -14]} r={80}>
        <Tractor reduced={reduced} />
      </Near>
    </>
  );
}
