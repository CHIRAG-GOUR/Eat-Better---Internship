"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import TableWorld from "@/components/world/TableWorld";
import { Hoverable } from "@/components/world/hover";
import { BhujiaPile, Laddoos, MailerBox, NutPile, Scatter } from "@/components/world/props";
import { makeBowl } from "@/features/packaging/three/geometry";

/* ── chapter 1.2 props ────────────────────────────────────────── */

function Sieve() {
  const alpha = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#000";
    for (let y = 6; y < 128; y += 12) for (let x = 6 + ((y / 12) % 2) * 6; x < 128; x += 12) {
      g.beginPath();
      g.arc(x, y, 3.2, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);
  useEffect(() => () => alpha.dispose(), [alpha]);
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.7, 0.32, 48, 1, true]} />
        <meshStandardMaterial color="#C8963E" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 48]} />
        <meshStandardMaterial color="#D9A84E" metalness={0.8} roughness={0.35} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Scatter kind="date" count={9} area={[-0.4, 0.4, -0.4, 0.4]} seed={41} />
    </group>
  );
}

function FlagHill() {
  return (
    <group>
      <mesh position={[0, 0, 0]} scale={[1.3, 0.55, 1.3]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#B9C98A" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.1, 8]} />
        <meshStandardMaterial color="#4A3230" />
      </mesh>
      <mesh position={[0.27, 1.42, 0]}>
        <planeGeometry args={[0.52, 0.32]} />
        <meshStandardMaterial color="#FF5C00" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Pedestal({ children, h = 0.5 }: { children: React.ReactNode; h?: number }) {
  return (
    <group>
      <RoundedBox args={[1.1, h, 1.1]} radius={0.05} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#F3E1CD" roughness={0.8} />
      </RoundedBox>
      <group position={[0, h, 0]}>{children}</group>
    </group>
  );
}

function Jar({ fill = "#A8673A" }: { fill?: string }) {
  return (
    <group>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.64, 32, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0.05} transmission={0.6} thickness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.42, 24]} />
        <meshStandardMaterial color={fill} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 24]} />
        <meshStandardMaterial color="#C8963E" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SixChecks() {
  return (
    <group>
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[(i % 3 - 1) * 0.32, 0, (Math.floor(i / 3) - 0.5) * 0.32]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.09, 0.08, 20]} />
            <meshStandardMaterial color="#C8963E" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.045, 12, 10]} />
            <meshStandardMaterial color="#00A341" emissive="#00A341" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Kadhai({ reduced }: { reduced: boolean }) {
  const geo = useMemo(() => makeBowl(0.8, 0.32), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!steam.current || reduced) return;
    steam.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.5 + i / 3) % 1;
      c.position.y = 0.4 + t * 1.2;
      c.scale.setScalar(0.4 + t * 0.9);
      ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.35 * (1 - t);
    });
  });
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#3A3330" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.85, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.025, 8, 16]} />
          <meshStandardMaterial color="#3A3330" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      <BhujiaPile count={300} spread={0.55} height={0.2} />
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.2, 0.5, 0]}>
            <sphereGeometry args={[0.2, 12, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Phone() {
  return (
    <group rotation={[-Math.PI / 2 + 0.25, 0, 0.3]}>
      <RoundedBox args={[0.5, 0.95, 0.06]} radius={0.06} position={[0, 0, 0.03]} castShadow>
        <meshStandardMaterial color="#2F1C1A" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[0.42, 0.82]} />
        <meshStandardMaterial color="#FFF5EE" emissive="#FFF5EE" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.25, 0.07]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Chapter 1.2 scenes along the hall table:
 * the filter (sieve) → vision flag & daily-step laddoos → three value pedestals →
 * roasting kadhai & clean jars → delivery boxes & phone → a final katori.
 */
export default function World() {
  return (
    <TableWorld
      scenes={({ katori, small, mats, compact, reduced }) => (
        <>
          <Hoverable label="A brass sieve — a vision works like a filter">
            <group position={[3.2, 0.02, -0.6]}>
              <Sieve />
            </group>
          </Hoverable>
          <Hoverable label="Dry-fruit laddoos">
            <group position={[-3.4, 0.06, -1.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={11} spread={0.33} height={0.36} />
            </group>
          </Hoverable>

          <Hoverable label="Vision — where the brand aims to reach">
            <group position={[3.6, 0, -13]}>
              <FlagHill />
            </group>
          </Hoverable>
          <Hoverable label="Mission — the daily steps towards it">
            <group>
              {Array.from({ length: 6 }, (_, i) => (
                <group key={i} position={[-1.8 + i * 0.85, 0.1, -9.5 - i * 0.6]}>
                  <Laddoos count={1} spread={0.01} height={0} seed={50 + i} />
                </group>
              ))}
            </group>
          </Hoverable>

          <group position={[0, 0, -21.5]}>
            <Hoverable label="Familiar Taste">
              <group position={[-3.6, 0, 0]}>
                <Pedestal>
                  <group position={[0, 0.02, 0]}>
                    <mesh geometry={katori} material={mats.brass} castShadow />
                    <Laddoos count={8} spread={0.28} height={0.36} seed={61} />
                  </group>
                </Pedestal>
              </group>
            </Hoverable>
            <Hoverable label="Better Ingredients">
              <group position={[3.6, 0, -0.6]}>
                <Pedestal h={0.35}>
                  <group position={[-0.22, 0, 0]}>
                    <Jar />
                  </group>
                  <group position={[0.28, 0, 0.1]} scale={0.8}>
                    <Jar fill="#4A1E10" />
                  </group>
                </Pedestal>
              </group>
            </Hoverable>
            <Hoverable label="Honest Processes — six quality checkpoints">
              <group position={[2.2, 0, 1.4]}>
                <Pedestal h={0.25}>
                  <SixChecks />
                </Pedestal>
              </group>
            </Hoverable>
          </group>

          <group position={[0, 0, -33]}>
            <Hoverable label="Roasting, not deep-frying">
              <group position={[-3.5, 0.02, 0]}>
                <Kadhai reduced={reduced} />
              </group>
            </Hoverable>
            <Hoverable label="Clean-label ingredients">
              <group position={[3.4, 0, -0.5]}>
                <Jar fill="#C8A26A" />
                <group position={[0.65, 0, 0.35]} scale={0.85}>
                  <Jar fill="#A8673A" />
                </group>
              </group>
            </Hoverable>
            <Hoverable label="Dates — natural sweetness">
              <group position={[2.2, 0, 1.2]}>
                <mesh geometry={small} material={mats.ceramic} castShadow />
                <Scatter kind="date" count={10} area={[-0.3, 0.3, -0.3, 0.3]} seed={71} />
              </group>
            </Hoverable>
          </group>

          <group position={[0, 0, -45]}>
            <Hoverable label="Delivered by quick-commerce and D2C">
              <group position={[-3.8, 0, 0]} rotation={[0, 0.3, 0]}>
                <MailerBox />
                <group position={[0.05, 0.42, 0]} rotation={[0, -0.2, 0]}>
                  <MailerBox size={[0.8, 0.36, 0.6]} color="#E8540A" />
                </group>
              </group>
            </Hoverable>
            <Hoverable label="Ordering online">
              <group position={[3.4, 0.05, -0.4]}>
                <Phone />
              </group>
            </Hoverable>
            <Hoverable label="Nut & seed mix">
              <group position={[2.4, 0, 1.3]}>
                <mesh geometry={small} material={mats.ceramic} castShadow />
                <NutPile count={60} spread={0.38} height={0.2} />
              </group>
            </Hoverable>
          </group>

          <Hoverable label="Dry-fruit laddoos">
            <group position={[0.9, 0.06, -58.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={13} spread={0.36} height={0.36} seed={12} />
            </group>
          </Hoverable>

          <Scatter kind="almond" count={compact ? 40 : 80} area={[2.2, 5.5, -60, 4]} seed={81} />
          <Scatter kind="almond" count={compact ? 40 : 80} area={[-5.5, -2.2, -60, 4]} seed={82} />
          <Scatter kind="hazelnut" count={compact ? 30 : 60} area={[-5.5, -2.4, -60, 2]} seed={83} />
          <Scatter kind="seed" count={compact ? 160 : 360} area={[-4.5, 4.5, -60, 4]} seed={85} />
        </>
      )}
    />
  );
}
