"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import CourtFallback from "@/components/motion/CourtFallback";
import { hasWebGL, prefersReducedMotion } from "@/lib/motion";

/*
  HeroCourt — the hero drawing: a tennis court in ink hairlines with one ball
  on a slow arc.

  Client component, and one of the four on the page that exist only to carry
  motion. It renders the static SVG immediately and swaps in the WebGL scene
  after mount — three.js is loaded by next/dynamic with ssr: false, so it is
  never in the server HTML and never blocks first paint.

  The static SVG is not a placeholder to be embarrassed about: it is the whole
  picture. If WebGL is missing, or the visitor has asked for reduced motion,
  the page simply keeps it.
*/

const HeroCourtScene = dynamic(() => import("@/components/motion/HeroCourtScene"), {
  ssr: false,
  loading: () => <CourtFallback ball={0.5} />,
});

export default function HeroCourt() {
  const [enhance, setEnhance] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || !hasWebGL()) return;
    setEnhance(true);
  }, []);

  return (
    <div className="home__court" aria-hidden="true">
      {enhance ? <HeroCourtScene /> : <CourtFallback ball={0.5} />}
    </div>
  );
}
