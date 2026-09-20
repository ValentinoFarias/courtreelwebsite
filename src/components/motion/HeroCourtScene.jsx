"use client";

import { useEffect, useRef } from "react";

import { ballAt } from "@/lib/court";
import { buildBall, buildCourt, disposeGroup, tokenColor } from "@/lib/courtScene";
import { cappedPixelRatio, observeVisibility } from "@/lib/motion";

/*
  HeroCourtScene — the WebGL half of HeroCourt. Loaded only by next/dynamic
  with ssr: false; never imported anywhere else.

  Ink hairlines, no fills, no lights, no shadows. One clay ball on a slow arc,
  about eleven seconds end to end, which is slow enough to read as drifting
  rather than as an animation demanding attention.

  The loop stops when the canvas leaves the viewport and when the tab is
  hidden. It never runs at all under prefers-reduced-motion, because HeroCourt
  does not mount this component in that case.
*/

const CYCLE_MS = 11000;
const HERO_FOV = 42;
const HERO_ASPECT = 1.25; /* the canvas ratio at which the whole court fits */

export default function HeroCourtScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    let frame = 0;
    let visible = true;
    let disposed = false;

    let cleanupVisibility = () => {};
    let three;

    import("three")
      .then((THREE) => {
        if (disposed) return;
        three = THREE;

        const scene = new THREE.Scene();
        const court = buildCourt(tokenColor("--color-ink", "#14120c"));
        const ball = buildBall(tokenColor("--color-clay", "#b04a2f"));
        scene.add(court, ball);

        /* Framed so both baselines and the net posts sit inside the view: aimed
           at the middle of the near half, with enough vertical field of view
           that the near baseline is not cropped by the canvas edge. */
        const camera = new THREE.PerspectiveCamera(HERO_FOV, 1, 0.1, 200);
        camera.position.set(1.2, 11.5, 21);
        camera.lookAt(0, 0, 4.9);

        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          return; /* HeroCourt already checked, but never assume. */
        }

        renderer.setPixelRatio(cappedPixelRatio());
        renderer.setClearAlpha(0);
        host.appendChild(renderer.domElement);

        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          /* Below HERO_ASPECT the horizontal view is too narrow and crops the
             sidelines; widen the vertical FOV to keep the same visible width. */
          camera.fov =
            camera.aspect >= HERO_ASPECT
              ? HERO_FOV
              : (2 *
                  Math.atan((Math.tan((HERO_FOV * Math.PI) / 360) * HERO_ASPECT) / camera.aspect) *
                  180) /
                Math.PI;
          camera.updateProjectionMatrix();
        };

        resize();

        /* Deferred to the next frame: resizing (and rendering) inside the
           observation cycle is what produces "ResizeObserver loop completed
           with undelivered notifications". */
        let pendingResize = 0;
        const observer = new ResizeObserver(() => {
          cancelAnimationFrame(pendingResize);
          pendingResize = requestAnimationFrame(resize);
        });
        observer.observe(host);

        const draw = (now) => {
          const t = ((now % CYCLE_MS) / CYCLE_MS);
          const point = ballAt(t);
          ball.position.set(point.x, Math.max(point.y, 0.34), point.z);
          ball.rotation.x = t * 6;
          renderer.render(scene, camera);
        };

        const tick = (now) => {
          frame = requestAnimationFrame(tick);
          if (!visible || document.hidden) return;
          draw(now);
        };

        draw(0);
        frame = requestAnimationFrame(tick);

        const onVisibility = () => {
          if (!document.hidden) draw(performance.now());
        };
        document.addEventListener("visibilitychange", onVisibility);

        const stopWatching = observeVisibility(host, (next) => {
          visible = next;
        });

        cleanupVisibility = () => {
          observer.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          stopWatching();
          disposeGroup(scene);
        };
      })
      .catch(() => {
        /* Chunk failed: the SVG fallback is still in the DOM above us. */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanupVisibility();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      three = undefined;
    };
  }, []);

  return <div className="home__court-canvas" ref={hostRef} />;
}
