export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/partners" || url.pathname === "/partners/") {
      return new Response(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KAIZURO Partner Network</title>
<style>
body{margin:0;background:#0b0b0b;color:#fff;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box}
main{max-width:760px;text-align:center}
.kicker{letter-spacing:.18em;text-transform:uppercase;color:#c9a55d;font-size:14px;margin-bottom:18px}
h1{font-size:clamp(40px,7vw,78px);line-height:.95;margin:0 0 24px;text-transform:uppercase}
p{font-size:18px;line-height:1.6;color:#cfcfcf}
.badge{display:inline-block;margin-top:24px;border:1px solid #c9a55d;padding:12px 18px;color:#c9a55d;text-transform:uppercase;letter-spacing:.12em;font-size:12px}
</style>
</head>
<body>
<main>
<div class="kicker">KAIZURO Partner Network</div>
<h1>Built for performance.<br>Driven by partners.</h1>
<p>This direct Worker response confirms the staging Worker and /partners route are live.</p>
<div class="badge">KAIZURO STAGING TEST</div>
</main>
</body>
</html>`, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive"
        }
      });
    }

    return new Response("KAIZURO staging worker is live.", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": "no-store" }
    });
  }
};
