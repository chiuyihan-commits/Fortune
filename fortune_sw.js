const CACHE_NAME = 'Krane-Fortune-V1';

// 這裡列出所有我們需要「鎖進手機快取」讓離線也能讀取的檔案
const urlsToCache = [
  './',
  './index.html',
  './fortune_style.css',
  './fortune_app.js',
  './fortune_ui.js',
  './fortune_engine.js',
  './fortune_deitypoem.js',
  './fortune_data_manager.js',
  './sync_fortune.js',
  './firebase-config_fortune.js',
  './fortune_manifest.json',
  './fortune_tools.js',
  './deitypoem/Mazu.js',
  './deitypoem/Baishatun_Mazu.js',
  './deitypoem/Baosheng.js',
  './deitypoem/Shouzhi.js',
  './deitypoem/Kongming.js',
  './deitypoem/Leiyushi.js',
  './deitypoem/Yucing.js',
  './deitypoem/Shengxian.js',
  './deitypoem/Xuantian.js',
  './deitypoem/Guanyin.js',
  './deitypoem/Jiazi.js',
  './deitypoem/Baishatun_Mazu.jpg',
  './deitypoem/Shanbian_Mazu.jpg',
  './deitypoem/Shouzhi.jpg',
  './deitypoem/Kongming.jpg',
  './tools/localforage.min.js',
  './tools/html2canvas.min.js',
  './tools/Sortable.min.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'
];

// 1. 安裝階段：把所有檔案下載並存入手機快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('快取已成功開啟');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 攔截請求階段：沒有網路時，直接把快取的檔案丟出去
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在快取中找到檔案，就直接回傳快取檔案 (離線魔法在這裡)
        if (response) {
          return response;
        }
        // 如果快取沒有，才去網路上抓
        return fetch(event.request);
      })
  );
});

// 3. 更新階段：如果未來您的版本號更新了，清除舊的快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊版快取', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
