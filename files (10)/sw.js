/* 朝15分 英語音読ジム — Service Worker
   HTML本体をキャッシュし、オフラインでも起動できるようにする。
   教材を更新（HTMLを差し替え）したら、下の CACHE バージョンを上げる。 */
const CACHE = 'eigo-gym-v2';
const ASSETS = [
  './',
  './index.html',
  './eigo_gym_v2.html'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // network-first（最新HTMLを優先、失敗時キャッシュ）
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
