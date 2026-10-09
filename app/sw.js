// パイナップル：アプリ本体だけをキャッシュ（申請データは通さない）。版 202610091559
const CACHE = 'pineapple-202610091559';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // スプレッドシートとの通信はそのまま
  // 起動を速くする：保存しておいた画面をすぐ出し、裏でネットから最新を受け取って次回に使う
  // （新しい版が出たときは、画面の下に「新しい版があります」と出るので、開き直すと最新になる）
  const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; });
  e.respondWith(caches.match(e.request).then(hit => hit || net.catch(() => caches.match('index.html'))));
  e.waitUntil(net.then(() => {}, () => {}));
});
