/*
  HomePage — the composition seam for the whole site.

  T2 added the seven static sections; T3 adds the three client components. They
  slot into the ordered list below, in that order. Nothing here is a client
  component: everything is a server component unless it genuinely needs state.

  ---------------------------------------------------------------------------
  Missing-asset convention (applies to every screenshot and the brand mark)
  ---------------------------------------------------------------------------
  None of the image files exist yet. Do NOT `import` a missing image — a static
  import of a file that is not on disk fails `next build`. Instead, each section
  that shows imagery keeps a component-local array with an `available` flag:

      const shots = [
        { src: "/screenshots/timeline.png", alt: "…", available: false },
      ];

  When `available` is false the section renders `.home__well-placeholder` with
  an HTML comment naming the screen that belongs there. Once the PNG is dropped
  into /public/screenshots, flipping the flag to `true` is the only change
  needed — no other edit anywhere.

  See Screenshots.jsx and Hero.jsx for the two live examples.

  ---------------------------------------------------------------------------
  Landmarks
  ---------------------------------------------------------------------------
  <Navbar> renders the <header>, <Footer> the <footer>; both sit outside <main>
  so the landmarks are real. The single <h1> on the page belongs to <Hero>.
*/

import DownloadCards from "@/components/DownloadCards";
import Features from "@/components/Features";
import FeedbackForm from "@/components/FeedbackForm";
import FilmingGuide from "@/components/FilmingGuide";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Screenshots from "@/components/Screenshots";

export default function HomePage() {
  return (
    <>
      {/* 1. Navbar — T2 */}
      <Navbar />

      <main id="main-content" tabIndex={-1}>
        {/* 2. Hero — T2. Owns the one <h1> on the page. */}
        <Hero />

        {/* 3. How it works — T2. Carries id="what-it-does" for the nav anchor. */}
        <HowItWorks />

        {/* 4. Features — T2 */}
        <Features />

        {/* 5. Screenshots — T2 */}
        <Screenshots />

        {/* 6. Filming guide — T2 */}
        <FilmingGuide />

        {/* 7. Download — T3. Owns id="download" (navbar link + both hero
            buttons point at it) and renders <InstallNotes /> beneath the two
            cards. Client component: OS detection and the copy-link button. */}
        <DownloadCards />

        {/* 8. Feedback — T3. Owns id="feedback". Client component: Netlify
            Forms, posted as urlencoded data to /__forms.html. */}
        <FeedbackForm />
      </main>

      {/* 9. Footer — T2 */}
      <Footer />
    </>
  );
}
