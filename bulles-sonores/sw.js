// Bulles Sonores — service worker « réseau d'abord » (même principe que
// pas-a-pas/sw.js) : toujours la version en ligne quand c'est possible (la
// mise à jour automatique reste maître), la dernière copie connue hors
// ligne. Le moteur Rapier est mis en cache dès l'installation : sans lui,
// rien ne bouge.
var CACHE = "bulles-sonores-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll([
      "./", "./index.html", "./manifest.webmanifest",
      "./vendor/rapier2d-compat-0.14.0.js",
      "../favicon.svg", "../apple-touch-icon.png"
    ]);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (res) {
    if (res.ok && new URL(e.request.url).origin === location.origin && e.request.url.indexOf("_cb=") < 0) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true });
  }));
});
