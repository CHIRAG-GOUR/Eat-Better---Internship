"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs -- three.js objects, refs and textures are mutated inside useFrame / pointer handlers by design; the shared walker hands its refs to R3F (ref={walker.ref}, pose ref) */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { FollowCamera, WalkGround, WalkerController, type Walker } from "@/components/sim/walk";
import { Person, type Look } from "@/components/sim/Person";
import { NutPile } from "@/components/world/props";
import { BATCH_ID, LOTS, MACHINES, ORDER, PARTICLES, REVIEW_X, SAMPLES, STATION_INFO, STATION_X, TRAYS, type StationId } from "./data";
import { mistakesAt, useFacility } from "./store";
import { epoxyTexture, stripeTexture, textTexture } from "./tex";

const hand = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  },
  onPointerOut: () => {
    document.body.style.cursor = "";
  },
};

function useTex(make: () => THREE.Texture, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps -- tiny helper: callers pass literal deps
  const t = useMemo(make, deps);
  useEffect(() => () => t.dispose(), [t]);
  return t;
}

/* ── the hall ─────────────────────────────────────────────────── */

function Hall({ lite }: { lite: boolean }) {
  const floor = useTex(() => epoxyTexture(), []);
  const banner = useTex(
    () =>
      textTexture(1600, 200, "#2F1C1A", [
        { text: "VIRTUAL QUALITY & PACKAGING FACILITY", size: 82, color: "#FFF5EE", y: 82 },
        { text: `SIMULATED BATCH ${BATCH_ID} · TRAINING FLOOR`, size: 40, color: "#FED300", y: 158, weight: 700 },
      ]),
    [],
  );
  const hazard = useTex(() => {
    const t = stripeTexture("#2F1C1A", "#FED300", 16);
    t.repeat.set(20, 1);
    return t;
  }, []);
  const cols = useMemo(() => Array.from({ length: 9 }, (_, i) => -18 + i * 5.2), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 20]} />
        <meshStandardMaterial map={floor} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* walkway lines */}
      {[2.25, 3.95].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.006, z]}>
          <planeGeometry args={[42, 0.08]} />
          <meshStandardMaterial color="#FED300" />
        </mesh>
      ))}
      {/* back wall + windows strip */}
      <mesh position={[2.5, 3.5, -5]} receiveShadow>
        <planeGeometry args={[48, 7]} />
        <meshStandardMaterial color="#E4E7E3" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 0.25, -4.98]}>
        <planeGeometry args={[48, 0.5]} />
        <meshStandardMaterial map={hazard} />
      </mesh>
      <mesh position={[2.5, 5.2, -4.95]}>
        <planeGeometry args={[12, 1.5]} />
        <meshStandardMaterial map={banner} />
      </mesh>
      {!lite &&
        cols.map((x) => (
          <group key={x}>
            <mesh position={[x, 3.2, -4.6]} castShadow>
              <boxGeometry args={[0.3, 6.4, 0.3]} />
              <meshStandardMaterial color="#6C7A86" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[x, 6.3, -0.5]}>
              <boxGeometry args={[0.2, 0.3, 9]} />
              <meshStandardMaterial color="#7D8A95" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        ))}
      {/* overhead light panels */}
      {[-12, -6, 0, 6, 12, 18].map((x) => (
        <mesh key={x} position={[x, 5.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 0.5]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFF7EA" emissiveIntensity={1.6} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* duct */}
      {!lite && (
        <mesh position={[2.5, 5.9, -2.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 44, 16]} />
          <meshStandardMaterial color="#B8C0C6" metalness={0.7} roughness={0.35} />
        </mesh>
      )}
    </group>
  );
}

/* ── station shell: floor zone (click to walk there), hanging sign, status beacon ── */

function StationShell({ id, walkTo, children }: { id: StationId; walkTo: (id: StationId) => void; children: React.ReactNode }) {
  const idx = ORDER.indexOf(id);
  const passed = useFacility((s) => s.passed);
  const view = useFacility((s) => s.view);
  const alarmAt = useFacility((s) => s.alarmAt);
  const x = STATION_X[id];
  const info = STATION_INFO[id];
  const sign = useTex(
    () =>
      textTexture(720, 180, "#FF5C00", [
        { text: `0${info.n}`, size: 92, color: "#2F1C1A", y: 92, x: 90 },
        { text: info.name.toUpperCase(), size: 74, color: "#FFF5EE", y: 92, x: 420 },
      ]),
    [info.n, info.name],
  );
  const beacon = useRef<THREE.MeshStandardMaterial>(null);
  const zone = useRef<THREE.MeshStandardMaterial>(null);
  const status = idx < passed ? "done" : idx === passed ? "current" : "locked";
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const alarm = status === "current" && Date.now() - alarmAt < 2200;
    const c = alarm ? "#F83A3A" : status === "done" ? "#00A341" : status === "current" ? "#FF9A12" : "#8C918F";
    if (beacon.current) {
      beacon.current.color.set(c);
      beacon.current.emissive.set(c);
      beacon.current.emissiveIntensity = alarm ? (Math.sin(t * 16) > 0 ? 2 : 0.2) : status === "current" ? 1 + Math.sin(t * 4) * 0.5 : status === "done" ? 1.2 : 0.15;
    }
    if (zone.current) zone.current.opacity = view === id ? 0.5 : 0.28;
  });
  return (
    <group position={[x, 0, 0]}>
      {/* floor zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0.3]}
        onClick={(e) => {
          if (e.delta > 8) return;
          e.stopPropagation();
          walkTo(id);
        }}
        {...hand}
      >
        <planeGeometry args={[4.6, 4.2]} />
        <meshStandardMaterial ref={zone} color={status === "locked" ? "#9AA19E" : "#D6E4DA"} transparent opacity={0.3} />
      </mesh>
      {[-2.3, 2.3].map((dx) => (
        <mesh key={dx} rotation={[-Math.PI / 2, 0, 0]} position={[dx, 0.012, 0.3]}>
          <planeGeometry args={[0.06, 4.2]} />
          <meshStandardMaterial color="#FED300" />
        </mesh>
      ))}
      {/* hanging sign + beacon */}
      {[-1.1, 1.1].map((dx) => (
        <mesh key={dx} position={[dx, 4.6, -0.2]}>
          <cylinderGeometry args={[0.012, 0.012, 1.4, 6]} />
          <meshStandardMaterial color="#4A4F55" />
        </mesh>
      ))}
      <mesh position={[0, 3.75, -0.2]}>
        <planeGeometry args={[2.6, 0.65]} />
        <meshStandardMaterial map={sign} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.55, 3.75, -0.2]}>
        <sphereGeometry args={[0.14, 18, 14]} />
        <meshStandardMaterial ref={beacon} toneMapped={false} />
      </mesh>
      {children}
    </group>
  );
}

/** Retractable barrier between a station and the next one — opens when the station is passed. */
function Gate({ after }: { after: number }) {
  const passed = useFacility((s) => s.passed);
  const tape = useTex(() => {
    const t = stripeTexture("#F83A3A", "#FFFFFF", 10);
    t.repeat.set(2, 1);
    return t;
  }, []);
  const x = after < ORDER.length - 1 ? (STATION_X[ORDER[after]] + STATION_X[ORDER[after + 1]]) / 2 : (STATION_X.packaging + REVIEW_X) / 2 - 0.3;
  const open = passed > after;
  const g = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (g.current) g.current.scale.z = THREE.MathUtils.damp(g.current.scale.z, open ? 0.02 : 1, 4, delta);
  });
  return (
    <group position={[x, 0, 1.4]}>
      {[-1.6, 1.6].map((dz) => (
        <group key={dz} position={[0, 0, dz]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1, 10]} />
            <meshStandardMaterial color="#C9CDD1" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
            <meshStandardMaterial color="#2F1C1A" />
          </mesh>
        </group>
      ))}
      <mesh ref={g} position={[0, 0.92, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3.2, 0.08, 0.01]} />
        <meshStandardMaterial map={tape} />
      </mesh>
    </group>
  );
}

/* ── the simulated batch on its trolley (follows the batch's progress) ── */

function BatchTrolley() {
  const passed = useFacility((s) => s.passed);
  const alarmAt = useFacility((s) => s.alarmAt);
  const g = useRef<THREE.Group>(null);
  const tote = useRef<THREE.MeshStandardMaterial>(null);
  const tag = useTex(() => textTexture(360, 140, "#FFF5EE", [{ text: `BATCH ${BATCH_ID}`, size: 46, color: "#2F1C1A", y: 52 }, { text: "SIMULATED", size: 34, color: "#FF5C00", y: 104 }], "#2F1C1A"), []);
  const tx = passed >= ORDER.length ? REVIEW_X - 0.4 : STATION_X[ORDER[passed]] - 1.75;
  useFrame((_, delta) => {
    if (g.current) g.current.position.x = THREE.MathUtils.damp(g.current.position.x, tx, 1.8, delta);
    if (tote.current) tote.current.color.set(Date.now() - alarmAt < 2200 ? "#F83A3A" : "#2E7DBA");
  });
  return (
    <group ref={g} position={[STATION_X.sourcing - 1.75, 0, 1.6]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial color="#C9CDD1" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-0.4, 0.4].flatMap((dx) =>
        [-0.25, 0.25].map((dz) => (
          <group key={`${dx}${dz}`} position={[dx, 0, dz]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.45, 6]} />
              <meshStandardMaterial color="#9AA1A8" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.04, 0.02, 6, 12]} />
              <meshStandardMaterial color="#2F1C1A" />
            </mesh>
          </group>
        )),
      )}
      <RoundedBox args={[0.8, 0.36, 0.52]} radius={0.04} position={[0, 0.66, 0]} castShadow>
        <meshStandardMaterial ref={tote} color="#2E7DBA" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.66, 0.265]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshStandardMaterial map={tag} />
      </mesh>
    </group>
  );
}

/* ── 01 Sourcing: three incoming lots on a pallet ─────────────── */

function Sourcing() {
  const src = useFacility((s) => s.src);
  const setInspect = useFacility((s) => s.setInspect);
  const patch = useFacility((s) => s.patch);
  const view = useFacility((s) => s.view);
  const tags = useMemo(() => LOTS.map((l) => textTexture(300, 140, "#FFF5EE", [{ text: `LOT ${l.id}`, size: 56, color: "#2F1C1A", y: 52 }, { text: l.name.split("· ")[1].toUpperCase(), size: 34, color: "#4A3230", y: 106 }], "#2F1C1A")), []);
  useEffect(() => () => tags.forEach((t) => t.dispose()), [tags]);
  const inspect = (id: string) => {
    if (view !== "sourcing") return;
    patch("src", { selected: id, inspected: src.inspected.includes(id) ? src.inspected : [...src.inspected, id] });
    setInspect({ kind: "lot", id });
  };
  return (
    <group position={[0, 0, -0.5]}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.16, 1.3]} />
        <meshStandardMaterial color="#B98A5E" roughness={0.9} />
      </mesh>
      {LOTS.map((l, i) => {
        const sel = src.selected === l.id;
        const decided = src.decisions[l.id];
        return (
          <group
            key={l.id}
            position={[(i - 1) * 0.95, 0.16, 0]}
            onClick={(e) => {
              e.stopPropagation();
              inspect(l.id);
            }}
            {...hand}
          >
            <mesh position={[0, 0.42, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.38, 0.84, 20]} />
              <meshStandardMaterial color={l.sack} roughness={1} />
            </mesh>
            {l.fault && (
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.385, 0.385, 0.32, 20, 1, true]} />
                <meshStandardMaterial color="#5E4A30" roughness={1} transparent opacity={0.75} />
              </mesh>
            )}
            <mesh position={[0, 0.86, 0]} scale={[1, 0.35, 1]}>
              <sphereGeometry args={[0.31, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={l.fill} roughness={0.95} />
            </mesh>
            {l.fault &&
              [0, 1, 2, 3, 4, 5].map((k) => (
                <mesh key={k} position={[Math.cos(k * 1.1) * 0.16, 0.95, Math.sin(k * 1.1) * 0.16]} scale={[1, 0.4, 1]}>
                  <sphereGeometry args={[0.045, 10, 8]} />
                  <meshStandardMaterial color="#6B7A5A" roughness={1} />
                </mesh>
              ))}
            <mesh position={[0, 0.5, 0.39]}>
              <planeGeometry args={[0.42, 0.2]} />
              <meshStandardMaterial map={tags[i]} />
            </mesh>
            {(sel || decided) && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.42, 0.5, 32]} />
                <meshBasicMaterial color={decided === "reject" ? "#F83A3A" : decided === "accept" ? "#00A341" : "#FF5C00"} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* receiving dock door */}
      <mesh position={[0, 1.6, -1.9]}>
        <planeGeometry args={[3.6, 3.2]} />
        <meshStandardMaterial color="#9AA4AD" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ── 02 Quality Check: inspection table, sample trays, movable magnifier ── */

function QualityCheck() {
  const qc = useFacility((s) => s.qc);
  const setInspect = useFacility((s) => s.setInspect);
  const patch = useFacility((s) => s.patch);
  const view = useFacility((s) => s.view);
  const lens = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(-1.2, 0, 0.1));
  const trayX = [-0.85, 0, 0.85];
  const reveal = (lx: number, lz: number) => {
    trayX.forEach((tx, i) => {
      const id = TRAYS[i].id;
      if (Math.hypot(lx - tx, lz) < 0.33 && !qc.seen.includes(id)) {
        patch("qc", { seen: [...qc.seen, id] });
        setInspect({ kind: "tray", id });
      }
    });
  };
  useFrame((_, delta) => {
    if (!lens.current) return;
    lens.current.position.x = THREE.MathUtils.damp(lens.current.position.x, target.current.x, 10, delta);
    lens.current.position.z = THREE.MathUtils.damp(lens.current.position.z, target.current.z, 10, delta);
  });
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (view !== "check") return;
    e.stopPropagation();
    const local = e.object.parent!.worldToLocal(e.point.clone());
    target.current.set(THREE.MathUtils.clamp(local.x, -1.25, 1.25), 0, THREE.MathUtils.clamp(local.z, -0.35, 0.35));
    reveal(target.current.x, target.current.z);
  };
  return (
    <group position={[0, 0, -0.4]}>
      {/* steel table */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.06, 1.1]} />
        <meshStandardMaterial color="#D3D8DC" metalness={0.75} roughness={0.25} />
      </mesh>
      {[-1.4, 1.4].flatMap((x) =>
        [-0.45, 0.45].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.45, z]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color="#AEB5BB" metalness={0.8} />
          </mesh>
        )),
      )}
      {/* lightbox hood */}
      <mesh position={[0, 2.05, -0.3]}>
        <boxGeometry args={[3, 0.08, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      {/* pointer surface for the magnifier */}
      <mesh position={[0, 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onClick={move}>
        <planeGeometry args={[3, 1.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {TRAYS.map((t, i) => {
        const seen = qc.seen.includes(t.id);
        const flagged = qc.flags[t.id];
        return (
          <group key={t.id} position={[trayX[i], 0.94, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[0.66, 0.03, 0.5]} />
              <meshStandardMaterial color="#F4F6F7" roughness={0.4} />
            </mesh>
            {i === 2 ? (
              <>
                <group position={[-0.1, 0.02, 0]} scale={0.45}>
                  <NutPile count={36} spread={0.5} height={0.06} />
                </group>
                <group position={[0.14, 0.02, 0.05]} scale={0.95}>
                  <NutPile count={8} spread={0.12} height={0.04} />
                </group>
              </>
            ) : (
              <group position={[0, 0.02, 0]} scale={0.7}>
                <NutPile count={26} spread={0.3} height={0.05} />
              </group>
            )}
            {i === 1 &&
              [0, 1, 2, 3, 4].map((k) => (
                <mesh key={k} position={[Math.cos(k * 1.3) * 0.18, 0.05, Math.sin(k * 1.3) * 0.13]} scale={seen ? 1 : 0.45}>
                  {k % 2 ? <boxGeometry args={[0.07, 0.01, 0.03]} /> : <dodecahedronGeometry args={[0.028, 0]} />}
                  <meshStandardMaterial color={k % 2 ? "#D9C79A" : "#6E6E70"} roughness={1} />
                </mesh>
              ))}
            {(seen || flagged !== undefined) && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.36, 0.4, 36]} />
                <meshBasicMaterial color={flagged ? "#F83A3A" : seen ? "#FF9A12" : "#00A341"} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* the magnifier */}
      <group ref={lens} position={[-1.2, 0, 0.1]}>
        <group position={[0, 1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.3, 0.03, 12, 40]} />
            <meshStandardMaterial color="#2F1C1A" metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.29, 40]} />
            <meshPhysicalMaterial color="#E8F6FF" transparent opacity={0.22} roughness={0} transmission={0.5} thickness={0.2} />
          </mesh>
        </group>
        <mesh position={[0.42, 1.28, 0.2]} rotation={[0, -0.45, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.045, 0.35, 12]} />
          <meshStandardMaterial color="#FF5C00" />
        </mesh>
        <pointLight position={[0, 1.15, 0]} intensity={1.6} distance={0.9} color="#FFFFFF" />
      </group>
    </group>
  );
}

/* ── 03 Prepping: cleaning → roasting → sorting machines + sort output tray ── */

const NUM_TEX_CACHE: THREE.Texture[] = [];
function numTex(n: number) {
  if (!NUM_TEX_CACHE[n]) NUM_TEX_CACHE[n] = textTexture(128, 128, "#FF5C00", [{ text: String(n), size: 96, color: "#FFFFFF", y: 68 }]);
  return NUM_TEX_CACHE[n];
}

function Prepping() {
  const prep = useFacility((s) => s.prep);
  const patch = useFacility((s) => s.patch);
  const view = useFacility((s) => s.view);
  const drum = useRef<THREE.Mesh>(null);
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    if (drum.current && prep.ran) drum.current.rotation.x += delta * 1.6;
    if (water.current) water.current.position.y = 0.92 + Math.sin(clock.elapsedTime * 3) * 0.008;
  });
  const choose = (id: string) => {
    if (view !== "prepping" || prep.ran || prep.seq.includes(id) || prep.seq.length >= 3) return;
    patch("prep", { seq: [...prep.seq, id] });
  };
  const mx = { clean: -1.35, roast: 0, sort: 1.35 } as Record<string, number>;
  const particles = useMemo(() => Array.from({ length: PARTICLES }, (_, k) => [Math.cos(k * 1.7) * 0.2, Math.sin(k * 1.7) * 0.13] as [number, number]), []);
  const seeds = useMemo(() => Array.from({ length: 110 }, (_, k) => [((k * 37) % 100) / 100 - 0.5, ((k * 61) % 100) / 100 - 0.5] as [number, number]), []);
  return (
    <group position={[0, 0, -0.6]}>
      {MACHINES.map((m) => {
        const order = prep.seq.indexOf(m.id);
        return (
          <group
            key={m.id}
            position={[mx[m.id], 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              choose(m.id);
            }}
            {...hand}
          >
            {m.id === "clean" && (
              <>
                <RoundedBox args={[1, 0.9, 0.8]} radius={0.04} position={[0, 0.45, 0]} castShadow>
                  <meshStandardMaterial color="#C9CDD1" metalness={0.75} roughness={0.25} />
                </RoundedBox>
                <mesh ref={water} position={[0, 0.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.86, 0.66]} />
                  <meshStandardMaterial color="#6FB7E0" transparent opacity={0.8} roughness={0.1} />
                </mesh>
                <mesh position={[0, 1.4, -0.2]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.9, 10]} />
                  <meshStandardMaterial color="#9AA1A8" metalness={0.8} />
                </mesh>
              </>
            )}
            {m.id === "roast" && (
              <>
                <mesh position={[0, 0.35, 0]} castShadow>
                  <boxGeometry args={[0.9, 0.7, 0.7]} />
                  <meshStandardMaterial color="#4A4F55" metalness={0.5} roughness={0.45} />
                </mesh>
                <mesh ref={drum} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.38, 0.38, 0.95, 24]} />
                  <meshStandardMaterial color="#C9CDD1" metalness={0.85} roughness={0.25} />
                </mesh>
                <mesh position={[0.49, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <circleGeometry args={[0.3, 24]} />
                  <meshStandardMaterial color={prep.ran ? "#FF7A1A" : "#3A3A3A"} emissive={prep.ran ? "#FF5C00" : "#000000"} emissiveIntensity={0.6} />
                </mesh>
              </>
            )}
            {m.id === "sort" && (
              <>
                <mesh position={[0, 0.45, 0]} castShadow>
                  <boxGeometry args={[0.9, 0.9, 0.7]} />
                  <meshStandardMaterial color="#5A6670" metalness={0.5} roughness={0.45} />
                </mesh>
                <mesh position={[0, 1.05, 0.1]} rotation={[0.35, 0, 0]}>
                  <boxGeometry args={[0.8, 0.04, 0.9]} />
                  <meshStandardMaterial color="#2E2E30" roughness={0.8} />
                </mesh>
              </>
            )}
            {order >= 0 && (
              <mesh position={[0, 1.75, 0.2]}>
                <circleGeometry args={[0.16, 24]} />
                <meshBasicMaterial map={numTex(order + 1)} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* sort output tray (incomplete sorting is a simulated fault) */}
      <group position={[1.35, 0.92, 0.95]}>
        <mesh>
          <boxGeometry args={[0.9, 0.05, 0.55]} />
          <meshStandardMaterial color="#C9CDD1" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.47, 0]}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <meshStandardMaterial color="#9AA1A8" metalness={0.8} />
        </mesh>
        {prep.ran && (
          <>
            {seeds.map(([sx, sz], k) => (
              <mesh key={k} position={[sx * 0.8, 0.04, sz * 0.46]}>
                <sphereGeometry args={[0.018, 6, 5]} />
                <meshStandardMaterial color="#E2B866" roughness={0.9} />
              </mesh>
            ))}
            {particles.map(([px, pz], k) =>
              prep.found.includes(k) ? null : (
                <mesh
                  key={k}
                  position={[px, 0.06, pz]}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (view === "prepping") patch("prep", { found: [...prep.found, k] });
                  }}
                  {...hand}
                >
                  <dodecahedronGeometry args={[0.04, 0]} />
                  <meshStandardMaterial color="#5E5E60" roughness={1} />
                </mesh>
              ),
            )}
          </>
        )}
      </group>
    </group>
  );
}

/* ── 04 Cooking: small-batch kettle + simulated control dials ─── */

const COOK_COLORS = ["#EFE3B8", "#E6CF8A", "#D9A040", "#9A5A22", "#4A2A14"];

function Cooking() {
  const cook = useFacility((s) => s.cook);
  const patch = useFacility((s) => s.patch);
  const view = useFacility((s) => s.view);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const steam = useRef<THREE.Group>(null);
  const count = cook.size ? 220 : 110;
  const geo = useMemo(() => new THREE.SphereGeometry(0.035, 6, 5), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const score = cook.heat + cook.time;
    const r = cook.size ? 0.5 : 0.36;
    for (let i = 0; i < count; i++) {
      const a = i * 2.399;
      const d = Math.sqrt((i + 0.5) / count) * r;
      o.position.set(Math.cos(a) * d, 0.02 + ((i * 13) % 7) * 0.012 + (cook.size ? 0.06 : 0), Math.sin(a) * d);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      const shade = cook.size ? COOK_COLORS[Math.max(0, Math.min(4, score + (i % 2 ? -1 : 1)))] : COOK_COLORS[score];
      m.setColorAt(i, c.set(shade));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [cook, count]);
  useFrame(({ clock }) => {
    steam.current?.children.forEach((s, i) => {
      const t = (clock.elapsedTime * (0.3 + cook.heat * 0.2) + i / 4) % 1;
      s.position.y = 1.3 + t * 1.1;
      s.scale.setScalar(0.5 + t);
      ((s as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = (0.12 + cook.heat * 0.1) * (1 - t);
    });
  });
  const cycle = (id: "heat" | "time" | "size") => {
    if (view !== "cooking") return;
    const max = id === "size" ? 2 : 3;
    patch("cook", { [id]: (cook[id] + 1) % max });
  };
  return (
    <group position={[-0.4, 0, -0.4]}>
      {/* kettle */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.9, 20]} />
        <meshStandardMaterial color="#4A4F55" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <torusGeometry args={[0.38 + cook.heat * 0.06, 0.035, 6, 24]} />
        <meshStandardMaterial color="#FF5C00" emissive="#FF3D00" emissiveIntensity={0.4 + cook.heat * 0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.72, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#C9CDD1" metalness={0.85} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 0.95, 0]}>
        <instancedMesh ref={mesh} args={[geo, mat, 220]} count={count} />
      </group>
      <group ref={steam}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[(i - 1.5) * 0.15, 1.4, 0]}>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* control panel with dials */}
      <group position={[1.55, 0, 0.35]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.95, 1.3, 0.35]} />
          <meshStandardMaterial color="#5A6670" metalness={0.5} roughness={0.45} />
        </mesh>
        {(["heat", "time", "size"] as const).map((id, k) => {
          const stops = id === "size" ? 2 : 3;
          const ang = (-(cook[id] / (stops - 1)) + 0.5) * Math.PI * 0.9;
          return (
            <group
              key={id}
              position={[0, 1.08 - k * 0.32, 0.18]}
              onClick={(e) => {
                e.stopPropagation();
                cycle(id);
              }}
              {...hand}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.12, 0.06, 24]} />
                <meshStandardMaterial color="#2F1C1A" roughness={0.4} />
              </mesh>
              <mesh position={[Math.sin(-ang) * 0.07, Math.cos(-ang) * 0.07, 0.035]} rotation={[0, 0, -ang]}>
                <boxGeometry args={[0.025, 0.08, 0.01]} />
                <meshStandardMaterial color="#FED300" emissive="#FED300" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[-0.28, 0, 0.0]}>
                <boxGeometry args={[0.12, 0.05, 0.01]} />
                <meshStandardMaterial color={["#F83A3A", "#2E7DBA", "#00A341"][k]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/* ── 05 Batch Testing: lab bench, sample cups, moisture analyser, texture probe ── */

function Testing() {
  const test = useFacility((s) => s.test);
  const setInspect = useFacility((s) => s.setInspect);
  const patch = useFacility((s) => s.patch);
  const view = useFacility((s) => s.view);
  const plunger = useRef<THREE.Mesh>(null);
  const pressAt = useRef(-10);
  const last = test.tested[test.tested.length - 1];
  const sample = SAMPLES.find((s) => s.id === last);
  const screen = useTex(
    () =>
      textTexture(420, 200, "#13221A", sample ? [
        { text: `SAMPLE ${sample.id}`, size: 40, color: "#9FE3B5", y: 50, weight: 700 },
        { text: `MOISTURE ${sample.moisture}/5`, size: 52, color: sample.moisture > 3 ? "#FF6B5B" : "#9FE3B5", y: 120 },
        { text: "SIMULATED READING", size: 24, color: "#6FA383", y: 172, weight: 700 },
      ] : [{ text: "SELECT A SAMPLE", size: 40, color: "#9FE3B5", y: 100 }]),
    [last],
  );
  const labels = useMemo(() => SAMPLES.map((s) => textTexture(96, 96, "#FFFFFF", [{ text: s.id, size: 64, color: "#2F1C1A", y: 52 }])), []);
  useEffect(() => () => labels.forEach((t) => t.dispose()), [labels]);
  useFrame(({ clock }) => {
    if (!plunger.current) return;
    const dt = clock.elapsedTime - pressAt.current;
    plunger.current.position.y = 1.55 - (dt < 0.8 ? Math.sin((dt / 0.8) * Math.PI) * 0.32 : 0);
  });
  const run = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (view !== "testing" || !test.selected) return;
    patch("test", { tested: test.tested.includes(test.selected) ? test.tested : [...test.tested, test.selected], runs: test.runs + 1 });
    setInspect({ kind: "sample", id: test.selected });
  };
  return (
    <group position={[0, 0, -0.5]}>
      <ClockSync pressAt={pressAt} trigger={test.runs} />
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.07, 1.1]} />
        <meshStandardMaterial color="#F7F8F8" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.1, 0.9, 1.0]} />
        <meshStandardMaterial color="#DDE2E5" roughness={0.6} />
      </mesh>
      {/* glass partition behind */}
      <mesh position={[0, 1.9, -0.9]}>
        <planeGeometry args={[3.6, 1.9]} />
        <meshPhysicalMaterial color="#DCEFF7" transparent opacity={0.25} roughness={0.05} />
      </mesh>
      {SAMPLES.map((s, i) => {
        const sel = test.selected === s.id;
        const done = test.tested.includes(s.id);
        return (
          <group
            key={s.id}
            position={[-1.25 + i * 0.42, 0.94, 0.2]}
            onClick={(e) => {
              e.stopPropagation();
              if (view === "testing") patch("test", { selected: s.id });
            }}
            {...hand}
          >
            <mesh position={[0, 0.07, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.11, 0.14, 20, 1, true]} />
              <meshPhysicalMaterial color="#F4FBFF" transparent opacity={0.5} roughness={0.05} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.07, 20]} />
              <meshStandardMaterial color={s.id === "C" ? "#E3CC8A" : "#D9A040"} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.005, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.12, 0.12]} />
              <meshStandardMaterial map={labels[i]} />
            </mesh>
            {(sel || done) && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                <ringGeometry args={[0.15, 0.18, 30]} />
                <meshBasicMaterial color={sel ? "#FF5C00" : "#00A341"} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* moisture analyser */}
      <group position={[0.75, 0.94, 0.05]} onClick={run} {...hand}>
        <RoundedBox args={[0.6, 0.32, 0.5]} radius={0.04} position={[0, 0.16, 0]} castShadow>
          <meshStandardMaterial color="#E9ECEE" roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.33, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 24]} />
          <meshStandardMaterial color="#C9CDD1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.17, 0.252]}>
          <planeGeometry args={[0.46, 0.22]} />
          <meshStandardMaterial map={screen} emissive="#FFFFFF" emissiveMap={screen} emissiveIntensity={0.6} />
        </mesh>
      </group>
      {/* texture probe */}
      <group position={[1.35, 0.94, -0.1]} onClick={run} {...hand}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
          <meshStandardMaterial color="#5A6670" metalness={0.5} />
        </mesh>
        <mesh position={[0.15, 0.55, -0.12]}>
          <boxGeometry args={[0.06, 1.0, 0.06]} />
          <meshStandardMaterial color="#9AA1A8" metalness={0.8} />
        </mesh>
        <mesh ref={plunger} position={[0, 1.55 - 0.94, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 10]} />
          <meshStandardMaterial color="#C9CDD1" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** Keeps the probe animation in scene-clock time whenever a test is run. */
function ClockSync({ pressAt, trigger }: { pressAt: React.RefObject<number>; trigger: number }) {
  const clock = useThree((s) => s.clock);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pressAt.current = clock.elapsedTime;
  }, [trigger, clock, pressAt]);
  return null;
}

/* ── 06 Packaging: materials, seal-inspection turntable, label, leak tank ── */

function Packaging() {
  const pack = useFacility((s) => s.pack);
  const setInspect = useFacility((s) => s.setInspect);
  const patch = useFacility((s) => s.patch);
  const view = useFacility((s) => s.view);
  const pouch = useRef<THREE.Group>(null);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const rot = useRef(0);
  const dunk = useRef<THREE.Group>(null);
  const bubbles = useRef<THREE.Group>(null);
  const testAt = useRef(-10);
  const clock = useThree((s) => s.clock);
  const front = useTex(
    () =>
      textTexture(300, 400, "#F4EFE8", [
        { text: "PRACTICE", size: 46, color: "#2F1C1A", y: 120 },
        { text: "PRODUCT", size: 46, color: "#2F1C1A", y: 172 },
        { text: BATCH_ID, size: 34, color: "#FF5C00", y: 240 },
        { text: "SIMULATED", size: 28, color: "#4A3230", y: 300, weight: 700 },
      ], "#2F1C1A"),
    [],
  );
  useEffect(() => {
    testAt.current = clock.elapsedTime;
  }, [pack.leak, clock]);
  useFrame(({ clock: c }, delta) => {
    if (pouch.current) pouch.current.rotation.y = THREE.MathUtils.damp(pouch.current.rotation.y, rot.current, 10, delta);
    const dt = c.elapsedTime - testAt.current;
    if (dunk.current) dunk.current.position.y = pack.leak === "none" ? 0.55 : dt < 0.8 ? 0.55 - (dt / 0.8) * 0.45 : 0.1;
    if (bubbles.current) {
      const on = pack.leak === "fail";
      bubbles.current.visible = on;
      bubbles.current.children.forEach((b, i) => {
        const t = (c.elapsedTime * 0.9 + i / 8) % 1;
        b.position.set(0.05 + Math.sin(i * 2.1) * 0.04, 0.2 + t * 0.5, -0.02);
        b.scale.setScalar(0.6 + t * 0.6);
      });
    }
  });
  const down = (e: ThreeEvent<PointerEvent>) => {
    if (view !== "packaging") return;
    e.stopPropagation();
    drag.current = { x: e.clientX, r: rot.current };
    (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
  };
  const moveP = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    rot.current = drag.current.r + (e.clientX - drag.current.x) * 0.012;
  };
  const up = () => {
    drag.current = null;
  };
  const okMat = pack.material === "pouch";
  return (
    <group position={[0, 0, -0.4]}>
      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.07, 1.1]} />
        <meshStandardMaterial color="#D3D8DC" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[3.3, 0.88, 1.0]} />
        <meshStandardMaterial color="#B8C0C6" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* material samples */}
      {[
        { id: "paper", x: -1.45 },
        { id: "pouch", x: -1.0 },
        { id: "tub", x: -0.55 },
      ].map((m) => (
        <group
          key={m.id}
          position={[m.x, 0.92, 0.25]}
          onClick={(e) => {
            e.stopPropagation();
            if (view === "packaging" && !okMat) patch("pack", { material: m.id });
          }}
          {...hand}
        >
          {m.id === "paper" && (
            <mesh position={[0, 0.2, 0]} castShadow>
              <boxGeometry args={[0.26, 0.4, 0.14]} />
              <meshStandardMaterial color="#B98A5E" roughness={1} />
            </mesh>
          )}
          {m.id === "pouch" && (
            <RoundedBox args={[0.28, 0.4, 0.08]} radius={0.03} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#C9CDD1" metalness={0.75} roughness={0.25} />
            </RoundedBox>
          )}
          {m.id === "tub" && (
            <group>
              <mesh position={[0, 0.13, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.12, 0.26, 20, 1, true]} />
                <meshStandardMaterial color="#EDEDED" transparent opacity={0.8} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.06, 0.29, 0]} rotation={[0, 0, 0.35]}>
                <cylinderGeometry args={[0.16, 0.16, 0.02, 20]} />
                <meshStandardMaterial color="#EDEDED" />
              </mesh>
            </group>
          )}
          {pack.material === m.id && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <ringGeometry args={[0.2, 0.24, 30]} />
              <meshBasicMaterial color={okMat ? "#00A341" : "#F83A3A"} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
      {/* turntable with the batch pouch: drag to rotate, find the seal defect */}
      <group position={[0.35, 0.92, 0.1]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.42, 0.45, 0.06, 32]} />
          <meshStandardMaterial color="#2F1C1A" roughness={0.4} />
        </mesh>
        {okMat && (
          <group ref={pouch} position={[0, 0.06, 0]} onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerLeave={up} {...hand}>
            <RoundedBox args={[0.5, 0.7, 0.12]} radius={0.04} position={[0, 0.35, 0]} castShadow>
              <meshStandardMaterial color="#D9D2C7" metalness={0.35} roughness={0.35} />
            </RoundedBox>
            <mesh position={[0, 0.35, 0.061]}>
              <planeGeometry args={[0.46, 0.62]} />
              <meshStandardMaterial map={front} />
            </mesh>
            {/* heat-seal strip, top */}
            <mesh position={[0, 0.66, 0]}>
              <boxGeometry args={[0.5, 0.05, 0.125]} />
              <meshStandardMaterial color="#B8B1A6" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* the defect: an open gap in the seal on the BACK */}
            {!pack.repacked && (
              <mesh
                position={[0.1, 0.66, -0.064]}
                onClick={(e) => {
                  e.stopPropagation();
                  if (view === "packaging") {
                    patch("pack", { sealFound: true });
                    setInspect({ kind: "seal", id: "seal" });
                  }
                }}
              >
                <boxGeometry args={[0.16, 0.045, 0.01]} />
                <meshStandardMaterial color={pack.sealFound ? "#F83A3A" : "#3A2A20"} emissive={pack.sealFound ? "#F83A3A" : "#000000"} emissiveIntensity={0.6} />
              </mesh>
            )}
          </group>
        )}
      </group>
      {/* leak-test tank */}
      <group position={[1.3, 0.92, 0.05]}>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.6, 0.64, 0.45]} />
          <meshPhysicalMaterial color="#D8EEF8" transparent opacity={0.22} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.56, 0.48, 0.41]} />
          <meshStandardMaterial color="#6FB7E0" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        <group ref={dunk} position={[0, 0.55, 0]}>
          <RoundedBox args={[0.2, 0.28, 0.06]} radius={0.02} position={[0, 0.14, 0]}>
            <meshStandardMaterial color="#D9D2C7" metalness={0.35} roughness={0.35} />
          </RoundedBox>
          <group ref={bubbles}>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.018, 8, 6]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

/* ── final review room with a 3D batch report board ───────────── */

function ReviewRoom() {
  const passed = useFacility((s) => s.passed);
  const log = useFacility((s) => s.log);
  const board = useTex(() => {
    const c = document.createElement("canvas");
    c.width = 1400;
    c.height = 800;
    const g = c.getContext("2d")!;
    g.fillStyle = "#2F1C1A";
    g.fillRect(0, 0, 1400, 800);
    g.fillStyle = "#FED300";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const fam = getComputedStyle(document.body).fontFamily;
    g.font = `800 60px ${fam}`;
    g.fillText(`QUALITY REVIEW · BATCH ${BATCH_ID}`, 700, 70);
    g.fillStyle = "#FFF5EE";
    g.font = `600 28px ${fam}`;
    g.fillText("SIMULATED BATCH — TRAINING EXERCISE", 700, 122);
    ORDER.forEach((st, i) => {
      const x = 60 + (i % 3) * 440;
      const y = 170 + Math.floor(i / 3) * 300;
      const m = mistakesAt(log, st);
      const done = i < passed;
      const col = !done ? "#6E6662" : m === 0 ? "#00A341" : "#E89A12";
      g.fillStyle = col;
      g.fillRect(x, y, 400, 260);
      g.fillStyle = "#FFFFFF";
      g.font = `800 40px ${fam}`;
      g.fillText(`0${i + 1} ${STATION_INFO[st].name.toUpperCase()}`, x + 200, y + 70);
      g.font = `800 46px ${fam}`;
      g.fillText(!done ? "NOT REACHED" : m === 0 ? "PASSED" : "CORRECTED", x + 200, y + 145);
      g.font = `600 28px ${fam}`;
      g.fillText(!done ? "—" : m === 0 ? "first decision correct" : `${m} decision${m > 1 ? "s" : ""} needed correction`, x + 200, y + 205);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [passed, log]);
  return (
    <group position={[REVIEW_X, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshStandardMaterial color="#E9DCCB" roughness={0.9} />
      </mesh>
      {/* glass walls */}
      {[
        [0, 1.5, -2.2, 0],
        [-2.3, 1.5, 0, Math.PI / 2],
        [2.3, 1.5, 0, Math.PI / 2],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <planeGeometry args={[4.6, 3]} />
          <meshPhysicalMaterial color="#DDF0F7" transparent opacity={0.18} roughness={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 3.02, 0]}>
        <boxGeometry args={[4.7, 0.06, 4.6]} />
        <meshStandardMaterial color="#9AA4AD" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.75, -2.1]}>
        <planeGeometry args={[3.6, 2.06]} />
        <meshStandardMaterial map={board} emissive="#FFFFFF" emissiveMap={board} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.4, 0.2]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.8, 24]} />
        <meshStandardMaterial color="#FFF5EE" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ── the player: QA specialist + camera ────────────────────── */

export const PLAYER_START: [number, number, number] = [STATION_X.sourcing - 3.2, 0, 3.2];
const PLAYER: Look = { skin: "#C68B59", top: "#FFFFFF", bottom: "#4A5A6A", hair: "#1E1410", hairStyle: "short", extra: "hairnet" };

function Rig({ walker }: { walker: Walker }) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const k = aspect < 1 ? 1.6 : aspect < 1.3 ? 1.2 : 1;
  return <FollowCamera target={walker.ref} offset={[0.4, 3.6 * k, 6.2 * k]} lookHeight={0.9} stiffness={3} />;
}

/* ── scene root ───────────────────────────────────────────────── */

export default function FacilityScene({ lite, walker, walkTo, onArrive }: { lite: boolean; walker: Walker; walkTo: (id: StationId) => void; onArrive: () => void }) {
  return (
    <>
      <color attach="background" args={["#E9ECEA"]} />
      <fog attach="fog" args={["#E9ECEA", 14, 34]} />
      <hemisphereLight args={["#FFFFFF", "#8C9690", 1.15]} />
      <directionalLight position={[-6, 10, 8]} intensity={1.7} castShadow={!lite} shadow-mapSize={[1024, 1024]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={8} shadow-camera-bottom={-6} />
      {!lite && (
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={3} color="#FFFFFF" position={[0, 6, 4]} scale={[20, 4, 1]} target={[0, 1, 0]} />
        </Environment>
      )}
      <Rig walker={walker} />
      <WalkGround walker={walker} size={[48, 20]} position={[2.5, 0, 0]} />
      <WalkerController walker={walker} bounds={[-16, 20.5, 1.2, 5]} onArrive={onArrive} />
      {/* start position set here: the walker's own start effect runs before the Canvas mounts */}
      <group ref={walker.ref} position={PLAYER_START}>
        <Person look={PLAYER} pose={walker.pose} />
      </group>
      <Hall lite={lite} />
      <StationShell id="sourcing" walkTo={walkTo}>
        <Sourcing />
      </StationShell>
      <StationShell id="check" walkTo={walkTo}>
        <QualityCheck />
      </StationShell>
      <StationShell id="prepping" walkTo={walkTo}>
        <Prepping />
      </StationShell>
      <StationShell id="cooking" walkTo={walkTo}>
        <Cooking />
      </StationShell>
      <StationShell id="testing" walkTo={walkTo}>
        <Testing />
      </StationShell>
      <StationShell id="packaging" walkTo={walkTo}>
        <Packaging />
      </StationShell>
      {ORDER.map((_, i) => (
        <Gate key={i} after={i} />
      ))}
      <ReviewRoom />
      <BatchTrolley />
      {!lite && <ContactShadows position={[2.5, 0.015, 0]} opacity={0.25} scale={48} blur={2.4} far={3} resolution={1024} frames={1} />}
    </>
  );
}
