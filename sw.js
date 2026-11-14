/* Keeps the app available offline. Online it always fetches the newest files first. */
const BASE = "gym-plan-v2", CACHE = BASE + "|" + self.registration.scope;
const FILES = ["./", "index.html", "local-backend.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && (k === BASE || k.endsWith("|" + self.registration.scope))).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  /* no-cache: always ask GitHub for the newest file (it still answers quickly if nothing changed), so updates show straight away */
  const u = new URL(e.request.url), doc = e.request.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html");
  /* pages get a one-off address so GitHub's cache can't hand back an old copy after an update */
  const net = doc ? fetch(u.origin + u.pathname + (u.search ? u.search + "&" : "?") + "_=" + Date.now(), { cache: "no-store", credentials: "same-origin" }) : fetch(new Request(e.request.url, { cache: "no-cache", credentials: "same-origin" }));
  e.respondWith(net.then(r => { if (r.ok && !u.searchParams.has("check")) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
