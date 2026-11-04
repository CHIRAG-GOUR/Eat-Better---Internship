"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Person, type Look, type Pose } from "@/components/sim/Person";

/**
 * Street life for Brand Boulevard: Indian traffic (auto-rickshaws, delivery scooters, hatchbacks) in
 * both lanes and pedestrians on both pavements, all looping around the camera so the street always
 * feels alive. Generic vehicles, no real brands. Lighter on phones.
 */

const still = (o: Partial<Pose> = {}): Pose => ({ walk: 0, mood: 0, arm: 0, shake: 0, jump: 0, holding: false, ...o });

function Wheel({ r = 0.24, w = 0.14, spin }: { r?: number; w?: number; spin: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current) g.current.rotation.x = spin.current ?? 0;
  });
  return (
    <group ref={g}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, w, 20]} />
        <meshStandardMaterial color="#1D1B1A" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, w + 0.01, 14]} />
        <meshStandardMaterial color="#B9B4AE" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, r * 0.3, 0]}>
        <boxGeometry args={[w + 0.02, r * 0.12, r * 0.12]} />
        <meshStandardMaterial color="#6E6A66" />
      </mesh>
    </group>
  );
}

const RIDER: Look = { skin: "#B98157", top: "#FF5C00", bottom: "#2F2A28", hair: "#1A110C", hairStyle: "short", extra: "cap", extraColor: "#1E1A18" };
const DRIVER: Look = { skin: "#A47148", top: "#7A8A99", bottom: "#3B3B3B", hair: "#1A110C", hairStyle: "short" };

/** Delivery scooter with a seated rider and an insulated box. Faces +z. */
export function Scooter({ spin, body = "#2E7D6B", box = "#FF5C00", rider = RIDER }: { spin: React.RefObject<number>; body?: string; box?: string; rider?: Look }) {
  const pose = useRef<Pose>(still({ sit: 1, arm: 0.42 }));
  return (
    <group>
      {/* wheels */}
      <group position={[0, 0.24, 0.62]}>
        <Wheel spin={spin} />
      </group>
      <group position={[0, 0.24, -0.6]}>
        <Wheel spin={spin} />
      </group>
      {/* floorboard + rear body */}
      <RoundedBox args={[0.42, 0.14, 0.95]} radius={0.05} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color="#2B2A29" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.42, 0.72]} radius={0.16} position={[0, 0.66, -0.34]} castShadow>
        <meshStandardMaterial color={body} roughness={0.35} metalness={0.15} />
      </RoundedBox>
      {/* seat */}
      <RoundedBox args={[0.34, 0.1, 0.62]} radius={0.05} position={[0, 0.92, -0.28]} castShadow>
        <meshStandardMaterial color="#1F1D1C" roughness={0.7} />
      </RoundedBox>
      {/* front apron + stem */}
      <RoundedBox args={[0.46, 0.78, 0.12]} radius={0.06} position={[0, 0.82, 0.5]} rotation={[-0.22, 0, 0]} castShadow>
        <meshStandardMaterial color={body} roughness={0.35} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 1.22, 0.58]} rotation={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#2B2A29" />
      </mesh>
      {/* handlebar + headlight + mirrors */}
      <mesh position={[0, 1.44, 0.52]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <meshStandardMaterial color="#2B2A29" />
      </mesh>
      <mesh position={[0, 1.38, 0.66]}>
        <sphereGeometry args={[0.08, 14, 10]} />
        <meshStandardMaterial color="#FFF3C4" emissive="#FFE08A" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.3, 1.62, 0.5]}>
          <boxGeometry args={[0.1, 0.07, 0.02]} />
          <meshStandardMaterial color="#9AA4AE" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* delivery box */}
      <RoundedBox args={[0.5, 0.46, 0.46]} radius={0.06} position={[0, 1.25, -0.62]} castShadow>
        <meshStandardMaterial color={box} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 1.25, -0.384]}>
        <planeGeometry args={[0.3, 0.12]} />
        <meshStandardMaterial color="#FFF5EE" />
      </mesh>
      {/* rider */}
      <group position={[0, 0.34, -0.22]} scale={0.92}>
        <Person look={rider} pose={pose} />
      </group>
    </group>
  );
}

/** Auto-rickshaw: green lower body, yellow canopy, three wheels, seated driver. Faces +z. */
export function AutoRickshaw({ spin, body = "#2F7A3B", top = "#F6C21C" }: { spin: React.RefObject<number>; body?: string; top?: string }) {
  const pose = useRef<Pose>(still({ sit: 1, arm: 0.4 }));
  return (
    <group>
      <group position={[0, 0.26, 0.95]}>
        <Wheel spin={spin} r={0.26} />
      </group>
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.26, -0.55]}>
          <Wheel spin={spin} r={0.26} />
        </group>
      ))}
      {/* lower body + floor */}
      <RoundedBox args={[1.32, 0.55, 1.75]} radius={0.14} position={[0, 0.62, -0.15]} castShadow>
        <meshStandardMaterial color={body} roughness={0.45} metalness={0.1} />
      </RoundedBox>
      {/* nose with headlight */}
      <RoundedBox args={[0.62, 0.95, 0.4]} radius={0.12} position={[0, 0.9, 0.86]} castShadow>
        <meshStandardMaterial color={body} roughness={0.45} metalness={0.1} />
      </RoundedBox>
      <mesh position={[0, 1.02, 1.07]}>
        <sphereGeometry args={[0.09, 14, 10]} />
        <meshStandardMaterial color="#FFF3C4" emissive="#FFE08A" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* windscreen */}
      <mesh position={[0, 1.55, 0.7]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[1.0, 0.62]} />
        <meshStandardMaterial color="#9FC3D6" transparent opacity={0.4} roughness={0.1} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* canopy + posts */}
      <RoundedBox args={[1.42, 0.12, 2.0]} radius={0.06} position={[0, 2.02, -0.12]} castShadow>
        <meshStandardMaterial color={top} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.55, -1.08]}>
        <boxGeometry args={[1.36, 0.95, 0.06]} />
        <meshStandardMaterial color="#1E1A18" roughness={0.8} />
      </mesh>
      {[-0.66, 0.66].flatMap((x) =>
        [0.72, -0.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 1.48, z]}>
            <cylinderGeometry args={[0.03, 0.03, 1.05, 8]} />
            <meshStandardMaterial color="#1E1A18" />
          </mesh>
        )),
      )}
      {/* passenger bench */}
      <RoundedBox args={[1.18, 0.3, 0.45]} radius={0.06} position={[0, 1.03, -0.75]}>
        <meshStandardMaterial color="#3A2A22" roughness={0.8} />
      </RoundedBox>
      {/* driver */}
      <group position={[0, 0.62, 0.3]} scale={0.88}>
        <Person look={DRIVER} pose={pose} />
      </group>
    </group>
  );
}

/** Small hatchback with tinted glass. Faces +z. */
export function Hatchback({ spin, color = "#B3261E" }: { spin: React.RefObject<number>; color?: string }) {
  return (
    <group>
      {[-0.82, 0.82].flatMap((x) =>
        [1.05, -1.05].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.3, z]}>
            <Wheel spin={spin} r={0.3} w={0.2} />
          </group>
        )),
      )}
      <RoundedBox args={[1.7, 0.66, 3.3]} radius={0.22} position={[0, 0.68, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} />
      </RoundedBox>
      <RoundedBox args={[1.5, 0.62, 1.95]} radius={0.24} position={[0, 1.22, -0.3]} castShadow>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} />
      </RoundedBox>
      {/* glass band */}
      <RoundedBox args={[1.52, 0.42, 1.8]} radius={0.16} position={[0, 1.26, -0.3]}>
        <meshStandardMaterial color="#26323C" roughness={0.1} metalness={0.6} />
      </RoundedBox>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.78, 1.66]}>
          <boxGeometry args={[0.36, 0.14, 0.03]} />
          <meshStandardMaterial color="#FFF3C4" emissive="#FFE08A" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}
      {[-0.6, 0.6].map((x) => (
        <mesh key={`r${x}`} position={[x, 0.82, -1.66]}>
          <boxGeometry args={[0.3, 0.12, 0.03]} />
          <meshStandardMaterial color="#C62828" emissive="#FF3B30" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── traffic + pedestrians ─────────────────────────────────────── */

type Kind = "auto" | "scooter" | "car";
type Vehicle = { kind: Kind; lane: 1 | -1; speed: number; offset: number; color?: string; top?: string; box?: string };
const WINDOW = 74; // loop length around the camera

const VEHICLES: Vehicle[] = [
  { kind: "auto", lane: 1, speed: 4.2, offset: 6 },
  { kind: "scooter", lane: -1, speed: 5.6, offset: 18, color: "#2E7D6B", box: "#FF5C00" },
  { kind: "car", lane: 1, speed: 5.2, offset: 40, color: "#1E5AA8" },
  { kind: "scooter", lane: 1, speed: 5.0, offset: 58, color: "#C62828", box: "#FED300" },
  { kind: "auto", lane: -1, speed: 3.8, offset: 30, top: "#111111", color: "#F6C21C" },
  { kind: "car", lane: -1, speed: 4.8, offset: 62, color: "#E8E2DA" },
];

function TrafficItem({ v, reduced }: { v: Vehicle; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame(({ camera, clock }, dt) => {
    const grp = g.current;
    if (!grp) return;
    const t = reduced ? 0 : clock.elapsedTime;
    const d = (v.offset + t * v.speed) % WINDOW;
    // lane 1 (left, x<0) drives towards the camera (+z); lane -1 drives away (-z)
    const far = camera.position.z - 64;
    grp.position.set(v.lane === 1 ? -1.45 : 1.45, 0, v.lane === 1 ? far + d : far + WINDOW - d);
    grp.rotation.y = v.lane === 1 ? 0 : Math.PI;
    if (!reduced) spin.current += (v.speed / 0.26) * dt;
  });
  return (
    <group ref={g}>
      {v.kind === "auto" && <AutoRickshaw spin={spin} body={v.color} top={v.top} />}
      {v.kind === "scooter" && <Scooter spin={spin} body={v.color} box={v.box} />}
      {v.kind === "car" && <Hatchback spin={spin} color={v.color} />}
    </group>
  );
}

const WALKERS: { look: Look; side: 1 | -1; lane: number; dir: 1 | -1; speed: number; offset: number }[] = [
  { look: { skin: "#C68B59", top: "#2E6F95", bottom: "#3B3B3B", hair: "#1E1410", hairStyle: "short", extra: "backpack", extraColor: "#35401D" }, side: -1, lane: 4.15, dir: 1, speed: 1.2, offset: 4 },
  { look: { skin: "#9C6644", top: "#C2185B", bottom: "#C2185B", hair: "#140C08", hairStyle: "long", dress: true, extra: "dupatta", extraColor: "#FED300" }, side: -1, lane: 4.75, dir: -1, speed: 1.0, offset: 22 },
  { look: { skin: "#D4A373", top: "#3E8E41", bottom: "#2B3A55", hair: "#2A1A12", hairStyle: "short", extra: "cap", extraColor: "#FF5C00" }, side: 1, lane: 4.2, dir: -1, speed: 1.3, offset: 9 },
  { look: { skin: "#A86B45", top: "#7B1FA2", bottom: "#7B1FA2", hair: "#BDB6B0", hairStyle: "bun", dress: true, extra: "glasses", extraColor: "#C8963E" }, side: 1, lane: 4.7, dir: 1, speed: 0.8, offset: 35 },
  { look: { skin: "#8D5A3B", top: "#F2A900", bottom: "#4E342E", hair: "#1A110C", hairStyle: "short" }, side: -1, lane: 4.45, dir: 1, speed: 1.1, offset: 47 },
  { look: { skin: "#B5764A", top: "#26A69A", bottom: "#26A69A", hair: "#140C08", hairStyle: "long", dress: true }, side: 1, lane: 4.55, dir: 1, speed: 1.05, offset: 58 },
  { look: { skin: "#C68B59", top: "#FFF5EE", bottom: "#4A3230", hair: "#1E1410", hairStyle: "short", extra: "glasses", extraColor: "#2F1C1A" }, side: -1, lane: 4.8, dir: -1, speed: 1.15, offset: 66 },
  { look: { skin: "#D9A066", top: "#E98A7B", bottom: "#2B3A55", hair: "#3E2723", hairStyle: "bun", extra: "backpack", extraColor: "#1565C0" }, side: 1, lane: 4.3, dir: -1, speed: 1.25, offset: 28 },
];

function Walker({ w, reduced }: { w: (typeof WALKERS)[number]; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const pose = useRef<Pose>(still({ walk: reduced ? 0 : 1 }));
  useFrame(({ camera, clock }) => {
    const grp = g.current;
    if (!grp) return;
    const t = reduced ? 0 : clock.elapsedTime;
    const d = (w.offset + t * w.speed) % WINDOW;
    const far = camera.position.z - 64;
    grp.position.set(w.side * w.lane, 0.12, w.dir === 1 ? far + d : far + WINDOW - d);
    grp.rotation.y = w.dir === 1 ? 0 : Math.PI;
  });
  return (
    <group ref={g}>
      <Person look={w.look} pose={pose} />
    </group>
  );
}

export function StreetLife({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const vehicles = useMemo(() => (compact ? VEHICLES.filter((_, i) => i % 2 === 0) : VEHICLES), [compact]);
  const walkers = useMemo(() => (compact ? WALKERS.slice(0, 4) : WALKERS), [compact]);
  return (
    <group>
      {vehicles.map((v, i) => (
        <TrafficItem key={i} v={v} reduced={reduced} />
      ))}
      {walkers.map((w, i) => (
        <Walker key={i} w={w} reduced={reduced} />
      ))}
    </group>
  );
}
