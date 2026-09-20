import { release } from "@/data/release";

/**
 * Footer — maker, year, the privacy promise once more, and the build number.
 *
 * Server component. The year is read at build time; the site is rebuilt on every
 * deploy, so it stays current without any client JavaScript.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="home__footer">
      <div className="home__container home__footer-inner">
        <p className="home__footer-line">
          <span className="home__footer-brand">CutShot</span>{" "}
          <span className="home__numeric">{release.version}</span> — made by Valentino
          Farias, {year}.
        </p>

        <p className="home__footer-line home__footer-line--promise">
          Your video never leaves your computer.
        </p>
      </div>
    </footer>
  );
}
