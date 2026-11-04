"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import BoulevardWorld, { Billboard, signTexture } from "@/components/world2/BoulevardWorld";
import { Hoverable } from "@/components/world/hover";

/**
 * Chapter 2.1 stretch of Brand Boulevard — the "design studio" district at golden hour:
 * brand-palette swatch monoliths, moodboard billboards with official creatives, real packs on
 * plinths, logo standees and a giant tone-of-voice speaker.
 */

const PALETTE = [
  { name: "Better Orange", hex: "#FF5C00" },
  { name: "Cocoa", hex: "#2F1C1A" },
  { name: "Logo Chocolate", hex: "#603A38" },
  { name: "Peach", hex: "#FEE7D5" },
  { name: "Cream", hex: "#FFF5EE" },
  { name: "Haldi Yellow", hex: "#FED300" },
];
const PACKS = ["millet-bhujia", "quinoa-namkeen", "nut-mix", "hazelnut-laddoo", "trail-mix", "ragi-chips"];

function Swatches({ position, rotation = 0, compact }: { position: [number, number, number]; rotation?: number; compact: boolean }) {
  const list = compact ? PALETTE.slice(0, 4) : PALETTE;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {list.map((p, i) => {
        const h = 1.6 + (i % 3) * 0.55;
        return (
          <Hoverable key={p.name} label={`${p.name} · ${p.hex} (Eat Better palette)`}>
            <RoundedBox args={[0.55, h, 0.55]} radius={0.05} position={[(i - (list.length - 1) / 2) * 0.68, h / 2, 0]} castShadow>
              <meshStandardMaterial color={p.hex} roughness={0.45} />
            </RoundedBox>
          </Hoverable>
        );
      })}
    </group>
  );
}

function PackPlinths({ position, rotation = 0, ids }: { position: [number, number, number]; rotation?: number; ids: string[] }) {
  const tex = useTexture(ids.map((id) => `/chapter-1-3/packs/${id}.webp`));
  useMemo(() => tex.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace)), [tex]);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    g.current?.children.forEach((c, i) => {
      const pack = c.children[1];
      if (pack) pack.rotation.y = Math.sin(clock.elapsedTime * 0.7 + i) * 0.4;
    });
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]}>
      {ids.map((id, i) => {
        const t = tex[i];
        const img = t.image as { width: number; height: number } | undefined;
        const h = 1.0;
        const w = h * (img ? img.width / img.height : 0.7);
        return (
          <group key={id} position={[(i - (ids.length - 1) / 2) * 1.35, 0, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.42, 0.48, 0.9, 28]} />
              <meshStandardMaterial color="#FFF5EE" roughness={0.5} />
            </mesh>
            <Hoverable label={`${id.replace(/-/g, " ")} — official Eat Better pack`}>
              <group position={[0, 0.9 + h / 2 + 0.05, 0]}>
                <RoundedBox args={[w, h, 0.07]} radius={0.02} castShadow>
                  <meshStandardMaterial color="#3A231C" />
                </RoundedBox>
                <mesh position={[0, 0, 0.036]}>
                  <planeGeometry args={[w * 0.985, h * 0.985]} />
                  <meshStandardMaterial map={t} roughness={0.45} />
                </mesh>
              </group>
            </Hoverable>
          </group>
        );
      })}
    </group>
  );
}

function LogoStandee({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 640;
      const g = c.getContext("2d")!;
      g.fillStyle = "#FFF5EE";
      g.fillRect(0, 0, 1024, 640);
      g.strokeStyle = "#FF5C00";
      g.lineWidth = 26;
      g.strokeRect(13, 13, 998, 614);
      g.drawImage(img, 162, 120, 700, 700 * (40 / 83));
      g.fillStyle = "#4A3230";
      g.textAlign = "center";
      g.font = `700 56px ${getComputedStyle(document.body).fontFamily}`;
      g.fillText("THE JOY OF SNACKING, MADE BETTER.", 512, 540, 900);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
    img.src = "/brand/eat-better-logo.svg";
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return (
    <Hoverable label="Eat Better logo & tagline">
      <group position={position} rotation={[0, rotation, 0]}>
        <RoundedBox args={[3.3, 2.1, 0.12]} radius={0.05} position={[0, 2.4, -0.07]} castShadow>
          <meshStandardMaterial color="#2F1C1A" />
        </RoundedBox>
        {tex && (
          <mesh position={[0, 2.4, 0]}>
            <planeGeometry args={[3.15, 1.97]} />
            <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.12} toneMapped={false} />
          </mesh>
        )}
        <mesh position={[0, 0.7, -0.1]} castShadow>
          <boxGeometry args={[0.18, 1.4, 0.18]} />
          <meshStandardMaterial color="#3A3330" />
        </mesh>
      </group>
    </Hoverable>
  );
}

function ToneSpeaker({ position, rotation = 0, reduced }: { position: [number, number, number]; rotation?: number; reduced: boolean }) {
  const rings = useRef<THREE.Group>(null);
  const sign = useMemo(() => signTexture("TONE OF VOICE", "#2F1C1A", "#FED300", 512, 112), []);
  useEffect(() => () => sign.dispose(), [sign]);
  useFrame(({ clock }) => {
    if (reduced) return;
    rings.current?.children.forEach((r, i) => {
      const k = (clock.elapsedTime * 0.5 + i / 3) % 1;
      r.scale.setScalar(0.7 + k * 1.8);
      ((r as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.5;
    });
  });
  return (
    <Hoverable label="Tone of voice: warm, simple, about joy">
      <group position={position} rotation={[0, rotation, 0]}>
        <RoundedBox args={[1.6, 2.6, 1.0]} radius={0.08} position={[0, 1.3, 0]} castShadow>
          <meshStandardMaterial color="#2F1C1A" roughness={0.5} />
        </RoundedBox>
        {[1.75, 0.75].map((y, i) => (
          <mesh key={y} position={[0, y, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[i ? 0.4 : 0.55, i ? 0.25 : 0.32, 0.12, 32, 1, true]} />
            <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.35} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <group ref={rings} position={[0, 1.75, 0.6]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <ringGeometry args={[0.55, 0.6, 40]} />
              <meshBasicMaterial color="#FFB27A" transparent opacity={0} depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 2.9, 0]}>
          <planeGeometry args={[1.6, 0.35]} />
          <meshStandardMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </Hoverable>
  );
}

export default function World() {
  return (
    <BoulevardWorld
      chapter="2.1"
      scenes={({ compact, reduced }) => (
        <>
          <Swatches position={[4.6, 0, -4]} rotation={-0.55} compact={compact} />
          <Hoverable label="eatbetterco.com header — official website">
            <Billboard src="/chapter-2-1/lms-1.png" position={[0.6, 5.7, -12]} width={6.4} height={1} posts={false} />
          </Hoverable>
          {[-3.4, 4.6].map((x) => (
            <mesh key={x} position={[x, 2.9, -12.08]} castShadow>
              <cylinderGeometry args={[0.07, 0.08, 5.8, 8]} />
              <meshStandardMaterial color="#3A3330" metalness={0.4} roughness={0.5} />
            </mesh>
          ))}
          <Hoverable label="Official Eat Better product photo">
            <Billboard src="/brand/products/millet-namkeen-0.webp" position={[-4.7, 3.2, -8]} rotation={[0, 0.5, 0]} width={2.4} height={2.4} />
          </Hoverable>
          <Suspense fallback={null}>
            <PackPlinths position={[4.4, 0, -15]} rotation={-0.75} ids={compact ? PACKS.slice(0, 2) : PACKS.slice(0, 3)} />
          </Suspense>
          <LogoStandee position={[-4.5, 0, -18]} rotation={0.55} />
          <Hoverable label="eatbetterco.com — official website">
            <Billboard src="/chapter-1-5/all-products-collection.png" position={[4.8, 3.3, -27]} rotation={[0, -0.55, 0]} width={4.2} height={2.37} />
          </Hoverable>
          <ToneSpeaker position={[-4.4, 0, -29]} rotation={0.6} reduced={reduced} />
          <Swatches position={[-4.6, 0, -38]} rotation={0.6} compact={compact} />
          <Hoverable label="Official Eat Better creative">
            <Billboard src="/brand/products/laddoo-box-42-0.webp" position={[4.7, 3.2, -40]} rotation={[0, -0.5, 0]} width={2.4} height={2.4} />
          </Hoverable>
          {!compact && (
            <Suspense fallback={null}>
              <PackPlinths position={[-4.4, 0, -49]} rotation={0.75} ids={PACKS.slice(3, 6)} />
            </Suspense>
          )}
          <LogoStandee position={[4.5, 0, -55]} rotation={-0.55} />
        </>
      )}
    />
  );
}
