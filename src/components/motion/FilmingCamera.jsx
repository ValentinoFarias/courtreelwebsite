"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import CourtFallback from "@/components/motion/CourtFallback";
import { hasWebGL, prefersReducedMotion } from "@/lib/motion";

/*
  FilmingCamera — the pinned scene above the filming advice.

  As the section is pinned, the camera travels from a high overview of the
  whole court down to the one place the guide is asking for: behind the near
  baseline, at chest height. The instruction and the picture are the same
  sentence.

  Reduced motion, or no WebGL, and the block renders the static court with the
  spot marked and a plain caption. The advice is in the <dl> underneath either
  way — nothing here carries information that is not also written down.
*/

const FilmingCameraScene = dynamic(
  () => import("@/components/motion/FilmingCameraScene"),
  { ssr: false, loading: () => <CourtFallback ball={0.55} /> },
);

export default function FilmingCamera() {
  const [enhance, setEnhance] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || !hasWebGL()) return;
    setEnhance(true);
  }, []);

  return (
    <figure className="home__guide-scene">
      <div className="home__court home__court--guide" aria-hidden="true">
        {enhance ? <FilmingCameraScene /> : <CourtFallback ball={0.55} />}
      </div>
      <figcaption className="home__guide-scene-caption">
        Where the phone goes: behind the near player, at chest height, whole
        player in frame.
      </figcaption>
    </figure>
  );
}
