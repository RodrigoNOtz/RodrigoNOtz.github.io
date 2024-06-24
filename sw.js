// Importar la biblioteca Workbox para el Service Worker
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Nombre del caché para los recursos de la página PWA
const CACHE = "snake-game-cache";

// Página offline de respaldo (debes crear esta página)
const offlineFallbackPage = "offline.html"; // Reemplaza con el nombre de tu página offline

// Escuchar mensajes desde la aplicación para activar el Service Worker inmediatamente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Evento de instalación del Service Worker
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

// Habilitar la pre-carga de navegación si es compatible
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Evento fetch para manejar las solicitudes de red y caché
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});
