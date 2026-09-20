/**
 * HowItWorks — the four-step walkthrough, film to export.
 *
 * Server component. This section carries id="what-it-does", the destination of
 * the first navbar anchor: it is the first thing that answers the question, and
 * the feature grid follows immediately below it. The id exists nowhere else.
 *
 * The step numbers are CSS counters (see the HOW IT WORKS banner in style.css),
 * so the list stays an honest <ol> and there is no clipart anywhere near it.
 */

const steps = [
  {
    title: "Film",
    body: "Prop your phone behind the player at about chest height and record the session. Any recent phone is good enough.",
  },
  {
    title: "Import",
    body: "Drag MP4, MOV or M4V files onto the training calendar. Each one is copied into CourtReel’s own library, so the original can be moved or deleted afterwards.",
  },
  {
    title: "Mark or auto-detect",
    body: "Press one key at the frame of contact to mark a shot, or run “Analyze Video” and let CourtReel find the strokes for you.",
  },
  {
    title: "Review and export",
    body: "Step through the shots frame by frame, rate what you see, and export any selection as separate clips.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="what-it-does"
      className="home__section home__section--stage home__how"
      aria-labelledby="home-how-title"
    >
      <div className="home__container">
        <div className="home__section-head">
          <p className="home__eyebrow">What it does</p>
          <h2 id="home-how-title" className="home__section-title">
            How it works
          </h2>
          <p className="home__lede">
            Four steps, start to finish. Nothing to set up, nothing to sign into.
          </p>
        </div>

        <ol className="home__how-list">
          {steps.map((step) => (
            <li key={step.title} className="home__how-step">
              <h3 className="home__how-step-title">{step.title}</h3>
              <p className="home__how-step-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
