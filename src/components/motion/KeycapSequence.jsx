"use client";

import { useEffect, useRef } from "react";

import { loadScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/*
  KeycapSequence — step 3, shown rather than described.

  Six real shortcuts press in order and each drops a tick onto a timeline
  strip, coloured with the same stroke colour the features section uses. M is
  a point marker, so its tick is the neutral one.

  Nothing here is invented: these are the keys the app actually has, in the
  order the features list names them. The strip is decorative — every key is
  also written out in the Features section as text — so the whole block is
  aria-hidden and the step's prose is untouched above it.

  Reduced motion: every key is drawn pressed and every tick present, at once.
*/

const KEYS = [
  { key: "M", stroke: "ni", at: 0.06 },
  { key: "F", stroke: "forehand", at: 0.22 },
  { key: "B", stroke: "backhand", at: 0.38 },
  { key: "V", stroke: "volley-fh", at: 0.54 },
  { key: "C", stroke: "volley-bh", at: 0.7 },
  { key: "S", stroke: "serve", at: 0.86 },
];

export default function KeycapSequence() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const caps = Array.from(root.querySelectorAll(".home__tape-key"));
    const ticks = Array.from(root.querySelectorAll(".home__tape-tick"));

    const setAll = (value) => {
      caps.forEach((cap) => cap.setAttribute("data-pressed", value));
      ticks.forEach((tick) => tick.setAttribute("data-dropped", value));
    };

    if (prefersReducedMotion()) {
      setAll("true");
      return undefined;
    }

    let trigger;
    let killed = false;

    loadScrollTrigger()
      .then(({ ScrollTrigger }) => {
        if (killed) return;

        trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          end: "bottom 45%",
          scrub: 0.35,
          onUpdate: (self) => {
            KEYS.forEach((entry, index) => {
              const hit = self.progress >= entry.at;
              caps[index].setAttribute("data-pressed", hit ? "true" : "false");
              ticks[index].setAttribute("data-dropped", hit ? "true" : "false");
            });
          },
        });
      })
      .catch(() => setAll("true"));

    return () => {
      killed = true;
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <div className="home__tape" ref={rootRef} aria-hidden="true">
      <div className="home__tape-keys">
        {KEYS.map((entry) => (
          <span key={entry.key} className="home__tape-key" data-pressed="false">
            {entry.key}
          </span>
        ))}
      </div>

      <div className="home__tape-strip">
        {KEYS.map((entry) => (
          <span
            key={entry.key}
            className={`home__tape-tick home__tape-tick--${entry.stroke}`}
            data-dropped="false"
            style={{ left: `${entry.at * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
