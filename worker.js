const EXPECTED_HASH = "055dabbeffe8f131cad386b2c8bf6c670d9d4ab30f4afa24725bea3b774de37c";

function unauthorized() {
  return new Response("KAIZURO private preview", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="KAIZURO Private Preview", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request, env) {
    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.startsWith("Basic ")) return unauthorized();

    let credentials = "";
    try {
      credentials = atob(authorization.slice(6));
    } catch (_) {
      return unauthorized();
    }

    if ((await sha256Hex(credentials)) !== EXPECTED_HASH) return unauthorized();

    return env.ASSETS.fetch(request);
  }
};
