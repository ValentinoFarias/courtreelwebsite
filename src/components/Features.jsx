import Keycap from "@/components/Keycap";
import BallSpeed from "@/components/motion/BallSpeed";
import FrameStepper from "@/components/motion/FrameStepper";

/**
 * Features — the six feature cards.
 *
 * Server component. The cards are written out rather than generated from a data
 * array because three of them carry real keycaps and one carries the colour-coded
 * stroke list; a data array would only hide that.
 *
 * Keycaps appear only where the app genuinely has a shortcut. Nothing here is
 * invented: the cards without a keycap simply do not have one.
 *
 * The five stroke colours are used in exactly one place on the site — the stroke
 * list below — and never as decoration. The stroke name is always spelled out, so
 * colour is never the only thing carrying the meaning.
 *
 * Two cards carry a small client-side diagram: <FrameStepper> in the player
 * card and <BallSpeed> in the ball-speed card. Both are aria-hidden and sit
 * BELOW the prose that already explains them.
 */

const strokes = [
  { key: "F", name: "Forehand", modifier: "forehand" },
  { key: "B", name: "Backhand", modifier: "backhand" },
  { key: "V", name: "Forehand volley", modifier: "volley-fh", wip: true },
  { key: "C", name: "Backhand volley", modifier: "volley-bh", wip: true },
  { key: "S", name: "Serve", modifier: "serve" },
];

/*
  Not shipped yet, marked up by hand: the words scribbled out with one clay
  marker stroke (drawn right to left, small at the start and bigger as it goes)
  and a handwritten note beside them. The scribble is decorative; the note says
  the same thing in words, so colour never carries the meaning alone.
*/
function Struck({ children }) {
  return (
    <span className="home__feature-struck">
      {children}
      <svg
        className="home__feature-scribble"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M99 11 L94 6 L90 15 L84 4 L78 16 L71 2 L64 18 L56 1 L48 18 L39 2 L31 19 L22 1 L14 18 L7 3 L2 12" />
      </svg>
    </span>
  );
}

function WipNote() {
  return <span className="home__feature-status">Work in progress</span>;
}

export default function Features() {
  return (
    <section className="home__section home__features" aria-labelledby="home-features-title">
      <div className="home__container">
        <div className="home__section-head">
          <p className="home__eyebrow">Inside the app</p>
          <h2 id="home-features-title" className="home__section-title">
            Built around the frame of contact
          </h2>
          <p className="home__lede">
            Everything CutShot does comes back to one thing: finding the exact
            instant the ball met the strings, and making it easy to look at again.
          </p>
        </div>

        <ul className="home__features-grid">
          <li className="home__feature">
            <h3 className="home__feature-title">Training calendar</h3>
            <p className="home__feature-body">
              Every session lands on the day it was filmed. Drag MP4, MOV or M4V files
              onto the calendar to import them; the files are copied into the app’s own
              library, so the originals can be moved or deleted afterwards.
            </p>
          </li>

          <li className="home__feature">
            <h3 className="home__feature-title">Frame-accurate player</h3>
            <p className="home__feature-body">
              <Keycap label="Space bar">Space</Keycap> plays and pauses. While paused,
              the arrow keys <Keycap label="Left arrow">←</Keycap>{" "}
              <Keycap label="Right arrow">→</Keycap> step one frame at a time, which is
              how you find the exact instant of contact. Slow motion and 5-second skips
              sit under the video.
            </p>
            <FrameStepper />
          </li>

          <li className="home__feature">
            <h3 className="home__feature-title">Mark points and shots with one keypress</h3>
            <p className="home__feature-body">
              <Keycap>M</Keycap> drops a point marker. At the frame of contact, one key
              marks the stroke and the clip is built around that instant.
            </p>
            <ul className="home__stroke-list">
              {strokes.map((stroke) => (
                <li
                  key={stroke.key}
                  className={`home__stroke home__stroke--${stroke.modifier}`}
                >
                  <Keycap>{stroke.key}</Keycap>
                  {stroke.wip ? (
                    <>
                      <Struck>{stroke.name}</Struck>
                      <WipNote />
                    </>
                  ) : (
                    <span>{stroke.name}</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="home__feature-body">
              <Keycap>N</Keycap> flags a shot played from an awkward position, while
              keeping its stroke type.
            </p>
          </li>

          <li className="home__feature">
            <h3 className="home__feature-title">Automatic stroke detection</h3>
            <p className="home__feature-body">
              “Analyze Video” finds forehands, backhands and serves across a whole video
              by tracking the player’s body pose. Results are tagged{" "}
              <span className="home__tag">AUTO</span> and stay fully editable — a first
              pass to correct, not the last word.
            </p>
          </li>

          <li className="home__feature">
            <h3 className="home__feature-title home__feature-title--wip">
              <Struck>Ball speed</Struck>
              <WipNote />
            </h3>
            <p className="home__feature-body">
              Calibrate the court once by clicking its four corners, then measure a shot
              by marking the ball across a few frames.
            </p>
            <BallSpeed />
          </li>

          <li className="home__feature">
            <h3 className="home__feature-title">Review, rate, export</h3>
            <p className="home__feature-body">
              Every point and shot in time order, with star ratings. Folders group
              sessions so one stroke can be reviewed across weeks, and any selection can
              be exported as separate clips.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
