import Image from "next/image";

import HeroCourt from "@/components/motion/HeroCourt";
import { release } from "@/data/release";

/*
  `alt` is empty on purpose: the mark is decorative here, because the wordmark
  in the navbar and the heading below already name the product. Rendered via
  next/image, which needs `dangerouslyAllowSVG` in next.config.mjs to serve it.

  The mark is centred BEHIND the whole hero, large, and the right-hand column
  holds the court drawing (HeroCourt). Both are ink hairlines, so the mark is
  set well back — see the HERO banner in style.css.
*/
const brandMark = {
  src: "/courtreel-mark.svg",
  alt: "",
  width: 1024,
  height: 1024,
  available: true,
};

export default function Hero() {
  return (
    <section className="home__section home__hero" aria-labelledby="home-hero-title">
      {/* Hero mark: rendered only once the file exists (see brandMark above). */}
      {brandMark.available ? (
        <div className="home__hero-watermark" aria-hidden="true">
          <Image
            className="home__watermark-image"
            src={brandMark.src}
            alt={brandMark.alt}
            width={brandMark.width}
            height={brandMark.height}
            priority
          />
        </div>
      ) : null}

      <div className="home__container home__hero-inner">
        <div className="home__hero-copy">
          <p className="home__eyebrow">Tennis training video</p>

          <h1 id="home-hero-title" className="home__hero-title">
            Review your tennis one frame at a time.
          </h1>

          <p className="home__lede">
            CourtReel is a desktop app for macOS and Windows that turns the training
            video you filmed on your phone into something you can actually study. It is
            made for the players and coaches who record their own sessions and want a
            proper look at them afterwards.
          </p>

          <div className="home__hero-actions">
            <a className="home__btn home__btn--primary" href="#download">
              Download for macOS
            </a>
            <a className="home__btn home__btn--secondary" href="#download">
              Download for Windows
            </a>
          </div>

          <p className="home__hero-meta">
            <span className="home__numeric">{release.version}</span> · macOS &amp; Windows
            · free · runs offline
          </p>

          <p className="home__hero-privacy">
            Everything runs on your own machine. No account, no upload, no cloud — the
            video never leaves the computer.
          </p>
        </div>

        {/* The court: a static SVG on the server, a slow WebGL line drawing
            after mount. Decorative — it carries no information the copy does
            not. */}
        <div className="home__hero-figure">
          <HeroCourt />
        </div>
      </div>
    </section>
  );
}
