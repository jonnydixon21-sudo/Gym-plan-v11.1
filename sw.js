/* Keeps the app available offline. Online it always fetches the newest files first. */
const BASE = "gym-plan-v2", CACHE = BASE + "|" + self.registration.scope;
const FILES = ["./", "index.html", "local-backend.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && (k === BASE || k.endsWith("|" + self.registration.scope))).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  /* the in-app update check goes straight to the network */
  if (e.request.method !== "GET" || u.origin !== location.origin || u.searchParams.has("check")) return;
  /* network first (asking GitHub for the newest copy), the saved copy when offline */
  e.respondWith(fetch(new Request(e.request.url, { cache: "no-cache", credentials: "same-origin" })).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(u.origin + u.pathname, copy)); } return r; })
    .catch(() => caches.match(u.origin + u.pathname).then(r => r || caches.match(new URL("index.html", self.registration.scope).href))));
});
