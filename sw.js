// Cópia offline da Mesa de Tarô
const V = "tarot-v1";
const EXT = "tarot-ext";
const BASE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const FORA = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V && k !== EXT).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);

  // Arquivos do app: abre do aparelho e atualiza em segundo plano
  if (u.origin === location.origin) {
    e.respondWith(
      caches.match(r, { ignoreSearch: true }).then(hit => {
        const rede = fetch(r)
          .then(res => {
            if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
            return res;
          })
          .catch(() => hit || (r.mode === "navigate" ? caches.match("./index.html") : Response.error()));
        return hit || rede;
      })
    );
    return;
  }

  // Fontes e motor do Gemma: baixa uma vez e guarda
  if (FORA.includes(u.hostname)) {
    e.respondWith(
      caches.open(EXT).then(async c => {
        const hit = await c.match(r);
        if (hit) return hit;
        const res = await fetch(r);
        if (res.ok || res.type === "opaque") c.put(r, res.clone());
        return res;
      })
    );
  }
});
