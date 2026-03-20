// T-League Service Worker
const CACHE = 'tleague-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Network first — всегда свежие данные, fallback на кэш
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Не кэшируем Supabase и Telegram запросы
  const url = e.request.url;
  if (url.includes('supabase.co') || url.includes('telegram.org') || url.includes('api.telegram')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
