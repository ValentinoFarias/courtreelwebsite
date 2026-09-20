import { COURT_LINES, NET_LINES, ballAt } from "@/lib/court";

/**
 * CourtFallback — the court as a flat SVG, in ink hairlines, with the ball on
 * its arc frozen at the top of the bounce.
 *
 * This is not decoration: it is what renders when WebGL is unavailable, while
 * the three.js chunk is still loading, and under prefers-reduced-motion. The
 * WebGL scenes draw the same lines from the same array in src/lib/court.js, so
 * the fallback is the same picture, not an approximation of it.
 *
 * Server component — no state, no script. Decorative, so aria-hidden.
 *
 * @param {object} props
 * @param {number} [props.ball] where on its arc the ball sits, 0 to 1.
 */

/* Oblique projection: metres to viewBox units. No perspective, so the lines
   stay even-weight at every depth — the point of a hairline drawing. */
const SCALE = 13;
const DEPTH = 0.46;
const LIFT = 0.62;

function project(x, y, z) {
  return [x * SCALE, z * SCALE * DEPTH - y * SCALE * LIFT];
}

export default function CourtFallback({ ball = 0.5 }) {
  const surface = COURT_LINES.map(([x1, z1, x2, z2]) => [
    ...project(x1, 0, z1),
    ...project(x2, 0, z2),
  ]);

  const net = NET_LINES.map(([x1, y1, z1, x2, y2, z2]) => [
    ...project(x1, y1, z1),
    ...project(x2, y2, z2),
  ]);

  const point = ballAt(ball);
  const [bx, by] = project(point.x, point.y, point.z);

  return (
    <svg
      className="home__court-svg"
      viewBox="-90 -100 180 190"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      >
        {surface.map((line, index) => (
          <line key={`s${index}`} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} />
        ))}
        {net.map((line, index) => (
          <line key={`n${index}`} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} />
        ))}
      </g>

      {/* The one clay mark in the whole drawing. */}
      <circle className="home__court-ball" cx={bx} cy={by} r="2.6" />
    </svg>
  );
}
