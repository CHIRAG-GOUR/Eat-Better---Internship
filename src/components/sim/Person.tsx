"use client";

/**
 * Shared stylised 3D people for the chapter simulations (1.4–1.6), same look as Chapter 1.3's Stall Day.
 * Drive animation through a `pose` ref: walk 0..1, mood -1/0/1, arm 0..1 (raise), shake 0..1, jump (m), holding.
 */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
export type Look = {
  skin: string;
  top: string;
  bottom: string;
  hair: string;
  hairStyle: "short" | "long" | "bun";
  dress?: boolean;
  extra?: "glasses" | "cap" | "dupatta" | "backpack" | "apron" | "hairnet" | "labcoat";
  extraColor?: string;
};

export type Pose = { walk: number; mood: number; arm: number; shake: number; jump: number; holding: boolean };

export function Person({ look, pose, holdColor }: { look: Look; pose: React.RefObject<Pose>; holdColor?: string }) {
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const held = useRef<THREE.Group>(null);
  const seed = useMemo(() => look.top.charCodeAt(1) * 0.37, [look.top]);

  useFrame(({ clock }) => {
    const p = pose.current;
    if (!p) return;
    const t = clock.elapsedTime + seed;
    const sw = Math.sin(t * 8.5) * 0.6 * p.walk;
    if (legL.current) legL.current.rotation.x = sw;
    if (legR.current) legR.current.rotation.x = -sw;
    if (armL.current) {
      armL.current.rotation.x = -sw * 0.7 - p.arm * 2.7;
      armL.current.rotation.z = p.arm * 0.35;
    }
    if (armR.current) {
      armR.current.rotation.x = sw * 0.7 - p.arm * 2.7 - (p.holding && p.arm < 0.1 ? 0.5 : 0);
      armR.current.rotation.z = -p.arm * 0.35;
    }
    if (body.current) body.current.position.y = Math.abs(Math.sin(t * 8.5)) * 0.045 * p.walk + p.jump + Math.sin(t * 1.6) * 0.008;
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 15) * 0.5 * p.shake;
      head.current.rotation.x = p.mood < 0 ? 0.12 : p.mood > 0 ? -0.08 : 0;
    }
    if (mouth.current) {
      mouth.current.rotation.z = p.mood < 0 ? 0 : Math.PI;
      mouth.current.scale.y = p.mood === 0 ? 0.25 : 1;
      mouth.current.position.y = p.mood < 0 ? -0.075 : -0.055;
    }
    if (held.current) held.current.visible = p.holding;
  });

  const skirt = look.dress;
  return (
    <group ref={body}>
      {/* legs */}
      {[
        [-0.1, legL],
        [0.1, legR],
      ].map(([x, r]) => (
        <group key={x as number} ref={r as React.RefObject<THREE.Group>} position={[x as number, 0.82, 0]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <capsuleGeometry args={[0.072, 0.6, 4, 10]} />
            <meshStandardMaterial color={skirt ? look.skin : look.bottom} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.78, 0.05]} castShadow>
            <boxGeometry args={[0.13, 0.08, 0.25]} />
            <meshStandardMaterial color="#2B1E18" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {skirt && (
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.34, 0.86, 18]} />
          <meshStandardMaterial color={look.bottom} roughness={0.75} />
        </mesh>
      )}
      {/* torso */}
      <mesh position={[0, 1.15, 0]} scale={[1, 1, 0.72]} castShadow>
        <capsuleGeometry args={[0.2, 0.44, 4, 14]} />
        <meshStandardMaterial color={look.top} roughness={0.75} />
      </mesh>
      {look.extra === "apron" && (
        <group>
          <mesh position={[0, 1.0, 0.152]}>
            <boxGeometry args={[0.34, 0.7, 0.02]} />
            <meshStandardMaterial color={look.extraColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.24, 0.163]}>
            <planeGeometry args={[0.2, 0.08]} />
            <meshStandardMaterial color="#FFF5EE" />
          </mesh>
        </group>
      )}
      {look.extra === "labcoat" && (
        <mesh position={[0, 0.98, 0]} scale={[1, 1, 0.78]} castShadow>
          <cylinderGeometry args={[0.235, 0.27, 0.92, 16]} />
          <meshStandardMaterial color={look.extraColor ?? "#F7F7F5"} roughness={0.8} />
        </mesh>
      )}
      {look.extra === "dupatta" && (
        <mesh position={[0.02, 1.2, 0.15]} rotation={[0, 0, 0.62]}>
          <boxGeometry args={[0.13, 0.82, 0.03]} />
          <meshStandardMaterial color={look.extraColor} roughness={0.85} />
        </mesh>
      )}
      {look.extra === "backpack" && (
        <RoundedBox args={[0.34, 0.44, 0.16]} radius={0.05} position={[0, 1.17, -0.22]} castShadow>
          <meshStandardMaterial color={look.extraColor} roughness={0.8} />
        </RoundedBox>
      )}
      {/* arms */}
      {[
        [-0.27, armL],
        [0.27, armR],
      ].map(([x, r]) => (
        <group key={x as number} ref={r as React.RefObject<THREE.Group>} position={[x as number, 1.36, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.4, 4, 10]} />
            <meshStandardMaterial color={look.top} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.066, 12, 10]} />
            <meshStandardMaterial color={look.skin} roughness={0.6} />
          </mesh>
          {(x as number) > 0 && (
            <group ref={held} position={[0, -0.56, 0.1]} visible={false}>
              <RoundedBox args={[0.2, 0.28, 0.06]} radius={0.02} castShadow>
                <meshStandardMaterial color={holdColor ?? "#FF5C00"} roughness={0.5} />
              </RoundedBox>
            </group>
          )}
        </group>
      ))}
      {/* neck + head */}
      <mesh position={[0, 1.47, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 12]} />
        <meshStandardMaterial color={look.skin} roughness={0.6} />
      </mesh>
      <group ref={head} position={[0, 1.68, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 24, 18]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.02, -0.015]} scale={[1.04, 1, 1.04]}>
          <sphereGeometry args={[0.205, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color={look.hair} roughness={0.9} />
        </mesh>
        {look.extra === "hairnet" && (
          <mesh position={[0, 0.03, -0.01]} scale={[1.1, 1.05, 1.1]}>
            <sphereGeometry args={[0.205, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={look.extraColor ?? "#EEF3F7"} roughness={0.9} transparent opacity={0.92} />
          </mesh>
        )}
        {look.hairStyle === "long" && (
          <mesh position={[0, -0.16, -0.12]}>
            <boxGeometry args={[0.38, 0.5, 0.1]} />
            <meshStandardMaterial color={look.hair} roughness={0.9} />
          </mesh>
        )}
        {look.hairStyle === "bun" && (
          <mesh position={[0, 0.17, -0.12]}>
            <sphereGeometry args={[0.085, 14, 10]} />
            <meshStandardMaterial color={look.hair} roughness={0.9} />
          </mesh>
        )}
        {/* face */}
        {[-0.07, 0.07].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.02, 0.18]}>
              <sphereGeometry args={[0.026, 10, 8]} />
              <meshStandardMaterial color="#1A0F0A" roughness={0.3} />
            </mesh>
            <mesh position={[x, 0.075, 0.178]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]}>
              <boxGeometry args={[0.06, 0.012, 0.01]} />
              <meshStandardMaterial color={look.hair === "#BDB6B0" ? "#8E8780" : "#1A0F0A"} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.02, 0.2]}>
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
        <mesh ref={mouth} position={[0, -0.055, 0.183]}>
          <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#7A2E22" roughness={0.5} />
        </mesh>
        {look.extra === "glasses" &&
          [-0.07, 0.07].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.19]}>
              <torusGeometry args={[0.045, 0.008, 6, 20]} />
              <meshStandardMaterial color={look.extraColor} metalness={0.4} roughness={0.4} />
            </mesh>
          ))}
        {look.extra === "cap" && (
          <group position={[0, 0.12, 0]}>
            <mesh>
              <sphereGeometry args={[0.215, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
              <meshStandardMaterial color={look.extraColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.0, 0.2]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.24, 0.02, 0.17]} />
              <meshStandardMaterial color={look.extraColor} roughness={0.7} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

export const still = (o: Partial<Pose> = {}): Pose => ({ walk: 0, mood: 0, arm: 0, shake: 0, jump: 0, holding: false, ...o });
