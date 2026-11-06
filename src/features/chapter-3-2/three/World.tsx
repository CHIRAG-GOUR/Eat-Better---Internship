"use client";

import ValleyWorld, { Signpost, type ValleyKit } from "@/components/world3/ValleyWorld";

/**
 * Chapter 3.2 district of Value Chain Valley (early golden morning). The camera follows the value chain:
 * supplier fields (Key Partners) → collection centre → the logistics road and river bridge → the kitchen &
 * production facility (Key Resource: glass kitchen, small-batch kettles, quality lab, packing line) →
 * warehouse & dispatch → the canvas terrace with Key Partners, Key Activities and Key Resources lit.
 */

function Scenes({ kit }: { kit: ValleyKit }) {
  return (
    <>
      <Signpost text={"KEY PARTNERS\nINGREDIENT SUPPLIERS"} position={[-4.8, 0, 12]} rotation={0.35} width={3.2} label="Key partners: farmers and ingredient suppliers" />
      <Signpost text={"KEY ACTIVITY\nSOURCING & GRADING"} position={[-5.2, 0, -21]} rotation={0.5} width={2.8} color="#FFF5EE" fg="#2F1C1A" label="Key activity: sourcing ingredients and checking them" />
      <Signpost text={"KEY PARTNERS\nLOGISTICS"} position={[4.8, 0, -22]} rotation={-0.4} width={2.6} label="Key partners: logistics and delivery partners" />
      <Signpost text={"KEY RESOURCE\nKITCHEN & FACILITY"} position={[6.2, 0, -43.6]} rotation={-0.35} width={3.2} label="Key resource: the kitchen and production facility (brand figure: 50,000 sq. ft.)" />
      {!kit.compact && <Signpost text={"KEY ACTIVITIES\nCOOK · TEST · PACK · SHIP"} position={[5.6, 0, -66.5]} rotation={-0.4} width={3.2} color="#FFF5EE" fg="#2F1C1A" label="Key activities: small-batch cooking, testing every batch, packing and fulfilment" />}
      <Signpost text={"KEY PARTNERS\nMARKETPLACES · Q-COMMERCE"} position={[4.8, 0, -86]} rotation={-0.3} width={3.4} label="Key partners: marketplaces and quick-commerce platforms" />
      <Signpost text={"INVESTORS &\nCORPORATE CLIENTS"} position={[-17.2, 0, -55.5]} rotation={Math.PI / 2 - 0.25} width={3.2} label="Key partners: investors and corporate clients for gifting and bulk orders" />
    </>
  );
}

export default function World() {
  return <ValleyWorld chapter="3.2" scenes={(kit) => <Scenes kit={kit} />} />;
}
