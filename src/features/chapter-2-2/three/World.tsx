"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import BoulevardWorld, { signTexture, type BoulevardKit } from "@/components/world2/BoulevardWorld";
import { Scooter } from "@/components/world2/StreetLife";
import { Person, type Look, type Pose } from "@/components/sim/Person";
import { Hoverable } from "@/components/world/hover";

/**
 * Chapter 2.2 district of Brand Boulevard — the "phone-screen skyline": phone-shaped towers with
 * post panels, like/comment shapes rising from them (no emojis), community crowds linked by glowing
 * lines, and a delivery scooter on the road. Generic content only, no real platform logos.
 */

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.35);
  s.bezierCurveTo(-0.55, 0.05, -0.35, 0.5, 0, 0.25);
  s.bezierCurveTo(0.35, 0.5, 0.55, 0.05, 0, -0.35);
  return s;
}
function bubbleShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.4, -0.15);
  s.quadraticCurveTo(-0.45, 0.32, 0, 0.32);
  s.quadraticCurveTo(0.45, 0.32, 0.4, -0.05);
  s.quadraticCurveTo(0.36, -0.28, 0, -0.26);
  s.lineTo(-0.28, -0.42);
  s.lineTo(-0.2, -0.2);
  s.quadraticCurveTo(-0.38, -0.2, -0.4, -0.15);
  return s;
}

function postTexture(seed: number, night: number) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = night > 0.5 ? "#1D1B26" : "#FFF5EE";
  g.fillRect(0, 0, 256, 512);
  const hues = ["#FF5C00", "#F4C21B", "#3DAE48", "#D81F45", "#7B4BB7", "#C8963E"];
  for (let i = 0; i < 3; i++) {
    const y = 26 + i * 160;
    g.fillStyle = night > 0.5 ? "#2B2836" : "#FFFFFF";
    g.beginPath();
    g.roundRect(14, y, 228, 146, 14);
    g.fill();
    g.fillStyle = hues[(seed + i) % hues.length];
    g.beginPath();
    g.roundRect(24, y + 10, 208, 92, 10);
    g.fill();
    g.fillStyle = night > 0.5 ? "#8C86A0" : "#D9C6B5";
    g.fillRect(24, y + 112, 120, 10);
    g.fillRect(24, y + 128, 80, 8);
    g.fillStyle = "#F83A3A";
    g.beginPath();
    g.arc(214, y + 124, 8, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A phone-shaped tower with a glowing feed; hearts and comment shapes float up from it. */
function PhoneTower({ x, z, h, seed, kit, label }: { x: number; z: number; h: number; seed: number; kit: BoulevardKit; label: string }) {
  const tex = useMemo(() => postTexture(seed, kit.night), [seed, kit.night]);
  useEffect(() => () => tex.dispose(), [tex]);
  const heart = useMemo(() => new THREE.ExtrudeGeometry(heartShape(), { depth: 0.08, bevelEnabled: false }), []);
  const bubble = useMemo(() => new THREE.ExtrudeGeometry(bubbleShape(), { depth: 0.08, bevelEnabled: false }), []);
  useEffect(
    () => () => {
      heart.dispose();
      bubble.dispose();
    },
    [heart, bubble],
  );
  const floaters = useRef<(THREE.Mesh | null)[]>([]);
  const n = kit.compact ? 3 : 5;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    floaters.current.forEach((m, i) => {
      if (!m) return;
      const k = kit.reduced ? 0.5 : ((t * 0.25 + i / n + seed * 0.13) % 1);
      m.position.set(Math.sin(i * 2.1 + seed) * 0.5, h + 0.2 + k * 2.4, 0.3);
      m.scale.setScalar(0.35 + Math.sin(k * Math.PI) * 0.25);
      (m.material as THREE.MeshStandardMaterial).opacity = Math.sin(k * Math.PI);
      m.rotation.y = Math.sin(t + i) * 0.4;
    });
  });
  const w = h * 0.42;
  const face = x > 0 ? -0.5 : 0.5;
  return (
    <group position={[x, 0, z]} rotation={[0, face, 0]}>
      <Hoverable label={label}>
        <RoundedBox args={[w, h, 0.32]} radius={0.18} position={[0, h / 2, 0]} castShadow>
          <meshStandardMaterial color="#2F1C1A" roughness={0.35} metalness={0.2} />
        </RoundedBox>
        <mesh position={[0, h / 2, 0.165]}>
          <planeGeometry args={[w * 0.88, h * 0.9]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.25 + kit.night * 0.6} />
        </mesh>
      </Hoverable>
      {Array.from({ length: n }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            floaters.current[i] = el;
          }}
          geometry={i % 2 ? bubble : heart}
        >
          <meshStandardMaterial color={i % 2 ? "#FFF5EE" : "#F83A3A"} emissive={i % 2 ? "#FFE9D2" : "#F83A3A"} emissiveIntensity={0.3 + kit.night * 0.5} transparent />
        </mesh>
      ))}
    </group>
  );
}

/** A small crowd on the pavement, linked by glowing lines — a community. */
function Community({ x, z, kit, label }: { x: number; z: number; kit: BoulevardKit; label: string }) {
  const people = useMemo(() => {
    return Array.from({ length: kit.compact ? 4 : 6 }, (_, i) => ({ px: Math.cos(i * 1.7) * 0.9, pz: Math.sin(i * 1.7) * 0.7, look: CROWD[i % CROWD.length] }));
  }, [kit.compact]);
  const poses = useMemo(() => people.map((_, i) => ({ current: { walk: 0, mood: 1, arm: i % 3 === 0 ? 0.25 : 0, shake: 0, jump: 0, holding: false } as Pose })), [people]);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    people.forEach((a, i) => {
      const b = people[(i + 1) % people.length];
      pts.push(new THREE.Vector3(a.px, 2.05, a.pz), new THREE.Vector3(b.px, 2.05, b.pz));
    });
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [people]);
  useEffect(() => () => lines.dispose(), [lines]);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = kit.reduced ? 0.8 : 0.45 + Math.sin(clock.elapsedTime * 2) * 0.35;
  });
  return (
    <Hoverable label={label}>
      <group position={[x, 0, z]}>
        {people.map((p, i) => (
          <group key={i} position={[p.px, 0.12, p.pz]} rotation={[0, Math.atan2(-p.px, -p.pz), 0]} scale={0.9}>
            <Person look={p.look} pose={poses[i]} />
          </group>
        ))}
        <lineSegments geometry={lines}>
          <lineBasicMaterial ref={mat} color="#FFC24D" transparent />
        </lineSegments>
      </group>
    </Hoverable>
  );
}

/** Delivery scooter riding up the road (the shared street scooter with a hover label). */
function DeliveryRun({ kit }: { kit: BoulevardKit }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const t = kit.reduced ? 0.3 : (clock.elapsedTime * 0.06) % 1;
    g.current.position.set(-1.45, 0, 4 - t * 64);
    if (!kit.reduced) spin.current += dt * 14;
  });
  return (
    <group ref={g} rotation={[0, Math.PI, 0]}>
      <Hoverable label="Delivery on its way — online orders reach the doorstep">
        <Scooter spin={spin} />
      </Hoverable>
    </group>
  );
}

const CROWD: Look[] = [
  { skin: "#C68B59", top: "#FF5C00", bottom: "#3B3B3B", hair: "#1E1410", hairStyle: "short" },
  { skin: "#9C6644", top: "#2E7D6B", bottom: "#2E7D6B", hair: "#140C08", hairStyle: "long", dress: true },
  { skin: "#D4A373", top: "#1E5AA8", bottom: "#263238", hair: "#3E2723", hairStyle: "short", extra: "cap", extraColor: "#FED300" },
  { skin: "#A86B45", top: "#C9A400", bottom: "#795548", hair: "#9E9E9E", hairStyle: "bun", dress: true, extra: "glasses", extraColor: "#2F1C1A" },
  { skin: "#B5764A", top: "#B3261E", bottom: "#4E342E", hair: "#1A110C", hairStyle: "short", extra: "backpack", extraColor: "#35401D" },
  { skin: "#8D5A3B", top: "#7B4BB7", bottom: "#7B4BB7", hair: "#140C08", hairStyle: "long", dress: true, extra: "dupatta", extraColor: "#FFC24D" },
];

/** Street sign for the district. */
function DistrictSign({ z, text, kit }: { z: number; text: string; kit: BoulevardKit }) {
  const tex = useMemo(() => signTexture(text, "#2F1C1A", "#FED300", 768, 128), [text]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={[4.4, 0, z]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#3B3B3B" />
      </mesh>
      <mesh position={[0, 2.8, 0.02]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.2 + kit.night * 0.5} />
      </mesh>
    </group>
  );
}

export default function World() {
  return (
    <BoulevardWorld
      chapter="2.2"
      scenes={(kit) => (
        <>
          <DistrictSign z={-9} text="PHONE-SCREEN SKYLINE" kit={kit} />
          <PhoneTower x={4.6} z={-6} h={3.6} seed={1} kit={kit} label="Social feed — reach new people" />
          <PhoneTower x={-4.6} z={-12} h={3.0} seed={2} kit={kit} label="Reels and posts — showcase products" />
          <Community x={4.7} z={-17} kit={kit} label="A community of customers" />
          <PhoneTower x={4.6} z={-23} h={4.0} seed={3} kit={kit} label="Founder stories — build trust" />
          <Community x={-4.7} z={-28} kit={kit} label="Squad members talking to each other" />
          <PhoneTower x={-4.6} z={-35} h={3.4} seed={4} kit={kit} label="Reviews and ratings — social proof" />
          <PhoneTower x={4.6} z={-42} h={3.2} seed={5} kit={kit} label="Offers that give a reason to buy" />
          {!kit.compact && <Community x={4.7} z={-50} kit={kit} label="Repeat customers" />}
          <PhoneTower x={-4.6} z={-54} h={3.8} seed={6} kit={kit} label="Quick-commerce apps — delivered in minutes" />
          <DeliveryRun kit={kit} />
        </>
      )}
    />
  );
}
