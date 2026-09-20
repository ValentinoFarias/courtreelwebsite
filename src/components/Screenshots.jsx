import Image from "next/image";

/*
  Screenshots — three black wells with captions.

  Server component. None of the PNGs exist yet, so none of them is imported:
  a static import of a missing file fails `next build`. Following the convention
  documented at the top of HomePage.jsx, each screen is declared here with an
  `available` flag. While the flag is false the well shows the --color-stage
  placeholder naming the exact screen that belongs in it, so the page never
  renders a broken image.

  To ship a screenshot: drop the PNG into /public/screenshots with the filename
  below and flip `available` to true. That is the only edit required — the true
  branch already uses next/image.
*/
const shots = [
  {
    // /public/screenshots/calendar.png — the training calendar
    src: "/screenshots/calendar.png",
    file: "calendar.png",
    screen: "the training calendar",
    alt: "The CourtReel training calendar, with each filmed session sitting on the day it was recorded.",
    caption: "The training calendar. Every session lands on the day it was filmed.",
    available: false,
  },
  {
    // /public/screenshots/player.png — the frame-accurate player
    src: "/screenshots/player.png",
    file: "player.png",
    screen: "the frame-accurate player",
    alt: "The CourtReel player paused on a single frame, with slow motion and skip controls under the video.",
    caption: "The frame-accurate player, paused at the instant of contact.",
    available: false,
  },
  {
    // /public/screenshots/shots.png — the shot list / review view
    src: "/screenshots/shots.png",
    file: "shots.png",
    screen: "the shot list and review view",
    alt: "The CourtReel shot list, showing every point and shot of a session in time order with star ratings.",
    caption: "The shot list. Every point and shot in time order, rated and ready to export.",
    available: false,
  },
];

/* 16:10, matching --aspect-screenshot. next/image needs the intrinsic size. */
const SHOT_WIDTH = 1600;
const SHOT_HEIGHT = 1000;

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
            Three screens
          </h2>
        </div>

        <ul className="home__shots-list">
          {shots.map((shot) => (
            <li key={shot.file}>
              <figure className="home__shot">
                <div className="home__well">
                  {shot.available ? (
                    <Image
                      className="home__shot-image"
                      src={shot.src}
                      alt={shot.alt}
                      width={SHOT_WIDTH}
                      height={SHOT_HEIGHT}
                    />
                  ) : (
                    /* Placeholder until the PNG named in `file` is dropped in. */
                    <div className="home__well-placeholder">
                      <span>
                        <code>{shot.file}</code> — {shot.screen}
                      </span>
                    </div>
                  )}
                </div>
                <figcaption className="home__shot-caption">{shot.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
