"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import TableWorld from "@/components/world/TableWorld";
import { Hoverable } from "@/components/world/hover";
import { BhujiaPile, Laddoos, MailerBox, Scatter } from "@/components/world/props";

const PACKS = ["hazelnut-laddoo", "millet-bhujia", "quinoa-namkeen", "nut-mix", "millet-bhel"] as const;
type PackId = (typeof PACKS)[number];
const URLS = Object.fromEntries(PACKS.map((p) => [p, `/chapter-1-3/packs/${p}.webp`])) as Record<PackId, string>;

function Pack({ tex, h = 0.62 }: { tex: THREE.Texture; h?: number }) {
  const img = tex.image as { width: number; height: number } | undefined;
  const w = h * (img ? img.width / img.height : 0.7);
  return (
    <group>
      <RoundedBox args={[w, h, 0.09]} radius={0.025} position={[0, h / 2, 0]} castShadow>
        <meshStandardMaterial color="#EDE3D6" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, h / 2, 0.046]}>
        <planeGeometry args={[w * 0.985, h * 0.985]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
    </group>
  );
}

/** A kadhai of hot oil — "the old way". */
function Kadhai() {
  const oil = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (oil.current) (oil.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + Math.sin(clock.elapsedTime * 4) * 0.08;
  });
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.62, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#2B2B2B" metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={oil} position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#D9A21B" emissive="#B5760C" emissiveIntensity={0.3} roughness={0.15} metalness={0.2} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.66, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#2B2B2B" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Sugar cubes — refined sugar. */
function SugarCubes() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = 18;
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const layer = Math.floor(i / 9);
      o.position.set(((i % 3) - 1) * 0.13, 0.06 + layer * 0.12, ((Math.floor(i / 3) % 3) - 1) * 0.13);
      o.rotation.set(0, (i * 0.37) % 0.3, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} castShadow>
      <boxGeometry args={[0.11, 0.11, 0.11]} />
      <meshStandardMaterial color="#FBFBF7" roughness={0.9} />
    </instancedMesh>
  );
}

/** A brass balance: taste on one side, health on the other — level. */
function Balance() {
  const beam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (beam.current) beam.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.04;
  });
  const brass = <meshStandardMaterial color="#C8963E" metalness={0.95} roughness={0.28} />;
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.1, 32]} />
        {brass}
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.4, 16]} />
        {brass}
      </mesh>
      <group ref={beam} position={[0, 1.45, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 12]} />
          {brass}
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.88, 0, 0]}>
            <mesh position={[0, -0.35, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.7, 6]} />
              <meshStandardMaterial color="#8A6A2E" />
            </mesh>
            <mesh position={[0, -0.72, 0]} castShadow>
              <cylinderGeometry args={[0.36, 0.26, 0.08, 32]} />
              {brass}
            </mesh>
            <group position={[0, -0.68, 0]} scale={0.8}>
              {s < 0 ? <Laddoos count={6} spread={0.2} height={0.12} seed={71} /> : <BhujiaPile count={160} spread={0.3} height={0.1} />}
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Magnifier over a pack — "what is in the packet?" */
function Magnifier() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.position.x = Math.sin(clock.elapsedTime * 0.7) * 0.15;
      g.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 1.3) * 0.04;
    }
  });
  return (
    <group ref={g} position={[0, 0.55, 0.3]} rotation={[0.1, 0, -0.4]}>
      <mesh>
        <torusGeometry args={[0.24, 0.035, 12, 40]} />
        <meshStandardMaterial color="#2F1C1A" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.22, 40]} />
        <meshPhysicalMaterial color="#DDF3FF" transmission={0.6} roughness={0.05} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.4, 12]} />
        <meshStandardMaterial color="#6B4126" />
      </mesh>
    </group>
  );
}

/** Boxes going round in a loop — repeat orders. */
function RepeatLoop() {
  const g = useRef<THREE.Group>(null);
  const ring = useMemo(() => new THREE.TorusGeometry(1.0, 0.035, 10, 80), []);
  useEffect(() => () => ring.dispose(), [ring]);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.5;
  });
  return (
    <group>
      <mesh geometry={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.35} />
      </mesh>
      <group ref={g}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0]} rotation={[0, -a, 0]} scale={0.5}>
              <MailerBox color={i % 2 ? "#E8540A" : "#FF5C00"} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Phone() {
  return (
    <group rotation={[-0.25, 0, 0]}>
      <RoundedBox args={[0.42, 0.8, 0.05]} radius={0.04} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#2F1C1A" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0.027]}>
        <planeGeometry args={[0.37, 0.72]} />
        <meshStandardMaterial color="#FFF5EE" emissive="#FFE9D2" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.22, 0.03]}>
        <planeGeometry args={[0.26, 0.08]} />
        <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function PackRow() {
  const tex = useTexture(URLS) as Record<PackId, THREE.Texture>;
  useMemo(() => {
    for (const t of Object.values(tex)) t.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  return (
    <>
      <Hoverable label="Dates-sweetened laddoos">
        <group position={[-3.6, 0, -12.6]} rotation={[0, 0.35, 0]}>
          <Pack tex={tex["hazelnut-laddoo"]} />
        </group>
      </Hoverable>
      <Hoverable label="Roasted millet namkeen">
        <group position={[-2.9, 0, -13.2]} rotation={[0, 0.25, 0]}>
          <Pack tex={tex["millet-bhujia"]} h={0.55} />
        </group>
      </Hoverable>
      <Hoverable label="Quinoa namkeen">
        <group position={[3.4, 0, -13.4]} rotation={[0, -0.35, 0]}>
          <Pack tex={tex["quinoa-namkeen"]} h={0.55} />
        </group>
      </Hoverable>
      <Hoverable label="Familiar flavours: bhel">
        <group position={[3.3, 0, -24.8]} rotation={[0, -0.35, 0]}>
          <Pack tex={tex["millet-bhel"]} h={0.55} />
        </group>
      </Hoverable>
      <Hoverable label="Clean, simple ingredients">
        <group position={[-3.4, 0, -35.5]} rotation={[0, 0.3, 0]}>
          <Pack tex={tex["nut-mix"]} h={0.7} />
          <Magnifier />
        </group>
      </Hoverable>
    </>
  );
}

/**
 * Chapter 1.4 scenes along the hall table:
 * the old way → re-engineered snacks → taste and health in balance → what's in the packet →
 * online & quick-commerce → repeat orders.
 */
export default function World() {
  return (
    <TableWorld
      scenes={({ katori, mats, compact }) => (
        <>
          <Hoverable label="The old way: deep-frying in oil">
            <group position={[3.4, 0.45, -1.2]} scale={0.7}>
              <Kadhai />
            </group>
          </Hoverable>
          <Hoverable label="Refined sugar">
            <group position={[-3.3, 0, -1.6]}>
              <SugarCubes />
            </group>
          </Hoverable>

          <Suspense fallback={null}>
            <PackRow />
          </Suspense>
          <Hoverable label="Natural sweetening: dates">
            <group position={[3.6, 0.06, -11.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={11} spread={0.33} height={0.36} seed={14} />
            </group>
          </Hoverable>

          <Hoverable label="No more choosing between taste and health">
            <group position={[-3.6, 0, -24]}>
              <Balance />
            </group>
          </Hoverable>

          <Hoverable label="Available online and on quick-commerce apps">
            <group position={[3.5, 0.02, -45]} rotation={[0, -0.4, 0]}>
              <Phone />
            </group>
          </Hoverable>
          <Hoverable label="Delivered to the door">
            <group position={[-3.7, 0, -46]} rotation={[0, 0.3, 0]}>
              <MailerBox />
              <group position={[0.05, 0.42, 0]} rotation={[0, -0.2, 0]}>
                <MailerBox size={[0.8, 0.36, 0.6]} color="#E8540A" />
              </group>
            </group>
          </Hoverable>

          <Hoverable label="Repeat orders: the real signal of fit">
            <group position={[0.4, 0, -57.5]}>
              <RepeatLoop />
            </group>
          </Hoverable>

          <Scatter kind="date" count={compact ? 40 : 80} area={[2.2, 5.5, -60, -6]} seed={141} />
          <Scatter kind="almond" count={compact ? 30 : 60} area={[-5.5, -2.2, -60, -6]} seed={142} />
          <Scatter kind="seed" count={compact ? 160 : 340} area={[-4.5, 4.5, -60, 4]} seed={143} />
        </>
      )}
    />
  );
}
