"use client";
 

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Human, type HumanLook } from "@/components/world2/Human";
import { angleDelta, groundHeight, mat } from "./kit";

/** A texture made once per component and disposed on unmount. */
export function useTex<T extends THREE.Texture>(make: () => T) {
  const [t] = useState(make);
  useEffect(() => () => t.dispose(), [t]);
  return t;
}

/* ── instancing ───────────────────────────────────────────────── */

export type Inst = { p: [number, number, number]; r?: [number, number, number]; s?: number | [number, number, number]; c?: string };

/** One draw call for many copies of a mesh. `items` must be memoised. */
export function Instanced({ geometry, material, items, castShadow = false, receiveShadow = false }: { geometry: THREE.BufferGeometry; material: THREE.Material; items: Inst[]; castShadow?: boolean; receiveShadow?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(it.p[0], it.p[1], it.p[2]);
      o.rotation.set(it.r?.[0] ?? 0, it.r?.[1] ?? 0, it.r?.[2] ?? 0);
      if (typeof it.s === "number") o.scale.setScalar(it.s);
      else if (it.s) o.scale.set(it.s[0], it.s[1], it.s[2]);
      else o.scale.setScalar(1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (it.c) m.setColorAt(i, col.set(it.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh key={items.length} ref={ref} args={[geometry, material, items.length]} castShadow={castShadow} receiveShadow={receiveShadow} />;
}

/* ── distance culling for small busy things (people, vehicles) ── */

/** Hides its children when the camera is further than `r` (xz distance) from `at`. */
export function Near({ at, r = 62, children }: { at: [number, number]; r?: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (g.current) g.current.visible = Math.hypot(camera.position.x - at[0], camera.position.z - at[1]) < r;
  });
  return <group ref={g}>{children}</group>;
}

/* ── people ───────────────────────────────────────────────────── */

export type Headwear = "turban" | "hairnet" | "cap";
const HEADWEAR = {
  cap: new THREE.SphereGeometry(0.118, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
  ring: new THREE.TorusGeometry(0.104, 0.05, 8, 22),
  frill: new THREE.TorusGeometry(0.11, 0.012, 6, 22),
  brim: new THREE.CylinderGeometry(0.13, 0.13, 0.01, 18),
};

/**
 * Head covering for a STANDING person (head position is static in "stand" mode): Rajasthani turban (pagdi),
 * kitchen hairnet or a cap. Coordinates follow Human's skeleton (head centre ≈ y 1.594, z 0.034).
 */
function HeadCover({ kind, color }: { kind: Headwear; color: string }) {
  const m = mat(color, 0.85);
  if (kind === "turban")
    return (
      <group position={[0, 1.6, 0.03]} rotation={[-0.05, 0, 0]}>
        <mesh geometry={HEADWEAR.ring} material={m} position={[0, 0.045, -0.004]} rotation={[Math.PI / 2, 0, 0]} scale={[0.98, 1.06, 1]} castShadow />
        <mesh geometry={HEADWEAR.cap} material={m} position={[0, 0.05, -0.006]} scale={[0.93, 0.62, 1.0]} />
        <mesh geometry={HEADWEAR.ring} material={m} position={[0, 0.085, -0.01]} rotation={[Math.PI / 2 - 0.25, 0, 0.2]} scale={[0.82, 0.86, 0.75]} />
      </group>
    );
  if (kind === "hairnet")
    return (
      <group position={[0, 1.608, 0.026]}>
        <mesh geometry={HEADWEAR.cap} material={m} position={[0, 0.004, -0.006]} scale={[0.98, 1.08, 1.06]} />
        <mesh geometry={HEADWEAR.frill} material={m} position={[0, 0.004, -0.006]} rotation={[Math.PI / 2 - 0.12, 0, 0]} scale={[0.99, 1.08, 1]} />
      </group>
    );
  return (
    <group position={[0, 1.61, 0.03]}>
      <mesh geometry={HEADWEAR.cap} material={m} position={[0, 0.004, -0.006]} scale={[0.98, 0.9, 1.04]} />
      <mesh geometry={HEADWEAR.brim} material={m} position={[0, 0.006, 0.09]} scale={[0.7, 1, 0.75]} />
    </group>
  );
}

/** A standing person (optionally with headwear) who now and then turns a little — reads as working, not frozen. */
export function Worker({ look, at, face = 0, headwear, hwColor = "#FFFFFF", reduced, phase = 0, y }: { look: HumanLook; at: [number, number]; face?: number; headwear?: Headwear; hwColor?: string; reduced: boolean; phase?: number; y?: number }) {
  const g = useRef<THREE.Group>(null);
  const gy = useMemo(() => y ?? groundHeight(at[0], at[1]), [y, at]);
  useFrame(({ clock }) => {
    if (!g.current || reduced) return;
    const t = clock.elapsedTime * 0.45 + phase;
    g.current.rotation.y = face + Math.sin(t) * 0.25 + Math.sin(t * 2.3) * 0.08;
  });
  return (
    <group ref={g} position={[at[0], gy, at[1]]} rotation={[0, face, 0]}>
      <group scale={look.height ?? 1}>
        {headwear && <HeadCover kind={headwear} color={hwColor} />}
      </group>
      <Human look={{ ...look, height: look.height }} mode="stand" />
    </group>
  );
}

/** Walks back and forth between a and b (turns smoothly at the ends); follows the ground. */
export function Walker({ look, a, b, speed = 1.1, phase = 0, reduced, y }: { look: HumanLook; a: [number, number]; b: [number, number]; speed?: number; phase?: number; reduced: boolean; y?: number }) {
  const g = useRef<THREE.Group>(null);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const fwd = Math.atan2(b[0] - a[0], b[1] - a[1]);
  const heading = useRef(fwd);
  useFrame(({ clock }, dt) => {
    const grp = g.current;
    if (!grp) return;
    const cyc = reduced ? 0.5 : ((clock.elapsedTime * speed) / len + phase) % 2;
    const f = cyc < 1 ? cyc : 2 - cyc;
    const x = a[0] + (b[0] - a[0]) * f;
    const z = a[1] + (b[1] - a[1]) * f;
    grp.position.set(x, y ?? groundHeight(x, z), z);
    const goal = cyc < 1 ? fwd : fwd + Math.PI;
    heading.current += angleDelta(heading.current, goal) * Math.min(1, dt * 7);
    grp.rotation.y = heading.current;
  });
  return (
    <group ref={g}>
      <Human look={look} mode={reduced ? "stand" : "walk"} speed={speed} phase={phase * 9} />
    </group>
  );
}

/* ── vehicles bits ────────────────────────────────────────────── */

const WHEEL = {
  tyre: new THREE.CylinderGeometry(1, 1, 1, 22),
  rim: new THREE.CylinderGeometry(1, 1, 1, 14),
};

/** A road wheel, axle along x. */
export function Wheel({ r = 0.42, w = 0.26, spin }: { r?: number; w?: number; spin?: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current && spin) g.current.rotation.x = spin.current ?? 0;
  });
  return (
    <group ref={g}>
      <mesh geometry={WHEEL.tyre} material={mat("#1D1B1A", 0.9)} rotation={[0, 0, Math.PI / 2]} scale={[r, w, r]} castShadow />
      <mesh geometry={WHEEL.rim} material={mat("#A9ADB1", 0.35, 0.7)} rotation={[0, 0, Math.PI / 2]} scale={[r * 0.55, w + 0.02, r * 0.55]} />
      <mesh geometry={WHEEL.rim} material={mat("#5B5F63", 0.5, 0.5)} rotation={[0, 0, Math.PI / 2]} scale={[r * 0.18, w + 0.04, r * 0.18]} />
    </group>
  );
}

/** Jute sack geometry (shared). */
export const SACK = (() => {
  const g = new THREE.SphereGeometry(1, 14, 10);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    // flatter top/bottom, a little tied-off bulge
    p.setY(i, Math.sign(y) * Math.pow(Math.abs(y), 0.7));
  }
  g.computeVertexNormals();
  return g;
})();
