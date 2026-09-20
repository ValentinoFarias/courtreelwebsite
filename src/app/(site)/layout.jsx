import { Caveat } from "next/font/google";

import "@/assets/css/style.css";

/* The handwritten note on the Ball speed card. Self-hosted by Next at build
   time, so visitors never contact Google. Set on <html> so the :root token
   --font-handwritten in style.css can read the variable. */
const caveat = Caveat({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-caveat",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cutshot.app";

const title = "CutShot — review your tennis training video";
const description =
  "CutShot is a free desktop app for macOS and Windows that turns tennis training video filmed on your phone into something you can actually study. Mark shots frame by frame, or let CutShot detect forehands, backhands and serves for you. Everything runs on your own machine.";

/*
  The link to this site gets pasted into WhatsApp, so the preview matters.
  /og.png (1200x630) does not exist yet — drop the file into /public and the
  cards below start working with no code change. No favicon is declared here
  on purpose: /icon.png does not exist and must not be invented.
*/
export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "CutShot",
  keywords: [
    "tennis",
    "video analysis",
    "training video",
    "stroke detection",
    "macOS app",
    "Windows app",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CutShot",
    title,
    description,
    locale: "en_GB",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CutShot — a desktop app for reviewing tennis training video.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={caveat.variable}>
      <body>{children}</body>
    </html>
  );
}
