"use client";

import { Panel } from "@/components/chapter/Panel";
import { motion } from "motion/react";
import { VIDEO } from "../content";
import { SectionIntro } from "@/components/chapter/SectionIntro";
import { getMediaUrl } from "@/lib/media";

/**
 * Self-hosted copy of the official story video (https://youtu.be/AZrRAUVxlgg).
 * Original YouTube streams, remuxed without re-encoding (no quality loss):
 * AV1 1080p (19.4 MB) first, H.264 1080p (27.2 MB) fallback for devices without AV1.
 */
export function StoryVideo() {
  return (
    <section id="story" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="dark" reveal="up" width="max-w-6xl">
        <SectionIntro index="▸" kicker="Watch · In the company's own words" title="How Eat Better Co started" tone="dark">
          As you watch, notice two things: <strong className="text-cream">where the brand began</strong>, and{" "}
          <strong className="text-cream">what it says it stands for</strong>. You&apos;ll use both later in this chapter.
        </SectionIntro>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className="mt-8 overflow-hidden rounded-2xl border border-cream/20 bg-black shadow-[4px_4px_0_0_#ff5c00]"
        >
          <video
            className="block aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
            poster="/brand/video-poster.jpg"
            title={VIDEO.title}
            controlsList="nodownload"
          >
            <source src={getMediaUrl("/chapter-1-1/video/story-av1.mp4")} type='video/mp4; codecs="av01.0.08M.08, mp4a.40.2"' />
            <source src={getMediaUrl("/chapter-1-1/video/story-h264.mp4")} type='video/mp4; codecs="avc1.640028, mp4a.40.2"' />
            Your browser can&apos;t play this video.{" "}
            <a href={`https://youtu.be/${VIDEO.id}`} className="underline">
              Watch it on YouTube
            </a>
            .
          </video>
        </motion.div>
        <p className="mt-4 text-[0.95rem] text-cream/70">
          {VIDEO.title} — {VIDEO.channel}
        </p>
      </Panel>
    </section>
  );
}
