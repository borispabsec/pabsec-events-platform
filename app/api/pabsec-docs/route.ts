import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assemblyId = searchParams.get("assembly_id");
  const lang = searchParams.get("lang") ?? "en";

  if (!assemblyId || !/^\d+$/.test(assemblyId)) {
    return new Response("Invalid assembly_id", { status: 400 });
  }

  const flipUrl    = `https://www.pabsec.org/assemblies-flip/${assemblyId}`;
  const setLocale  = `https://www.pabsec.org/setlocale/${lang}`;

  // English: plain redirect
  if (lang === "en") {
    return NextResponse.redirect(flipUrl);
  }

  // Russian / Turkish: load setlocale in an iframe to set the locale cookie on
  // pabsec.org, then redirect the top-level window to the assembly flip page.
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Redirecting…</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;
         min-height:100vh;background:#f8f9fa;color:#6b7280}
    p{font-size:13px;letter-spacing:.04em}
  </style>
</head>
<body>
  <p>Redirecting…</p>
  <iframe id="loc" src="${setLocale}" style="display:none" sandbox="allow-same-origin allow-scripts"></iframe>
  <script>
    var redirected = false;
    function go(){
      if(redirected) return;
      redirected = true;
      window.location.href = "${flipUrl}";
    }
    document.getElementById('loc').addEventListener('load', go);
    setTimeout(go, 1800);
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
