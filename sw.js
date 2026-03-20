// T-League Service Worker v2 — Push Notifications
const CACHE = 'tleague-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// ── PUSH УВЕДОМЛЕНИЯ ──
self.addEventListener('push', e => {
  let data = { title: 'T-League', body: 'Новое уведомление ⚽', icon: '/icon-192.png' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch(err) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
    })
  );
});

// Клик по уведомлению — открываем приложение
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) { c.focus(); return; }
      }
      return clients.openWindow(url);
    })
  );
});

// ── КЭШ ──
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('supabase.co') || url.includes('telegram.org')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const c = res.clone(); caches.open(CACHE).then(ch => ch.put(e.request, c)); return res; })
      .catch(() => caches.match(e.request))
  );
});
