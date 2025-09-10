const CACHE_NAME = 'my-tasks-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// التثبيت الأولي وتهيئة الكاش
self.addEventListener('install', event => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// إدارة الطلبات
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching');
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // نسخ الاستجابة
        const resClone = res.clone();
        // فتح الكاش
        caches.open(CACHE_NAME)
          .then(cache => {
            // إضافة الاستجابة إلى الكاش
            cache.put(event.request, resClone);
          });
        return res;
      })
      .catch(() => caches.match(event.request).then(res => res))
  );

});
// وظيفة للتحقق من حجم البيانات المخزنة في localStorage
function checkStorageQuota() {
    const usedSpace = JSON.stringify(localStorage).length;
    const quota = 5 * 1024 * 1024; // 5MB
    if (usedSpace >= quota) {
        alert("تم امتلاء مساحة التخزين، سيتم مسح المهام القديمة.");
        clearTasks();
    }
}

// وظيفة لمسح البيانات
function clearTasks() {
    localStorage.clear();
    renderTasks();
}

// وظيفة لعرض المهام
function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        taskList.appendChild(li);
    });
}

// استدعاء وظيفة التحقق عند تحميل الصفحة
window.onload = function() {
    checkStorageQuota();
    renderTasks();
};
