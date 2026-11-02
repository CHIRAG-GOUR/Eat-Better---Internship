"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { forwardRef } from "react";

export type KidMood = "content" | "happy" | "done";

/**
 * Original Eat Better Co progress companion: a child sitting cross-legged on a brass thali,
 * eating a dry-fruit laddoo. Pure inline SVG — no network asset to fail.
 *
 * The parent drives all motion through MotionValues (no React re-renders per frame):
 *  - handX/handY: position of the laddoo hand (eating gesture)
 *  - mouth: 0 closed → 1 open
 *  - chew:  0 → 1 cheek puff
 *  - progress: 0 → 1, removes bites from the laddoo
 */
type Props = {
  mood: KidMood;
  progress: MotionValue<number>;
  handX: MotionValue<number>;
  handY: MotionValue<number>;
  mouth: MotionValue<number>;
  chew: MotionValue<number>;
  idPrefix: string;
};

const SKIN = "#F2C29A";
const SKIN_SHADE = "#E2A57A";
const HAIR = "#2F1C1A";
const TEE = "#FF5C00";
const PANTS = "#4A3230";

export const LaddooKid = forwardRef<SVGSVGElement, Props>(function LaddooKid(
  { mood, progress, handX, handY, mouth, chew, idPrefix },
  ref,
) {
  const id = (s: string) => `${idPrefix}-${s}`;
  // laddoo bites appear at 25 / 50 / 75 %, and the laddoo is finished at the end
  const bite1 = useTransform(progress, [0.24, 0.26], [0, 1]);
  const bite2 = useTransform(progress, [0.49, 0.51], [0, 1]);
  const bite3 = useTransform(progress, [0.74, 0.76], [0, 1]);
  const laddooLeft = useTransform(progress, [0.97, 0.995], [1, 0]);
  const crumbs = useTransform(progress, [0.97, 0.995], [0, 1]);
  // upper arm follows the hand
  const armPath = useTransform([handX, handY], ([x, y]: number[]) => `M40 38.5 Q${(40 + x) / 2 + 4.5} ${(38.5 + y) / 2 + 4} ${x} ${y}`);
  const mouthOpenScale = useTransform(mouth, [0, 1], [0.15, 1]);
  const mouthClosedOpacity = useTransform(mouth, [0, 0.35], [1, 0]);
  const cheekScale = useTransform(chew, [0, 1], [1, 1.25]);

  const eyesOpen = mood === "content";

  return (
    <svg ref={ref} viewBox="0 0 60 64" className="block size-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={id("laddoo")} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#A36B45" />
          <stop offset="55%" stopColor="#5A3322" />
          <stop offset="100%" stopColor="#2E170E" />
        </radialGradient>
        <linearGradient id={id("brass")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F0C870" />
          <stop offset="100%" stopColor="#B9852F" />
        </linearGradient>
        <mask id={id("bites")} maskUnits="userSpaceOnUse" x="-10" y="-10" width="20" height="20">
          <rect x="-10" y="-10" width="20" height="20" fill="white" />
          <motion.circle cx="4.6" cy="-3.4" r="2.6" fill="black" style={{ opacity: bite1 }} />
          <motion.circle cx="5.4" cy="1.4" r="2.4" fill="black" style={{ opacity: bite2 }} />
          <motion.circle cx="2.2" cy="5" r="2.6" fill="black" style={{ opacity: bite3 }} />
        </mask>
      </defs>

      {/* thali (brass plate) the child rides on */}
      <ellipse cx="30" cy="59" rx="23" ry="4.6" fill={`url(#${id("brass")})`} />
      <ellipse cx="30" cy="57.9" rx="19" ry="2.8" fill="#F6D78F" opacity="0.75" />
      <ellipse cx="30" cy="59" rx="23" ry="4.6" fill="none" stroke="#8A5E1C" strokeWidth="0.8" />

      {/* crossed legs */}
      <ellipse cx="22" cy="52.5" rx="9.5" ry="4.4" fill={PANTS} />
      <ellipse cx="38" cy="52.5" rx="9.5" ry="4.4" fill={PANTS} />
      <ellipse cx="13.6" cy="53.6" rx="2.8" ry="2" fill={SKIN} />
      <ellipse cx="46.4" cy="53.6" rx="2.8" ry="2" fill={SKIN} />

      {/* body — brand-orange tee */}
      <path d="M20.5 50 C19.5 42 21 37 25 35.6 L35 35.6 C39 37 40.5 42 39.5 50 Z" fill={TEE} />
      <path d="M26.6 35.6 Q30 39 33.4 35.6" fill="none" stroke="#FFF5EE" strokeWidth="1.2" strokeLinecap="round" />
      {/* resting arm on the knee */}
      <path d="M21.5 38.5 Q17.2 43 18.8 48.2" fill="none" stroke={TEE} strokeWidth="4.4" strokeLinecap="round" />
      <circle cx="19" cy="48.8" r="2.2" fill={SKIN} />

      {/* neck + head */}
      <rect x="27.4" y="31.5" width="5.2" height="5" rx="2" fill={SKIN_SHADE} />
      <circle cx="17.6" cy="24.5" r="2.6" fill={SKIN} />
      <circle cx="42.4" cy="24.5" r="2.6" fill={SKIN} />
      <circle cx="30" cy="23" r="12.6" fill={SKIN} />
      {/* hair with a little top-knot */}
      <circle cx="30" cy="8.4" r="3.8" fill={HAIR} />
      <path d="M17.6 22.5 C17 12.5 23.5 9.4 30 9.4 C36.5 9.4 43 12.5 42.4 22.5 C40 18.5 36.6 16.6 33 16.4 C31 18.6 26.5 19 22.6 17.6 C20.5 18.6 18.8 20.4 17.6 22.5 Z" fill={HAIR} />

      {/* eyes */}
      {eyesOpen ? (
        <g className="kid-blink" style={{ transformOrigin: "30px 24px" }}>
          <ellipse cx="25.2" cy="24.2" rx="1.75" ry="2.25" fill={HAIR} />
          <ellipse cx="34.8" cy="24.2" rx="1.75" ry="2.25" fill={HAIR} />
          <circle cx="25.8" cy="23.4" r="0.6" fill="#fff" />
          <circle cx="35.4" cy="23.4" r="0.6" fill="#fff" />
        </g>
      ) : (
        <g fill="none" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round">
          <path d="M23.3 24.8 Q25.2 22.4 27.1 24.8" />
          <path d="M32.9 24.8 Q34.8 22.4 36.7 24.8" />
        </g>
      )}

      {/* cheeks puff while chewing */}
      <motion.circle cx="21.6" cy="28.6" r="2.4" fill="#FF8A65" opacity={mood === "content" ? 0.45 : 0.7} style={{ scale: cheekScale, transformOrigin: "21.6px 28.6px" }} />
      <motion.circle cx="38.4" cy="28.6" r="2.4" fill="#FF8A65" opacity={mood === "content" ? 0.45 : 0.7} style={{ scale: cheekScale, transformOrigin: "38.4px 28.6px" }} />

      {/* mouth: smile ↔ open */}
      <motion.path d={mood === "done" ? "M26.4 29.6 Q30 33.4 33.6 29.6" : "M27.4 30 Q30 32.4 32.6 30"} fill="none" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" style={{ opacity: mouthClosedOpacity }} />
      <motion.g style={{ scaleY: mouthOpenScale, transformOrigin: "30px 30.6px", opacity: useTransform(mouth, [0, 0.2], [0, 1]) }}>
        <ellipse cx="30" cy="30.6" rx="2.3" ry="2" fill="#5A1A14" />
        <ellipse cx="30" cy="31.6" rx="1.4" ry="0.8" fill="#FF7A6B" />
      </motion.g>

      {/* laddoo arm (drawn last so the laddoo passes in front of the face) */}
      <motion.path d={armPath} fill="none" stroke={TEE} strokeWidth="4.4" strokeLinecap="round" />
      <motion.g style={{ x: handX, y: handY }}>
        <motion.g style={{ opacity: laddooLeft }}>
          <g mask={`url(#${id("bites")})`}>
            <circle r="5.4" fill={`url(#${id("laddoo")})`} />
            <circle cx="-1.8" cy="-1.6" r="0.55" fill="#E3C49A" />
            <circle cx="1.2" cy="-2.6" r="0.45" fill="#C9965F" />
            <circle cx="-2.4" cy="1.6" r="0.5" fill="#E3C49A" />
            <circle cx="0.8" cy="1.2" r="0.6" fill="#1D0F09" />
            <circle cx="2.6" cy="-0.4" r="0.4" fill="#E3C49A" />
            <circle cx="-0.4" cy="3.2" r="0.45" fill="#C9965F" />
          </g>
        </motion.g>
        <motion.g style={{ opacity: crumbs }} fill="#7A4A2C">
          <circle cx="-1.2" cy="1.2" r="0.8" />
          <circle cx="1" cy="0.2" r="0.6" />
          <circle cx="0.2" cy="2.2" r="0.5" />
        </motion.g>
        <circle cx="0" cy="3.4" r="2.3" fill={SKIN} />
      </motion.g>

      {/* end-of-chapter sparkle */}
      {mood === "done" && (
        <g fill="#FED300">
          {[
            [10, 9, 0],
            [50, 7, 0.15],
            [52, 20, 0.3],
          ].map(([x, y, d]) => (
            <motion.path
              key={`${x}-${y}`}
              d={`M${x} ${y - 3} L${x + 0.9} ${y - 0.9} L${x + 3} ${y} L${x + 0.9} ${y + 0.9} L${x} ${y + 3} L${x - 0.9} ${y + 0.9} L${x - 3} ${y} L${x - 0.9} ${y - 0.9} Z`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.85] }}
              transition={{ duration: 0.6, delay: d }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          ))}
        </g>
      )}
    </svg>
  );
});
