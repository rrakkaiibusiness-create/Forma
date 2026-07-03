const BASE_PATH = '/Forma/'
const CACHE_PREFIX = 'forma-pwa-'
const CACHE_NAME = `${CACHE_PREFIX}v1`
const CORE_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}favicon.svg`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  `${BASE_PATH}icons/icon-512-maskable.png`,
]

async function cacheResponse(cache, request) {
  try {
    const response = await fetch(request, { cache: 'reload' })
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    return null
  }
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME)
  const indexResponse = await cacheResponse(cache, BASE_PATH)
  const discoveredAssets = []

  if (indexResponse) {
    const html = await indexResponse.text()
    for (const match of html.matchAll(/(?:src|href)="(\/Forma\/[^"#?]+)"/g)) {
      discoveredAssets.push(match[1])
    }
  }

  await Promise.all([...new Set([...CORE_ASSETS, ...discoveredAssets])].map(asset => cacheResponse(cache, asset)))
}

self.addEventListener('install', event => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE_PATH)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(BASE_PATH, response.clone()))
          return response
        })
        .catch(() => caches.match(BASE_PATH)),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
      return response
    })),
  )
})
