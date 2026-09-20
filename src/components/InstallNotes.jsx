"use client";

/*
  InstallNotes — the "your computer will shout at you" disclosure.

  Native <details>/<summary>: the open/closed behaviour is the browser's, not
  ours, so it works with JavaScript off and is keyboard-operable for free. The
  only styling rule that matters is that the summary keeps its focus ring.

  The "use client" directive is here to be explicit rather than because this
  component holds state: it is imported by DownloadCards, which is a client
  component, so it is part of the client bundle either way. The project's rule
  is that exactly three files carry the directive, and this is one of them.

  Tone: honest. The warning is real, the reason is money, and saying so is
  more reassuring than a euphemism would be.
*/
export default function InstallNotes() {
  return (
    <details className="home__install">
      <summary className="home__install-summary">
        The installer will warn you — here&rsquo;s why.
      </summary>

      <div className="home__install-body">
        <p className="home__install-note">
          CutShot is not code-signed. A signing certificate costs money every
          year, and this is a test build, so I have not bought one yet. Your
          computer cannot tell an unsigned app from a dangerous one, so it warns
          you about both. Here is how to get past it.
        </p>

        <div className="home__install-os">
          <h3 className="home__install-os-title">On macOS</h3>
          <ol className="home__install-steps">
            <li>Open the .dmg and drag CutShot into Applications.</li>
            <li>
              Right-click the app in Applications and choose <strong>Open</strong>,
              then <strong>Open</strong> again in the dialog that appears.
            </li>
            <li>
              If that dialog never offers you an Open button, go to{" "}
              <strong>System Settings → Privacy &amp; Security</strong>, scroll to
              the note about CutShot being blocked, and click{" "}
              <strong>Open Anyway</strong>.
            </li>
          </ol>
          <p className="home__install-note">
            You only have to do this the first time you launch it.
          </p>
        </div>

        <div className="home__install-os">
          <h3 className="home__install-os-title">On Windows</h3>
          <ol className="home__install-steps">
            <li>
              Run the installer. SmartScreen will say it protected your PC.
            </li>
            <li>
              Click <strong>More info</strong>, then <strong>Run anyway</strong>.
            </li>
          </ol>
          <p className="home__install-note">
            The warning stops once enough people have installed the same file, or
            once the build is signed.
          </p>
        </div>
      </div>
    </details>
  );
}
