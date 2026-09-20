/**
 * Keycap — a single keyboard key, rendered as a real <kbd>.
 *
 * This is how the app's shortcuts (M, F, B, V, C, S, N and Space) get shown
 * anywhere on the page. Server component: no state, no interactivity.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.children] - the key legend, e.g. "F" or "Space".
 * @param {string} [props.label] - optional accessible name, e.g. "Space bar".
 */
export default function Keycap({ children = "Space", label = "" }) {
  return (
    <kbd className="home__keycap" aria-label={label || undefined}>
      {children}
    </kbd>
  );
}
