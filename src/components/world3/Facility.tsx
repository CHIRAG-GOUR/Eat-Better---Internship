"use client";
 

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { HumanLook } from "@/components/world2/Human";
import { Hoverable } from "@/components/world/hover";
import { canvasTexture, mat, rng, signTex } from "./kit";
import { Instanced, useTex, Near, Worker, type Inst } from "./parts";

/**
 * The kitchen & production facility (x 11–41, z -46 … -64) and the warehouse (x 11–35, z -68 … -84).
 * Kitchen visibility: the front (+z) and road-side (-x) walls are glass, so the small-batch kettles,
 * quality lab and packing line are visible from the road. Generic signage only.
 */

const F = { x0: 11, x1: 41, z0: -46, z1: -64, floor: 0.3, top: 6.8 };

const glassMat = new THREE.MeshStandardMaterial({ color: "#CFE7EE", roughness: 0.04, metalness: 0.15, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
const steel = mat("#C9CED3", 0.22, 0.88);
const frame = mat("#3E4447", 0.45, 0.6);
const white = mat("#F2F1EC", 0.7);
const cream = mat("#F6F1E7", 0.8);

/** A sign panel facing +z (rotate the group to turn it). */
function Sign({ tex, w, h, position, rotation = 0 }: { tex: THREE.Texture; w: number; h: number; position: [number, number, number]; rotation?: number }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.12} />
    </mesh>
  );
}

/* ── small-batch kettle ───────────────────────────────────────── */

function Kettle({ position, reduced, phase }: { position: [number, number, number]; reduced: boolean; phase: number }) {
  const stir = useRef<THREE.Group>(null);
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (reduced) return;
    if (stir.current) stir.current.rotation.y += dt * 1.2;
    if (steam.current)
      steam.current.children.forEach((c, i) => {
        const t = (clock.elapsedTime * 0.35 + phase + i / 3) % 1;
        c.position.y = 2.0 + t * 1.6;
        c.scale.setScalar(0.25 + t * 0.55);
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - t);
      });
  });
  const steamMats = useMemo(() => [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.2, depthWrite: false })), []);
  useEffect(() => () => steamMats.forEach((m) => m.dispose()), [steamMats]);
  return (
    <group position={position}>
      {/* legs */}
      {[0, 1, 2].map((k) => (
        <mesh key={k} material={steel} position={[Math.sin((k / 3) * 6.28) * 0.55, 0.38, Math.cos((k / 3) * 6.28) * 0.55]}>
          <cylinderGeometry args={[0.035, 0.035, 0.76, 8]} />
        </mesh>
      ))}
      {/* bowl: cylinder + rounded bottom + rim */}
      <mesh material={steel} position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.85, 28, 1, true]} />
      </mesh>
      <mesh material={steel} position={[0, 0.96, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.72, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={steel} position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.035, 8, 32]} />
      </mesh>
      {/* the batch inside (golden-brown) */}
      <mesh material={mat("#B5762F", 0.7)} position={[0, 1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.69, 28]} />
      </mesh>
      {/* gantry + motor + stirrer */}
      <mesh material={frame} position={[0, 1.6, -0.95]}>
        <boxGeometry args={[0.12, 3.2, 0.12]} />
      </mesh>
      <mesh material={frame} position={[0, 3.1, -0.48]}>
        <boxGeometry args={[0.12, 0.12, 1.05]} />
      </mesh>
      <RoundedBox args={[0.36, 0.42, 0.36]} radius={0.05} position={[0, 2.85, 0]} material={mat("#2F6B4F", 0.45, 0.3)} />
      <group ref={stir} position={[0, 2.2, 0]}>
        <mesh material={steel} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
        </mesh>
        <mesh material={steel} position={[0.25, -0.55, 0]}>
          <boxGeometry args={[0.55, 0.08, 0.03]} />
        </mesh>
      </group>
      {/* control box */}
      <RoundedBox args={[0.32, 0.4, 0.14]} radius={0.03} position={[0.75, 1.3, 0.35]} rotation={[0, 0.8, 0]} material={mat("#E8E6E1", 0.5)} />
      <mesh position={[0.83, 1.38, 0.43]} rotation={[0, 0.8, 0]} material={mat("#2ECC71", 0.4, 0, { emissive: "#2ECC71", ei: 1.4 })}>
        <circleGeometry args={[0.03, 10]} />
      </mesh>
      <group ref={steam}>
        {steamMats.map((m, i) => (
          <mesh key={i} material={m} position={[0.1 * i - 0.1, 2.2, 0]}>
            <sphereGeometry args={[0.5, 10, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── packing line ─────────────────────────────────────────────── */

const LINE = { x: 13.3, za: -47.8, zb: -59.2, y: 1.05 };

function PackingLine({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const pouches = useRef<THREE.InstancedMesh>(null);
  const n = compact ? 10 : 18;
  const pouchGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.26, 0.34, 0.08, 1, 1, 1);
    return g;
  }, []);
  const pouchMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.45 }), []);
  useEffect(
    () => () => {
      pouchGeo.dispose();
      pouchMat.dispose();
    },
    [pouchGeo, pouchMat],
  );
  const cols = useMemo(() => ["#FF5C00", "#550D10", "#F2B33A", "#2E7D6B"], []);
  useEffect(() => {
    const m = pouches.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) m.setColorAt(i, c.set(cols[i % cols.length]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [n, cols]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = pouches.current;
    if (!m) return;
    const len = LINE.za - LINE.zb;
    for (let i = 0; i < n; i++) {
      const d = ((reduced ? 0 : clock.elapsedTime * 0.7) + (i * len) / n) % len;
      o.position.set(LINE.x, LINE.y + 0.2, LINE.za - d);
      o.rotation.set(0, Math.PI / 2, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  const len = LINE.za - LINE.zb;
  const zc = (LINE.za + LINE.zb) / 2;
  return (
    <group>
      {/* frame, belt, rails, legs */}
      <mesh material={frame} position={[LINE.x, LINE.y - 0.12, zc]} castShadow>
        <boxGeometry args={[0.9, 0.18, len]} />
      </mesh>
      <mesh material={mat("#2B2B2B", 0.7)} position={[LINE.x, LINE.y, zc]}>
        <boxGeometry args={[0.72, 0.05, len]} />
      </mesh>
      {[-0.43, 0.43].map((dx) => (
        <mesh key={dx} material={steel} position={[LINE.x + dx, LINE.y + 0.08, zc]}>
          <boxGeometry args={[0.05, 0.1, len]} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => LINE.za - 0.4 - (i * (len - 0.8)) / 5).map((z) => (
        <mesh key={z} material={frame} position={[LINE.x, (LINE.y + 0.3) / 2, z]}>
          <boxGeometry args={[0.7, LINE.y - 0.3, 0.07]} />
        </mesh>
      ))}
      <instancedMesh ref={pouches} args={[pouchGeo, pouchMat, n]} castShadow />
      {/* sealing / check-weigher arch */}
      <group position={[LINE.x, LINE.y, -52.4]}>
        <RoundedBox args={[1.2, 1.0, 0.9]} radius={0.06} position={[0, 0.85, 0]} material={mat("#E6E8EA", 0.4, 0.4)} castShadow />
        <mesh position={[0.61, 0.95, 0]} rotation={[0, Math.PI / 2, 0]} material={mat("#1F3A4D", 0.3, 0, { emissive: "#3FA9F5", ei: 0.7 })}>
          <planeGeometry args={[0.5, 0.32]} />
        </mesh>
      </group>
      {/* filled cartons waiting at the end of the line */}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <mesh key={k} material={mat(k % 3 === 2 ? "#E07A3F" : "#B98A5A", 0.85)} position={[LINE.x + (k % 2 ? 0.32 : -0.32), F.floor + 0.32 + Math.floor(k / 2) * 0.62, -60.4]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.7]} />
        </mesh>
      ))}
    </group>
  );
}

/* ── quality lab ──────────────────────────────────────────────── */

function Lab() {
  const flasks = useMemo<Inst[]>(() => {
    const r = rng(8);
    return Array.from({ length: 9 }, (_, i) => ({ p: [32.6 + i * 0.85, 1.32, -48.9 + (r() - 0.5) * 0.3], s: [1, 0.8 + r() * 0.6, 1], c: ["#9ED8E8", "#F3C26B", "#BFE3B4"][i % 3] }));
  }, []);
  const flaskGeo = useMemo(() => new THREE.CylinderGeometry(0.07, 0.11, 0.3, 10), []);
  useEffect(() => () => flaskGeo.dispose(), [flaskGeo]);
  return (
    <group>
      {/* island bench + back bench */}
      <mesh material={white} position={[36, 0.75, -48.9]} castShadow>
        <boxGeometry args={[8, 0.9, 1.0]} />
      </mesh>
      <mesh material={mat("#DADDE0", 0.3)} position={[36, 1.22, -48.9]}>
        <boxGeometry args={[8.1, 0.05, 1.1]} />
      </mesh>
      <mesh material={white} position={[36, 0.75, -52.4]}>
        <boxGeometry args={[9, 0.9, 0.8]} />
      </mesh>
      <Instanced geometry={flaskGeo} material={mat("#FFFFFF", 0.1, 0.1, { opacity: 0.85 })} items={flasks} />
      {/* microscope + monitor on the island */}
      <group position={[38.8, 1.25, -48.9]}>
        <mesh material={mat("#2B2F33", 0.4, 0.4)} position={[0, 0.06, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
        </mesh>
        <mesh material={mat("#2B2F33", 0.4, 0.4)} position={[0, 0.3, -0.08]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.5, 8]} />
        </mesh>
      </group>
      <group position={[34, 1.25, -52.4]}>
        <mesh material={mat("#22262A", 0.4)} position={[0, 0.35, 0]}>
          <boxGeometry args={[0.9, 0.55, 0.05]} />
        </mesh>
        <mesh material={mat("#16324A", 0.3, 0, { emissive: "#4DA3FF", ei: 0.6 })} position={[0, 0.35, 0.03]}>
          <planeGeometry args={[0.82, 0.47]} />
        </mesh>
      </group>
      {/* sample shelves on the back wall */}
      {[2.2, 3.0].map((y) => (
        <mesh key={y} material={white} position={[36, y, -52.85]}>
          <boxGeometry args={[8, 0.06, 0.4]} />
        </mesh>
      ))}
      {/* glass partitions of the lab */}
      <mesh material={glassMat} position={[31.05, 3.0, -49.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7, 5.4]} />
      </mesh>
      <mesh material={glassMat} position={[36, 3.0, -53.05]}>
        <planeGeometry args={[10, 5.4]} />
      </mesh>
    </group>
  );
}

/* ── people inside ────────────────────────────────────────────── */

const STAFF: HumanLook[] = [
  { skin: "#B5764A", hair: "#140C08", hairStyle: "bun", outfit: "kurta", top: "#FAFAF7", bottom: "#C9CDD1", slim: true, height: 0.95 },
  { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "kurta", top: "#FAFAF7", bottom: "#C9CDD1", facial: "moustache" },
  { skin: "#C68B59", hair: "#1E1410", hairStyle: "short", outfit: "kurta", top: "#FAFAF7", bottom: "#4A4E55" },
  { skin: "#9C6644", hair: "#140C08", hairStyle: "long", outfit: "kurta", top: "#FAFAF7", bottom: "#C9CDD1", glasses: "#2A2A2A", slim: true, height: 0.94 },
  { skin: "#A86F45", hair: "#1A110C", hairStyle: "side", outfit: "tshirt", top: "#2E7D6B", bottom: "#3B3B3B", facial: "stubble" },
  { skin: "#D1A276", hair: "#2A1A12", hairStyle: "bun", outfit: "kurta", top: "#FAFAF7", bottom: "#4A4E55", slim: true, height: 0.95 },
];

/* ── the building ─────────────────────────────────────────────── */

export function Facility({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const brand = useTex(() => signTex("EAT BETTER CO", "#FFF5EE", "#FF5C00", 1536, 220));
  const kitchen = useTex(() => signTex("OPEN KITCHEN  ·  SMALL BATCHES", "#2F1C1A", "#FFF5EE", 1536, 160));
  const labSign = useTex(() => signTex("QUALITY LAB", "#2E7D6B", "#FFFFFF", 1024, 200));
  const packSign = useTex(() => signTex("PACKING  ·  DISPATCH", "#2F1C1A", "#FED300", 1536, 200));
  const solar = useTex(() =>
    canvasTexture(128, 192, (g) => {
      g.fillStyle = "#1C2C4A";
      g.fillRect(0, 0, 128, 192);
      g.strokeStyle = "#7F95B5";
      g.lineWidth = 2;
      for (let x = 0; x <= 128; x += 21.3) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 192);
        g.stroke();
      }
      for (let y = 0; y <= 192; y += 21.3) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(128, y);
        g.stroke();
      }
      g.strokeStyle = "#C8CDD3";
      g.lineWidth = 6;
      g.strokeRect(0, 0, 128, 192);
    }),
  );
  const shutter = useTex(() => {
    const t = canvasTexture(64, 64, (g) => {
      g.fillStyle = "#AEB5BA";
      g.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 8) {
        g.fillStyle = "#8D959B";
        g.fillRect(0, y, 64, 2);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 6);
    return t;
  });
  const solarMat = useMemo(() => new THREE.MeshStandardMaterial({ map: solar, roughness: 0.25, metalness: 0.55 }), [solar]);
  useEffect(() => () => solarMat.dispose(), [solarMat]);
  const geos = useMemo(() => ({ box: new THREE.BoxGeometry(1, 1, 1) }), []);
  useEffect(() => () => geos.box.dispose(), [geos]);

  const panels = useMemo<Inst[]>(() => {
    const out: Inst[] = [];
    const stepX = compact ? 2.2 : 1.75;
    for (let z = -48.6; z > -63; z -= 2.3) for (let x = 12.6; x < 40; x += stepX) out.push({ p: [x, F.top + 0.55, z], r: [-0.42, 0, 0], s: [1.6, 0.05, 1.05] });
    return out;
  }, [compact]);
  const lights = useMemo<Inst[]>(() => {
    const out: Inst[] = [];
    for (let z = -48; z > -63; z -= 3.5) for (let x = 13.5; x < 40; x += 4.2) out.push({ p: [x, F.top - 0.5, z], s: [2.2, 0.06, 0.35] });
    return out;
  }, []);
  const mullions = useMemo<Inst[]>(() => {
    const out: Inst[] = [];
    const h = 5.4 - F.floor;
    for (let x = F.x0; x <= F.x1 + 0.01; x += 2.5) out.push({ p: [x, F.floor + h / 2, F.z0], s: [0.12, h, 0.14] });
    out.push({ p: [(F.x0 + F.x1) / 2, 2.7, F.z0], s: [F.x1 - F.x0, 0.08, 0.1] });
    for (let z = F.z0; z >= -57.5; z -= 2.5) out.push({ p: [F.x0, F.floor + h / 2, z], s: [0.14, h, 0.12] });
    out.push({ p: [F.x0, 2.7, (F.z0 - 57.5) / 2], s: [0.1, 0.08, 57.5 + F.z0] });
    return out;
  }, []);

  const wallH = F.top - F.floor;
  const midY = F.floor + wallH / 2;
  return (
    <group>
      {/* concrete apron in front of the facility + warehouse */}
      <mesh position={[23.6, -0.1, -65]} material={mat("#CFCBC2", 0.95)} receiveShadow>
        <boxGeometry args={[41, 0.3, 46]} />
      </mesh>
      <Hoverable label="Kitchen & production facility (Key Resource; brand figure: 50,000 sq. ft.)">
        <group>
          {/* plinth / floor */}
          <mesh position={[(F.x0 + F.x1) / 2, F.floor / 2, (F.z0 + F.z1) / 2]} material={mat("#DCE0E1", 0.55)} receiveShadow>
            <boxGeometry args={[F.x1 - F.x0, F.floor, F.z0 - F.z1]} />
          </mesh>
          {/* solid walls: back, rear, dock end of road side */}
          <mesh position={[F.x1 - 0.15, midY, (F.z0 + F.z1) / 2]} material={cream} receiveShadow>
            <boxGeometry args={[0.3, wallH, F.z0 - F.z1]} />
          </mesh>
          <mesh position={[(F.x0 + F.x1) / 2, midY, F.z1 + 0.15]} material={cream} receiveShadow>
            <boxGeometry args={[F.x1 - F.x0, wallH, 0.3]} />
          </mesh>
          <mesh position={[F.x0 + 0.15, midY, (-57.5 + F.z1) / 2]} material={cream} receiveShadow castShadow>
            <boxGeometry args={[0.3, wallH, -57.5 - F.z1]} />
          </mesh>
          {/* fascia bands above the glass */}
          <mesh position={[(F.x0 + F.x1) / 2, 6.1, F.z0 + 0.05]} material={cream} castShadow>
            <boxGeometry args={[F.x1 - F.x0 + 0.3, 1.4, 0.4]} />
          </mesh>
          <mesh position={[F.x0 - 0.05, 6.1, (F.z0 - 57.5) / 2]} material={cream}>
            <boxGeometry args={[0.4, 1.4, 57.5 + F.z0]} />
          </mesh>
          <mesh position={[(F.x0 + F.x1) / 2, 5.45, F.z0 + 0.1]} material={mat("#FF5C00", 0.6)}>
            <boxGeometry args={[F.x1 - F.x0 + 0.3, 0.12, 0.42]} />
          </mesh>
          {/* glass curtain walls (front = kitchen, road side = packing) */}
          <mesh material={glassMat} position={[(F.x0 + F.x1) / 2, (F.floor + 5.4) / 2, F.z0]}>
            <planeGeometry args={[F.x1 - F.x0, 5.4 - F.floor]} />
          </mesh>
          <mesh material={glassMat} position={[F.x0, (F.floor + 5.4) / 2, (F.z0 - 57.5) / 2]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[57.5 + F.z0, 5.4 - F.floor]} />
          </mesh>
          <Instanced geometry={geos.box} material={frame} items={mullions} />
          {/* roof + parapet + solar */}
          <mesh position={[(F.x0 + F.x1) / 2, F.top + 0.05, (F.z0 + F.z1) / 2]} material={mat("#E4E1DA", 0.85)}>
            <boxGeometry args={[F.x1 - F.x0 + 0.4, 0.3, F.z0 - F.z1 + 0.4]} />
          </mesh>
          <Instanced geometry={geos.box} material={solarMat} items={panels} castShadow={!compact} />
          <Instanced geometry={geos.box} material={mat("#FFFFFF", 0.4, 0, { emissive: "#FFFFFF", ei: 1.2 })} items={lights} />
          {/* signs */}
          <Sign tex={brand} w={11.5} h={1.15} position={[19.5, 6.12, F.z0 + 0.26]} />
          <Sign tex={labSign} w={4.6} h={0.9} position={[36, 6.12, F.z0 + 0.26]} />
          <Sign tex={packSign} w={9} h={1.1} position={[F.x0 - 0.26, 6.12, -51.8]} rotation={-Math.PI / 2} />
          <Sign tex={kitchen} w={7} h={0.72} position={[24, 4.35, F.z0 - 0.12]} />
        </group>
      </Hoverable>

      {/* interior: kettles, prep tables, lab, packing line */}
      <Hoverable label="Small-batch kettles: every batch is cooked in small lots and tested (Key Activity)">
        <group>
          {[19.2, 22.6, 26, 29.4].slice(0, compact ? 3 : 4).map((x, i) => (
            <Kettle key={x} position={[x, F.floor, -50.3]} reduced={reduced} phase={i * 0.37} />
          ))}
          <mesh material={steel} position={[24, F.floor + 0.88, -54.6]} castShadow>
            <boxGeometry args={[9, 0.06, 1.1]} />
          </mesh>
          {[-4.3, 4.3].map((dx) => (
            <mesh key={dx} material={steel} position={[24 + dx, F.floor + 0.44, -54.6]}>
              <boxGeometry args={[0.08, 0.88, 1.0]} />
            </mesh>
          ))}
          {[21, 23.4, 26.2].map((x, i) => (
            <mesh key={x} material={steel} position={[x, F.floor + 1.0, -54.5]}>
              <cylinderGeometry args={[0.22 - i * 0.03, 0.18, 0.22, 14]} />
            </mesh>
          ))}
        </group>
      </Hoverable>
      <Hoverable label="Quality lab: ingredients and every batch are checked (brand claim: 6-layer quality check)">
        <Lab />
      </Hoverable>
      <Hoverable label="Packing line: pouches are filled, sealed and checked before dispatch">
        <PackingLine reduced={reduced} compact={compact} />
      </Hoverable>

      {/* loading dock on the road side */}
      <Hoverable label="Loading dock: cartons leave for warehouses and delivery partners (Key Partners: logistics)">
        <group>
          <mesh position={[10.3, 0.55, -60.8]} material={mat("#B9B4AA", 0.9)} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.1, 6]} />
          </mesh>
          <mesh position={[10.86, 2.0, -60.8]} rotation={[0, -Math.PI / 2, 0]} material={mat("#1C1B1A", 0.9)}>
            <planeGeometry args={[3.0, 2.9]} />
          </mesh>
          <mesh position={[10.84, 3.85, -60.8]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[3.0, 0.8]} />
            <meshStandardMaterial map={shutter} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[10.84, 4.45, -60.8]} material={mat("#FED300", 0.6)}>
            <boxGeometry args={[0.1, 0.12, 3.3]} />
          </mesh>
          {/* bumpers */}
          {[-1.2, 1.2].map((dz) => (
            <mesh key={dz} position={[9.57, 0.75, -60.8 + dz]} material={mat("#1E1E1E", 0.9)}>
              <boxGeometry args={[0.08, 0.35, 0.25]} />
            </mesh>
          ))}
        </group>
      </Hoverable>

      <Near at={[24, -54]} r={64}>
        <Worker look={STAFF[0]} at={[20.9, -51.6]} face={0.35} headwear="hairnet" reduced={reduced} y={F.floor} />
        <Worker look={STAFF[1]} at={[27.7, -51.6]} face={-0.3} headwear="hairnet" reduced={reduced} y={F.floor} phase={1.3} />
        {!compact && <Worker look={STAFF[2]} at={[24.6, -55.6]} face={0} headwear="hairnet" reduced={reduced} y={F.floor} phase={2.1} />}
        <Worker look={STAFF[3]} at={[36.4, -49.9]} face={0.1} headwear="hairnet" reduced={reduced} y={F.floor} phase={0.7} />
        <Worker look={STAFF[5]} at={[14.6, -50.6]} face={-Math.PI / 2} headwear="hairnet" reduced={reduced} y={F.floor} phase={3} />
        {!compact && <Worker look={STAFF[0]} at={[14.6, -55.4]} face={-Math.PI / 2 + 0.2} headwear="hairnet" reduced={reduced} y={F.floor} phase={0.2} />}
        {!compact && <Worker look={STAFF[4]} at={[10.3, -59.2]} face={-Math.PI / 2 - 0.4} headwear="cap" hwColor="#2E7D6B" reduced={reduced} y={1.1} phase={1.8} />}
      </Near>
    </group>
  );
}

/* ── warehouse ────────────────────────────────────────────────── */

const W = { x0: 11, x1: 35, z0: -68, z1: -84, eave: 6, ridge: 8.4 };

export function Warehouse({ compact }: { compact: boolean }) {
  const cladding = useTex(() => {
    const t = canvasTexture(64, 64, (g) => {
      g.fillStyle = "#C5CDD2";
      g.fillRect(0, 0, 64, 64);
      for (let x = 0; x < 64; x += 8) {
        g.fillStyle = "#A9B3B9";
        g.fillRect(x, 0, 3, 64);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(16, 2);
    return t;
  });
  const sign = useTex(() => signTex("WAREHOUSE  ·  DISPATCH", "#2E5E8A", "#FFFFFF", 1536, 200));
  const cladMat = useMemo(() => new THREE.MeshStandardMaterial({ map: cladding, roughness: 0.55, metalness: 0.35 }), [cladding]);
  useEffect(() => () => cladMat.dispose(), [cladMat]);
  const gable = useMemo(() => {
    const s = new THREE.Shape();
    const hw = (W.x1 - W.x0) / 2;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, W.eave);
    s.lineTo(0, W.ridge);
    s.lineTo(-hw, W.eave);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
  }, []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(
    () => () => {
      gable.dispose();
      box.dispose();
    },
    [gable, box],
  );
  const { racks, cartons } = useMemo(() => {
    const r = rng(55);
    const racks: Inst[] = [];
    const cartons: Inst[] = [];
    const rows = compact ? [15.5, 21, 27] : [15.5, 19.5, 23.5, 27.5, 31.5];
    for (const x of rows) {
      for (let z = -69.5; z >= -82.6; z -= 2.6) {
        racks.push({ p: [x - 0.6, 2.2, z], s: [0.08, 4.4, 0.08] }, { p: [x + 0.6, 2.2, z], s: [0.08, 4.4, 0.08] });
      }
      for (const y of [0.15, 1.55, 2.95, 4.3]) racks.push({ p: [x, y, -76], s: [1.3, 0.06, 13.2] });
      for (const y of [0.18, 1.58, 2.98])
        for (let z = -69.9; z > -82.4; z -= 0.75) {
          if (r() < 0.22) continue;
          const h = 0.5 + r() * 0.4;
          cartons.push({ p: [x + (r() - 0.5) * 0.15, y + h / 2 + 0.03, z], s: [1.0, h, 0.66], c: r() > 0.84 ? "#E2733A" : r() > 0.5 ? "#B98A5A" : "#C99B68" });
        }
    }
    return { racks, cartons };
  }, [compact]);
  const hw = (W.x1 - W.x0) / 2;
  const cx = (W.x0 + W.x1) / 2;
  const slope = Math.atan2(W.ridge - W.eave, hw);
  const roofLen = Math.hypot(hw, W.ridge - W.eave) + 0.5;
  const bays = [-71.2, -76, -80.8];
  return (
    <Hoverable label="Warehouse: finished cartons stored, picked and handed to delivery partners">
      <group>
        <mesh position={[cx, 0.08, (W.z0 + W.z1) / 2]} material={mat("#BFC3C4", 0.7)} receiveShadow>
          <boxGeometry args={[W.x1 - W.x0, 0.16, W.z0 - W.z1]} />
        </mesh>
        {/* gable ends + back wall */}
        <mesh geometry={gable} material={mat("#C5CDD2", 0.55, 0.35)} position={[cx, 0, W.z0 - 0.3]} castShadow />
        <mesh geometry={gable} material={mat("#C5CDD2", 0.55, 0.35)} position={[cx, 0, W.z1]} />
        <mesh position={[W.x1 - 0.15, W.eave / 2, (W.z0 + W.z1) / 2]} material={cladMat}>
          <boxGeometry args={[0.3, W.eave, W.z0 - W.z1]} />
        </mesh>
        {/* road-side wall with three open bays */}
        <mesh position={[W.x0 + 0.15, 5.2, (W.z0 + W.z1) / 2]} material={cladMat}>
          <boxGeometry args={[0.3, 1.6, W.z0 - W.z1]} />
        </mesh>
        {[
          [-68, -69.4],
          [-73, -74.2],
          [-77.8, -79],
          [-82.6, -84],
        ].map(([a, b]) => (
          <mesh key={a} position={[W.x0 + 0.15, 2.2, (a + b) / 2]} material={cladMat}>
            <boxGeometry args={[0.32, 4.4, a - b]} />
          </mesh>
        ))}
        {bays.map((z) => (
          <mesh key={z} position={[W.x0 + 0.16, 4.15, z]} material={mat("#FED300", 0.6)}>
            <boxGeometry args={[0.34, 0.14, 3.6]} />
          </mesh>
        ))}
        {/* roof */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[cx + s * (hw / 2), (W.eave + W.ridge) / 2 + 0.05, (W.z0 + W.z1) / 2]} rotation={[0, 0, -s * slope]} material={mat("#8E9AA2", 0.45, 0.5)} castShadow>
            <boxGeometry args={[roofLen, 0.12, W.z0 - W.z1 + 0.8]} />
          </mesh>
        ))}
        <Sign tex={sign} w={10} h={1.3} position={[W.x0 - 0.02, 5.2, (W.z0 + W.z1) / 2]} rotation={-Math.PI / 2} />
        {/* racks + cartons */}
        <Instanced geometry={box} material={mat("#3E6EA8", 0.5, 0.4)} items={racks} />
        <Instanced geometry={box} material={mat("#FFFFFF", 0.85)} items={cartons} />
      </group>
    </Hoverable>
  );
}
