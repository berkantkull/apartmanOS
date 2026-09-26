const CACHE_NAME = "apartmanos-static-v3";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/pwa-192.png", "/pwa-512.png", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const isStaticAsset = url.pathname.startsWith("/_next/static/") || url.pathname === "/pwa-192.png" || url.pathname === "/pwa-512.png" || url.pathname === "/manifest.webmanifest";
  if (!isStaticAsset) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (!response.ok) return response;
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    return response;
  })));
});

self.addEventListener("push", event => {
  let payload = { title: "apartmanOS", body: "Yeni bir duyurunuz var.", url: "/giris", tag: "apartmanos-announcement" };
  try { payload = { ...payload, ...event.data.json() }; } catch {}
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: payload.tag,
    data: { url: payload.url || "/giris" }
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/giris", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(windows => {
    const existing = windows.find(client => client.url.startsWith(self.location.origin));
    if (existing) return existing.navigate(target).then(client => client?.focus());
    return self.clients.openWindow(target);
  }));
});
