/**
 * Minimal on purpose.
 * Every image on this site is a local file in /public, so there is no
 * `images.remotePatterns` block and nothing speculative in here.
 *
 * `dangerouslyAllowSVG` is on because the brand mark (cutshot-mark.svg) is
 * served through next/image, which blocks SVG by default. The CSP below is
 * Next's own recommended mitigation: it disables scripts inside the SVG
 * response, which is the actual risk the default block guards against.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
