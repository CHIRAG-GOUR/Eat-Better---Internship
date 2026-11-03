"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { Play } from "lucide-react";
import { getMediaUrl } from "@/lib/media";

type Props = {
  title: string;
  caption?: string;
  /** vertical (9:16) clips such as social posts */
  portrait?: boolean;
} & (
  | { kind: "file"; av1?: string; h264: string; poster?: string }
  | { kind: "youtube"; id: string; poster?: string }
);

/**
 * One video player for every chapter.
 * - kind "file": self-hosted copies (AV1 first, H.264 fallback), metadata-only preload.
 * - kind "youtube": privacy-enhanced embed that loads only when the student presses play
 *   (used for third-party broadcast content we must not re-host).
 */
export function VideoBlock(props: Props) {
  const [play, setPlay] = useState(false);
  const frame = props.portrait ? "mx-auto aspect-[9/16] max-h-[78vh] w-auto max-w-full" : "aspect-video w-full";
  return (
    <figure>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ type: "spring", stiffness: 110, damping: 20 }}
        className={`relative overflow-hidden rounded-2xl border border-cocoa bg-black shadow-[4px_4px_0_0_#ff5c00] ${frame}`}
      >
        {props.kind === "file" ? (
          <video className="block size-full bg-black object-contain" controls playsInline preload="metadata" poster={props.poster} title={props.title} controlsList="nodownload">
            {props.av1 && <source src={getMediaUrl(props.av1)} type='video/mp4; codecs="av01.0.08M.08, mp4a.40.2"' />}
            <source src={getMediaUrl(props.h264)} type="video/mp4" />
          </video>
        ) : play ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0&modestbranding=1`}
            title={props.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlay(true)} className="group absolute inset-0 size-full" aria-label={`Play video: ${props.title}`}>
            <Image src={props.poster ?? `https://i.ytimg.com/vi/${props.id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" unoptimized={!props.poster} />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-orange text-white shadow-[0_10px_40px_rgba(255,92,0,0.6)] transition-transform group-hover:scale-110">
              <Play className="ml-1 size-9 fill-white" />
            </span>
          </button>
        )}
      </motion.div>
      {props.caption && <figcaption className="mt-3 text-[0.95rem] leading-snug opacity-80">{props.caption}</figcaption>}
    </figure>
  );
}
