// File ini mengatur caching dan offline functionality

const CACHE_NAME = "Cleaner-cache1";
// Daftar file yang perlu di-cache untuk akses offline
const urlsToCache = [
    "/app.js",
    "/index.html",
    "/kontak.html",
    "/img/profile.jpg",
    "/img/offline_logo.png",
    "/style.css",
];

// Event Install - Dijalankan saat SW pertama kali diinstall
self.addEventListener("install", async (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            console.log("Service Worker: Membuka cache dan menyimpan file...");

            // Menggunakan loop untuk menambahkan file satu per satu
            // Ini akan membantu mengidentifikasi file mana yang menyebabkan error
            for (const url of urlsToCache) {
                try {
                    await cache.add(url); // Menggunakan cache.add() untuk setiap file
                    console.log('Service Worker: Berhasil DISIMPAN!!! ${ url } ke cache.');
                } catch (error) {
                    console.error('Service Worker: Gagal MENYIMPAN!!! ${ url } ke cache.Error:, error');
                    // Penting: Meskipun ada error, loop akan terus mencoba menyimpan file lain.
                    // Ini sangat membantu untuk debugging agar Anda tahu semua file yang bermasalah.
                }
            }
            console.log("Service Worker: Proses caching SELESAI.");
        })()
    );
});

// Event Activate - Mengelola penghapusan cache lama
// Penting untuk memastikan hanya cache terbaru yang digunakan
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: MENGHAPUS cache lama: ${ cacheName }');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Event Fetch - Dijalankan setiap kali browser meminta file
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Jika ada di cache, gunakan versi cache
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).catch(() => {
                // Jika offline dan request gambar, tampilkan logo default
                if (event.request.destination === 'image') {
                    return caches.match('/img/offline_logo.png');
                }
                // Untuk resource lain (gambar, CSS, JS) jika offline dan tidak di cache,
                // akan tetap gagal atau mengembalikan Response kosong.
                return new Response('', {
                    status: 408,
                    statusText: 'Offline - data gak ada di cache kamu'
                });
            });
        })
    );
});