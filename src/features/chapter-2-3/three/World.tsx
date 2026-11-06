"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import BoulevardWorld, { Billboard, signTexture, type BoulevardKit } from "@/components/world2/BoulevardWorld";
import { Person, type Look, type Pose } from "@/components/sim/Person";
import { Hoverable } from "@/components/world/hover";

/**
 * Chapter 2.3 district of Brand Boulevard (dusk) — the "market square": a positioning-map plinth,
 * target-audience groups of shoppers, generic competitor stalls beside an Eat Better stall, the
 * hamper stats banner and the sample-persona board. Props sit at |x| >= 5.3 (walking strip kept clear).
 * Competitor stalls are generic brand TYPES from the chapter's objective, not real brands.
 */

const pose = (o: Partial<Pose> = {}): React.RefObject<Pose> => ({ current: { walk: 0, mood: 1, arm: 0, shake: 0, jump: 0, holding: false, ...o } });

function DistrictSign({ z, text, kit, side = 1 }: { z: number; text: string; kit: BoulevardKit; side?: 1 | -1 }) {
  const tex = useMemo(() => signTexture(text, "#2F1C1A", "#FED300", 768, 128), [text]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={[side * 5.6, 0, z]} rotation={[0, side * -0.6, 0]}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#3B3B3B" />
      </mesh>
      <mesh position={[0, 2.8, 0.02]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.25 + kit.night * 0.5} />
      </mesh>
    </group>
  );
}

/** The chapter's positioning map, painted on a tilted plinth. */
function mapTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const fam = getComputedStyle(document.body).fontFamily || "sans-serif";
  [["#F6D9C4", 0, 0], ["#E4EED9", 256, 0], ["#FBE6D3", 0, 256], ["#DCEBDD", 256, 256]].forEach(([col, x, y]) => {
    g.fillStyle = col as string;
    g.fillRect(x as number, y as number, 256, 256);
  });
  g.strokeStyle = "#2F1C1A";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(256, 20);
  g.lineTo(256, 492);
  g.moveTo(20, 256);
  g.lineTo(492, 256);
  g.stroke();
  g.fillStyle = "#2F1C1A";
  g.textAlign = "center";
  g.font = `800 24px ${fam}`;
  g.fillText("UNFAMILIAR", 256, 44);
  g.fillText("FAMILIAR", 256, 484);
  g.save();
  g.translate(36, 256);
  g.rotate(-Math.PI / 2);
  g.fillText("INDULGENT", 0, 0);
  g.restore();
  g.save();
  g.translate(476, 256);
  g.rotate(Math.PI / 2);
  g.fillText("HEALTH-FIRST", 0, 0);
  g.restore();
  g.fillStyle = "#FF5C00";
  g.beginPath();
  g.arc(256 + 0.35 * 200, 256 + 0.55 * 200, 22, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFF5EE";
  g.font = `800 18px ${fam}`;
  g.fillText("EB", 256 + 0.35 * 200, 256 + 0.55 * 200 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function MapPlinth({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const tex = useMemo(() => mapTex(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <Hoverable label="Positioning map: Eat Better sits on the familiar, better-for-you side">
      <group position={position} rotation={[0, rotation, 0]}>
        <RoundedBox args={[2.2, 0.9, 1.6]} radius={0.08} position={[0, 0.45, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#2F1C1A" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 1.15, 0.05]} rotation={[-0.75, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 1.9, 0.06]} />
          <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.17, 0.08]} rotation={[-0.75, 0, 0]}>
          <planeGeometry args={[1.85, 1.75]} />
          <meshStandardMaterial map={tex} roughness={0.7} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/** A concentric target board — the target audience. */
function TargetBoard({ position, rotation, kit }: { position: [number, number, number]; rotation: number; kit: BoulevardKit }) {
  const dart = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (dart.current && !kit.reduced) dart.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.05;
  });
  return (
    <Hoverable label="Target audience: the people a brand most wants to reach">
      <group position={position} rotation={[0, rotation, 0]}>
        <mesh position={[0, 1.0, -0.05]}>
          <cylinderGeometry args={[0.05, 0.06, 2.0, 8]} />
          <meshStandardMaterial color="#5B3A28" />
        </mesh>
        {[0.95, 0.72, 0.49, 0.26].map((r, i) => (
          <mesh key={r} position={[0, 2.25, 0.02 + i * 0.012]}>
            <circleGeometry args={[r, 40]} />
            <meshStandardMaterial color={i % 2 ? "#FFF5EE" : "#FF5C00"} emissive={i % 2 ? "#000000" : "#FF5C00"} emissiveIntensity={kit.night * 0.25} roughness={0.6} />
          </mesh>
        ))}
        <group ref={dart} position={[0.05, 2.28, 0.4]} rotation={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
            <meshStandardMaterial color="#2F1C1A" />
          </mesh>
          <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.16, 4]} />
            <meshStandardMaterial color="#FED300" />
          </mesh>
        </group>
      </group>
    </Hoverable>
  );
}

/** A small market stall with a name board. */
function Stall({ position, rotation, color, name, label }: { position: [number, number, number]; rotation: number; color: string; name: string; label: string }) {
  const sign = useMemo(() => signTexture(name, "#FFF5EE", "#2F1C1A", 512, 112), [name]);
  useEffect(() => () => sign.dispose(), [sign]);
  return (
    <Hoverable label={label}>
      <group position={position} rotation={[0, rotation, 0]}>
        <RoundedBox args={[1.6, 0.85, 0.85]} radius={0.06} position={[0, 0.43, 0]} castShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </RoundedBox>
        {[-0.72, 0.72].map((x) => (
          <mesh key={x} position={[x, 1.35, -0.34]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 1.9, 8]} />
            <meshStandardMaterial color="#5B3A28" />
          </mesh>
        ))}
        <mesh position={[0, 2.3, 0.02]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.06, 1.1]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        <mesh position={[0, 2.0, 0.55]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[1.6, 0.35]} />
          <meshStandardMaterial map={sign} roughness={0.7} />
        </mesh>
        {[-0.45, 0, 0.45].map((x, i) => (
          <mesh key={x} position={[x, 0.95, 0.1]} castShadow>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={["#E8A33C", "#C97A3A", "#8C5A2B"][i]} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </Hoverable>
  );
}

const LOOKS: Record<string, Look[]> = {
  families: [
    { skin: "#B5764A", top: "#26A69A", bottom: "#26A69A", hair: "#140C08", hairStyle: "long", dress: true, extra: "dupatta", extraColor: "#FED300" },
    { skin: "#C68B59", top: "#FF5C00", bottom: "#3B3B3B", hair: "#1E1410", hairStyle: "short" },
  ],
  professionals: [
    { skin: "#D4A373", top: "#1E5AA8", bottom: "#263238", hair: "#3E2723", hairStyle: "short", extra: "backpack", extraColor: "#2F2A28" },
    { skin: "#9C6644", top: "#FFF5EE", bottom: "#4A3230", hair: "#140C08", hairStyle: "bun", extra: "glasses", extraColor: "#2F1C1A" },
  ],
  gifting: [{ skin: "#A86B45", top: "#7B1FA2", bottom: "#7B1FA2", hair: "#1A110C", hairStyle: "long", dress: true }],
  corporate: [
    { skin: "#C68B59", top: "#4A5560", bottom: "#2F2A28", hair: "#1E1410", hairStyle: "short", extra: "glasses", extraColor: "#2F1C1A" },
    { skin: "#8D5A3B", top: "#35401D", bottom: "#2F2A28", hair: "#1A110C", hairStyle: "bun" },
  ],
};

function Group({ id, position, rotation, label, kids = false, gift = false, boxes = false }: { id: string; position: [number, number, number]; rotation: number; label: string; kids?: boolean; gift?: boolean; boxes?: boolean }) {
  const looks = LOOKS[id];
  const poses = useMemo(() => looks.map((_, i) => pose({ holding: gift && i === 0, arm: gift ? 0.15 : 0 })), [looks, gift]);
  const kid = useMemo(() => pose(), []);
  return (
    <Hoverable label={label}>
      <group position={position} rotation={[0, rotation, 0]}>
        {looks.map((l, i) => (
          <group key={i} position={[(i - (looks.length - 1) / 2) * 0.62, 0.12, i % 2 ? 0.2 : 0]} rotation={[0, (i - 0.5) * 0.4, 0]}>
            <Person look={l} pose={poses[i]} holdColor="#B3261E" />
          </group>
        ))}
        {kids && (
          <group position={[0.05, 0.12, 0.55]} scale={0.6}>
            <Person look={{ skin: "#C68B59", top: "#FED300", bottom: "#1E5AA8", hair: "#1E1410", hairStyle: "short" }} pose={kid} />
          </group>
        )}
        {boxes &&
          [0, 1, 2].map((i) => (
            <RoundedBox key={i} args={[0.5, 0.32, 0.4]} radius={0.03} position={[0.95, 0.28 + i * 0.33, 0.1]} castShadow>
              <meshStandardMaterial color={i % 2 ? "#FF5C00" : "#550D10"} roughness={0.6} />
            </RoundedBox>
          ))}
      </group>
    </Hoverable>
  );
}

export default function World() {
  return (
    <BoulevardWorld
      chapter="2.3"
      scenes={(kit) => (
        <>
          <DistrictSign z={-7} text="MARKET SQUARE" kit={kit} />
          <Hoverable label="Eat Better’s figures (brand claims): hampers delivered, corporate clients, hamper designs">
            <Billboard src="/chapter-2-3/lms-1.png" position={[0.6, 5.6, -12]} width={7} height={0.93} posts={false} />
          </Hoverable>
          {[-3.6, 4.8].map((x) => (
            <mesh key={x} position={[x, 2.85, -12.08]} castShadow>
              <cylinderGeometry args={[0.07, 0.08, 5.7, 8]} />
              <meshStandardMaterial color="#3A3330" metalness={0.4} roughness={0.5} />
            </mesh>
          ))}
          <MapPlinth position={[-5.8, 0, -9]} rotation={1.0} />
          <TargetBoard position={[5.9, 0, -15]} rotation={-1.0} kit={kit} />
          <Group id="families" position={[-5.9, 0, -17]} rotation={1.2} label="Health-conscious families" kids />
          <Group id="professionals" position={[5.9, 0, -22]} rotation={-1.2} label="Working professionals" />
          <Stall position={[-5.9, 0, -25]} rotation={1.1} color="#B3261E" name="SWEET SHOP" label="Traditional sweet shop (a brand type, not a real brand)" />
          <Stall position={[5.9, 0, -29]} rotation={-1.1} color="#E6A100" name="NAMKEEN" label="Mainstream namkeen brand (a brand type)" />
          <Stall position={[-5.9, 0, -33]} rotation={1.1} color="#2E7D6B" name="HEALTH BARS" label="Health-first snack brand (a brand type)" />
          <Stall position={[5.9, 0, -37]} rotation={-1.1} color="#FF5C00" name="EAT BETTER" label="Eat Better: familiar snacks with a better-for-you approach" />
          <Group id="gifting" position={[-5.9, 0, -41]} rotation={1.2} label="Festive gift buyers" gift />
          <Hoverable label="Sample persona: The Conscious Family Buyer (illustrative)">
            <Billboard src="/chapter-2-3/persona.jpeg" position={[6.1, 3.2, -46]} rotation={[0, -0.9, 0]} width={3.2} height={1.83} />
          </Hoverable>
          {!kit.compact && <Group id="corporate" position={[-5.9, 0, -50]} rotation={1.2} label="Corporate buyers" boxes />}
          <Hoverable label="Gifting: hampers for festive buyers">
            <Billboard src="/brand/catalog/bb-roshni.webp" position={[6.1, 3.2, -55]} rotation={[0, -0.9, 0]} width={2.4} height={2.4} />
          </Hoverable>
        </>
      )}
    />
  );
}
