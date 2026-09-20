"use client";

import { useEffect, useRef } from "react";

import { loadScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/*
  FrameStepper — what "one frame at a time" means, shown at the speed the
  arrow keys move.

  Scroll scrubs a ball trail across nine frames, but the easing is stepped, so
  it never slides: it jumps, holds, jumps, exactly like tapping the right
  arrow. It stops on the labelled contact frame in the middle, which is the
  frame the whole app is built around.

  Decorative and aria-hidden — the card's prose already says all of this.
  Reduced motion: the trail is drawn complete, parked on contact.
*/

const FRAMES = 9;
const CONTACT = 4;

/* The ball's height across those nine frames: rising, struck, driven away. */
const HEIGHTS = [78, 62, 48, 36, 30, 38, 52, 64, 72];

export default function FrameStepper() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const cells = Array.from(root.querySelectorAll(".home__frames-cell"));

    const showUpTo = (index) => {
      cells.forEach((cell, i) => {
        cell.setAttribute("data-state", i < index ? "past" : i === index ? "now" : "ahead");
      });
    };

    if (prefersReducedMotion()) {
      showUpTo(CONTACT);
      return undefined;
    }

    let trigger;
    let killed = false;

    loadScrollTrigger()
      .then(({ gsap, ScrollTrigger }) => {
        if (killed) return;

        const step = gsap.parseEase(`steps(${FRAMES})`);

        trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 82%",
          end: "bottom 50%",
          scrub: 0.2,
          onUpdate: (self) => {
            const index = Math.min(Math.round(step(self.progress) * FRAMES), FRAMES - 1);
            showUpTo(index);
          },
        });
      })
      .catch(() => showUpTo(CONTACT));

    return () => {
      killed = true;
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <div className="home__frames" ref={rootRef} aria-hidden="true">
      <div className="home__frames-row">
        {HEIGHTS.map((top, index) => (
          <span
            key={index}
            className={
              index === CONTACT
                ? "home__frames-cell home__frames-cell--contact"
                : "home__frames-cell"
            }
            data-state="ahead"
          >
            <span className="home__frames-ball" style={{ top: `${top}%` }} />
          </span>
        ))}
      </div>
      <p className="home__frames-label">
        <span className="home__frames-label-mark" />
        contact
      </p>
    </div>
  );
}
