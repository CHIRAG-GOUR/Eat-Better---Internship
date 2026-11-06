"use client";

import { useEffect, useMemo } from "react";
import ValleyWorld, { Signpost, type ValleyKit } from "@/components/world3/ValleyWorld";
import { mat, signTex } from "@/components/world3/kit";
import { Hoverable } from "@/components/world/hover";

/**
 * Chapter 3.1 district of Value Chain Valley (bright late morning). The camera starts on the canvas
 * terrace (Customer Segments, Value Propositions, Channels and Customer Relationships lit), passes the
 * dispatch bays and a channel gantry over the road, then tours the customer town: dark store, homes,
 * college + co-working, festive market, office tower and the review billboard.
 */

const CHANNELS = ["OWN WEBSITE", "MARKETPLACES", "QUICK-COMMERCE APPS", "BULK & CORPORATE ORDERS"];

/** A highway-style gantry over the road: four channels, four lanes to the customer. */
function ChannelGantry({ z }: { z: number }) {
  const texes = useMemo(() => CHANNELS.map((c) => signTex(c, "#1F6B45", "#FFFFFF", 1024, 300, "#FFFFFF")), []);
  useEffect(() => () => texes.forEach((t) => t.dispose()), [texes]);
  const steel = mat("#6B7378", 0.45, 0.6);
  return (
    <Hoverable label="Channels: the routes Eat Better uses to reach customers">
      <group position={[0, 0, z]}>
        {[-4.6, 4.6].map((x) => (
          <mesh key={x} position={[x, 3.4, 0]} material={steel} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 6.8, 10]} />
          </mesh>
        ))}
        <mesh position={[0, 6.55, -0.1]} material={steel} castShadow>
          <boxGeometry args={[9.6, 0.3, 0.3]} />
        </mesh>
        {texes.map((t, i) => (
          <group key={i} position={[-3.45 + i * 2.3, 5.75, 0.06]}>
            <mesh material={mat("#FFFFFF", 0.8)} position={[0, 0, -0.04]}>
              <boxGeometry args={[2.24, 0.72, 0.05]} />
            </mesh>
            <mesh>
              <planeGeometry args={[2.16, 0.64]} />
              <meshStandardMaterial map={t} emissiveMap={t} emissive="#FFFFFF" emissiveIntensity={0.2} roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </Hoverable>
  );
}

function Scenes({ kit }: { kit: ValleyKit }) {
  const g = kit.ground;
  return (
    <>
      <Signpost text={"VALUE PROPOSITION\nFAMILIAR TASTE, CLEANER INGREDIENTS"} position={[-5.4, g(-5.4, -71), -71]} rotation={0.55} width={4.2} color="#FFF5EE" fg="#2F1C1A" label="Value proposition: familiar Indian taste made with cleaner ingredients" />
      <ChannelGantry z={-84} />
      <Signpost text="QUICK COMMERCE" position={[4.6, 0, -86.5]} rotation={-0.45} width={2.6} label="Channel: quick-commerce apps deliver in minutes from the dark store" />
      <Signpost text="FAMILIES" position={[-12.2, g(-12.2, -96), -96]} rotation={Math.PI / 2 - 0.35} width={2.2} label="Customer segment: health-conscious families" />
      {!kit.compact && <Signpost text={"STUDENTS &\nYOUNG PROFESSIONALS"} position={[5, 0, -102.5]} rotation={-0.5} width={2.6} label="Customer segment: students and young professionals" />}
      <Signpost text="GIFT BUYERS" position={[-15.2, g(-15.2, -121), -121]} rotation={0.7} width={2.4} label="Customer segment: festive and personal gift buyers" />
      <Signpost text="CORPORATE BUYERS" position={[6.4, 0, -125.5]} rotation={-0.45} width={2.8} label="Customer segment: corporate buyers (employee gifting, events)" />
      {!kit.compact && <Signpost text={"REVIEWS · OFFERS\nCOMMUNITY"} position={[-4.4, 0, -143]} rotation={0.35} width={2.8} color="#FFF5EE" fg="#2F1C1A" label="Customer relationships: reviews, customer care, offers, combos and a subscriber community" />}
    </>
  );
}

export default function World() {
  return <ValleyWorld chapter="3.1" scenes={(kit) => <Scenes kit={kit} />} />;
}
