const CACHE_NAME = "asset-system-v1";

// الملفات التي سيتم تخزينها للعمل بدون إنترنت
const urlsToCache = [
  "/",
  "index.html",
  "manifest.json",
  "assets/logo.png",
  "assets/logo-institute.png"
];

// تثبيت الـ Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// تشغيله واعتراض الطلبات
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا الملف موجود بالكاش يرجعه
        if (response) {
          return response;
        }
        // إذا لا، يحاول يجلبه من الإنترنت
        return fetch(event.request);
      })
  );
});

// تحديث الكاش عند تغيير الإصدار
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});