// ponytail: one runtime cache and no precache list. Hashed bundles persist;
// image fingerprints replace older copies of the same path when stored.
const CACHE = "jomc-v2";
const STATIC = /^\/(assets|sprites|badges|items|covers|fonts|icons|save-reader)\//;

const put = (key, res) => caches.open(CACHE).then(async (c) => {
  await c.delete(key, { ignoreSearch: true });
  await c.put(key, res);
}).catch(() => {});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);
// A first visit loads everything before this worker takes over, so the page
// sends the list of what it loaded and we store those files and the app page.
self.addEventListener("message", (e) => {
  if (!Array.isArray(e.data)) return;
  const mine = e.data
    .map((u) => new URL(u, location.origin))
    .filter((u) => u.origin === location.origin && STATIC.test(u.pathname))
    .map((u) => u.pathname + u.search);
  e.waitUntil(
    Promise.all(
      ["/", ...mine].map((path) =>
        fetch(path)
          .then((res) => res.status === 200 && put(path, res))
          .catch(() => {}),
      ),
    ),
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    // The app page: network first so a deploy shows up at once, cached copy when offline.
    if (url.pathname !== "/") return;
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) put("/", res.clone());
          return res;
        })
        .catch(() => caches.match("/").then((hit) => hit || Response.error())),
    );
  } else if (STATIC.test(url.pathname)) {
    e.respondWith(
      caches.match(req, { ignoreVary: true }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.status === 200) put(req, res.clone());
            return res;
          }),
      ),
    );
  }
});
