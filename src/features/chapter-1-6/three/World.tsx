"use client";

import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import TableWorld from "@/components/world/TableWorld";
import { Hoverable } from "@/components/world/hover";
import { BhujiaPile, Laddoos, MailerBox, NutPile, Scatter } from "@/components/world/props";

/* ── chapter 1.6 props: the six checkpoints laid along the hall table ── */

function Sack({ color = "#B9905E", fill = "#E8D3A8" }: { color?: string; fill?: string }) {
  return (
    <group>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.36, 0.64, 18]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[0, 0.66, 0]} scale={[1, 0.35, 1]}>
        <sphereGeometry args={[0.29, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={fill} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.63, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.025, 6, 24]} />
        <meshStandardMaterial color="#8A6A40" roughness={1} />
      </mesh>
    </group>
  );
}

function Magnifier() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.position.y = 0.75 + Math.sin(clock.elapsedTime * 1.4) * 0.05;
      g.current.rotation.z = -0.5 + Math.sin(clock.elapsedTime * 0.9) * 0.08;
    }
  });
  return (
    <group ref={g} position={[0.1, 0.75, 0]} rotation={[-0.9, 0, -0.5]}>
      <mesh>
        <torusGeometry args={[0.26, 0.035, 10, 36]} />
        <meshStandardMaterial color="#2F1C1A" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.25, 36]} />
        <meshPhysicalMaterial color="#DDF2FF" transparent opacity={0.28} roughness={0} transmission={0.6} thickness={0.1} />
      </mesh>
      <mesh position={[0, -0.47, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.42, 12]} />
        <meshStandardMaterial color="#FF5C00" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Kadhai() {
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    steam.current?.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.5 + i / 3) % 1;
      c.position.y = 0.4 + t * 0.9;
      c.scale.setScalar(0.6 + t * 0.9);
      ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.35 * (1 - t);
    });
  });
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow>
        <sphereGeometry args={[0.5, 30, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.54, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.02, 6, 14]} />
          <meshStandardMaterial color="#3A3A3A" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      <group position={[0, 0.06, 0]} scale={0.95}>
        <BhujiaPile count={260} spread={0.36} height={0.1} />
      </group>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.12, 0.5, 0]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SmallPan() {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.28, 0.16, 26, 1, true]} />
        <meshStandardMaterial color="#C9C2BA" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 26]} />
        <meshStandardMaterial color="#C9C2BA" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.48, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.34, 8]} />
        <meshStandardMaterial color="#2F1C1A" />
      </mesh>
      <group position={[0, 0.04, 0]} scale={0.7}>
        <NutPile count={40} spread={0.32} height={0.08} />
      </group>
    </group>
  );
}

function TestTubes() {
  const colors = ["#E8B04A", "#C9772E", "#7BAE4F", "#E8622C", "#B98A5E"];
  return (
    <group>
      <RoundedBox args={[1.25, 0.1, 0.3]} radius={0.02} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color="#FFF5EE" roughness={0.6} />
      </RoundedBox>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.26]} />
          <meshStandardMaterial color="#FFF5EE" />
        </mesh>
      ))}
      {colors.map((c, i) => (
        <group key={i} position={[-0.44 + i * 0.22, 0.38, 0]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 14, 1, true]} />
            <meshPhysicalMaterial color="#EAF6FF" transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.044, 0.044, 0.26, 14]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* lab scale */}
      <group position={[1.05, 0, 0.1]}>
        <RoundedBox args={[0.55, 0.12, 0.45]} radius={0.03} position={[0, 0.06, 0]} castShadow>
          <meshStandardMaterial color="#E9E4DE" roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.02, 24]} />
          <meshStandardMaterial color="#C9C2BA" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.07, 0.226]}>
          <planeGeometry args={[0.24, 0.07]} />
          <meshStandardMaterial color="#00A341" emissive="#00A341" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

const POUCH_IDS = ["millet-bhujia", "quinoa-namkeen", "nut-mix", "trail-mix", "hazelnut-laddoo"] as const;

function SealedPouches() {
  const tex = useTexture(Object.fromEntries(POUCH_IDS.map((id) => [id, `/chapter-1-3/packs/${id}.webp`]))) as Record<string, THREE.Texture>;
  useEffect(() => {
    for (const t of Object.values(tex)) t.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  return (
    <group>
      {POUCH_IDS.map((id, i) => {
        const t = tex[id];
        const img = t.image as { width: number; height: number } | undefined;
        const h = 0.62;
        const w = h * (img ? img.width / img.height : 0.7);
        return (
          <group key={id} position={[(i - 2) * 0.62, 0, (i % 2) * 0.18]} rotation={[0, (i - 2) * -0.12, 0]}>
            <RoundedBox args={[w, h, 0.09]} radius={0.025} position={[0, h / 2, 0]} castShadow>
              <meshStandardMaterial color="#E9E2D8" roughness={0.45} />
            </RoundedBox>
            <mesh position={[0, h / 2, 0.0465]}>
              <planeGeometry args={[w * 0.98, h * 0.98]} />
              <meshStandardMaterial map={t} roughness={0.4} />
            </mesh>
            {/* heat-seal strip */}
            <mesh position={[0, h - 0.035, 0.047]}>
              <planeGeometry args={[w * 0.98, 0.035]} />
              <meshStandardMaterial color="#C9C2BA" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function CheckLamp({ color = "#00A341" }: { color?: string }) {
  const m = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (m.current) m.current.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 3) * 0.4;
  });
  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.7, 10]} />
        <meshStandardMaterial color="#4A3230" />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial ref={m} color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

/**
 * Chapter 1.6 scenes along the hall table, in checkpoint order:
 * sourcing sacks → quality check (magnifier) → prepping (roasting kadhai) → small-batch cooking →
 * batch testing (lab) → packaging (sealed pouches) → a final katori.
 */
export default function World() {
  return (
    <TableWorld
      scenes={({ katori, mats, compact }) => (
        <>
          <Hoverable label="1 · Sourcing — trusted suppliers">
            <group position={[3.3, 0, -1]}>
              <Sack />
              <group position={[0.75, 0, 0.25]} scale={0.85}>
                <Sack color="#A88252" fill="#5B2E1C" />
              </group>
              <group position={[-0.7, 0, 0.3]} scale={0.75}>
                <Sack color="#C2A070" fill="#E2B866" />
              </group>
            </group>
          </Hoverable>
          <Hoverable label="Dry-fruit laddoos">
            <group position={[-3.4, 0.06, -1.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={11} spread={0.33} height={0.36} seed={61} />
            </group>
          </Hoverable>

          <Hoverable label="2 · Quality Check — size, freshness, quality">
            <group position={[-3.5, 0.06, -11]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <group position={[0, 0.05, 0]}>
                <NutPile count={50} spread={0.3} height={0.12} />
              </group>
              <Magnifier />
            </group>
          </Hoverable>
          <group position={[3.6, 0, -12]}>
            <Hoverable label="Checkpoint passed">
              <CheckLamp />
            </Hoverable>
          </group>

          <Hoverable label="3 · Prepping — dry roasting, no deep frying">
            <group position={[3.4, 0.02, -21]}>
              <Kadhai />
            </group>
          </Hoverable>

          <Hoverable label="4 · Cooking — controlled, in small batches">
            <group position={[-3.6, 0.02, -30]}>
              {[-0.7, 0, 0.7].map((x) => (
                <group key={x} position={[x, 0, Math.abs(x) * 0.3]} scale={0.8}>
                  <SmallPan />
                </group>
              ))}
            </group>
          </Hoverable>

          <Hoverable label="5 · Batch Testing — taste, texture, moisture">
            <group position={[3.2, 0.02, -39]} rotation={[0, -0.3, 0]}>
              <TestTubes />
            </group>
          </Hoverable>

          <Hoverable label="6 · Packaging — sealed to lock in freshness">
            <group position={[-3.3, 0.02, -48]} rotation={[0, 0.3, 0]} scale={compact ? 0.85 : 1}>
              <Suspense fallback={null}>
                <SealedPouches />
              </Suspense>
            </group>
          </Hoverable>
          <Hoverable label="Packed and ready to ship">
            <group position={[3.6, 0, -49]} rotation={[0, -0.3, 0]}>
              <MailerBox />
              <group position={[0.05, 0.42, 0]} rotation={[0, 0.2, 0]}>
                <MailerBox size={[0.8, 0.36, 0.6]} color="#E8540A" />
              </group>
            </group>
          </Hoverable>

          <Hoverable label="Dry-fruit laddoos">
            <group position={[0.9, 0.06, -58.6]}>
              <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
              <Laddoos count={13} spread={0.36} height={0.36} seed={16} />
            </group>
          </Hoverable>

          <Scatter kind="almond" count={compact ? 40 : 80} area={[2.2, 5.5, -60, 4]} seed={161} />
          <Scatter kind="date" count={compact ? 30 : 60} area={[-5.5, -2.2, -60, 4]} seed={162} />
          <Scatter kind="hazelnut" count={compact ? 30 : 60} area={[-5.5, -2.4, -60, 2]} seed={163} />
          <Scatter kind="seed" count={compact ? 160 : 360} area={[-4.5, 4.5, -60, 4]} seed={165} />
        </>
      )}
    />
  );
}
