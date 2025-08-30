// sw.js
const cacheName = 'order-app-cache-v2'; // Update cache name
const assetsToCache = [
    '/',
    '/index.html',
    '/products.html',      // <-- ADD NEW
    '/add-order.html',     // <-- ADD NEW
    '/style.css',
    '/js/db.js',
    '/js/main.js',         // <-- ADD NEW
    '/js/products.js',     // <-- ADD NEW
    '/js/add-order.js',    // <-- ADD NEW
    'https://unpkg.com/dexie@3/dist/dexie.js'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(assetsToCache))
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});