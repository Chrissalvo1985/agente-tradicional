const CACHE_NAME = 'agente-tradicional-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Estrategia de cache: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardar en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar servir desde cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response
            }
            // Si no está en cache, retornar página offline
            return caches.match('/offline.html')
          })
      })
  )
})

// Background Sync para subir datos cuando hay conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // Implementar lógica de sincronización
  console.log('Sincronizando datos...')
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Agente Tradicional'
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/dashboard')
  )
})
