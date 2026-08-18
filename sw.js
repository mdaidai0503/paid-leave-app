const CACHE_NAME = 'paid-leave-v5.4-swfix-20260819';

// GitHub Pages上で同じ階層にある基本ファイルだけを対象にします。
// 存在しないファイルがあってもService Workerのインストール自体は失敗させません。
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1ファイルの取得失敗でSW全体が壊れないよう個別に処理
      await Promise.allSettled(
        APP_SHELL.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response && response.ok) {
              await cache.put(url, response.clone());
            }
          } catch (_) {
            // 初回キャッシュ失敗は無視。オンライン時に通常取得します。
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 古いService Workerキャッシュを削除
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // POST/PUT/PATCH/DELETE等には一切触れない
  // Supabaseログイン・DB更新通信を壊さないため重要
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // ★最重要
  // Supabase (*.supabase.co) やその他CDN/APIなど、
  // GitHub Pages以外への通信はService Workerで横取りしない。
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 同一オリジンはネットワーク優先
        const response = await fetch(request);

        // Responseが正常に存在する場合だけキャッシュ
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        // fetch()が成功した場合は必ずResponseを返す
        return response;
      } catch (_) {
        // 通信失敗時だけキャッシュを利用
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }

        // ページ遷移ならトップページをオフライン代替
        if (request.mode === 'navigate') {
          const home =
            (await caches.match('./index.html')) ||
            (await caches.match('./'));

          if (home) {
            return home;
          }
        }

        // ★絶対に null / undefined を返さない
        return new Response('現在オフラインです。通信状態を確認してください。', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        });
      }
    })()
  );
});

// 将来の更新時、ページ側から skipWaiting を要求できるようにしておく
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
