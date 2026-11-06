"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import BoulevardWorld, { Billboard, signTexture, type BoulevardKit } from "@/components/world2/BoulevardWorld";
import { Person, still, type Look, type Pose } from "@/components/sim/Person";
import { Hoverable } from "@/components/world/hover";

/**
 * Chapter 2.4 district of Brand Boulevard (neon night) — the pitch & media district: a GENERIC pitch
 * studio front with searchlights (no show branding), TV cameras, press photographers with flashes, a
 * newspaper kiosk with blank headlines, and billboards with official Eat Better images.
 * Props stay at |x| >= 5.3 (the walking strip |x| 4.0–4.9 is kept clear).
 */

function Sign({ x, z, text, rot, kit }: { x: number; z: number; text: string; rot: number; kit: BoulevardKit }) {
  const tex = useMemo(() => signTexture(text, "#1B1426", "#FED300", 768, 128), [text]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#3B3B3B" />
      </mesh>
      <mesh position={[0, 2.8, 0.02]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.4 + kit.night * 0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Generic pitch-studio front: marquee bulbs, a glowing entrance and two sweeping searchlights. */
function StudioFront({ x, z, rot, kit }: { x: number; z: number; rot: number; kit: BoulevardKit }) {
  const tex = useMemo(() => signTexture("THE PITCH · STUDIO 4", "#2F1C1A", "#FFF5EE", 768, 128), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const beams = useRef<THREE.Group>(null);
  const bulbs = useMemo(() => Array.from({ length: kit.compact ? 10 : 18 }, (_, i) => i), [kit.compact]);
  useFrame(({ clock }) => {
    if (!beams.current || kit.reduced) return;
    const t = clock.elapsedTime;
    beams.current.children.forEach((b, i) => {
      b.rotation.z = Math.sin(t * 0.6 + i * 2) * 0.45;
    });
  });
  return (
    <Hoverable label="A pitch studio — national TV is top-of-funnel marketing">
      <group position={[x, 0, z]} rotation={[0, rot, 0]}>
        <mesh position={[0, 2, -0.6]} castShadow>
          <boxGeometry args={[3.4, 4, 0.8]} />
          <meshStandardMaterial color="#241A33" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.15, -0.19]}>
          <planeGeometry args={[1.5, 2.1]} />
          <meshStandardMaterial color="#FFB866" emissive="#FF8A3D" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        <mesh position={[0, 3.1, -0.18]}>
          <planeGeometry args={[3.0, 0.5]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
        {bulbs.map((i) => {
          const k = i / (bulbs.length - 1);
          return (
            <mesh key={i} position={[-1.6 + k * 3.2, 3.55, -0.16]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial color="#FFE6B0" emissive="#FFC24D" emissiveIntensity={2.2} toneMapped={false} />
            </mesh>
          );
        })}
        {/* red carpet */}
        <mesh position={[0, 0.13, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.6]} />
          <meshStandardMaterial color="#B3261E" roughness={0.9} />
        </mesh>
        {!kit.compact && (
          <group ref={beams} position={[0, 4, -0.6]}>
            {[-1.2, 1.2].map((bx) => (
              <mesh key={bx} position={[bx, 0, 0]}>
                <coneGeometry args={[0.7, 9, 20, 1, true]} />
                <meshBasicMaterial color="#CFE3FF" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </Hoverable>
  );
}

function TvCamera({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <Hoverable label="TV camera — a prime-time broadcast reaches the whole nation">
      <group position={[x, 0.12, z]} rotation={[0, rot, 0]}>
        {[0, 1, 2].map((k) => {
          const a = (k * 2 * Math.PI) / 3;
          return (
            <mesh key={k} position={[Math.sin(a) * 0.28, 0.6, Math.cos(a) * 0.28]} rotation={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]}>
              <cylinderGeometry args={[0.025, 0.025, 1.3, 6]} />
              <meshStandardMaterial color="#2B2A29" />
            </mesh>
          );
        })}
        <RoundedBox args={[0.42, 0.42, 0.8]} radius={0.05} position={[0, 1.4, 0]} castShadow>
          <meshStandardMaterial color="#1E1A18" roughness={0.4} metalness={0.4} />
        </RoundedBox>
        <mesh position={[0, 1.42, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.25, 20]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0.12, 1.66, 0.3]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#FF3B30" emissive="#FF3B30" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>
    </Hoverable>
  );
}

const PRESS: Look[] = [
  { skin: "#B98157", top: "#37474F", bottom: "#212121", hair: "#140C08", hairStyle: "short", extra: "cap", extraColor: "#1565C0" },
  { skin: "#9C6644", top: "#5D4037", bottom: "#3E2723", hair: "#140C08", hairStyle: "long" },
  { skin: "#D4A373", top: "#455A64", bottom: "#263238", hair: "#3E2723", hairStyle: "short", extra: "glasses", extraColor: "#2F1C1A" },
];

/** Photographers with cameras whose flashes pop at random. */
function PressPack({ x, z, rot, kit }: { x: number; z: number; rot: number; kit: BoulevardKit }) {
  const n = kit.compact ? 2 : 3;
  const poses = useMemo(() => Array.from({ length: n }, () => ({ current: still({ arm: 0.5 }) as Pose })), [n]);
  const flashes = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const seeds = useMemo(() => Array.from({ length: n }, (_, i) => 1.3 + i * 0.77), [n]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flashes.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t * seeds[i]) % 2.4;
      m.emissiveIntensity = kit.reduced ? 0.6 : phase < 0.12 ? 6 : 0;
    });
  });
  return (
    <Hoverable label="Press photographers — earned media coverage">
      <group position={[x, 0.12, z]} rotation={[0, rot, 0]}>
        {Array.from({ length: n }, (_, i) => (
          <group key={i} position={[(i - (n - 1) / 2) * 0.75, 0, (i % 2) * 0.35]}>
            <Person look={PRESS[i]} pose={poses[i]} />
            <group position={[0, 1.6, 0.42]}>
              <RoundedBox args={[0.24, 0.16, 0.14]} radius={0.02}>
                <meshStandardMaterial color="#1E1A18" />
              </RoundedBox>
              <mesh position={[0, 0.13, 0]}>
                <boxGeometry args={[0.12, 0.08, 0.06]} />
                <meshStandardMaterial
                  ref={(m) => {
                    flashes.current[i] = m;
                  }}
                  color="#FFFFFF"
                  emissive="#FFFFFF"
                  emissiveIntensity={0}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </Hoverable>
  );
}

function headlineTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const g = c.getContext("2d")!;
  g.fillStyle = "#F4EFE6";
  g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#2F1C1A";
  g.fillRect(16, 16, 224, 26);
  g.fillStyle = "#9A938A";
  for (let y = 60; y < 300; y += 18) g.fillRect(16, y, y % 36 === 0 ? 150 : 224, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Newspaper kiosk with blank headlines (no real outlets). */
function Kiosk({ x, z, rot }: { x: number; z: number; rot: number }) {
  const tex = useMemo(() => headlineTexture(), []);
  const sign = useMemo(() => signTexture("NEWS", "#FF5C00", "#FFF5EE", 256, 96), []);
  useEffect(
    () => () => {
      tex.dispose();
      sign.dispose();
    },
    [tex, sign],
  );
  return (
    <Hoverable label="Newspaper kiosk — funding news becomes business press">
      <group position={[x, 0.12, z]} rotation={[0, rot, 0]}>
        <RoundedBox args={[1.6, 1.1, 0.9]} radius={0.06} position={[0, 0.55, 0]} castShadow>
          <meshStandardMaterial color="#2E7D6B" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[1.9, 0.08, 1.2]} />
          <meshStandardMaterial color="#2E7D6B" roughness={0.6} />
        </mesh>
        {[-0.85, 0.85].map((px) => (
          <mesh key={px} position={[px, 1.65, -0.35]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#1E1A18" />
          </mesh>
        ))}
        <mesh position={[0, 2.45, 0.6]}>
          <planeGeometry args={[0.9, 0.34]} />
          <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#FFFFFF" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        {[-0.5, 0, 0.5].map((px, i) => (
          <mesh key={px} position={[px, 1.45, 0.46]} rotation={[-0.12, 0, (i - 1) * 0.05]}>
            <planeGeometry args={[0.42, 0.52]} />
            <meshStandardMaterial map={tex} roughness={0.9} />
          </mesh>
        ))}
      </group>
    </Hoverable>
  );
}

export default function World() {
  return (
    <BoulevardWorld
      chapter="2.4"
      scenes={(kit) => (
        <>
          <Sign x={5.6} z={-6} text="PITCH & MEDIA DISTRICT" rot={-0.6} kit={kit} />
          <StudioFront x={6.4} z={-11} rot={-1.25} kit={kit} />
          <TvCamera x={5.5} z={-8.3} rot={-2.2} />
          <PressPack x={-5.8} z={-12.5} rot={1.3} kit={kit} />
          <Hoverable label="Press feature — Eat Better on Shark Tank India (ceovine.com)">
            <Billboard src="/chapter-2-4/lms-3.png" position={[-6.1, 3.3, -19]} rotation={[0, 0.9, 0]} width={2.4} height={2.4} />
          </Hoverable>
          <Kiosk x={5.9} z={-23} rot={-1.2} />
          <Hoverable label="Festive campaign — Diwali gift hampers (official photo)">
            <Billboard src="/brand/catalog/bb-tyohaar.webp" position={[6.1, 3.3, -31]} rotation={[0, -0.9, 0]} width={2.6} height={2.6} />
          </Hoverable>
          <Hoverable label="Rakhi gift hamper (official photo)">
            <Billboard src="/brand/catalog/bb-nazar.webp" position={[-6.1, 3.3, -36]} rotation={[0, 0.9, 0]} width={2.4} height={2.4} />
          </Hoverable>
          <Hoverable label="Corporate gifting — eatbetterco.com (screenshot)">
            <Billboard src="/chapter-2-4/web/corporate-gifting.webp" position={[6.1, 3.3, -44]} rotation={[0, -0.9, 0]} width={4.1} height={2.0} />
          </Hoverable>
          {!kit.compact && <PressPack x={5.8} z={-50} rot={-1.3} kit={kit} />}
          <Hoverable label="“Featured in media” — eatbetterco.com (screenshot)">
            <Billboard src="/chapter-2-4/web/featured-in-media.webp" position={[-6.1, 3.3, -54]} rotation={[0, 0.9, 0]} width={4.3} height={1.0} />
          </Hoverable>
          <TvCamera x={-5.5} z={-58} rot={2.2} />
        </>
      )}
    />
  );
}
