"use client";
/* eslint-disable react-hooks/immutability -- three.js objects and refs are mutated inside useFrame by design */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";

/**
 * Walkable-world helpers shared by the 1.4 neighbourhood and the 1.6 facility.
 *
 *   const walker = useWalker({ start: [0, 0, 6] });
 *   <WalkGround size={[30, 30]} walker={walker} />            // tap/click the floor to walk there
 *   <group ref={walker.ref}><Person … pose={walker.pose} /></group>
 *   <WalkerController walker={walker} bounds={[-14, 14, -14, 14]} onArrive={…} />
 *   <FollowCamera target={walker.ref} offset={[0, 5.5, 7.5]} />
 *   useKeyboardWalk(walker)                                   // optional WASD / arrows on desktop
 *
 * Interactive objects: `walker.goTo(point, () => openPanel())` walks up to them first.
 */

export type WalkPose = { walk: number; mood: number; arm: number; shake: number; jump: number; holding: boolean };

export type Walker = {
  ref: React.RefObject<THREE.Group | null>;
  target: React.RefObject<THREE.Vector3 | null>;
  arrive: React.RefObject<(() => void) | null>;
  pose: React.RefObject<WalkPose>;
  speed: number;
  /** Walk to a point; `stopShort` stops that far before it (to face a person/station). */
  goTo: (p: THREE.Vector3 | [number, number, number], onArrive?: () => void, stopShort?: number) => void;
};

export function useWalker({ start = [0, 0, 0], speed = 3 }: { start?: [number, number, number]; speed?: number } = {}): Walker {
  const ref = useRef<THREE.Group | null>(null);
  const target = useRef<THREE.Vector3 | null>(null);
  const arrive = useRef<(() => void) | null>(null);
  const pose = useRef<WalkPose>({ walk: 0, mood: 0, arm: 0, shake: 0, jump: 0, holding: false });
  const startRef = useRef(start);
  useEffect(() => {
    ref.current?.position.set(...startRef.current);
  }, []);
  return useMemo(
    () => ({
      ref,
      target,
      arrive,
      pose,
      speed,
      goTo: (p, onArrive, stopShort = 0) => {
        const v = Array.isArray(p) ? new THREE.Vector3(...p) : p.clone();
        v.y = 0;
        const g = ref.current;
        if (g && stopShort > 0) {
          const dir = v.clone().sub(g.position).setY(0);
          const len = dir.length();
          if (len > stopShort) v.sub(dir.normalize().multiplyScalar(stopShort));
          else v.copy(g.position);
        }
        target.current = v;
        arrive.current = onArrive ?? null;
      },
    }),
    [speed],
  );
}

/** Moves the walker towards its target each frame, turns it, and drives `pose.walk`. */
export function WalkerController({ walker, bounds, onArrive }: { walker: Walker; bounds?: [number, number, number, number]; onArrive?: () => void }) {
  useFrame((_, delta) => {
    const g = walker.ref.current;
    const t = walker.target.current;
    const p = walker.pose.current;
    if (!g) return;
    if (!t) {
      p.walk = THREE.MathUtils.damp(p.walk, 0, 10, delta);
      return;
    }
    if (bounds) {
      t.x = THREE.MathUtils.clamp(t.x, bounds[0], bounds[1]);
      t.z = THREE.MathUtils.clamp(t.z, bounds[2], bounds[3]);
    }
    const d = t.clone().sub(g.position).setY(0);
    const dist = d.length();
    if (dist < 0.06) {
      walker.target.current = null;
      p.walk = 0;
      const cb = walker.arrive.current;
      walker.arrive.current = null;
      cb?.();
      onArrive?.();
      return;
    }
    const step = Math.min(dist, walker.speed * Math.min(delta, 0.05));
    g.position.addScaledVector(d.normalize(), step);
    const yaw = Math.atan2(d.x, d.z);
    let diff = yaw - g.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.rotation.y += diff * Math.min(1, delta * 10);
    p.walk = 1;
  });
  return null;
}

/** Invisible floor that turns a tap/click (not a drag) into a walk target, with a landing ring. */
export function WalkGround({ walker, size = [40, 40], position = [0, 0, 0], enabled = true }: { walker: Walker; size?: [number, number]; position?: [number, number, number]; enabled?: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!enabled || e.delta > 8) return; // ignore drags (orbit / pan)
    e.stopPropagation();
    walker.goTo(e.point);
    if (ring.current) {
      ring.current.position.set(e.point.x, 0.02, e.point.z);
      ring.current.scale.setScalar(1);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
    }
  };
  useFrame((_, delta) => {
    const r = ring.current;
    if (!r) return;
    const m = r.material as THREE.MeshBasicMaterial;
    m.opacity = Math.max(0, m.opacity - delta * 1.2);
    r.scale.multiplyScalar(1 + delta * 0.8);
  });
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} onClick={click}>
        <planeGeometry args={size} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.26, 32]} />
        <meshBasicMaterial color="#FF5C00" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Third-person camera that follows a target smoothly (keeps its offset; no orbit fighting). */
export function FollowCamera({ target, offset = [0, 5.5, 7.5], lookHeight = 1, stiffness = 4 }: { target: React.RefObject<THREE.Object3D | null>; offset?: [number, number, number]; lookHeight?: number; stiffness?: number }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const t = target.current;
    if (!t) return;
    want.set(t.position.x + offset[0], t.position.y + offset[1], t.position.z + offset[2]);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, want.x, stiffness, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, want.y, stiffness, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, want.z, stiffness, delta);
    look.set(t.position.x, t.position.y + lookHeight, t.position.z);
    camera.lookAt(look);
  });
  return null;
}

/** Optional desktop control: WASD / arrow keys nudge the walker (ignored while typing in inputs). */
export function useKeyboardWalk(walker: Walker, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const keys = new Set<string>();
    const typing = () => {
      const el = document.activeElement;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (typing()) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        keys.add(k);
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    let raf = 0;
    const tick = () => {
      const g = walker.ref.current;
      if (g && keys.size) {
        const v = new THREE.Vector3((keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0), 0, (keys.has("s") || keys.has("arrowdown") ? 1 : 0) - (keys.has("w") || keys.has("arrowup") ? 1 : 0));
        if (v.lengthSq()) walker.goTo(g.position.clone().add(v.normalize().multiplyScalar(0.6)));
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      cancelAnimationFrame(raf);
    };
  }, [walker, enabled]);
}
