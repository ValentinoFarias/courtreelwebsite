"use client";

import { useEffect, useRef } from "react";

import { loadScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/*
  ShotReveal — the quiet way into the black wells.

  One clip-path wipe per screenshot as it comes up, played once, not scrubbed:
  a scrubbed reveal would mean a half-drawn screenshot whenever the visitor
  stops mid-scroll, and a screenshot you cannot see is a screenshot that is
  not doing its job.

  The image is fully in the DOM and fully accessible before, during and after
  the wipe — this only clips it. Reduced motion, or no gsap: nothing is
  clipped at all.
*/
export default function ShotReveal({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    let trigger;
    let killed = false;

    loadScrollTrigger()
      .then(({ gsap, ScrollTrigger }) => {
        if (killed) return;

        const tween = gsap.fromTo(
          root,
          { clipPath: "inset(0% 0% 14% 0%)", opacity: 0.55 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            paused: true,
          },
        );

        trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 88%",
          once: true,
          onEnter: () => tween.play(),
        });
      })
      .catch(() => {});

    return () => {
      killed = true;
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <div className="home__shot-reveal" ref={rootRef}>
      {children}
    </div>
  );
}
