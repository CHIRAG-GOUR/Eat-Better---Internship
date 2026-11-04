"use client";

import { Boxes, Factory, FlaskConical, Flame, Leaf, PackageCheck, ScanSearch, ShieldCheck, Smile, Truck } from "lucide-react";
import { AutoStepper, BeforeAfter, FlipCards, IconFlow, Marquee, PhotoFan, SplitStory, StatBand, VersusCards } from "@/components/rich";

function H({ t }: { t: string }) {
  return <h2 className="mb-4 mt-14 font-display text-[1.6rem] font-semibold text-cocoa first:mt-0">{t}</h2>;
}

/** Showcase of the rich chapter components, filled only with facts already used in the chapters. */
export default function ComponentsPreview() {
  return (
    <main className="mx-auto max-w-6xl bg-cream px-4 py-10 sm:px-8">
      <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-orange">Preview</div>
      <h1 className="mb-10 font-display text-[2.4rem] font-semibold text-cocoa">Rich chapter components</h1>

      <H t="StatBand (count-up)" />
      <StatBand
        stats={[
          { value: 10, suffix: " Lac+", label: "Happy customers", icon: Smile, note: "Brand claim, eatbetterco.com" },
          { value: 6, suffix: "-layer", label: "Quality check on every batch", icon: ShieldCheck, note: "Brand claim" },
          { value: 50000, suffix: " sq. ft.", label: "Kitchen", icon: Factory, note: "Brand claim" },
          { value: 0, label: "Palm oil used", icon: Leaf, note: "Brand claim" },
        ]}
      />

      <H t="AutoStepper" />
      <AutoStepper
        steps={[
          { title: "Sourcing", text: "Selection of high-grade raw materials from trusted suppliers.", img: "/chapter-1-3/frames/warehouse.webp", icon: Truck },
          { title: "Quality Check", text: "Raw ingredients checked for size, freshness and quality.", img: "/chapter-1-2/better-ingredients.webp", icon: ScanSearch },
          { title: "Cooking", text: "Controlled cooking in small batches.", img: "/chapter-1-3/home-kitchen.webp", icon: Flame },
          { title: "Packaging", text: "Immediate sealing in protective, multi-layer food-grade packaging.", img: "/chapter-1-2/frames/shipping-box.webp", icon: PackageCheck },
        ]}
      />

      <H t="IconFlow" />
      <IconFlow
        nodes={[
          { icon: Truck, title: "Sourcing" },
          { icon: ScanSearch, title: "Quality Check" },
          { icon: Boxes, title: "Prepping" },
          { icon: Flame, title: "Cooking" },
          { icon: FlaskConical, title: "Batch Testing" },
          { icon: PackageCheck, title: "Packaging" },
        ]}
      />

      <H t="VersusCards" />
      <VersusCards
        rows={[
          { problem: "Tasty snacks are not healthy", answer: "Dates-sweetened laddoos, roasted namkeens, millet and quinoa options", proof: "Zero palm oil (brand claim)" },
          { problem: "Healthy snacks taste boring", answer: "Familiar Indian flavours such as bhujia, bhel and chatpata" },
        ]}
        answerLabel="Eat Better's answer"
      />

      <H t="PhotoFan" />
      <PhotoFan
        items={[
          { img: "/brand/products/millet-bhujia-0.webp", caption: "Millet Bhujia" },
          { img: "/brand/products/hazelnut-laddoo-0.webp", caption: "Hazelnut Chocolate Laddoos" },
          { img: "/brand/products/nut-mix-0.webp", caption: "Premium Nut Mix" },
          { img: "/brand/products/trail-mix-0.webp", caption: "Better Trail Mix" },
        ]}
      />

      <H t="BeforeAfter" />
      <BeforeAfter before="/chapter-1-3/home-kitchen.webp" after="/chapter-1-3/frames/warehouse.webp" beforeLabel="Home kitchen" afterLabel="50,000 sq. ft." alt="From a home kitchen to a large facility" />

      <H t="Marquee" />
      <Marquee
        items={[
          { img: "/brand/products/millet-bhujia-0.webp", label: "Millet Bhujia" },
          { img: "/brand/products/millet-bhel-0.webp", label: "Millet Bhel" },
          { img: "/brand/products/quinoa-namkeen-0.webp", label: "Quinoa Namkeen" },
          { img: "/brand/products/nut-mix-0.webp", label: "Premium Nut Mix" },
          { img: "/brand/products/protein-laddoo-0.webp", label: "Protein Laddoos" },
          { img: "/brand/products/seed-mix-0.webp", label: "Seed Mix" },
        ]}
      />

      <H t="FlipCards" />
      <FlipCards
        cards={[
          { front: "Brand Name", back: "How a simple, memorable name communicates a brand promise.", icon: Smile },
          { front: "Colour Psychology", back: "How colours influence perceptions of taste, freshness, quality, and health.", img: "/brand/products/seed-mix-0.webp" },
          { front: "Packaging Design", back: "How packaging attracts attention, communicates value, and influences purchase decisions.", icon: PackageCheck },
        ]}
      />

      <H t="SplitStory" />
      <SplitStory img="/chapter-1-3/exhibition-stall.webp" alt="A snack stall at an exhibition" kicker="Exhibitions & direct selling" title="Before the internet: a stall" badge="2020">
        Meeting customers face to face gave honest, immediate feedback on taste, price and packaging.
      </SplitStory>
      <div className="h-24" />
    </main>
  );
}
