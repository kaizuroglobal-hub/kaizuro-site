const PASSWORD = "KAIZURO100";
const AUTH_COOKIE = "kaizuro_preview=granted_2026";

function loginPage(error = "") {
  const safeError = error ? `<p id="login-error" class="error">${error}</p>` : `<p id="login-error" class="error" hidden></p>`;
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KAIZURO Private Preview</title>
<style>html,body{height:100%;margin:0;font-family:Inter,Arial,sans-serif;background:#050607;color:#fff}body{display:grid;place-items:center}.panel{width:min(88vw,420px);padding:42px;border:1px solid #333;background:#0c0d0e}.brand{letter-spacing:.22em;font-size:13px;margin-bottom:30px}.eyebrow{color:#9ca3aa;text-transform:uppercase;letter-spacing:.18em;font-size:11px}.panel h1{font-size:34px;font-weight:400;margin:12px 0 14px}.panel p{color:#aeb4ba;line-height:1.6}.panel input{box-sizing:border-box;width:100%;padding:15px;margin:20px 0 12px;border:1px solid #555;background:#08090a;color:#fff;font-size:16px}.panel button{width:100%;padding:15px;border:0;background:#fff;color:#050607;font-weight:700;cursor:pointer}.panel button[disabled]{opacity:.55;cursor:wait}.error{color:#ff8c8c!important;font-size:13px;margin:0 0 10px}.status{color:#cbd1d6!important;font-size:13px;margin:0 0 10px}</style></head>
<body><main class="panel"><div class="brand">KAIZURO</div><div class="eyebrow">Private preview</div><h1>Enter access password.</h1><p>This development site is restricted while KAIZURO prepares for launch.</p>${safeError}<p id="login-status" class="status" hidden>Checking password…</p><form id="login-form" method="post" action="/__kaizuro-login"><input id="password" type="password" name="password" autocomplete="current-password" autofocus required><button id="login-button" type="submit">Enter site</button></form></main>
<script>
const form=document.getElementById('login-form');
const button=document.getElementById('login-button');
const error=document.getElementById('login-error');
const status=document.getElementById('login-status');
form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  button.disabled=true;
  error.hidden=true;
  status.hidden=false;
  try{
    const response=await fetch('/__kaizuro-login',{method:'POST',body:new FormData(form),credentials:'same-origin',headers:{'x-kaizuro-login':'1'}});
    if(response.ok){window.location.replace('/');return;}
    const data=await response.json().catch(()=>({}));
    error.textContent=data.error||'Incorrect password. Please try again.';
    error.hidden=false;
  }catch(_){
    error.textContent='Unable to sign in. Please refresh and try again.';
    error.hidden=false;
  }finally{
    status.hidden=true;
    button.disabled=false;
  }
});
</script></body></html>`, { status: 200, headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/__kaizuro-login" && request.method === "POST") {
      let submitted = "";
      try {
        const form = await request.formData();
        submitted = String(form.get("password") || "").trim();
      } catch (_) {}

      if (submitted === PASSWORD) {
        const headers = new Headers({
          "set-cookie": `${AUTH_COOKIE}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
          "cache-control": "no-store"
        });
        if (request.headers.get("x-kaizuro-login") === "1") {
          headers.set("content-type", "application/json; charset=UTF-8");
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
        }
        headers.set("location", "/");
        return new Response(null, { status: 303, headers });
      }

      if (request.headers.get("x-kaizuro-login") === "1") {
        return new Response(JSON.stringify({ ok: false, error: "Incorrect password. Please try again." }), {
          status: 401,
          headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store" }
        });
      }
      return loginPage("Incorrect password. Please try again.");
    }

    const cookie = request.headers.get("cookie") || "";
    if (!cookie.includes(AUTH_COOKIE)) return loginPage();

    return env.ASSETS.fetch(request);
  }
};
