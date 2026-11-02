"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { ProductLine } from "@/lib/brand";
import { LINE_BACKDROP } from "@/lib/brand";
import { makeBowl, makeCyclorama, makeKatori, makeLaddooGeometry, makeSpeckleTexture } from "./geometry";

/** Backdrop + table colours ease towards the current product line. */
function useEasedColor(mat: THREE.MeshStandardMaterial, hex: string) {
  const invalidate = useThree((s) => s.invalidate);
  const target = useMemo(() => new THREE.Color(hex), [hex]);
  useEffect(() => invalidate(), [target, invalidate]);
  useFrame((_, dt) => {
    if (mat.color.equals(target)) return;
    mat.color.lerp(target, 1 - Math.exp(-dt * 4));
    const d = Math.abs(mat.color.r - target.r) + Math.abs(mat.color.g - target.g) + Math.abs(mat.color.b - target.b);
    if (d < 0.002) mat.color.copy(target);
    invalidate();
  });
}

export function Laddoos({ count, spread, height, seed = 3 }: { count: number; spread: number; height: number; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => makeLaddooGeometry(0.105, 3, seed), [seed]);
  const tex = useMemo(() => makeSpeckleTexture("#5b3322", seed), [seed]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 0.6, roughness: 0.92, color: "#ffffff" }),
    [tex],
  );
  useEffect(() => () => {
    geo.dispose();
    tex.dispose();
    mat.dispose();
  }, [geo, tex, mat]);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const golden = Math.PI * (3 - Math.sqrt(5));
    const tones = ["#6a3d27", "#4d2a1a", "#7c4a2c", "#3f2216", "#5a3322"];
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const layer = i < count * 0.65 ? 0 : 1;
      const rr = layer === 0 ? spread * Math.sqrt((i + 0.5) / (count * 0.65)) : spread * 0.45 * Math.sqrt((i - count * 0.65 + 0.5) / (count * 0.35));
      const a = i * golden;
      o.position.set(Math.cos(a) * rr, height + layer * 0.17, Math.sin(a) * rr);
      o.rotation.set(i * 1.3, i * 0.7, i * 2.1);
      o.scale.setScalar(0.92 + ((i * 37) % 10) / 60);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(tones[i % tones.length]).multiplyScalar(1.8));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, spread, height]);

  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow receiveShadow />;
}

export function BhujiaPile({ count = 420, spread = 0.42, height = 0.12 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.CapsuleGeometry(0.0085, 0.085, 2, 5), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d99a3a", roughness: 0.7 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let s = 11;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * spread;
      const dome = Math.sqrt(Math.max(0, 1 - (d / (spread * 1.05)) ** 2));
      o.position.set(Math.cos(a) * d, height + dome * 0.16 * rnd(), Math.sin(a) * d);
      o.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.setHSL(0.09 + rnd() * 0.02, 0.62, 0.42 + rnd() * 0.16));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, spread, height]);
  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow />;
}

export function NutPile({ count = 60, spread = 0.4, height = 0.12 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.06, 14, 10);
    g.scale(1, 0.55, 0.38);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.65 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const tones = ["#a8673a", "#e6c9a0", "#8a5a33", "#c99a62", "#4a2c2a", "#9fae5a"];
    let s = 5;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * spread;
      const dome = Math.sqrt(Math.max(0, 1 - (d / (spread * 1.05)) ** 2));
      o.position.set(Math.cos(a) * d, height + dome * 0.14 * rnd(), Math.sin(a) * d);
      o.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
      o.scale.setScalar(0.8 + rnd() * 0.5);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(tones[Math.floor(rnd() * tones.length)]));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, spread, height]);
  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow />;
}

function Props({ line }: { line: ProductLine }) {
  const prop = LINE_BACKDROP[line].prop;
  const katori = useMemo(() => makeKatori(0.46, 0.24), []);
  const bowl = useMemo(() => makeBowl(0.58, 0.3), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C8963E", metalness: 1, roughness: 0.28 }), []);
  const ceramic = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F4EEE6", roughness: 0.55 }), []);
  useEffect(() => () => {
    katori.dispose();
    bowl.dispose();
    brass.dispose();
    ceramic.dispose();
  }, [katori, bowl, brass, ceramic]);

  return (
    <group>
      {prop === "brass" ? (
        <group position={[-1.45, 0, -0.55]}>
          <mesh geometry={katori} material={brass} castShadow receiveShadow />
          <Laddoos count={9} spread={0.24} height={0.27} />
        </group>
      ) : (
        <group position={[-1.5, 0, -0.5]}>
          <mesh geometry={bowl} material={ceramic} castShadow receiveShadow />
          {line === "nuts" ? <NutPile spread={0.4} height={0.22} /> : <BhujiaPile spread={0.4} height={0.2} />}
        </group>
      )}
      {/* a few loose pieces on the table, kept away from the pack's front */}
      {(line === "laddoo" || line === "gifting") && (
        <group position={[1.3, 0.1, -0.15]}>
          <Laddoos count={3} spread={0.25} height={0} seed={9} />
        </group>
      )}
    </group>
  );
}

export function StudioSet({ line }: { line: ProductLine }) {
  const look = LINE_BACKDROP[line];
  const cyc = useMemo(() => makeCyclorama(), []);
  const coveMat = useMemo(() => new THREE.MeshStandardMaterial({ color: look.cove, roughness: 0.95 }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const tableMat = useMemo(() => new THREE.MeshStandardMaterial({ color: look.table, roughness: 0.75 }), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    cyc.dispose();
    coveMat.dispose();
    tableMat.dispose();
  }, [cyc, coveMat, tableMat]);
  useEasedColor(coveMat, look.cove);
  useEasedColor(tableMat, look.table);

  return (
    <group>
      <mesh geometry={cyc} material={coveMat} position={[0, -0.6, 0]} receiveShadow />
      {/* deep tabletop so the shelf-test view (camera ~11 units back) never sees past its edge */}
      <RoundedBox args={[10, 0.6, 14]} radius={0.06} smoothness={4} position={[0, -0.3, 4.6]} material={tableMat} receiveShadow />
      <Props line={line} />
    </group>
  );
}
