// Soroban — service worker « réseau d'abord » (même principe que Pas à
// Pas) : on sert toujours la version en ligne quand c'est possible (la
// mise à jour automatique reste maître), et la dernière copie connue hors
// ligne — police comprise, pour que l'oscilloscope garde sa typo.
var CACHE = "soroban-v1";
var FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

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
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === location.origin;
  var font = FONT_HOSTS.indexOf(url.hostname) >= 0;
  if (!sameOrigin && !font) return;
  e.respondWith(fetch(e.request).then(function (res) {
    // Jamais la requête de vérification de mise à jour (?_cb=…)
    if ((res.ok || res.type === "opaque") && e.request.url.indexOf("_cb=") < 0) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: sameOrigin });
  }));
});
