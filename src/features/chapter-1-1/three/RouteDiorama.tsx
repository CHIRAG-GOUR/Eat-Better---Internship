"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { D2C } from "../content";

/**
 * 3D "two routes" diorama for the D2C section. One kitchen, two roads:
 *   shop route  : kitchen → distributor (warehouse) → shop → customer   (two hand-offs)
 *   D2C route   : kitchen → brand website (phone) → delivery van → customer
 * Plays on its own in a loop while visible. After each delivery a feedback bubble travels
 * back: on the D2C road it reaches the kitchen; on the shop road it stops at the shop.
 */

type RouteId = "traditional" | "d2c";
type V3 = [number, number, number];

const KITCHEN: V3 = [-5.2, 0, 0];
const ROUTES: Record<RouteId, V3[]> = {
  traditional: [KITCHEN, [-1.7, 0, -1.9], [1.7, 0, -1.9], [5.2, 0, -1.9]],
  d2c: [KITCHEN, [-1.7, 0, 1.9], [1.7, 0, 1.9], [5.2, 0, 1.9]],
};
const CYCLE = 15; // seconds — slow enough to read each caption

/** Plain-language narration for every moment of the loop. */
export const NARRATION: Record<RouteId, Record<string, string>> = {
  traditional: {
    leg0: "The kitchen sends the order to a distributor.",
    hold1: "Hand-off 1: the distributor takes the parcel.",
    leg1: "The distributor carries it to a shop.",
    hold2: "Hand-off 2: the shopkeeper puts it on a shelf.",
    leg2: "The customer buys it from the shop.",
    delivered: "The customer tries the snack.",
    feedback: "Feedback: “A bit too spicy!” — the customer tells the shopkeeper.",
    stalled: "The feedback stops at the shop. The kitchen never hears it.",
  },
  d2c: {
    leg0: "The customer ordered on the brand's website — the kitchen packs it.",
    hold1: "The order is confirmed on the brand's own website.",
    leg1: "The parcel goes straight to the delivery van.",
    hold2: "The van picks it up — no shop in between.",
    leg2: "The van drives it to the customer's door.",
    delivered: "Delivered! The customer tries the snack.",
    feedback: "Feedback: “A bit too spicy!” — sent straight to the brand.",
    heard: "The kitchen hears it directly and can improve the recipe.",
  },
};
export const PHASE_ORDER = ["leg0", "hold1", "leg1", "hold2", "leg2", "delivered", "feedback", "end"];

const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Timeline for one route: legs (travel seconds) with holds (hand-off pauses) at intermediate stops. */
function routeState(route: RouteId, time: number) {
  const pts = ROUTES[route];
  const t = time % CYCLE;
  const legs = route === "traditional" ? [1.8, 1.8, 1.8] : [1.6, 1.6, 1.8];
  const holds = route === "traditional" ? [1.6, 1.6] : [1.2, 1.2];
  // outbound
  let clock = 0;
  for (let i = 0; i < legs.length; i++) {
    if (t < clock + legs[i]) {
      const k = ease((t - clock) / legs[i]);
      return { phase: `leg${i}`, parcel: lerp3(pts[i], pts[i + 1], k), parcelOn: true, leg: i, bubble: null as V3 | null, bubbleAlpha: 0, handoff: -1, delivered: false, heard: 0, stalled: 0 };
    }
    clock += legs[i];
    if (i < holds.length) {
      if (t < clock + holds[i]) {
        const hop = Math.sin(((t - clock) / holds[i]) * Math.PI) * 0.35;
        const p = pts[i + 1];
        return { phase: `hold${i + 1}`, parcel: [p[0], hop, p[2]] as V3, parcelOn: true, leg: i, bubble: null, bubbleAlpha: 0, handoff: i + 1, delivered: false, heard: 0, stalled: 0 };
      }
      clock += holds[i];
    }
  }
  // delivered → feedback travels back
  const back = route === "traditional" ? [1.8] : [1.2, 1.2, 1.2]; // stalls at the shop vs. returns to the kitchen
  const pause = 1.4;
  if (t < clock + pause) return { phase: "delivered", parcel: pts[3], parcelOn: false, leg: 3, bubble: pts[3], bubbleAlpha: (t - clock) / pause, handoff: -1, delivered: true, heard: 0, stalled: 0 };
  clock += pause;
  for (let i = 0; i < back.length; i++) {
    if (t < clock + back[i]) {
      const k = ease((t - clock) / back[i]);
      return { phase: "feedback", parcel: pts[3], parcelOn: false, leg: 3, bubble: lerp3(pts[3 - i], pts[2 - i], k), bubbleAlpha: 1, handoff: -1, delivered: true, heard: 0, stalled: 0 };
    }
    clock += back[i];
  }
  const end = route === "traditional" ? pts[2] : pts[0];
  const after = t - clock;
  if (route === "traditional") {
    return { phase: "stalled", parcel: pts[3], parcelOn: false, leg: 3, bubble: end, bubbleAlpha: Math.max(0.25, 1 - after / 2.4), handoff: -1, delivered: true, heard: 0, stalled: Math.max(0, 1 - after / 2) };
  }
  return { phase: "heard", parcel: pts[3], parcelOn: false, leg: 3, bubble: end, bubbleAlpha: Math.max(0, 1 - after / 0.8), handoff: -1, delivered: true, heard: Math.max(0.35, 1 - after / 2.6), stalled: 0 };
}

/* ── buildings & props ────────────────────────────────────────── */

function House({ color = "#F7E3CF", roof = "#B5652F", glow = false }: { color?: string; roof?: string; glow?: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.1, 0.85, 1]} radius={0.04} position={[0, 0.43, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.85, 0.5, 4]} />
        <meshStandardMaterial color={roof} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.28, 0.505]}>
        <planeGeometry args={[0.28, 0.48]} />
        <meshStandardMaterial color={glow ? "#FFC14D" : "#6B4126"} emissive={glow ? "#FF9A2A" : "#000000"} emissiveIntensity={glow ? 1.4 : 0} />
      </mesh>
    </group>
  );
}

function Customer({ shirt }: { shirt: string }) {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.36, 4, 12]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.15, 18, 14]} />
        <meshStandardMaterial color="#E2A57A" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.96, -0.03]}>
        <sphereGeometry args={[0.152, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2F1C1A" />
      </mesh>
    </group>
  );
}

function Kitchen({ pulse }: { pulse: number }) {
  return (
    <group>
      <RoundedBox args={[1.6, 1.05, 1.4]} radius={0.05} position={[0, 0.53, 0]} castShadow>
        <meshStandardMaterial color="#FFF5EE" roughness={0.75} />
      </RoundedBox>
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[1.75, 0.12, 1.55]} />
        <meshStandardMaterial color="#FF5C00" roughness={0.6} />
      </mesh>
      <mesh position={[0.5, 1.6, -0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.55, 12]} />
        <meshStandardMaterial color="#6B4126" />
      </mesh>
      {/* glowing window — lights up when feedback arrives */}
      <mesh position={[0, 0.6, 0.705]}>
        <planeGeometry args={[0.9, 0.42]} />
        <meshStandardMaterial color="#FFE2B0" emissive="#FF9A2A" emissiveIntensity={0.2 + pulse * 2.4} />
      </mesh>
    </group>
  );
}

function Warehouse() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.7, 0.9, 1.1]} />
        <meshStandardMaterial color="#C9B9A6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.56, 0.56, 1.7, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#8C7B6A" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={x} position={[x, 0.17 + (i === 1 ? 0.3 : 0), 0.75]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <meshStandardMaterial color="#D8B98A" />
        </mesh>
      ))}
    </group>
  );
}

function Shop() {
  const stripes = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);
  return (
    <group>
      <RoundedBox args={[1.3, 0.9, 1]} radius={0.04} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#F3D9C0" roughness={0.8} />
      </RoundedBox>
      {stripes.map((i) => (
        <mesh key={i} position={[-0.55 + i * 0.22, 0.95, 0.62]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.5]} />
          <meshStandardMaterial color={i % 2 ? "#FFF5EE" : "#2F6B3A"} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0.55]}>
        <boxGeometry args={[1.1, 0.25, 0.15]} />
        <meshStandardMaterial color="#8A5A36" />
      </mesh>
    </group>
  );
}

function PhoneSite() {
  return (
    <group rotation={[0, -0.35, 0]}>
      <RoundedBox args={[0.85, 1.55, 0.12]} radius={0.08} position={[0, 0.95, 0]} castShadow>
        <meshStandardMaterial color="#2F1C1A" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.98, 0.065]}>
        <planeGeometry args={[0.72, 1.32]} />
        <meshStandardMaterial color="#FFF5EE" emissive="#FFF5EE" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.62, 0.07]}>
        <planeGeometry args={[0.5, 0.16]} />
        <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.6} />
      </mesh>
      {[1.35, 1.18, 1.01].map((y) => (
        <mesh key={y} position={[0, y, 0.07]}>
          <planeGeometry args={[0.52, 0.07]} />
          <meshStandardMaterial color="#E9C9AE" />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.2, 20]} />
        <meshStandardMaterial color="#C8963E" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

const Van = function Van({ refObj }: { refObj: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={refObj}>
      <RoundedBox args={[1, 0.5, 0.55]} radius={0.06} position={[-0.1, 0.38, 0]} castShadow>
        <meshStandardMaterial color="#FF5C00" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.36, 0.52]} radius={0.05} position={[0.55, 0.31, 0]} castShadow>
        <meshStandardMaterial color="#FF7A2A" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0.66, 0.38, 0]}>
        <boxGeometry args={[0.12, 0.16, 0.48]} />
        <meshStandardMaterial color="#BFE3F5" />
      </mesh>
      {[
        [-0.38, -0.25],
        [-0.38, 0.25],
        [0.45, -0.25],
        [0.45, 0.25],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 14]} />
          <meshStandardMaterial color="#2F1C1A" />
        </mesh>
      ))}
    </group>
  );
};

function Parcel({ refObj }: { refObj: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={refObj}>
      <RoundedBox args={[0.42, 0.32, 0.42]} radius={0.03} position={[0, 0.16, 0]} castShadow>
        <meshStandardMaterial color="#D8B98A" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.321, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.43, 0.08]} />
        <meshStandardMaterial color="#FF5C00" />
      </mesh>
    </group>
  );
}

function Bubble({ refObj, stalledRef }: { refObj: React.RefObject<THREE.Group | null>; stalledRef: React.RefObject<THREE.MeshStandardMaterial | null> }) {
  return (
    <group ref={refObj}>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.32, 20, 16]} />
        <meshStandardMaterial ref={stalledRef} color="#FED300" transparent roughness={0.4} />
      </mesh>
      <mesh position={[-0.14, 1.25, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.1, 0.22, 10]} />
        <meshStandardMaterial color="#FED300" transparent />
      </mesh>
      {[-0.12, 0, 0.12].map((x) => (
        <mesh key={x} position={[x, 1.55, 0.3]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#2F1C1A" />
        </mesh>
      ))}
    </group>
  );
}

function Road({ from, to, highlight }: { from: V3; to: V3; highlight: boolean }) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  const mid: V3 = [(from[0] + to[0]) / 2, 0.012, (from[2] + to[2]) / 2];
  return (
    <group position={mid} rotation={[0, -ang, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[len, 0.62]} />
        <meshStandardMaterial color={highlight ? "#5A4038" : "#7A6A60"} roughness={0.9} />
      </mesh>
      {Array.from({ length: Math.floor(len / 0.5) }, (_, i) => (
        <mesh key={i} position={[-len / 2 + 0.25 + i * 0.5, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 0.05]} />
          <meshStandardMaterial color={highlight ? "#FF5C00" : "#F3E6D8"} />
        </mesh>
      ))}
    </group>
  );
}

/* ── scene ────────────────────────────────────────────────────── */

type Stop = { route: RouteId; id: string };

const A_ = ROUTES.traditional;
const B_ = ROUTES.d2c;
/** World-space anchor (top of each building) for the DOM labels. */
const ANCHORS: Record<string, V3> = {
  kitchen: [KITCHEN[0], 2.1, KITCHEN[2]],
  distributor: [A_[1][0], 1.9, A_[1][2] - 0.75],
  shop: [A_[2][0], 1.6, A_[2][2] - 0.75],
  customerA: [A_[3][0], 1.7, A_[3][2] - 0.6],
  website: [B_[1][0], 2.2, B_[1][2] + 0.7],
  delivery: [B_[2][0], 1.2, B_[2][2] + 1.3],
  customerB: [B_[3][0], 1.7, B_[3][2] + 0.6],
  spicyA: [A_[3][0] - 0.95, 1.5, A_[3][2] + 0.15],
  spicyB: [B_[3][0] - 0.95, 1.5, B_[3][2] - 0.15],
};

/** Projects anchors to screen space every frame and moves the DOM labels (no React renders). */
function LabelProjector({ labels }: { labels: React.RefObject<Record<string, HTMLDivElement | null>> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const map = labels.current;
    if (!map) return;
    for (const [id, a] of Object.entries(ANCHORS)) {
      const el = map[id];
      if (!el) continue;
      v.set(a[0], a[1], a[2]).project(camera);
      // labels are plain DOM nodes outside React's control here (positioned every frame)
      el.style.setProperty("transform", `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px) translate(-50%, -100%)`);
    }
  });
  return null;
}

function Scene({ highlight, onPick, reduced, onPhase, labels }: { highlight: RouteId | null; onPick: (s: Stop | null) => void; reduced: boolean; onPhase: (p: { a: string; b: string }) => void; labels: React.RefObject<Record<string, HTMLDivElement | null>> }) {
  const parcelA = useRef<THREE.Group>(null);
  const parcelB = useRef<THREE.Group>(null);
  const van = useRef<THREE.Group>(null);
  const bubbleA = useRef<THREE.Group>(null);
  const bubbleB = useRef<THREE.Group>(null);
  const bubbleMatA = useRef<THREE.MeshStandardMaterial>(null);
  const bubbleMatB = useRef<THREE.MeshStandardMaterial>(null);
  const [kitchenPulse, setKitchenPulse] = useState(0);
  const [glow, setGlow] = useState({ a: false, b: false });
  const clock = useRef(reduced ? 6.2 : 0);
  const last = useRef({ a: "", b: "" });

  useFrame((state, dt) => {
    if (!reduced) clock.current += dt;
    const sa = routeState("traditional", clock.current);
    const sb = routeState("d2c", clock.current);
    const place = (g: THREE.Group | null, p: V3, on: boolean) => {
      if (!g) return;
      g.visible = on;
      g.position.set(p[0], p[1], p[2]);
    };
    place(parcelA.current, sa.parcel, sa.parcelOn);
    // on the D2C road the van carries the parcel on the last leg
    const vanLeg = sb.leg === 2 && sb.parcelOn;
    place(parcelB.current, sb.parcel, sb.parcelOn && !vanLeg);
    if (van.current) {
      const parked = ROUTES.d2c[2];
      const p = vanLeg ? sb.parcel : sb.delivered ? ROUTES.d2c[3] : parked;
      van.current.position.set(p[0] - 0.2, 0, p[2] + 0.55);
    }
    const bub = (g: THREE.Group | null, m: THREE.MeshStandardMaterial | null, p: V3 | null, a: number) => {
      if (!g) return;
      g.visible = !!p && a > 0.01;
      if (p) g.position.set(p[0], 0, p[2]);
      if (m) m.opacity = a;
      g.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    };
    bub(bubbleA.current, bubbleMatA.current, sa.bubble, sa.bubbleAlpha);
    bub(bubbleB.current, bubbleMatB.current, sb.bubble, sb.bubbleAlpha);
    // cheap React updates only when values change meaningfully
    const pulse = Math.round(sb.heard * 20) / 20;
    if (pulse !== kitchenPulse) setKitchenPulse(pulse);
    if (glow.a !== sa.delivered || glow.b !== sb.delivered) setGlow({ a: sa.delivered, b: sb.delivered });
    if (sa.phase !== last.current.a || sb.phase !== last.current.b) {
      last.current = { a: sa.phase, b: sb.phase };
      onPhase(last.current);
    }
  });

  const pick = (route: RouteId, id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPick({ route, id });
  };
  const hoverOn = () => (document.body.style.cursor = "pointer");
  const hoverOff = () => (document.body.style.cursor = "");
  const A = ROUTES.traditional;
  const B = ROUTES.d2c;

  return (
    <>
      <hemisphereLight args={["#FFF4E6", "#7A4A2C", 0.9]} />
      <directionalLight position={[-4, 8, 5]} intensity={2.2} color="#FFF0DC" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.5} color="#FFF4E6" position={[-3, 4, 4]} scale={[5, 4, 1]} target={[0, 0, 0]} />
      </Environment>

      {/* board */}
      <RoundedBox args={[13.4, 0.3, 6.8]} radius={0.12} position={[0, -0.15, 0]} receiveShadow onClick={() => onPick(null)}>
        <meshStandardMaterial color="#F1D3B4" roughness={0.95} />
      </RoundedBox>
      {/* grass patches */}
      {[
        [-3.4, -2.9],
        [3.4, 2.9],
        [0, 0],
        [-3.3, 2.9],
        [3.2, -2.9],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 20]} />
          <meshStandardMaterial color="#B9C98A" />
        </mesh>
      ))}

      {A.slice(0, -1).map((p, i) => (
        <Road key={`a${i}`} from={p} to={A[i + 1]} highlight={highlight === "traditional"} />
      ))}
      {B.slice(0, -1).map((p, i) => (
        <Road key={`b${i}`} from={p} to={B[i + 1]} highlight={highlight === "d2c"} />
      ))}

      {/* kitchen (shared) */}
      <group position={KITCHEN} onClick={pick("d2c", "kitchen")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
        <Kitchen pulse={kitchenPulse} />
      </group>

      {/* shop & distributor road (back) */}
      <group position={[A[1][0], 0, A[1][2] - 0.75]} onClick={pick("traditional", "distributor")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
        <Warehouse />
      </group>
      <group position={[A[2][0], 0, A[2][2] - 0.75]} onClick={pick("traditional", "shop")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
        <Shop />
      </group>
      <group position={[A[3][0], 0, A[3][2] - 0.6]} onClick={pick("traditional", "customer")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
        <House glow={glow.a} />
      </group>

      {/* D2C road (front) */}
      <group position={[B[1][0], 0, B[1][2] + 0.7]} onClick={pick("d2c", "website")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
        <PhoneSite />
      </group>
      <group position={[B[2][0], 0, B[2][2] + 1.3]} onClick={pick("d2c", "delivery")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
      </group>
      <group position={[B[3][0], 0, B[3][2] + 0.6]} onClick={pick("d2c", "customer")} onPointerOver={hoverOn} onPointerOut={hoverOff}>
        <House color="#FFF0DE" roof="#E8540A" glow={glow.b} />
      </group>

      {/* the two customers, standing outside their homes */}
      <group position={[A[3][0] - 0.95, 0, A[3][2] + 0.15]}>
        <Customer shirt="#4A6FA5" />
      </group>
      <group position={[B[3][0] - 0.95, 0, B[3][2] - 0.15]}>
        <Customer shirt="#2F8F5B" />
      </group>

      <Van refObj={van} />
      <Parcel refObj={parcelA} />
      <Parcel refObj={parcelB} />
      <Bubble refObj={bubbleA} stalledRef={bubbleMatA} />
      <Bubble refObj={bubbleB} stalledRef={bubbleMatB} />

      <LabelProjector labels={labels} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2} far={3} resolution={512} frames={1} />
    </>
  );
}

export default function RouteDiorama({ highlight }: { highlight: RouteId | null }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pick, setPick] = useState<Stop | null>(null);
  const [phase, setPhase] = useState({ a: "leg0", b: "leg0" });
  const labels = useRef<Record<string, HTMLDivElement | null>>({});
  const reduced = !!useReducedMotion();
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  const info = pick ? D2C.routes[pick.route].stops.find((s) => s.id === pick.id) : null;

  return (
    <div ref={host} className="relative">
      <div className="relative h-[380px] overflow-hidden rounded-[24px] border border-cocoa bg-[#FBE6D3] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[460px]">
        {visible && (
          <Canvas shadows="percentage" dpr={[1, 1.5]} camera={{ position: [0, 8.2, 8.8], fov: 36 }} onCreated={({ camera }) => camera.lookAt(0, 0.2, 0.2)}>
            <color attach="background" args={["#FBE6D3"]} />
            <Scene highlight={highlight} onPick={setPick} reduced={reduced} onPhase={setPhase} labels={labels} />
          </Canvas>
        )}
        {/* building labels (positioned by LabelProjector) */}
        {visible && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {(
              [
                ["kitchen", "Kitchen", phase.b === "heard" ? "Feedback heard!" : undefined, phase.a === "leg0" || phase.b === "leg0" || phase.b === "heard"],
                ["distributor", "Distributor", "in between", phase.a === "hold1" || phase.a === "leg1"],
                ["shop", "Shop", "in between", phase.a === "hold2" || phase.a === "leg2" || phase.a === "stalled"],
                ["customerA", "Customer", "buys from the shop", phase.a === "delivered" || phase.a === "feedback"],
                ["website", "Brand website", undefined, phase.b === "hold1" || phase.b === "leg0"],
                ["delivery", "Delivery van", undefined, phase.b === "leg1" || phase.b === "hold2" || phase.b === "leg2"],
                ["customerB", "Customer", "orders online", phase.b === "delivered" || phase.b === "feedback"],
              ] as [string, string, string | undefined, boolean][]
            ).map(([id, text, sub, on]) => (
              <div key={id} ref={(el) => { labels.current[id] = el; }} className="absolute left-0 top-0 will-change-transform">
                <div className={`whitespace-nowrap rounded-lg border px-2 py-0.5 text-center text-[12px] font-bold leading-tight shadow-[2px_2px_0_0_#2f1c1a] sm:text-[13px] ${on ? "border-cocoa bg-orange text-white" : "border-cocoa bg-cream text-cocoa"}`}>
                  {text}
                  {sub && <div className="text-[10.5px] font-semibold opacity-85 sm:text-[11px]">{sub}</div>}
                </div>
              </div>
            ))}
            {(["spicyA", "spicyB"] as const).map((id) => {
              const show = id === "spicyA" ? phase.a === "delivered" || phase.a === "feedback" : phase.b === "delivered" || phase.b === "feedback";
              return (
                <div key={id} ref={(el) => { labels.current[id] = el; }} className="absolute left-0 top-0 will-change-transform">
                  <div className={`whitespace-nowrap rounded-full border border-cocoa bg-haldi px-2.5 py-0.5 text-[12px] font-bold text-cocoa transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>A bit too spicy!</div>
                </div>
              );
            })}
          </div>
        )}
        {/* road legends */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="rounded-lg bg-cocoa/85 px-2.5 py-1 text-[0.85rem] font-bold text-cream">Back road · {D2C.routes.traditional.label}</span>
          <span className="rounded-lg bg-orange px-2.5 py-1 text-[0.85rem] font-bold text-white">Front road · {D2C.routes.d2c.label}</span>
        </div>
      </div>

      {/* live narration — what is happening right now on each road */}
      <div className="mt-3 grid gap-3 md:grid-cols-2" aria-live="polite">
        {(["traditional", "d2c"] as const).map((r) => {
          const key = r === "traditional" ? phase.a : phase.b;
          const step = Math.max(0, PHASE_ORDER.indexOf(key === "stalled" || key === "heard" ? "end" : key));
          const end = key === "stalled" || key === "heard";
          return (
            <div key={r} className={`rounded-2xl px-4 py-3 ${r === "d2c" ? "bg-orange/10" : "bg-surface-sunk"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{r === "d2c" ? "Front road · D2C" : "Back road · shop route"}</span>
                <span className="flex gap-1" aria-hidden>
                  {PHASE_ORDER.map((_, i) => (
                    <span key={i} className={`h-1.5 w-3 rounded-full ${i <= step ? (r === "d2c" ? "bg-orange" : "bg-cocoa-2") : "bg-cocoa/15"}`} />
                  ))}
                </span>
              </div>
              <p className={`mt-1.5 min-h-[3.2em] text-[1.02rem] leading-snug ${end ? "font-bold" : ""} ${end && r === "traditional" ? "text-error" : end ? "text-success" : "text-cocoa"}`}>
                <span className="mr-1.5 inline-grid size-6 place-items-center rounded-full bg-cocoa text-[0.8rem] font-bold text-cream">{step + 1}</span>
                {NARRATION[r][key]}
              </p>
            </div>
          );
        })}
      </div>
      {info && pick && (
        <p className="mt-3 rounded-2xl border border-cocoa/20 bg-white px-4 py-3 text-[1rem] leading-relaxed text-cocoa">
          <strong>{info.label}</strong> <span className="text-cocoa-2">({D2C.routes[pick.route].label})</span>: {info.text}
        </p>
      )}
    </div>
  );
}
