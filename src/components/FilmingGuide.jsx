/**
 * FilmingGuide — how to film so the analyser can read the video.
 *
 * Server component. Short and friendly: the near-player limit is stated as what
 * it is — how the analyser works — rather than dressed up as advice.
 */

const tips = [
  {
    term: "Put the phone behind the player",
    detail:
      "Roughly chest height, with the whole player in frame. A fence post, a bag or a small tripod all work — it only has to stay still.",
  },
  {
    term: "Only the near player is analysed",
    detail:
      "This is how the analyser works rather than a preference: it follows the player closest to the camera. So film the person you want to study from behind, and keep them the nearest body in the shot.",
  },
  {
    term: "H.264 MP4 is the safe format",
    detail: "It plays everywhere and imports without any fuss.",
  },
  {
    term: "iPhone video may not play",
    detail:
      "iPhones record HEVC .mov by default, and those files may not play in CourtReel. Set Settings → Camera → Formats to “Most Compatible” before you film, or convert the file to H.264 MP4 afterwards.",
  },
];

export default function FilmingGuide() {
  return (
    <section className="home__section home__guide" aria-labelledby="home-guide-title">
      <div className="home__container home__container--narrow">
        <div className="home__section-head">
          <p className="home__eyebrow">Before you film</p>
          <h2 id="home-guide-title" className="home__section-title">
            Filming that the analyser can read
          </h2>
          <p className="home__lede">
            A minute of setup at the court makes everything afterwards easier.
          </p>
        </div>

        <dl className="home__guide-list">
          {tips.map((tip) => (
            <div key={tip.term} className="home__guide-item">
              <dt className="home__guide-term">{tip.term}</dt>
              <dd className="home__guide-detail">{tip.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
