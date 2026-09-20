import * as THREE from "three";

import { COURT_LINES, NET_LINES } from "@/lib/court";

/*
  The court as three.js geometry. Imported only from components that next/dynamic
  loads with ssr: false, so three.js never reaches the server bundle or the
  first-paint chunk.

  Everything here is LineSegments. There is not a single filled face in the
  scene: no surface, no shading, no lights. The drawing is hairlines on paper,
  exactly as the SVG fallback draws it.
*/

/**
 * @param {number} color ink, as a hex number read from the CSS token.
 * @returns {THREE.Group} the surface lines and the net.
 */
export function buildCourt(color) {
  const group = new THREE.Group();

  const points = [];
  COURT_LINES.forEach(([x1, z1, x2, z2]) => {
    points.push(x1, 0, z1, x2, 0, z2);
  });
  NET_LINES.forEach(([x1, y1, z1, x2, y2, z2]) => {
    points.push(x1, y1, z1, x2, y2, z2);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.72,
  });

  group.add(new THREE.LineSegments(geometry, material));
  return group;
}

/**
 * The ball: a wireframe sphere, so it is a drawing too — but in clay, the one
 * accent mark the hero is allowed.
 *
 * @param {number} color clay, as a hex number.
 * @returns {THREE.LineSegments}
 */
export function buildBall(color) {
  const sphere = new THREE.SphereGeometry(0.34, 10, 7);
  const ball = new THREE.LineSegments(
    new THREE.WireframeGeometry(sphere),
    new THREE.LineBasicMaterial({ color }),
  );
  sphere.dispose();
  return ball;
}

/**
 * Read a CSS custom property off <html> and hand it back as a hex number, so
 * the scene takes its colours from the tokens rather than repeating them.
 *
 * @param {string} name e.g. "--color-ink"
 * @param {string} fallback
 * @returns {number}
 */
export function tokenColor(name, fallback) {
  const raw =
    typeof window === "undefined"
      ? ""
      : getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return new THREE.Color(raw || fallback).getHex();
}

/** Free every geometry and material in a scene graph. */
export function disposeGroup(group) {
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });
}
