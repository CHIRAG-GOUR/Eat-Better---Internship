"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Human, type HumanLook } from "./Human";

/**
 * Street life for Brand Boulevard: Indian traffic (auto-rickshaws, delivery scooters, hatchbacks) in
 * both lanes and pedestrians on both pavements, all looping around the camera so the street always
 * feels alive. Generic vehicles, no real brands. Lighter on phones.
 */

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

const RIDER: HumanLook = { skin: "#A86F45", hair: "#1A110C", hairStyle: "short", outfit: "tshirt", top: "#FF5C00", bottom: "#2F2A28", facial: "stubble", helmet: "#F4F1EC", bag: { kind: "sling", color: "#3A2F2A" } };
const DRIVER: HumanLook = { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "shirt", top: "#7A8A99", bottom: "#3B3B3B", accent: "#6B7A88", facial: "moustache" };

function ScooterWheel({ spin }: { spin: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current) g.current.rotation.x = spin.current ?? 0;
  });
  return (
    <group ref={g}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.16, 0.058, 12, 28]} />
        <meshStandardMaterial color="#1B1A19" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.07, 18]} />
        <meshStandardMaterial color="#8E949A" metalness={0.75} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} rotation={[(k / 5) * Math.PI * 2, 0, 0]} position={[0.038, 0, 0]}>
          <boxGeometry args={[0.012, 0.22, 0.03]} />
          <meshStandardMaterial color="#5E6368" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A 110cc-style Indian scooter: curved front apron + leg shield, floorboard, smooth rear cowl, CVT casing,
 * silencer, mirrors on stalks, integrated headlamp, tail lamp and a delivery box. Seated rider with an
 * open-face helmet, hands on the grips and feet on the floorboard. Faces +z.
 */
export function Scooter({ spin, body = "#2E7D6B", box = "#FF5C00", rider = RIDER }: { spin: React.RefObject<number>; body?: string; box?: string; rider?: HumanLook }) {
  const paint = { color: body, roughness: 0.28, metalness: 0.25 };
  return (
    <group>
      {/* wheels: 10-inch tyres on alloy rims */}
      {[0.6, -0.6].map((z) => (
        <group key={z} position={[0, 0.215, z]}>
          <ScooterWheel spin={spin} />
        </group>
      ))}
      {/* front fork + fender */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.55, 0.55]} rotation={[-0.16, 0, 0]} castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.72, 10]} />
          <meshStandardMaterial color="#2B2A29" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <group position={[0, 0.215, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh rotation={[0, 0, 1.15]} castShadow>
          <torusGeometry args={[0.255, 0.05, 8, 24, 1.75]} />
          <meshStandardMaterial {...paint} />
        </mesh>
      </group>
      {/* front apron (outer), chrome strip, inner leg shield, indicators */}
      <RoundedBox args={[0.44, 0.8, 0.15]} radius={0.07} position={[0, 0.78, 0.43]} rotation={[-0.2, 0, 0]} castShadow>
        <meshStandardMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.56, 0.04]} radius={0.02} position={[0, 0.74, 0.51]} rotation={[-0.2, 0, 0]}>
        <meshStandardMaterial color="#C9CDD1" metalness={0.8} roughness={0.25} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.6, 0.05]} radius={0.02} position={[0, 0.68, 0.34]} rotation={[-0.2, 0, 0]}>
        <meshStandardMaterial color="#1E1D1C" roughness={0.7} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 0.92, 0.52]}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshStandardMaterial color="#FFB300" emissive="#FF9800" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}
      {/* floorboard + underbody */}
      <RoundedBox args={[0.36, 0.07, 0.48]} radius={0.03} position={[0, 0.37, 0.08]} castShadow>
        <meshStandardMaterial color="#2A2928" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.12, 0.7]} radius={0.04} position={[0, 0.27, -0.05]}>
        <meshStandardMaterial color="#1F1E1D" roughness={0.8} />
      </RoundedBox>
      {/* rear cowl: one smooth body + side skirt */}
      <mesh position={[0, 0.63, -0.44]} scale={[0.25, 0.25, 0.58]} castShadow>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial {...paint} />
      </mesh>
      <RoundedBox args={[0.46, 0.22, 0.7]} radius={0.1} position={[0, 0.5, -0.36]} castShadow>
        <meshStandardMaterial {...paint} />
      </RoundedBox>
      {/* engine / CVT casing (left) + silencer (right) */}
      <RoundedBox args={[0.12, 0.2, 0.52]} radius={0.05} position={[-0.15, 0.3, -0.5]} castShadow>
        <meshStandardMaterial color="#5C5F63" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0.17, 0.3, -0.62]} rotation={[Math.PI / 2 - 0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.44, 14]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* seat + carrier + delivery box */}
      <RoundedBox args={[0.3, 0.1, 0.7]} radius={0.045} position={[0, 0.88, -0.36]} rotation={[0.04, 0, 0]} castShadow>
        <meshStandardMaterial color="#1A1918" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.36, 0.03, 0.3]} radius={0.01} position={[0, 0.93, -0.84]}>
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.44, 0.44]} radius={0.05} position={[0, 1.17, -0.84]} castShadow>
        <meshStandardMaterial color={box} roughness={0.55} />
      </RoundedBox>
      {/* tail lamp + number plate */}
      <RoundedBox args={[0.18, 0.06, 0.04]} radius={0.02} position={[0, 0.72, -1.0]} rotation={[0.3, 0, 0]}>
        <meshStandardMaterial color="#B71C1C" emissive="#FF3B30" emissiveIntensity={0.9} toneMapped={false} />
      </RoundedBox>
      <mesh position={[0, 0.56, -1.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.2, 0.1]} />
        <meshStandardMaterial color="#F5F3EE" />
      </mesh>
      {/* handlebar cowl with headlamp, grips, mirrors */}
      <RoundedBox args={[0.5, 0.13, 0.2]} radius={0.06} position={[0, 1.13, 0.42]} castShadow>
        <meshStandardMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.08, 0.03]} radius={0.03} position={[0, 1.13, 0.525]}>
        <meshStandardMaterial color="#FFF3C4" emissive="#FFE08A" emissiveIntensity={1.3} toneMapped={false} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.3, 1.12, 0.4]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.12, 10]} />
            <meshStandardMaterial color="#141414" roughness={0.9} />
          </mesh>
          <mesh position={[s * 0.22, 1.24, 0.41]} rotation={[0, 0, s * -0.4]}>
            <cylinderGeometry args={[0.009, 0.009, 0.18, 6]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[s * 0.27, 1.33, 0.41]} rotation={[0, s * 0.3, 0]} scale={[0.085, 0.055, 0.016]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color="#2C3238" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* rider: hips on the seat, feet on the floorboard, hands on the grips */}
      <group position={[0, 0.02, -0.29]}>
        <Human look={rider} mode="ride" />
      </group>
    </group>
  );
}

/** Auto-rickshaw: green lower body, yellow canopy, three wheels, seated driver. Faces +z. */
export function AutoRickshaw({ spin, body = "#2F7A3B", top = "#F6C21C" }: { spin: React.RefObject<number>; body?: string; top?: string }) {
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
      {/* handlebar + driver */}
      <mesh position={[0, 1.32, 0.62]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.62, 8]} />
        <meshStandardMaterial color="#1E1A18" />
      </mesh>
      <group position={[0, 0.16, 0.18]}>
        <Human look={DRIVER} mode="drive" />
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

type WalkerSpec = { look: HumanLook; side: 1 | -1; lane: number; dir: 1 | -1; speed: number; offset: number };
const WALKERS: WalkerSpec[] = [
  { look: { skin: "#B98157", hair: "#1E1410", hairStyle: "side", outfit: "shirt", top: "#DCE6F0", bottom: "#2B3A55", accent: "#F4F7FA", facial: "stubble", bag: { kind: "shoulder", color: "#3E2B22" } }, side: -1, lane: 4.15, dir: 1, speed: 1.15, offset: 4 },
  { look: { skin: "#9C6644", hair: "#140C08", hairStyle: "braid", outfit: "saree", top: "#C2185B", bottom: "#C2185B", accent: "#F2A900", bindi: true, slim: true, height: 0.95, bag: { kind: "shoulder", color: "#7A4B2A" } }, side: -1, lane: 4.75, dir: -1, speed: 0.95, offset: 22 },
  { look: { skin: "#D1A276", hair: "#2A1A12", hairStyle: "curly", outfit: "tshirt", top: "#3E8E41", bottom: "#33475B", shoe: "#EDEDED", bag: { kind: "backpack", color: "#35401D" } }, side: 1, lane: 4.2, dir: -1, speed: 1.3, offset: 9 },
  { look: { skin: "#A86B45", hair: "#CFC8C0", hairStyle: "bald", outfit: "kurta", top: "#F4EFE6", bottom: "#F4EFE6", facial: "moustache", glasses: "#3A2A1E", height: 0.97 }, side: 1, lane: 4.7, dir: 1, speed: 0.75, offset: 35 },
  { look: { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "hoodie", top: "#4A4E69", bottom: "#2B2B2B", facial: "beard", shoe: "#F2F2F2" }, side: -1, lane: 4.45, dir: 1, speed: 1.1, offset: 47 },
  { look: { skin: "#B5764A", hair: "#140C08", hairStyle: "long", outfit: "salwar", top: "#26A69A", bottom: "#F3E5D0", accent: "#FED300", bindi: true, slim: true, height: 0.94 }, side: 1, lane: 4.55, dir: 1, speed: 1.0, offset: 58 },
  { look: { skin: "#C68B59", hair: "#1E1410", hairStyle: "side", outfit: "kurta", top: "#7B2D26", bottom: "#E8DCC8", facial: "beard", glasses: "#1A1A1A" }, side: -1, lane: 4.8, dir: -1, speed: 1.1, offset: 66 },
  { look: { skin: "#D9A066", hair: "#3E2723", hairStyle: "bun", outfit: "shirt", top: "#E98A7B", bottom: "#2B3A55", accent: "#F7D2CB", slim: true, height: 0.95, bag: { kind: "backpack", color: "#1565C0" } }, side: 1, lane: 4.3, dir: -1, speed: 1.2, offset: 28 },
];

function Walker({ w, reduced }: { w: WalkerSpec; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
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
      <Human look={w.look} mode={reduced ? "stand" : "walk"} speed={w.speed} phase={w.offset} />
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
