"use client";

import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox, useTexture } from "@react-three/drei";
import TableWorld from "@/components/world/TableWorld";
import { Hoverable } from "@/components/world/hover";
import { Diya, GiftBox, Laddoos, MailerBox, Marigold, NutPile, Scatter } from "@/components/world/props";

/**
 * Chapter 1.5 scenes along the hall table:
 * laddoo boxes → namkeen pouches → nut mixes → festive hampers → corporate boxes → a final katori.
 */

const PACKS = {
  bhujia: "/chapter-1-3/packs/millet-bhujia.webp",
  bhel: "/chapter-1-3/packs/millet-bhel.webp",
  quinoa: "/chapter-1-3/packs/quinoa-namkeen.webp",
  nut: "/chapter-1-3/packs/nut-mix.webp",
  trail: "/chapter-1-3/packs/trail-mix.webp",
  seed: "/chapter-1-3/packs/seed-mix.webp",
  hazel: "/chapter-1-3/packs/hazelnut-laddoo.webp",
  protein: "/chapter-1-3/packs/protein-laddoo.webp",
};

function Pack({ tex, h = 0.62, color = "#2B1A14" }: { tex: THREE.Texture; h?: number; color?: string }) {
  const img = tex.image as { width: number; height: number } | undefined;
  const w = h * (img ? img.width / img.height : 0.7);
  return (
    <group>
      <RoundedBox args={[w, h, 0.1]} radius={0.025} position={[0, h / 2, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, h / 2, 0.051]}>
        <planeGeometry args={[w * 0.985, h * 0.985]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Packs() {
  const tex = useTexture(PACKS) as Record<keyof typeof PACKS, THREE.Texture>;
  useMemo(() => {
    for (const t of Object.values(tex)) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  }, [tex]);
  return (
    <>
      <Hoverable label="Sweets & Laddoos — sweetened with dates">
        <group position={[3.4, 0, -1.2]} rotation={[0, -0.35, 0]}>
          <group position={[-0.3, 0, 0]}>
            <Pack tex={tex.hazel} />
          </group>
          <group position={[0.15, 0, 0.1]}>
            <Pack tex={tex.protein} />
          </group>
        </group>
      </Hoverable>
      <Hoverable label="Namkeens — roasted, no palm oil">
        <group position={[-3.6, 0, -11.5]} rotation={[0, 0.35, 0]}>
          {(["bhujia", "bhel", "quinoa"] as const).map((k, i) => (
            <group key={k} position={[(i - 1) * 0.62, 0, (i % 2) * 0.15]} rotation={[0, (1 - i) * 0.15, 0]}>
              <Pack tex={tex[k]} h={0.66} color="#9DBA3A" />
            </group>
          ))}
        </group>
      </Hoverable>
      <Hoverable label="Nuts & Mixes — real ingredients">
        <group position={[3.6, 0, -21]} rotation={[0, -0.4, 0]}>
          {(["nut", "trail", "seed"] as const).map((k, i) => (
            <group key={k} position={[(i - 1) * 0.55, 0, (i % 2) * 0.15]}>
              <Pack tex={tex[k]} h={0.66} color="#E8622C" />
            </group>
          ))}
        </group>
      </Hoverable>
    </>
  );
}

export default function World() {
  return (
    <TableWorld
      scenes={({ katori, mats, compact, reduced }) => (
        <>
          <Suspense fallback={null}>
            <Packs />
          </Suspense>
          <Hoverable label="Dry-fruit laddoos">
            <group position={[-3.4, 0.06, -1.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={11} spread={0.33} height={0.36} />
            </group>
          </Hoverable>
          <Hoverable label="Nut mix">
            <group position={[-3.3, 0.06, -22]}>
              <mesh geometry={katori} material={mats.ceramic} castShadow receiveShadow />
              <NutPile count={70} spread={0.34} height={0.14} />
            </group>
          </Hoverable>

          <Hoverable label="Festive hampers — Diwali and Rakhi">
            <group position={[-3.4, 0, -32]}>
              <GiftBox color="#550D10" lid="#C8963E" />
              <group position={[0.9, 0, 0.3]} scale={0.75}>
                <GiftBox color="#FF5C00" lid="#E8540A" />
              </group>
            </group>
          </Hoverable>
          <group position={[3.2, 0.02, -33]}>
            <Hoverable label="Diyas for Diwali">
              <group>
                <Diya flicker={!reduced} />
                <group position={[0.5, 0, 0.3]}>
                  <Diya flicker={!reduced} />
                </group>
              </group>
            </Hoverable>
          </group>
          <group position={[2.4, 0, -35]}>
            <Hoverable label="Marigolds">
              <Marigold />
            </Hoverable>
          </group>

          <Hoverable label="Corporate gifting — bulk orders for teams and events">
            <group position={[3.6, 0, -44]} rotation={[0, -0.3, 0]}>
              {[0, 1, 2].map((i) => (
                <group key={i} position={[(i % 2) * 0.1, i * 0.43, 0]} rotation={[0, i * 0.12, 0]}>
                  <MailerBox />
                </group>
              ))}
            </group>
          </Hoverable>
          <Hoverable label="Gift boxes">
            <group position={[-3.6, 0, -45]} scale={0.85}>
              <GiftBox color="#C98F3C" lid="#550D10" />
            </group>
          </Hoverable>

          <Hoverable label="Dry-fruit laddoos">
            <group position={[0.9, 0.06, -58.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={13} spread={0.36} height={0.36} seed={15} />
            </group>
          </Hoverable>

          <Scatter kind="almond" count={compact ? 40 : 80} area={[2.2, 5.5, -60, 4]} seed={151} />
          <Scatter kind="date" count={compact ? 30 : 60} area={[-5.5, -2.2, -60, 4]} seed={152} />
          <Scatter kind="hazelnut" count={compact ? 30 : 60} area={[-5.5, -2.4, -60, 2]} seed={153} />
          <Scatter kind="seed" count={compact ? 160 : 360} area={[-4.5, 4.5, -60, 4]} seed={155} />
        </>
      )}
    />
  );
}
