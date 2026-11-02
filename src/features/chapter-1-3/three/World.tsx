"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import TableWorld from "@/components/world/TableWorld";
import { Hoverable } from "@/components/world/hover";
import { BhujiaPile, Laddoos, MailerBox, Marigold, Scatter } from "@/components/world/props";

/* ── chapter 1.3 props ────────────────────────────────────────── */

function SpiceBowl({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.12, 24]} />
        <meshStandardMaterial color="#C8963E" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.07, 0]} scale={[1, 0.35, 1]}>
        <sphereGeometry args={[0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

function RollingPin() {
  return (
    <group rotation={[0, 0.5, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.8, 16]} />
        <meshStandardMaterial color="#B98A5E" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, s * 0.5, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 10]} />
          <meshStandardMaterial color="#8A5A36" />
        </mesh>
      ))}
    </group>
  );
}

function MiniStall() {
  return (
    <group>
      <RoundedBox args={[1.8, 0.08, 0.8]} radius={0.03} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#FF5C00" roughness={0.85} />
      </RoundedBox>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, 0.7]} />
          <meshStandardMaterial color="#E8540A" />
        </mesh>
      ))}
      {[-0.85, 0.85].map((x) => (
        <mesh key={`p${x}`} position={[x, 1.1, -0.35]}>
          <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
          <meshStandardMaterial color="#6B4126" />
        </mesh>
      ))}
      <mesh position={[0, 1.7, -0.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.95, 0.04, 0.8]} />
        <meshStandardMaterial color="#FFF5EE" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.85 + i * 0.2125, 1.5 - Math.sin((i / 8) * Math.PI) * 0.18, 0.18]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color={i % 2 ? "#FF9A12" : "#F57C00"} />
        </mesh>
      ))}
      <group position={[-0.45, 0.55, 0]} scale={0.6}>
        <Laddoos count={6} spread={0.22} height={0.12} seed={101} />
      </group>
      <group position={[0.4, 0.55, 0]} scale={0.6}>
        <BhujiaPile count={120} spread={0.3} height={0.05} />
      </group>
    </group>
  );
}

function Laptop() {
  return (
    <group>
      <RoundedBox args={[1.1, 0.05, 0.75]} radius={0.02} position={[0, 0.025, 0]} castShadow>
        <meshStandardMaterial color="#C9C2BA" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <group position={[0, 0.05, -0.37]} rotation={[-0.25, 0, 0]}>
        <RoundedBox args={[1.1, 0.72, 0.04]} radius={0.02} position={[0, 0.36, 0]} castShadow>
          <meshStandardMaterial color="#C9C2BA" metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.36, 0.022]}>
          <planeGeometry args={[1.0, 0.62]} />
          <meshStandardMaterial color="#FFF5EE" emissive="#FFE9D2" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0.025]}>
          <planeGeometry args={[0.36, 0.1]} />
          <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Stage() {
  const cone = useMemo(() => new THREE.ConeGeometry(0.9, 3, 32, 1, true), []);
  useEffect(() => () => cone.dispose(), [cone]);
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.3, 1.4, 0.12, 48]} />
        <meshStandardMaterial color="#6B4126" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.25, 48]} />
        <meshStandardMaterial color="#C8963E" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} geometry={cone} position={[x, 1.6, 0]} rotation={[0, 0, x > 0 ? 0.25 : -0.25]}>
          <meshBasicMaterial color="#FFE7B0" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <group position={[0, 0.13, 0]} scale={0.7}>
        <RoundedBox args={[0.9, 0.06, 0.6]} radius={0.02} position={[0, 0.03, 0]}>
          <meshStandardMaterial color="#C8963E" metalness={0.8} roughness={0.3} />
        </RoundedBox>
        <Laddoos count={6} spread={0.25} height={0.12} seed={111} />
      </group>
    </group>
  );
}

/** Pallets of boxes for the facility scene — one instanced mesh. */
function Pallets() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(0.5, 0.36, 0.42), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D8B98A", roughness: 0.85 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  const n = 3 * 3 * 4;
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let k = 0;
    for (let x = 0; x < 3; x++)
      for (let z = 0; z < 3; z++)
        for (let y = 0; y < 4; y++) {
          o.position.set((x - 1) * 0.52, 0.18 + y * 0.37, (z - 1) * 0.44);
          o.rotation.set(0, (k % 3) * 0.02, 0);
          o.updateMatrix();
          m.setMatrixAt(k++, o.matrix);
        }
    m.instanceMatrix.needsUpdate = true;
  }, [n]);
  return <instancedMesh ref={ref} args={[geo, mat, n]} castShadow receiveShadow />;
}

/**
 * Chapter 1.3 scenes along the hall table:
 * home kitchen → exhibition stall → going online → pitch stage → the facility → a final katori.
 */
export default function World() {
  return (
    <TableWorld
      scenes={({ katori, mats, compact }) => (
        <>
          <Hoverable label="The home kitchen where it all began">
            <group position={[3.2, 0, -0.8]}>
              <RoundedBox args={[2.1, 0.06, 1.2]} radius={0.03} position={[0, 0.03, 0]} rotation={[0, 0.15, 0]} material={mats.board} castShadow receiveShadow />
              <group position={[-0.55, 0.06, 0.05]}>
                <SpiceBowl color="#B3261E" />
              </group>
              <group position={[0, 0.06, -0.15]}>
                <SpiceBowl color="#E0B04A" />
              </group>
              <group position={[0.5, 0.06, 0.15]}>
                <SpiceBowl color="#4A1E10" />
              </group>
              <group position={[0.2, 0.13, 0.42]}>
                <RollingPin />
              </group>
            </group>
          </Hoverable>
          <Hoverable label="Dry-fruit laddoos">
            <group position={[-3.4, 0.06, -1.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={11} spread={0.33} height={0.36} />
            </group>
          </Hoverable>

          <Hoverable label="Selling at exhibitions">
            <group position={[-3.6, 0, -12.5]} rotation={[0, 0.35, 0]}>
              <MiniStall />
            </group>
          </Hoverable>
          <group position={[3.4, 0, -14]}>
            <Hoverable label="Marigolds">
              <Marigold />
            </Hoverable>
          </group>

          <Hoverable label="Going online — internet-first">
            <group position={[3.5, 0.02, -24]} rotation={[0, -0.4, 0]}>
              <Laptop />
            </group>
          </Hoverable>
          <Hoverable label="Orders shipped across India">
            <group position={[-3.8, 0, -25.5]} rotation={[0, 0.3, 0]}>
              <MailerBox />
              <group position={[0.05, 0.42, 0]} rotation={[0, -0.2, 0]}>
                <MailerBox size={[0.8, 0.36, 0.6]} color="#E8540A" />
              </group>
            </group>
          </Hoverable>

          <Hoverable label="The pitch stage — Shark Tank India, Season 4">
            <group position={[-3.4, 0, -35]}>
              <Stage />
            </group>
          </Hoverable>

          <Hoverable label="From a home kitchen to a 50,000 sq. ft. facility">
            <group position={[3.7, 0, -45]}>
              <Pallets />
            </group>
          </Hoverable>
          <Hoverable label="Ready to ship">
            <group position={[-3.6, 0, -46]}>
              <Pallets />
            </group>
          </Hoverable>

          <Hoverable label="Dry-fruit laddoos">
            <group position={[0.9, 0.06, -58.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={13} spread={0.36} height={0.36} seed={12} />
            </group>
          </Hoverable>

          <Scatter kind="almond" count={compact ? 40 : 80} area={[2.2, 5.5, -60, 4]} seed={121} />
          <Scatter kind="date" count={compact ? 30 : 60} area={[-5.5, -2.2, -60, 4]} seed={122} />
          <Scatter kind="hazelnut" count={compact ? 30 : 60} area={[-5.5, -2.4, -60, 2]} seed={123} />
          <Scatter kind="seed" count={compact ? 160 : 360} area={[-4.5, 4.5, -60, 4]} seed={125} />
        </>
      )}
    />
  );
}
