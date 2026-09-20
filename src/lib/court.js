/**
 * The court, once, in metres — the single source of truth for every drawing of
 * it on this page.
 *
 * Real ITF dimensions: 23.77 m long, 10.97 m wide doubles / 8.23 m singles,
 * service lines 6.40 m either side of the net, 1.07 m net at the posts.
 * The origin is the centre of the net; +z is towards the near baseline (the
 * end the phone films from).
 *
 * Plain data, no three.js import: the WebGL scenes and the static SVG fallback
 * both read this array, so they cannot drift apart.
 */
export const HALF_LENGTH = 11.885;
export const HALF_WIDTH = 5.485;
export const SINGLES_HALF_WIDTH = 4.115;
export const SERVICE_LINE = 6.4;
export const NET_HEIGHT_POST = 1.07;
export const NET_HEIGHT_CENTRE = 0.914;

const L = HALF_LENGTH;
const W = HALF_WIDTH;
const S = SINGLES_HALF_WIDTH;
const V = SERVICE_LINE;

/** Every painted line on the surface, as [x1, z1, x2, z2] in metres. */
export const COURT_LINES = [
  /* baselines */
  [-W, -L, W, -L],
  [-W, L, W, L],
  /* doubles sidelines */
  [-W, -L, -W, L],
  [W, -L, W, L],
  /* singles sidelines */
  [-S, -L, -S, L],
  [S, -L, S, L],
  /* service lines */
  [-S, -V, S, -V],
  [-S, V, S, V],
  /* centre service line */
  [0, -V, 0, V],
  /* centre marks */
  [0, -L, 0, -L + 0.15],
  [0, L - 0.15, 0, L],
];

/** The net, as [x1, y1, z1, x2, y2, z2] — the only geometry off the ground. */
export const NET_LINES = [
  /* cord and tape */
  [-W - 0.91, NET_HEIGHT_POST, 0, W + 0.91, NET_HEIGHT_POST, 0],
  [-W - 0.91, 0, 0, -W - 0.91, NET_HEIGHT_POST, 0],
  [W + 0.91, 0, 0, W + 0.91, NET_HEIGHT_POST, 0],
  /* the sag to the centre strap, drawn as two straight runs */
  [-W - 0.91, NET_HEIGHT_POST, 0, 0, NET_HEIGHT_CENTRE, 0],
  [0, NET_HEIGHT_CENTRE, 0, W + 0.91, NET_HEIGHT_POST, 0],
  [0, 0, 0, 0, NET_HEIGHT_CENTRE, 0],
];

/**
 * The ball on its arc, 0 → 1: a serve-height strike from the far baseline that
 * clears the net and lands inside the near service box.
 *
 * @param {number} t progress, 0 to 1
 * @returns {{x: number, y: number, z: number}} metres
 */
export function ballAt(t) {
  const p = Math.min(Math.max(t, 0), 1);
  return {
    x: -2.4 + p * 4.2,
    y: 2.3 + Math.sin(p * Math.PI) * 1.9 - p * 1.55,
    z: -L + p * (L + V - 1.2),
  };
}

/** Where the phone belongs: behind the near baseline, at chest height. */
export const CAMERA_SPOT = { x: 0, y: 1.42, z: L + 2.6 };

/** The high overview the filming scene starts from. */
export const CAMERA_OVERVIEW = { x: 0, y: 24, z: 26 };
