"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Silent fireworks over the city for the night chapter (2.4). Each shell launches a rocket trail from behind the
 * rooftops, bursts (peony, ring, gold willow or palm), drifts down under gravity and fades, then relaunches
 * somewhere new ahead of the camera. Additive points, not affected by fog, so they read against the night sky.
 */

const PALETTE = ["#FFD36B", "#FF7A3D", "#FF4F9A", "#7CFF8A", "#FFFFFF", "#B48CFF", "#4FD8FF", "#FFE9A8"];
type KindF = "peony" | "ring" | "willow" | "palm";

let DOT: THREE.Texture | null = null;
function dot() {
  if (DOT) return DOT;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  DOT = new THREE.CanvasTexture(c);
  return DOT;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function Shell({ index, n, delay }: { index: number; n: number; delay: number }) {
  const TRAIL = 10;
  const burst = useRef<THREE.Points>(null);
  const trail = useRef<THREE.Points>(null);
  const glow = useRef<THREE.Points>(null);

  const R = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const tpos = new Float32Array(TRAIL * 3);
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    bg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const tg = new THREE.BufferGeometry();
    tg.setAttribute("position", new THREE.BufferAttribute(tpos, 3));
    const gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
    const common = { map: dot(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: true } as const;
    return {
      bg,
      tg,
      gg,
      bm: new THREE.PointsMaterial({ ...common, size: 1.15, vertexColors: true }),
      tm: new THREE.PointsMaterial({ ...common, size: 0.45, color: "#FFE2A6" }),
      gm: new THREE.PointsMaterial({ ...common, size: 15, color: "#FFF4D6" }),
    };
  }, [n]);
  const st = useRef({ dirs: new Float32Array(n * 3), origin: new THREE.Vector3(), launchFrom: new THREE.Vector3(), start: -999, period: 4, launch: 1.1, kind: "peony" as KindF, grav: 2.4, life: 2.2, speed: 7 });

  const reset = (now: number, cam: THREE.Vector3) => {
    const s = st.current;
    const col = burst.current!.geometry.getAttribute("color") as THREE.BufferAttribute;
    s.start = now;
    s.kind = (["peony", "ring", "willow", "palm", "peony"] as KindF[])[Math.floor(Math.random() * 5)];
    s.origin.set(cam.x + rnd(-24, 24), rnd(13, 19), cam.z - rnd(46, 72));
    s.launchFrom.set(s.origin.x + rnd(-1.5, 1.5), 3, s.origin.z);
    s.launch = rnd(0.9, 1.3);
    s.period = rnd(3.6, 5.4);
    s.grav = s.kind === "willow" ? 3.6 : 2.2;
    s.life = s.kind === "willow" ? 3.0 : 2.1;
    s.speed = s.kind === "palm" ? 6.5 : s.kind === "ring" ? 9 : 8;
    const a = new THREE.Color(s.kind === "willow" ? "#FFC35A" : PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    const b = new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    // ring: particles on a circle in a random tilted plane; others: random directions on a sphere
    const tilt = new THREE.Euler(rnd(-0.9, 0.9), rnd(0, Math.PI), rnd(-0.5, 0.5));
    const v = new THREE.Vector3();
    for (let k = 0; k < n; k++) {
      if (s.kind === "ring") {
        const ang = (k / n) * Math.PI * 2;
        v.set(Math.cos(ang), 0, Math.sin(ang)).applyEuler(tilt);
      } else if (s.kind === "palm") {
        const arm = k % 7;
        const ang = (arm / 7) * Math.PI * 2;
        v.set(Math.cos(ang) * 0.8, 0.55 + Math.random() * 0.15, Math.sin(ang) * 0.8).normalize().multiplyScalar(0.55 + (k / n) * 0.5);
      } else {
        v.randomDirection().multiplyScalar(0.85 + Math.random() * 0.15);
      }
      s.dirs.set([v.x, v.y, v.z], k * 3);
      const c = Math.random() < (s.kind === "peony" ? 0.35 : 0.1) ? b : a;
      col.setXYZ(k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };

  useFrame(({ camera, clock }) => {
    const now = clock.elapsedTime;
    if (now < delay || !burst.current || !trail.current || !glow.current) return;
    const s = st.current;
    const bm = burst.current.material as THREE.PointsMaterial;
    const tm = trail.current.material as THREE.PointsMaterial;
    const gm = glow.current.material as THREE.PointsMaterial;
    if (now - s.start > s.period) reset(now, camera.position);
    const t = now - s.start;
    const pos = burst.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const tpos = trail.current.geometry.getAttribute("position") as THREE.BufferAttribute;

    if (t < s.launch) {
      // rocket climbing with a short fading trail
      const u = t / s.launch;
      const e = 1 - (1 - u) * (1 - u);
      for (let k = 0; k < TRAIL; k++) {
        const uk = Math.max(0, e - k * 0.018);
        tpos.setXYZ(k, THREE.MathUtils.lerp(s.launchFrom.x, s.origin.x, uk) + Math.sin(uk * 20 + index) * 0.05, THREE.MathUtils.lerp(s.launchFrom.y, s.origin.y, uk), s.origin.z);
      }
      tpos.needsUpdate = true;
      tm.opacity = 0.9;
      bm.opacity = 0;
      gm.opacity = 0;
      return;
    }
    tm.opacity = 0;
    const tt = t - s.launch;
    const drag = 1.6;
    const travel = (1 - Math.exp(-drag * tt)) / drag;
    for (let k = 0; k < n; k++) {
      const i3 = k * 3;
      pos.setXYZ(k, s.origin.x + s.dirs[i3] * s.speed * travel, s.origin.y + s.dirs[i3 + 1] * s.speed * travel - 0.5 * s.grav * tt * tt * 0.6, s.origin.z + s.dirs[i3 + 2] * s.speed * travel);
    }
    pos.needsUpdate = true;
    const fade = tt < 0.08 ? tt / 0.08 : Math.max(0, 1 - (tt - 0.35) / s.life);
    // late crackle on peonies
    bm.opacity = fade * (s.kind === "peony" && tt > 1.2 ? 0.75 + Math.sin(now * 40 + index) * 0.25 : 1);
    bm.size = 1.15 * (0.6 + 0.4 * fade);
    const gp = glow.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    gp.setXYZ(0, s.origin.x, s.origin.y, s.origin.z);
    gp.needsUpdate = true;
    gm.opacity = Math.max(0, 0.55 - tt * 1.4);
  });

  return (
    <group>
      <points ref={trail} geometry={R.tg} material={R.tm} frustumCulled={false} />
      <points ref={burst} geometry={R.bg} material={R.bm} frustumCulled={false} />
      <points ref={glow} geometry={R.gg} material={R.gm} frustumCulled={false} />
    </group>
  );
}

export function Fireworks({ compact }: { compact: boolean }) {
  const count = compact ? 3 : 6;
  const n = compact ? 70 : 120;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <Shell key={i} index={i} n={n} delay={i * 0.85} />
      ))}
    </group>
  );
}
