/* Pass-through helper. It used to keep an offline copy, but on iPhone home-screen apps its network requests could fail
   and leave the app on an old copy or a blank page. It now leaves every request to the browser, so pages always load
   straight from GitHub. Old offline copies are left in place (unused) rather than deleted. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
