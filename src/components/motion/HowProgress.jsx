"use client";

import { useEffect, useRef } from "react";

import { loadScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/*
  HowProgress — the line that runs across the four steps as you scroll them.

  It is a progress indicator, not an entrance animation: the steps are all
  there from the first paint, readable with JavaScript off and with motion
  turned down. This only draws a rule across them and marks which one you have
  reached, the way a manual's margin rule does.

  Under prefers-reduced-motion the line is simply drawn full.
*/
export default function HowProgress({ count = 4 }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const fill = root.querySelector(".home__how-progress-fill");
    const dots = Array.from(root.querySelectorAll(".home__how-progress-dot"));

    if (prefersReducedMotion()) {
      fill.style.transform = "scaleX(1)";
      dots.forEach((dot) => dot.setAttribute("data-reached", "true"));
      return undefined;
    }

    let trigger;
    let killed = false;

    loadScrollTrigger()
      .then(({ ScrollTrigger }) => {
        if (killed) return;

        trigger = ScrollTrigger.create({
          trigger: root.closest(".home__how") || root,
          start: "top 78%",
          end: "bottom 65%",
          scrub: 0.4,
          onUpdate: (self) => {
            fill.style.transform = `scaleX(${self.progress})`;
            dots.forEach((dot, index) => {
              const reached = self.progress >= index / Math.max(count - 1, 1) - 0.02;
              dot.setAttribute("data-reached", reached ? "true" : "false");
            });
          },
        });
      })
      .catch(() => {
        fill.style.transform = "scaleX(1)";
      });

    return () => {
      killed = true;
      if (trigger) trigger.kill();
    };
  }, [count]);

  return (
    <div className="home__how-progress" ref={rootRef} aria-hidden="true">
      <span className="home__how-progress-track" />
      <span className="home__how-progress-fill" />
      <span className="home__how-progress-dots">
        {Array.from({ length: count }).map((_, index) => (
          <span key={index} className="home__how-progress-dot" data-reached="false" />
        ))}
      </span>
    </div>
  );
}
