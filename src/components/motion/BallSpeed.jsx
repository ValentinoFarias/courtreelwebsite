"use client";

import { useEffect, useRef, useState } from "react";

import { loadScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/*
  BallSpeed — the two-part job the card describes: calibrate the court by
  clicking its four corners, then read a speed off a few marked frames.

  The four corners light one at a time as you scroll, and only once all four
  are lit does the readout count. That order is the point: there is no number
  before the calibration.

  The figure is an example, labelled as one — the app measures, it does not
  promise a number. Decorative and aria-hidden.
*/

const EXAMPLE_SPEED = 98;

export default function BallSpeed() {
  const rootRef = useRef(null);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const corners = Array.from(root.querySelectorAll(".home__speed-corner"));

    if (prefersReducedMotion()) {
      corners.forEach((corner) => corner.setAttribute("data-lit", "true"));
      setSpeed(EXAMPLE_SPEED);
      return undefined;
    }

    let trigger;
    let killed = false;

    loadScrollTrigger()
      .then(({ ScrollTrigger }) => {
        if (killed) return;

        trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 84%",
          end: "bottom 48%",
          scrub: 0.3,
          onUpdate: (self) => {
            const lit = Math.min(Math.floor(self.progress / 0.16), 4);
            corners.forEach((corner, index) => {
              corner.setAttribute("data-lit", index < lit ? "true" : "false");
            });

            const countFrom = 0.68;
            const ratio =
              self.progress <= countFrom
                ? 0
                : Math.min((self.progress - countFrom) / (1 - countFrom), 1);
            setSpeed(Math.round(ratio * EXAMPLE_SPEED));
          },
        });
      })
      .catch(() => {
        corners.forEach((corner) => corner.setAttribute("data-lit", "true"));
        setSpeed(EXAMPLE_SPEED);
      });

    return () => {
      killed = true;
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <div className="home__speed" ref={rootRef} aria-hidden="true">
      <div className="home__speed-plan">
        <span className="home__speed-corner" data-lit="false" data-corner="tl" />
        <span className="home__speed-corner" data-lit="false" data-corner="tr" />
        <span className="home__speed-corner" data-lit="false" data-corner="br" />
        <span className="home__speed-corner" data-lit="false" data-corner="bl" />
        <span className="home__speed-net" />
      </div>

      <p className="home__speed-readout">
        <span className="home__numeric home__speed-value">{speed}</span>
        <span className="home__speed-unit">km/h</span>
      </p>
      <p className="home__speed-note">an example reading</p>
    </div>
  );
}
