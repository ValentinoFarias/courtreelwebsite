import Image from "next/image";

import ShotReveal from "@/components/motion/ShotReveal";

/*
  Screenshots — four black wells with captions, in the order the app is used:
  import, mark, auto-detect, review.

  Server component. Each screen carries an `available` flag: while it is false
  the well shows the --color-stage placeholder naming the screen that belongs
  in it, so the page never renders a broken image (see the missing-asset
  convention at the top of HomePage.jsx).

  <ShotReveal> wraps each well with a one-off clip-path wipe. It clips; it
  never hides. The image is in the DOM and in the accessibility tree from the
  first paint whether or not the wipe ever runs.
*/
const shots = [
  {
    src: "/screenshots/calendar.jpg",
    file: "calendar.jpg",
    screen: "the training calendar",
    alt: "The CutShot training calendar, with each filmed session sitting on the day it was recorded.",
    caption: "The training calendar. Every session lands on the day it was filmed.",
    available: true,
  },
  {
    src: "/screenshots/theplayer.jpg",
    file: "theplayer.jpg",
    screen: "the frame-accurate player",
    alt: "The CutShot player paused on a single frame, with slow motion and skip controls under the video.",
    caption: "The frame-accurate player, paused at the instant of contact.",
    available: true,
  },
  {
    src: "/screenshots/analizer.jpg",
    file: "analizer.jpg",
    screen: "the automatic stroke detection results",
    alt: "The CutShot video analysis, with forehands, backhands and serves found across a whole video and tagged AUTO.",
    caption: "Automatic stroke detection. A first pass over the whole video, tagged AUTO and fully editable.",
    available: true,
  },
  {
    src: "/screenshots/shotreview.jpg",
    file: "shotreview.jpg",
    screen: "the shot list and review view",
    alt: "The CutShot shot list, showing every point and shot of a session in time order with star ratings.",
    caption: "The shot list. Every point and shot in time order, rated and ready to export.",
    available: true,
  },
];

/* Intrinsic size of the source files; next/image uses it for the aspect ratio. */
const SHOT_WIDTH = 2712;
const SHOT_HEIGHT = 1646;

export default function Screenshots() {
  return (
    <section
      className="home__section home__section--stage home__shots"
      aria-labelledby="home-shots-title"
    >
      <div className="home__container">
        <div className="home__section-head">
          <p className="home__eyebrow">The app</p>
          <h2 id="home-shots-title" className="home__section-title">
            Four screens
          </h2>
        </div>

        <ul className="home__shots-list">
          {shots.map((shot) => (
            <li key={shot.file}>
              <figure className="home__shot">
                <ShotReveal>
                  <div className="home__well">
                    {shot.available ? (
                      <Image
                        className="home__shot-image"
                        src={shot.src}
                        alt={shot.alt}
                        width={SHOT_WIDTH}
                        height={SHOT_HEIGHT}
                        sizes="(min-width: 1056px) 1024px, 100vw"
                      />
                    ) : (
                      <div className="home__well-placeholder">
                        <span>
                          <code>{shot.file}</code> — {shot.screen}
                        </span>
                      </div>
                    )}
                  </div>
                </ShotReveal>
                <figcaption className="home__shot-caption">{shot.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
