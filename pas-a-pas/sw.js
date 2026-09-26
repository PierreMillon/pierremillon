// Pas à Pas — service worker « réseau d'abord » : on sert toujours la
// version en ligne quand c'est possible (la mise à jour automatique reste
// maître), et la dernière copie connue quand on est hors ligne.
var CACHE = "pasapas-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(["./", "./index.html", "./manifest.webmanifest", "../favicon.svg", "../apple-touch-icon.png"]);
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
