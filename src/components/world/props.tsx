"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { makeBowl } from "@/features/packaging/three/geometry";
import { Hoverable } from "./hover";

export { BhujiaPile, Laddoos, NutPile } from "@/features/packaging/three/StudioSet";

/** Reusable props for the chapter worlds (instanced where repeated). */

/* ── materials & textures (created once) ──────────────────────── */

export function makeWoodTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#C79A70";
  g.fillRect(0, 0, 512, 512);
  let s = 42;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let plank = 0; plank < 4; plank++) {
    const x0 = plank * 128;
    g.fillStyle = `rgba(${120 + rnd() * 30},${78 + rnd() * 20},${45 + rnd() * 15},0.25)`;
    g.fillRect(x0, 0, 128, 512);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(90,55,30,${0.05 + rnd() * 0.12})`;
      g.lineWidth = 0.6 + rnd() * 1.6;
      const x = x0 + rnd() * 128;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + rnd() * 10 - 5, 170, x + rnd() * 10 - 5, 340, x + rnd() * 6 - 3, 512);
      g.stroke();
    }
    g.fillStyle = "rgba(60,35,20,0.35)";
    g.fillRect(x0, 0, 2, 512);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 22);
  t.anisotropy = 8;
  return t;
}

/* ── props ────────────────────────────────────────────────────── */

export function Scatter({ count, area, kind, seed = 1 }: { count: number; area: [number, number, number, number]; kind: "almond" | "date" | "hazelnut" | "seed"; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geo, mat } = useMemo(() => {
    let g: THREE.BufferGeometry;
    let m: THREE.Material;
    if (kind === "almond") {
      g = new THREE.SphereGeometry(0.06, 12, 8);
      g.scale(1.5, 0.45, 0.9);
      m = new THREE.MeshStandardMaterial({ color: "#A8673A", roughness: 0.6 });
    } else if (kind === "date") {
      g = new THREE.SphereGeometry(0.065, 14, 10);
      g.scale(1.7, 0.75, 0.8);
      m = new THREE.MeshPhysicalMaterial({ color: "#4A1E10", roughness: 0.35, clearcoat: 0.6 });
    } else if (kind === "hazelnut") {
      g = new THREE.SphereGeometry(0.06, 12, 10);
      g.scale(1, 1.1, 1);
      m = new THREE.MeshStandardMaterial({ color: "#8F5326", roughness: 0.5 });
    } else {
      g = new THREE.SphereGeometry(0.022, 6, 5);
      g.scale(1.6, 0.6, 1);
      m = new THREE.MeshStandardMaterial({ color: "#EADBC0", roughness: 0.8 });
    }
    return { geo: g, mat: m };
  }, [kind]);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const o = new THREE.Object3D();
    const [x0, x1, z0, z1] = area;
    for (let i = 0; i < count; i++) {
      o.position.set(x0 + rnd() * (x1 - x0), kind === "seed" ? 0.012 : 0.03, z0 + rnd() * (z1 - z0));
      o.rotation.set(0, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.3);
      o.scale.setScalar(0.85 + rnd() * 0.3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, area, kind, seed]);
  const label = kind === "almond" ? "Almonds" : kind === "date" ? "Dates — natural sweetness" : kind === "hazelnut" ? "Hazelnuts" : "Seeds";
  return (
    <Hoverable label={label}>
      <instancedMesh ref={ref} args={[geo, mat, count]} castShadow receiveShadow />
    </Hoverable>
  );
}

export function MailerBox({ size = [0.9, 0.42, 0.65], color = "#FF5C00" }: { size?: [number, number, number]; color?: string }) {
  const [w, h, d] = size;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.02} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </RoundedBox>
      {/* paper tape */}
      <mesh position={[0, h + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.98, 0.09]} />
        <meshStandardMaterial color="#E9D3B4" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function GiftBox({ color = "#FF5C00", lid = "#E8540A", s = 1 }: { color?: string; lid?: string; s?: number }) {
  return (
    <group scale={s}>
      <RoundedBox args={[0.7, 0.42, 0.7]} radius={0.02} position={[0, 0.21, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[0.74, 0.1, 0.74]} radius={0.02} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color={lid} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.745, 0.52, 0.07]} />
        <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.07, 0.52, 0.745]} />
        <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.09, 0.53, 0]} rotation={[Math.PI / 2, k * 0.5, 0]}>
          <torusGeometry args={[0.08, 0.022, 10, 24]} />
          <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export function Marigold({ s = 1 }: { s?: number }) {
  const petals = useMemo(() => Array.from({ length: 26 }, (_, i) => i), []);
  return (
    <group scale={s}>
      {petals.map((i) => {
        const ring = i < 14 ? 0 : 1;
        const n = ring ? 12 : 14;
        const a = ((i % n) / n) * Math.PI * 2 + ring * 0.3;
        const r = ring ? 0.06 : 0.1;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.06 + ring * 0.04, Math.sin(a) * r]} rotation={[0.6 * (ring ? 0.6 : 1), -a, 0]}>
            <sphereGeometry args={[0.055, 8, 6]} />
            <meshStandardMaterial color={ring ? "#FF9A12" : "#F57C00"} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Diya({ flicker }: { flicker: boolean }) {
  const flame = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => makeBowl(0.16, 0.08), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ clock }) => {
    if (!flame.current || !flicker) return;
    const t = clock.elapsedTime;
    flame.current.scale.set(1 + Math.sin(t * 13) * 0.06, 1 + Math.sin(t * 9.3) * 0.12, 1);
  });
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#B5652F" roughness={0.6} />
      </mesh>
      <mesh ref={flame} position={[0.05, 0.13, 0]}>
        <coneGeometry args={[0.03, 0.11, 12]} />
        <meshStandardMaterial color="#FFC14D" emissive="#FF8A00" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0.05, 0.2, 0]} color="#FFB04A" intensity={0.9} distance={2.2} />
    </group>
  );
}

export function Mint({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.06, 0.05, 0.12, 0.1, 0.2, 0);
    s.bezierCurveTo(0.12, -0.1, 0.06, -0.05, 0, 0);
    const g = new THREE.ShapeGeometry(s, 10);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotation, 0]} castShadow>
      <meshStandardMaterial color="#3E8F3A" roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

