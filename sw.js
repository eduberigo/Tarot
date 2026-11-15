// Cópia offline da Mesa de Tarô
const V = "tarot-v2";
const EXT = "tarot-ext";
const CARTAS = ["./cards/00.webp","./cards/01.webp","./cards/02.webp","./cards/03.webp","./cards/04.webp","./cards/05.webp","./cards/06.webp","./cards/07.webp","./cards/08.webp","./cards/09.webp","./cards/10.webp","./cards/11.webp","./cards/12.webp","./cards/13.webp","./cards/14.webp","./cards/15.webp","./cards/16.webp","./cards/17.webp","./cards/18.webp","./cards/19.webp","./cards/20.webp","./cards/21.webp","./cards/22.webp","./cards/23.webp","./cards/24.webp","./cards/25.webp","./cards/26.webp","./cards/27.webp","./cards/28.webp","./cards/29.webp","./cards/30.webp","./cards/31.webp","./cards/32.webp","./cards/33.webp","./cards/34.webp","./cards/35.webp","./cards/36.webp","./cards/37.webp","./cards/38.webp","./cards/39.webp","./cards/40.webp","./cards/41.webp","./cards/42.webp","./cards/43.webp","./cards/44.webp","./cards/45.webp","./cards/46.webp","./cards/47.webp","./cards/48.webp","./cards/49.webp","./cards/50.webp","./cards/51.webp","./cards/52.webp","./cards/53.webp","./cards/54.webp","./cards/55.webp","./cards/56.webp","./cards/57.webp","./cards/58.webp","./cards/59.webp","./cards/60.webp","./cards/61.webp","./cards/62.webp","./cards/63.webp","./cards/64.webp","./cards/65.webp","./cards/66.webp","./cards/67.webp","./cards/68.webp","./cards/69.webp","./cards/70.webp","./cards/71.webp","./cards/72.webp","./cards/73.webp","./cards/74.webp","./cards/75.webp","./cards/76.webp","./cards/77.webp", "./cards/verso.webp"];
const BASE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"].concat(CARTAS);
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
