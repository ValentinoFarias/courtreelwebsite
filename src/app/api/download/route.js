/*
  POST /api/download — trades a correct access code for a download URL.

  The page never holds the file URLs: it posts the build it wants and the code
  the visitor typed, and only a correct code gets a link back. Wrong codes get
  403 and nothing else — no hint about which part was wrong, and no URL.

  A POST rather than a GET on purpose: a GET would put the code in the address
  bar, in browser history and in any server log along the way, and would be
  cached and shareable. Nothing here is cacheable, hence `force-dynamic`.
*/

import { downloadUrlFor, isCodeCorrect, isGateConfigured } from "@/lib/downloads";

export const dynamic = "force-dynamic";

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function POST(request) {
  if (!isGateConfigured()) {
    /* The code lives only in the environment, so a missing variable is a
       deployment that is not finished — say so rather than letting everyone
       in or pretending every code is wrong. */
    return Response.json(
      { ok: false, reason: "not-configured" },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  const url = downloadUrlFor(body?.build);
  if (!url) {
    return Response.json({ ok: false, reason: "unknown-build" }, { status: 400 });
  }

  if (!isCodeCorrect(body?.code)) {
    return Response.json({ ok: false, reason: "wrong-code" }, { status: 403 });
  }

  return Response.json({ ok: true, url });
}
