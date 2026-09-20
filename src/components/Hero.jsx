import Image from "next/image";

import { release } from "@/data/release";

/*
  The large logo mark does not exist yet. Per the missing-asset convention
  documented at the top of HomePage.jsx it is declared here with an `available`
  flag instead of being imported: a static import of a missing file fails
  `next build`.

  While the flag is false the hero renders as a plain text hero — no grey slab
  in the opening screen. Drop /public/courtreel-mark.svg in and flip the flag
  to true; nothing else has to change.

  `alt` is empty on purpose: the mark is decorative here, because the wordmark
  in the navbar and the heading below already name the product.
*/
const brandMark = {
  src: "/courtreel-mark.svg",
  alt: "",
  width: 280,
  height: 280,
  available: false,
};

export default function Hero() {
  return (
    <section className="home__section home__hero" aria-labelledby="home-hero-title">
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

        {/* Hero mark: rendered only once the file exists (see brandMark above). */}
        {brandMark.available ? (
          <div className="home__hero-mark">
            <Image
              src={brandMark.src}
              alt={brandMark.alt}
              width={brandMark.width}
              height={brandMark.height}
              priority
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
