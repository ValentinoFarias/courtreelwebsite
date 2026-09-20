"use client";

import { useEffect, useRef } from "react";

import { CAMERA_OVERVIEW, CAMERA_SPOT } from "@/lib/court";
import { buildCourt, disposeGroup, tokenColor } from "@/lib/courtScene";
import { cappedPixelRatio, loadScrollTrigger, observeVisibility } from "@/lib/motion";

/*
  FilmingCameraScene — the scrubbed camera move.

  A ScrollTrigger pins the figure and scrubs a single number, 0 to 1. At 0 the
  camera is 24 m up, looking at the whole court; at 1 it is standing 2.6 m
  behind the near baseline at 1.42 m — chest height on most people, and the
  exact framing the guide describes.

  Scrub, not autoplay: the visitor owns the timing, and scrolling back up puts
  the camera back. No frame is drawn while the canvas is off-screen.
*/

export default function FilmingCameraScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    let trigger;
    let visible = true;
    let disposed = false;
    let teardown = () => {};

    Promise.all([import("three"), loadScrollTrigger()])
      .then(([THREE, { gsap, ScrollTrigger }]) => {
        if (disposed) return;

        const scene = new THREE.Scene();
        scene.add(buildCourt(tokenColor("--color-ink", "#14120c")));

        /* The marker for the phone itself: a small upright rectangle in clay,
           standing where the camera ends up. */
        const markerPoints = [
          -0.16, 0, 0, 0.16, 0, 0,
          0.16, 0, 0, 0.16, 0.3, 0,
          0.16, 0.3, 0, -0.16, 0.3, 0,
          -0.16, 0.3, 0, -0.16, 0, 0,
          0, -CAMERA_SPOT.y, 0, 0, 0, 0,
        ];
        const markerGeometry = new THREE.BufferGeometry();
        markerGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(markerPoints, 3),
        );
        const marker = new THREE.LineSegments(
          markerGeometry,
          new THREE.LineBasicMaterial({ color: tokenColor("--color-clay", "#b04a2f") }),
        );
        marker.position.set(CAMERA_SPOT.x, CAMERA_SPOT.y, CAMERA_SPOT.z);
        scene.add(marker);

        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);

        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          return;
        }

        renderer.setPixelRatio(cappedPixelRatio());
        renderer.setClearAlpha(0);
        host.appendChild(renderer.domElement);

        const state = { t: 0 };

        const place = () => {
          const t = gsap.parseEase("power2.inOut")(state.t);
          camera.position.set(
            CAMERA_OVERVIEW.x + (CAMERA_SPOT.x - CAMERA_OVERVIEW.x) * t,
            CAMERA_OVERVIEW.y + (CAMERA_SPOT.y - CAMERA_OVERVIEW.y) * t,
            CAMERA_OVERVIEW.z + (CAMERA_SPOT.z - CAMERA_OVERVIEW.z) * t,
          );
          /* Look at the middle of the court early, at the far baseline late —
             which is what you see standing behind a player. */
          camera.lookAt(0, 0.6 * t, -t * 6);
          /* The marker only matters once you are near it. */
          marker.visible = t > 0.45;
          renderer.render(scene, camera);
        };

        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          place();
        };

        resize();

        /* Deferred to the next frame — see HeroCourtScene: resizing inside the
           observation cycle trips the ResizeObserver loop warning. */
        let pendingResize = 0;
        const observer = new ResizeObserver(() => {
          cancelAnimationFrame(pendingResize);
          pendingResize = requestAnimationFrame(resize);
        });
        observer.observe(host);

        const section = host.closest(".home__guide") || host;

        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=90%",
          pin: host.closest(".home__guide-scene") || host,
          pinSpacing: true,
          scrub: 0.6,
          onUpdate: (self) => {
            state.t = self.progress;
            if (visible) place();
          },
        });

        const stopWatching = observeVisibility(host, (next) => {
          visible = next;
          if (next) place();
        });

        teardown = () => {
          observer.disconnect();
          stopWatching();
          disposeGroup(scene);
        };
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (trigger) trigger.kill();
      teardown();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return <div className="home__court-canvas" ref={hostRef} />;
}
