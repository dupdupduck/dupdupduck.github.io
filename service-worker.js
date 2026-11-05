// Caro Arena: gỡ service worker + cache của bản Gomoku Calculator cũ.
// Khi trình duyệt thấy file này thay đổi, nó cài SW mới, SW mới tự xóa
// toàn bộ cache cũ rồi tự hủy đăng ký — lần tải sau sẽ lấy trang mới.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((c) => {
          if (c.url.indexOf('dupdupduck.github.io') !== -1) c.navigate(c.url);
        });
      })
  );
});
