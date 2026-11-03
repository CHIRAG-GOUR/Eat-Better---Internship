"use client";
/* eslint-disable react-hooks/immutability -- three.js objects, refs and textures are mutated inside useFrame / effects by design (per-frame animation without React re-renders) */

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { makeBowl } from "@/features/packaging/three/geometry";
import { BhujiaPile, Diya, GiftBox, MailerBox, Marigold } from "@/components/world/props";
import { CATEGORIES, INGREDIENTS, ZONE_PRODUCTS, type CategoryId, type Format, type IngredientId, type OccasionId, type ZoneProduct } from "../../content";
import { drawPack, onLogo, packCanvasSize, type PackArt } from "./packArt";

export const X = { zones: -9, ing: -3, table: 3, pack: 9, test: 15 };
const ZONE_X: Record<CategoryId, number> = { laddoos: -2.4, namkeens: -0.8, nuts: 0.8, gifting: 2.4 };
const ING_POS = INGREDIENTS.map((ing, i) => ({ id: ing.id, x: X.ing - 2.5 + (i % 6), z: i < 6 ? -0.42 : 0.2 }));
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, (typeof CATEGORIES)[number]>;
const ING = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i])) as Record<IngredientId, (typeof INGREDIENTS)[number]>;

export type SceneProps = {
  step: number;
  focusZone: CategoryId | null;
  visited: CategoryId[];
  inspect: IngredientId | null;
  chosen: IngredientId[];
  category: CategoryId | null;
  format: Format | null;
  art: PackArt;
  testEnv: OccasionId | null;
  rot: React.RefObject<number>;
  lite: boolean;
  reduce: boolean;
  onZone: (c: CategoryId) => void;
  onIngredient: (i: IngredientId) => void;
  snap: React.RefObject<(() => string) | null>;
};

/* ── helpers ──────────────────────────────────────────────────── */

function fontFam() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

function signTexture(lines: { t: string; s: number; c: string; y: number }[], bg: string, w = 900, h = 220) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const l of lines) {
    g.fillStyle = l.c;
    g.font = `800 ${l.s}px ${fontFam()}`;
    g.fillText(l.t, w / 2, l.y, w * 0.92);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const hover = (on: boolean) => () => {
  document.body.style.cursor = on ? "pointer" : "";
};

/* ── ingredients ──────────────────────────────────────────────── */

function pieceGeometry(id: IngredientId) {
  switch (id) {
    case "dates": {
      const g = new THREE.SphereGeometry(0.03, 10, 8);
      g.scale(1.9, 1, 1);
      return g;
    }
    case "millets":
      return new THREE.SphereGeometry(0.008, 6, 5);
    case "quinoa":
      return new THREE.SphereGeometry(0.01, 6, 5);
    case "almonds": {
      const g = new THREE.SphereGeometry(0.02, 10, 8);
      g.scale(1.8, 0.9, 0.6);
      return g;
    }
    case "cashews":
      return new THREE.TorusGeometry(0.018, 0.009, 6, 10, Math.PI * 1.1);
    case "hazelnuts":
      return new THREE.SphereGeometry(0.018, 10, 8);
    case "seeds": {
      const g = new THREE.SphereGeometry(0.016, 8, 6);
      g.scale(1.5, 0.35, 0.9);
      return g;
    }
    case "jaggery":
      return new THREE.BoxGeometry(0.03, 0.026, 0.03);
    case "coffee": {
      const g = new THREE.SphereGeometry(0.013, 8, 6);
      g.scale(1.4, 0.8, 1);
      return g;
    }
    case "raisins": {
      const g = new THREE.SphereGeometry(0.012, 7, 6);
      g.scale(1.5, 0.8, 1);
      return g;
    }
    default:
      return new THREE.SphereGeometry(0.01, 6, 5);
  }
}

/** A heap of one ingredient. Powders (masalas, cocoa) render as a mound. */
export function IngredientPile({ id, radius = 0.15, height = 0.06, count = 60, seed = 1 }: { id: IngredientId; radius?: number; height?: number; count?: number; seed?: number }) {
  const color = ING[id].color;
  const powder = id === "masalas" || id === "cocoa";
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => pieceGeometry(id), [id]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: id === "dates" || id === "raisins" ? 0.45 : 0.8 }), [color, id]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  const n = powder ? 0 : count;
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let s = seed * 9301 + 49297;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * radius;
      const hgt = (1 - r / radius) * height * (0.4 + rnd() * 0.8);
      o.position.set(Math.cos(a) * r, hgt, Math.sin(a) * r);
      o.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [n, radius, height, seed]);
  if (powder)
    return (
      <mesh position={[0, 0, 0]} scale={[radius, height * 1.4, radius]} castShadow>
        <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    );
  return <instancedMesh ref={ref} args={[geo, mat, n]} castShadow />;
}

function IngredientBowl({ id, x, z, inspect, chosen, onClick, lite }: { id: IngredientId; x: number; z: number; inspect: boolean; chosen: boolean; onClick: () => void; lite: boolean }) {
  const g = useRef<THREE.Group>(null);
  const bowl = useMemo(() => makeBowl(0.2, 0.1), []);
  useEffect(() => () => bowl.dispose(), [bowl]);
  useFrame(({ clock }, delta) => {
    const grp = g.current;
    if (!grp) return;
    grp.position.y = THREE.MathUtils.damp(grp.position.y, inspect ? 1.32 : 0.92, 6, delta);
    grp.position.z = THREE.MathUtils.damp(grp.position.z, inspect ? z + 0.35 : z, 6, delta);
    grp.rotation.y = inspect ? grp.rotation.y + delta * 0.8 : THREE.MathUtils.damp(grp.rotation.y, 0, 4, delta);
    const s = inspect ? 1.6 : 1;
    grp.scale.setScalar(THREE.MathUtils.damp(grp.scale.x, s, 6, delta));
    void clock;
  });
  return (
    <group
      ref={g}
      position={[x, 0.92, z]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={hover(true)}
      onPointerOut={hover(false)}
    >
      <mesh geometry={bowl} castShadow receiveShadow>
        <meshStandardMaterial color="#FBF6EF" roughness={0.35} />
      </mesh>
      <group position={[0, 0.03, 0]}>
        <IngredientPile id={id} radius={0.14} height={0.06} count={lite ? 30 : 70} seed={id.length * 7} />
      </group>
      {chosen && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.29, 32]} />
          <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  );
}

/* ── packs ────────────────────────────────────────────────────── */

function RealPack({ p, tex }: { p: ZoneProduct; tex: THREE.Texture }) {
  const img = tex.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 0.7;
  const box = p.shape === "box";
  const h = box ? 0.34 : 0.42;
  const w = box ? 0.42 : h * aspect;
  const d = box ? 0.3 : 0.08;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.02} position={[0, h / 2, 0]} castShadow>
        <meshStandardMaterial color={box ? "#F2E6D6" : "#2B1A14"} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, h / 2, d / 2 + 0.002]}>
        <planeGeometry args={box ? [w * 0.94, h * 0.94] : [w * 0.985, h * 0.985]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Zones({ focus, visited, onZone }: { focus: CategoryId | null; visited: CategoryId[]; onZone: (c: CategoryId) => void }) {
  const urls = useMemo(() => Object.fromEntries(Object.values(ZONE_PRODUCTS).flat().map((p) => [p.id, p.tex])), []);
  const tex = useTexture(urls) as Record<string, THREE.Texture>;
  useMemo(() => {
    for (const t of Object.values(tex)) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  }, [tex]);
  const signs = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, signTexture([{ t: c.name.toUpperCase(), s: 84, c: "#FFF5EE", y: 112 }], c.color)])) as Record<CategoryId, THREE.CanvasTexture>,
    [],
  );
  useEffect(() => () => Object.values(signs).forEach((t) => t.dispose()), [signs]);
  return (
    <group position={[X.zones, 0, 0]}>
      {CATEGORIES.map((c) => {
        const x = ZONE_X[c.id];
        const on = focus === c.id;
        return (
          <group
            key={c.id}
            position={[x, 0, 0]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onZone(c.id);
            }}
            onPointerOver={hover(true)}
            onPointerOut={hover(false)}
          >
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.66, 0.72, 0.7, 40]} />
              <meshStandardMaterial color={c.color} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.705, 0]}>
              <cylinderGeometry args={[0.62, 0.62, 0.012, 40]} />
              <meshStandardMaterial color="#FFF5EE" roughness={0.6} />
            </mesh>
            {ZONE_PRODUCTS[c.id].map((p, i) => (
              <group key={p.id} position={[(i - 1) * 0.42, 0.71, (i === 1 ? -0.12 : 0.1)]} rotation={[0, (1 - i) * 0.25, 0]}>
                <RealPack p={p} tex={tex[p.id]} />
              </group>
            ))}
            <mesh position={[0, 1.95, -0.55]}>
              <planeGeometry args={[1.45, 0.36]} />
              <meshStandardMaterial map={signs[c.id]} roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.4, -0.58]}>
              <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
              <meshStandardMaterial color="#5A3A22" />
            </mesh>
            {(visited.includes(c.id) || on) && (
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.78, 0.86, 48]} />
                <meshStandardMaterial color={on ? "#FF5C00" : "#00A341"} emissive={on ? "#FF5C00" : "#00A341"} emissiveIntensity={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/** The student's pack: pouch, sachet or box with live pack art. */
export function ConceptPack({ art, rot, spin }: { art: PackArt; rot?: React.RefObject<number>; spin?: boolean }) {
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  useEffect(() => () => tex.dispose(), [tex]);
  const key = JSON.stringify(art);
  useEffect(() => {
    const draw = () => {
      const { w, h } = packCanvasSize(art.format);
      canvas.width = w;
      canvas.height = h;
      drawPack(canvas, art);
      tex.needsUpdate = true;
    };
    draw();
    onLogo(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures every art field
  }, [key, canvas, tex]);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!g.current) return;
    const target = rot ? rot.current : 0;
    const idle = spin ? Math.sin(clock.elapsedTime * 0.6) * 0.25 : 0;
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, target + idle, 6, delta);
  });
  const f = art.format;
  const dims = f === "box" ? { w: 1.05, h: 0.7, d: 0.42 } : f === "sachet" ? { w: 0.46, h: 0.83, d: 0.08 } : { w: 0.72, h: 0.9, d: 0.2 };
  return (
    <group ref={g}>
      <RoundedBox args={[dims.w, dims.h, dims.d]} radius={f === "box" ? 0.02 : 0.04} position={[0, dims.h / 2, 0]} castShadow>
        <meshStandardMaterial color={art.color} roughness={f === "box" ? 0.6 : 0.4} />
      </RoundedBox>
      <mesh position={[0, dims.h / 2, dims.d / 2 + 0.003]}>
        <planeGeometry args={[dims.w * (f === "box" ? 0.97 : 0.95), dims.h * (f === "box" ? 0.96 : 0.95)]} />
        <meshStandardMaterial map={tex} roughness={f === "box" ? 0.6 : 0.35} />
      </mesh>
      {f === "box" && (
        <mesh position={[0, dims.h + 0.012, 0]}>
          <boxGeometry args={[dims.w + 0.02, 0.025, dims.d + 0.02]} />
          <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
        </mesh>
      )}
      {f !== "box" && (
        <mesh position={[0, dims.h - 0.06, dims.d / 2 + 0.006]}>
          <planeGeometry args={[dims.w * 0.9, 0.012]} />
          <meshStandardMaterial color="#000" transparent opacity={0.18} />
        </mesh>
      )}
    </group>
  );
}

/** The 3D product concept on the design table, built from category + chosen ingredients. */
export function ProductConcept({ category, chosen, lite }: { category: CategoryId | null; chosen: IngredientId[]; lite: boolean }) {
  const bowl = useMemo(() => makeBowl(0.42, 0.2), []);
  useEffect(() => () => bowl.dispose(), [bowl]);
  const ings: IngredientId[] = chosen.length ? chosen : ["almonds"];
  const main = ING[ings[0]].color;
  if (!category) return null;
  if (category === "laddoos") {
    const pos: [number, number, number][] = [
      [0, 0, 0],
      [0.2, 0, 0.08],
      [-0.2, 0, 0.08],
      [0.1, 0, -0.17],
      [-0.1, 0, -0.17],
      [0, 0.17, -0.02],
    ];
    return (
      <group>
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <cylinderGeometry args={[0.45, 0.4, 0.03, 40]} />
          <meshStandardMaterial color="#C8963E" metalness={0.85} roughness={0.3} />
        </mesh>
        {pos.map((p, i) => (
          <group key={i} position={[p[0], 0.12 + p[1], p[2]]}>
            <mesh castShadow>
              <sphereGeometry args={[0.1, 20, 16]} />
              <meshStandardMaterial color={main} roughness={0.85} />
            </mesh>
            {ings.slice(1).map((id, k) => (
              <group key={id} rotation={[k * 1.3 + i, k * 0.7, 0]}>
                <group position={[0, 0.088, 0]} scale={0.8}>
                  <IngredientPile id={id} radius={0.05} height={0.01} count={lite ? 3 : 6} seed={i + k * 5} />
                </group>
              </group>
            ))}
          </group>
        ))}
      </group>
    );
  }
  if (category === "gifting") {
    return (
      <group>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.12, 0.7]} />
          <meshStandardMaterial color="#550D10" roughness={0.6} />
        </mesh>
        {ings.slice(0, 4).map((id, i) => (
          <group key={id} position={[(i % 2 ? 0.22 : -0.22), 0.12, i < 2 ? -0.15 : 0.15]}>
            <IngredientPile id={id} radius={0.14} height={0.05} count={lite ? 25 : 55} seed={i + 3} />
          </group>
        ))}
        <mesh position={[0, 0.125, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.7]} />
          <meshStandardMaterial color="#C8963E" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.125, 0]}>
          <boxGeometry args={[0.95, 0.01, 0.02]} />
          <meshStandardMaterial color="#C8963E" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh geometry={bowl} castShadow receiveShadow>
        <meshStandardMaterial color="#FBF6EF" roughness={0.35} />
      </mesh>
      <group position={[0, 0.05, 0]}>
        {category === "namkeens" && (
          <group scale={0.85}>
            <BhujiaPile count={lite ? 160 : 360} spread={0.34} height={0.12} />
          </group>
        )}
        {ings.map((id, i) => (
          <group key={id} position={[Math.cos(i * 2.1) * 0.08, 0.02 + i * 0.012, Math.sin(i * 2.1) * 0.08]}>
            <IngredientPile id={id} radius={0.3} height={0.1} count={lite ? 30 : 70} seed={i + 11} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ── stations ─────────────────────────────────────────────────── */

function Room({ lite }: { lite: boolean }) {
  const floor = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#F3E6D6";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = ["#E7D2BA", "#FBF3EA", "#DCC2A4", "#F0D9C4"][i % 4];
      g.beginPath();
      g.arc((i * 73) % 256, (i * 151) % 256, 1.5 + (i % 3), 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(16, 6);
    return t;
  }, []);
  const signs = useMemo(
    () => [
      { x: X.zones, t: signTexture([{ t: "1 · PRODUCT UNIVERSE", s: 74, c: "#2F1C1A", y: 110 }], "#FED300") },
      { x: X.ing, t: signTexture([{ t: "2 · INGREDIENT LAB", s: 74, c: "#FFF5EE", y: 110 }], "#35401D") },
      { x: X.table, t: signTexture([{ t: "3–4 · DESIGN TABLE", s: 74, c: "#FFF5EE", y: 110 }], "#FF5C00") },
      { x: X.pack, t: signTexture([{ t: "5 · PACKAGING", s: 74, c: "#FFF5EE", y: 110 }], "#550D10") },
      { x: X.test, t: signTexture([{ t: "6 · TEST STAGE", s: 74, c: "#2F1C1A", y: 110 }], "#E7BA68") },
    ],
    [],
  );
  useEffect(
    () => () => {
      floor.dispose();
      signs.forEach((s) => s.t.dispose());
    },
    [floor, signs],
  );
  const panels = ["#FEE7D5", "#E9EFD9", "#FFE2CF", "#F6DADB", "#F8EBCF"];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 16]} />
        <meshStandardMaterial map={floor} roughness={0.8} />
      </mesh>
      <mesh position={[3, 3.2, -3]} receiveShadow>
        <planeGeometry args={[44, 6.4]} />
        <meshStandardMaterial color="#FFF8F1" roughness={0.95} />
      </mesh>
      {signs.map((s, i) => (
        <group key={s.x}>
          <mesh position={[s.x, 2.2, -2.98]}>
            <planeGeometry args={[5.4, 4.2]} />
            <meshStandardMaterial color={panels[i]} roughness={0.9} />
          </mesh>
          <mesh position={[s.x, 3.75, -2.95]}>
            <planeGeometry args={[3.2, 0.78]} />
            <meshStandardMaterial map={s.t} roughness={0.7} />
          </mesh>
          <group position={[s.x, 4.3, 0]}>
            <mesh>
              <cylinderGeometry args={[0.32, 0.5, 0.32, 24, 1, true]} />
              <meshStandardMaterial color="#2F1C1A" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 1.6, 6]} />
              <meshStandardMaterial color="#2F1C1A" />
            </mesh>
            {!lite && <pointLight position={[0, -0.3, 0]} intensity={4} distance={6} color="#FFE6C4" />}
          </group>
        </group>
      ))}
      {/* plants between stations */}
      {[-6, 0, 6, 12].map((x) => (
        <group key={x} position={[x, 0, -2.4]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.18, 0.6, 18]} />
            <meshStandardMaterial color="#C8963E" roughness={0.6} />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[Math.cos(k * 1.3) * 0.12, 0.85 + (k % 2) * 0.2, Math.sin(k * 1.3) * 0.12]} castShadow>
              <sphereGeometry args={[0.22, 10, 8]} />
              <meshStandardMaterial color={k % 2 ? "#4E7A35" : "#35401D"} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function IngredientLab({ inspect, chosen, onIngredient, lite }: { inspect: IngredientId | null; chosen: IngredientId[]; onIngredient: (i: IngredientId) => void; lite: boolean }) {
  return (
    <group>
      <RoundedBox args={[6.6, 0.9, 1.5]} radius={0.04} position={[X.ing, 0.45, -0.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#35401D" roughness={0.7} />
      </RoundedBox>
      <mesh position={[X.ing, 0.905, -0.1]} receiveShadow>
        <boxGeometry args={[6.7, 0.03, 1.6]} />
        <meshStandardMaterial color="#F7F1E8" roughness={0.3} />
      </mesh>
      {ING_POS.map((p) => (
        <IngredientBowl key={p.id} id={p.id} x={p.x} z={p.z} inspect={inspect === p.id} chosen={chosen.includes(p.id)} onClick={() => onIngredient(p.id)} lite={lite} />
      ))}
    </group>
  );
}

function ConceptBoard({ category, chosen }: { category: CategoryId | null; chosen: IngredientId[] }) {
  const key = `${category}|${chosen.join(",")}`;
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 640;
    const g = c.getContext("2d")!;
    g.fillStyle = "#FFF5EE";
    g.fillRect(0, 0, 1000, 640);
    g.strokeStyle = "#2F1C1A";
    g.lineWidth = 6;
    g.strokeRect(10, 10, 980, 620);
    g.fillStyle = "#FF5C00";
    g.textAlign = "left";
    g.textBaseline = "top";
    g.font = `800 54px ${fontFam()}`;
    g.fillText("CONCEPT BOARD", 50, 40);
    g.fillStyle = "#2F1C1A";
    g.font = `700 40px ${fontFam()}`;
    g.fillText(`Category: ${category ? CAT[category].name : "—"}`, 50, 130);
    g.fillText("Ingredients:", 50, 200);
    chosen.forEach((id, i) => {
      g.fillStyle = ING[id].color;
      g.beginPath();
      g.arc(80 + (i % 2) * 440, 300 + Math.floor(i / 2) * 80, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#2F1C1A";
      g.fillText(ING[id].name, 120 + (i % 2) * 440, 278 + Math.floor(i / 2) * 80);
    });
    g.fillStyle = "#4A3230";
    g.font = `600 30px ${fontFam()}`;
    g.fillText("Student design exercise — not a recipe", 50, 560);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures category + ingredients
  }, [key]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={[X.table + 1.75, 0, -1.2]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[1.66, 1.08, 0.04]} />
        <meshStandardMaterial color="#B98A5E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.55, 0.025]}>
        <planeGeometry args={[1.56, 1.0]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.55, -0.1]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
          <meshStandardMaterial color="#5A3A22" />
        </mesh>
      ))}
    </group>
  );
}

function DesignTable({ step, category, chosen, lite }: { step: number; category: CategoryId | null; chosen: IngredientId[]; lite: boolean }) {
  const turn = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (turn.current) turn.current.rotation.y += delta * 0.35;
  });
  return (
    <group>
      <mesh position={[X.table, 0.88, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.35, 0.08, 56]} />
        <meshStandardMaterial color="#FFF5EE" roughness={0.4} />
      </mesh>
      <mesh position={[X.table, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.4, 0.84, 24]} />
        <meshStandardMaterial color="#FF5C00" roughness={0.5} />
      </mesh>
      <group ref={turn} position={[X.table, 0.93, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.03, 40]} />
          <meshStandardMaterial color="#E7BA68" roughness={0.5} />
        </mesh>
        <group position={[0, 0.015, 0]}>{step >= 3 && <ProductConcept category={category} chosen={chosen} lite={lite} />}</group>
      </group>
      {/* chosen ingredient bowls around the table */}
      {chosen.map((id, i) => {
        const a = Math.PI * 0.85 + i * 0.42;
        return (
          <group key={id} position={[X.table + Math.cos(a) * 1.05, 0.93, Math.sin(a) * 0.95]}>
            <IngredientPile id={id} radius={0.12} height={0.05} count={lite ? 20 : 45} seed={i + 21} />
          </group>
        );
      })}
      <ConceptBoard category={category} chosen={chosen} />
    </group>
  );
}

function PackStation({ art, rot, show }: { art: PackArt; rot: React.RefObject<number>; show: boolean }) {
  return (
    <group>
      <RoundedBox args={[3.2, 0.9, 1.4]} radius={0.04} position={[X.pack, 0.45, -0.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#550D10" roughness={0.6} />
      </RoundedBox>
      <mesh position={[X.pack, 0.905, -0.2]} receiveShadow>
        <boxGeometry args={[3.3, 0.03, 1.5]} />
        <meshStandardMaterial color="#FBF6EF" roughness={0.35} />
      </mesh>
      {/* cutting mat + tools */}
      <mesh position={[X.pack - 1.05, 0.925, 0.05]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[0.8, 0.55]} />
        <meshStandardMaterial color="#35401D" roughness={0.8} />
      </mesh>
      {["#FF5C00", "#FED300", "#35401D", "#550D10"].map((c, i) => (
        <mesh key={c} position={[X.pack + 1.0 + i * 0.12, 0.93, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 0.16]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
      <mesh position={[X.pack, 0.935, -0.05]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.03, 40]} />
        <meshStandardMaterial color="#E7BA68" roughness={0.5} />
      </mesh>
      {show && (
        <group position={[X.pack, 0.95, -0.05]}>
          <ConceptPack art={art} rot={rot} spin={false} />
        </group>
      )}
    </group>
  );
}

function Rangoli() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    const cols = ["#FF5C00", "#FED300", "#C2185B", "#00A341", "#FFF5EE"];
    for (let r = 5; r > 0; r--) {
      g.fillStyle = cols[r % cols.length];
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        g.beginPath();
        g.ellipse(256 + Math.cos(a) * r * 34, 256 + Math.sin(a) * r * 34, r * 14, r * 7, a, 0, Math.PI * 2);
        g.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.9]}>
      <circleGeometry args={[0.9, 48]} />
      <meshStandardMaterial map={tex} transparent roughness={0.9} />
    </mesh>
  );
}

function TestStage({ env, art, category, chosen, lite, show }: { env: OccasionId | null; art: PackArt; category: CategoryId | null; chosen: IngredientId[]; lite: boolean; show: boolean }) {
  const t = env ?? "daily";
  return (
    <group position={[X.test, 0, 0]}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.5, 0.1, 64]} />
        <meshStandardMaterial color={t === "festive" ? "#550D10" : t === "corporate" ? "#4A3230" : t === "gifting" ? "#C98F3C" : "#35401D"} roughness={0.7} />
      </mesh>
      {/* table */}
      <RoundedBox args={[2.2, 0.08, 1.1]} radius={0.02} position={[0, 0.86, -0.3]} castShadow receiveShadow>
        <meshStandardMaterial color={t === "corporate" ? "#E9E3DA" : "#B98A5E"} roughness={0.55} />
      </RoundedBox>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.45, -0.3]} castShadow>
          <boxGeometry args={[0.07, 0.82, 0.9]} />
          <meshStandardMaterial color="#5A3A22" />
        </mesh>
      ))}
      {show && (
        <group position={[0.2, 0.9, -0.2]}>
          <ConceptPack art={art} spin />
        </group>
      )}
      {show && (
        <group position={[-0.62, 0.9, -0.3]} scale={0.7}>
          <ProductConcept category={category} chosen={chosen} lite={lite} />
        </group>
      )}
      {t === "daily" && (
        <group>
          <mesh position={[0.82, 0.96, 0.05]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.13, 20]} />
            <meshStandardMaterial color="#FFF5EE" />
          </mesh>
          <mesh position={[0.82, 1.0, 0.05]}>
            <cylinderGeometry args={[0.062, 0.062, 0.01, 20]} />
            <meshStandardMaterial color="#B5763E" />
          </mesh>
          <mesh position={[0.6, 0.97, -0.6]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.16, 24]} />
            <meshStandardMaterial color="#C9CDD2" metalness={0.8} roughness={0.25} />
          </mesh>
          <RoundedBox args={[0.6, 0.75, 0.3]} radius={0.08} position={[1.4, 0.38, 0.6]} rotation={[0, -0.4, 0]} castShadow>
            <meshStandardMaterial color="#1565C0" roughness={0.7} />
          </RoundedBox>
        </group>
      )}
      {t === "festive" && (
        <group>
          <Rangoli />
          {[-0.5, 0, 0.5].map((x) => (
            <group key={x} position={[x, 0.1, 1.55 - Math.abs(x) * 0.3]}>
              <Diya flicker={!lite} />
            </group>
          ))}
          {[-0.85, 0.85].map((x) => (
            <group key={x} position={[x, 0.9, 0.05]} scale={0.8}>
              <Marigold />
            </group>
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <mesh key={i} position={[-1.4 + i * 0.2, 2.25 - Math.sin((i / 14) * Math.PI) * 0.3, -0.8]}>
              <sphereGeometry args={[0.06, 10, 8]} />
              <meshStandardMaterial color={i % 2 ? "#FF9A12" : "#F57C00"} />
            </mesh>
          ))}
        </group>
      )}
      {t === "gifting" && (
        <group>
          <group position={[0.85, 0.9, -0.45]} scale={0.6}>
            <GiftBox color="#550D10" lid="#C8963E" />
          </group>
          <group position={[-1.6, 0.1, 0.7]} scale={0.8}>
            <GiftBox color="#FF5C00" lid="#E8540A" />
          </group>
          <mesh position={[0.75, 0.905, 0.1]} rotation={[-Math.PI / 2, 0, 0.3]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshStandardMaterial color="#FED300" />
          </mesh>
        </group>
      )}
      {t === "corporate" && (
        <group>
          <group position={[0.8, 0.9, -0.45]} rotation={[0, -0.3, 0]}>
            <mesh position={[0, 0.01, 0]} castShadow>
              <boxGeometry args={[0.5, 0.02, 0.34]} />
              <meshStandardMaterial color="#9AA0A6" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.17, -0.17]} rotation={[-0.25, 0, 0]} castShadow>
              <boxGeometry args={[0.5, 0.32, 0.015]} />
              <meshStandardMaterial color="#9AA0A6" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
          {[0, 1, 2].map((i) => (
            <group key={i} position={[-1.65 + (i % 2) * 0.2, 0.1 + i * 0.42, 0.6]} rotation={[0, i * 0.15, 0]}>
              <MailerBox />
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

/* ── camera + snapshot ────────────────────────────────────────── */

function Rig({ step, focusZone, inspect, reduce }: { step: number; focusZone: CategoryId | null; inspect: IngredientId | null; reduce: boolean }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(3, 1, 0), []);
  const lookWant = useMemo(() => new THREE.Vector3(), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  const first = useRef(true);
  useFrame(({ clock }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    cam.fov = aspect < 1 ? 50 : 40;
    const far = step === 5 ? (aspect < 1 ? 1.05 : 1) : aspect < 1 ? 1.55 : aspect < 1.3 ? 1.2 : 1;
    let lx = 3;
    let ly = 1;
    let off: [number, number, number] = [0, 5, 13];
    if (step === 1) {
      if (focusZone) {
        lx = X.zones + ZONE_X[focusZone];
        ly = 1.2;
        off = [0, 0.9, 3.9];
      } else {
        lx = X.zones;
        ly = 1.0;
        off = [0, 2.2, 6.6];
      }
    } else if (step === 2) {
      const p = ING_POS.find((q) => q.id === inspect);
      if (p) {
        lx = p.x;
        ly = 1.25;
        off = [0, 0.75, 2.5];
      } else {
        lx = X.ing;
        ly = 0.9;
        off = [0, 2.6, 5.4];
      }
    } else if (step === 3) {
      lx = X.table;
      ly = 1.05;
      off = [0, 2.2, 4.6];
    } else if (step === 4) {
      lx = X.table;
      ly = 1.05;
      off = [0, 1.4, 3.2];
    } else if (step === 5) {
      lx = X.pack;
      ly = 1.35;
      off = [0, 0.4, 2.9];
    } else if (step >= 6) {
      lx = X.test;
      ly = 1.1;
      off = [0, 1.5, 4.4];
    }
    lookWant.set(lx, ly, 0);
    const sway = reduce ? 0 : Math.sin(clock.elapsedTime * 0.25) * 0.12;
    want.set(lx + off[0] + sway, ly + off[1] * far, off[2] * far);
    if (first.current) {
      cam.position.copy(want);
      look.copy(lookWant);
      first.current = false;
    }
    const k = reduce ? 30 : 2.4;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, want.x, k, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, want.y, k, delta);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, want.z, k, delta);
    look.lerp(lookWant, 1 - Math.exp(-k * delta));
    cam.lookAt(look);
    cam.updateProjectionMatrix();
  });
  return null;
}

function Snapper({ snap }: { snap: React.RefObject<(() => string) | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    snap.current = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
    return () => {
      snap.current = null;
    };
  }, [gl, scene, camera, snap]);
  return null;
}

export function StudioScene(p: SceneProps) {
  return (
    <>
      <color attach="background" args={["#FBEFE3"]} />
      <fog attach="fog" args={["#FBEFE3", 14, 30]} />
      <hemisphereLight args={["#FFF6EC", "#8A6A4A", 1.1]} />
      <directionalLight position={[-3, 9, 7]} intensity={1.6} castShadow={!p.lite} shadow-mapSize={[1024, 1024]} shadow-camera-left={-14} shadow-camera-right={20} shadow-camera-top={6} shadow-camera-bottom={-4} />
      {!p.lite && (
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={3} color="#FFF4E6" position={[0, 6, 6]} scale={[12, 4, 1]} target={[3, 1, 0]} />
        </Environment>
      )}
      <Rig step={p.step} focusZone={p.focusZone} inspect={p.inspect} reduce={p.reduce} />
      <Room lite={p.lite} />
      <Suspense fallback={null}>
        <Zones focus={p.step === 1 ? p.focusZone : null} visited={p.visited} onZone={p.onZone} />
      </Suspense>
      <IngredientLab inspect={p.step === 2 ? p.inspect : null} chosen={p.chosen} onIngredient={p.onIngredient} lite={p.lite} />
      <DesignTable step={p.step} category={p.category} chosen={p.chosen} lite={p.lite} />
      <PackStation art={p.art} rot={p.rot} show={p.step >= 5 && !!p.format} />
      <TestStage env={p.testEnv} art={p.art} category={p.category} chosen={p.chosen} lite={p.lite} show={p.step >= 6} />
      <Snapper snap={p.snap} />
      {!p.lite && <ContactShadows position={[3, 0.01, 0]} opacity={0.25} scale={44} blur={2.4} far={3} resolution={1024} frames={1} />}
    </>
  );
}
