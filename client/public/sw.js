/**
 * AMT Service Worker — Cache-First for static assets, Network-First for API.
 * Version: 1.0.0
 */

const CACHE_NAME = 'amt-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// ── Install: pre-cache shell ───────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── Fetch: Cache-First for assets; Network-First for API ──────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and API requests (always network)
    if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
        return;
    }

    // Cache-First for static JS/CSS/images
    if (/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf)$/.test(url.pathname)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Network-First for HTML pages (SPA navigation)
    event.respondWith(
        fetch(request).catch(() => caches.match('/index.html'))
    );
});
