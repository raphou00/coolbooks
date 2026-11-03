/** Tiny HTML shell for the local-only /api/dev pages. */
export const devPage = (title: string, body: string) =>
    new Response(
        `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Bibliboo dev</title>
<style>
body{font-family:system-ui,sans-serif;max-width:860px;margin:2rem auto;padding:0 16px;color:#222;background:#fffaf3}
h1{font-size:1.4rem} a{color:#6a4cff} table{border-collapse:collapse;width:100%}
td,th{border-bottom:1px solid #eee;padding:.5rem;text-align:left;font-size:.95rem}
nav a{margin-right:1rem} .box{background:#fff;border:1px solid #eee;border-radius:12px;padding:1rem;margin:1rem 0}
button{background:#6a4cff;color:#fff;border:0;border-radius:8px;padding:.6rem 1.2rem;font-size:1rem;cursor:pointer}
input{padding:.4rem;border:1px solid #ccc;border-radius:6px;width:100%;box-sizing:border-box;margin:.2rem 0 .6rem}
code{background:#f3f0ff;padding:0 .3rem;border-radius:4px}
</style></head><body>
<nav><a href="/">Shop</a><a href="/api/dev/emails">Inbox</a><a href="/api/dev/cron">Run order sweeper</a></nav>
<h1>${title}</h1>${body}</body></html>`,
        { headers: { "content-type": "text/html; charset=utf-8" } }
    );

export const notFound = () => new Response("Not found", { status: 404 });

export const esc = (s: unknown) =>
    String(s ?? "").replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
