"use client";

import { RoundedBox } from "@react-three/drei";
import TableWorld from "@/components/world/TableWorld";
import { Hoverable } from "@/components/world/hover";
import { BhujiaPile, Diya, GiftBox, Laddoos, MailerBox, Marigold, Mint, NutPile, Scatter } from "@/components/world/props";

/**
 * Chapter 1.1 scenes on the shared table: family kitchen → ingredients → delivery boxes →
 * the four categories → festive gifting → a final katori of laddoos.
 */
export default function World() {
  return (
    <TableWorld
      scenes={({ katori, bowl, small, mats, compact, reduced }) => (
        <>
      {/* 1 · the family kitchen (opening + company at a glance) */}
      <group position={[0, 0, 0]}>
        <RoundedBox args={[2.2, 0.06, 1.3]} radius={0.03} position={[3.1, 0.03, -0.4]} rotation={[0, 0.15, 0]} material={mats.board} castShadow receiveShadow />
        <Hoverable label="Dry-fruit laddoos">
        <group position={[3.2, 0.06, -0.5]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={12} spread={0.34} height={0.36} />
        </group>
        </Hoverable>
        <Scatter kind="date" count={6} area={[2.2, 4.2, 0.1, 0.8]} seed={2} />
        <Hoverable label="Roasted millet bhujia">
        <group position={[-3.4, 0, -2]}>
          <mesh geometry={bowl} material={mats.ceramic} castShadow receiveShadow />
          <BhujiaPile count={compact ? 260 : 420} spread={0.54} height={0.27} />
        </group>
        </Hoverable>
        <Hoverable label="Mint leaves">
        <Mint position={[4.3, 0.02, 0.6]} rotation={0.6} />
        </Hoverable>
        <Hoverable label="Mint leaves">
        <Mint position={[4.5, 0.02, 0.4]} rotation={2.1} />
        </Hoverable>
      </group>

      {/* 2 · ingredients — what goes in (what is Eat Better / story) */}
      <group>
        <Scatter kind="almond" count={compact ? 18 : 34} area={[-5, -2, -16, -10]} seed={3} />
        <Scatter kind="hazelnut" count={compact ? 14 : 26} area={[2.2, 5, -17, -11]} seed={4} />
        <Scatter kind="seed" count={compact ? 60 : 140} area={[-1.6, 1.6, -18, -9]} seed={5} />
        <Hoverable label="Nut & seed mix">
        <group position={[3.8, 0, -14]}>
          <mesh geometry={small} material={mats.ceramic} castShadow receiveShadow />
          <NutPile count={70} spread={0.4} height={0.2} />
        </group>
        </Hoverable>
        <Hoverable label="Dry-fruit laddoos">
        <group position={[-3.6, 0, -19.5]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={10} spread={0.32} height={0.36} seed={6} />
        </group>
        </Hoverable>
      </group>

      {/* 3 · direct to the customer — stacked delivery boxes (D2C) */}
      <group>
        <Hoverable label="Delivery boxes — shipped direct to customers">
        <group position={[-3.8, 0, -27]} rotation={[0, 0.3, 0]}>
          <MailerBox />
          <group position={[0.05, 0.42, 0]} rotation={[0, -0.2, 0]}>
            <MailerBox size={[0.8, 0.36, 0.6]} color="#E8540A" />
          </group>
          <group position={[0, 0.78, 0.02]} rotation={[0, 0.25, 0]}>
            <MailerBox size={[0.6, 0.3, 0.5]} color="#FF7A2A" />
          </group>
        </group>
        </Hoverable>
        <Hoverable label="Delivery boxes — shipped direct to customers">
        <group position={[3.9, 0, -29.5]} rotation={[0, -0.5, 0]}>
          <MailerBox size={[1, 0.46, 0.7]} color="#E9D3B4" />
          <group position={[0.9, 0, 0.4]} rotation={[0, 0.6, 0]}>
            <MailerBox size={[0.7, 0.34, 0.5]} />
          </group>
        </group>
        </Hoverable>
      </group>

      {/* 4 · the four categories, side by side */}
      <group position={[0, 0, -38]}>
        <Hoverable label="Dry-fruit laddoos">
        <group position={[-4.4, 0.06, 0]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={11} spread={0.33} height={0.36} seed={8} />
        </group>
        </Hoverable>
        <Hoverable label="Roasted millet bhujia">
        <group position={[-2.6, 0, -1.2]}>
          <mesh geometry={bowl} material={mats.ceramic} castShadow receiveShadow />
          <BhujiaPile count={compact ? 220 : 360} spread={0.52} height={0.27} />
        </group>
        </Hoverable>
        <Hoverable label="Nut & seed mix">
        <group position={[2.8, 0, -0.9]}>
          <mesh geometry={small} material={mats.ceramic} castShadow receiveShadow />
          <NutPile count={70} spread={0.38} height={0.2} />
        </group>
        </Hoverable>
        <Hoverable label="Gift box — combos & gifting">
        <group position={[4.5, 0, 0.2]} rotation={[0, -0.4, 0]}>
          <GiftBox />
        </group>
        </Hoverable>
      </group>

      {/* 5 · festive gifting (takeaway + think & discuss) */}
      <group position={[0, 0, -48]}>
        <Hoverable label="Festive gift boxes">
        <group position={[-4.2, 0, 0]} rotation={[0, 0.4, 0]}>
          <GiftBox s={1.2} />
          <group position={[0.85, 0, 0.4]}>
            <GiftBox color="#550D10" lid="#6E1316" s={0.85} />
          </group>
        </group>
        </Hoverable>
        <Hoverable label="Diyas for the festive season">
        <group position={[4, 0, -1]}>
          <Diya flicker={!reduced} />
          <group position={[0.6, 0, 0.4]}>
            <Diya flicker={!reduced} />
          </group>
        </group>
        </Hoverable>
        <Hoverable label="Marigold flowers">
        <group position={[3.2, 0, 0.8]}>
          <Marigold />
        </group>
        </Hoverable>
        <Hoverable label="Marigold flowers">
        <group position={[-2.8, 0, 1]}>
          <Marigold s={0.8} />
        </group>
        </Hoverable>
        <Hoverable label="Marigold flowers">
        <group position={[4.8, 0, 1.2]}>
          <Marigold s={0.9} />
        </group>
        </Hoverable>
      </group>

      {/* 6 · the end — one katori, laddoos to share */}
      <Hoverable label="Dry-fruit laddoos">
      <group position={[0.9, 0.06, -58.6]}>
        <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
        <Laddoos count={13} spread={0.36} height={0.36} seed={12} />
      </group>
      </Hoverable>
      <Scatter kind="date" count={5} area={[-0.6, 1.8, -57.8, -56.8]} seed={13} />

      {/* ingredients scattered along the whole table so every gap between sections has life */}
      <Scatter kind="almond" count={compact ? 40 : 80} area={[2.2, 5.5, -60, 4]} seed={21} />
      <Scatter kind="almond" count={compact ? 40 : 80} area={[-5.5, -2.2, -60, 4]} seed={22} />
      <Scatter kind="hazelnut" count={compact ? 30 : 60} area={[-5.5, -2.4, -60, 2]} seed={23} />
      <Scatter kind="date" count={compact ? 20 : 40} area={[2.4, 5.5, -60, 2]} seed={24} />
      <Scatter kind="seed" count={compact ? 160 : 360} area={[-4.5, 4.5, -60, 4]} seed={25} />
      {[-8, -23, -33, -43, -53].map((zz, i) => (
        <Hoverable key={zz} label="Dry-fruit laddoos">
        <group position={[i % 2 ? 3.6 : -3.7, 0.06, zz]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={7} spread={0.28} height={0.36} seed={30 + i} />
        </group>
        </Hoverable>
      ))}
        </>
      )}
    />
  );
}
