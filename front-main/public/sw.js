// INBOLA Kids Marketplace Service Worker
// Version 1.0.0

const CACHE_NAME = 'inbola-kids-v1.0.0';
const STATIC_CACHE = 'inbola-static-v1.0.0';
const DYNAMIC_CACHE = 'inbola-dynamic-v1.0.0';
const IMAGE_CACHE = 'inbola-images-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-144x144.png',
  '/img/hero-kids.jpg',
  '/img/hero-kids-2.jpg',
  '/img/hero-kids-3.jpg',
  '/img/placeholder-product.jpg',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/brands/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('SW: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Image request failed:', error);
    return new Response('Image not available', { status: 404 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Try network first
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (networkError) {
      // Fallback to cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw networkError;
    }
  } catch (error) {
    console.log('SW: API request failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Network unavailable', 
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('SW: Navigation request failed, serving offline page');
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/offline.html') || 
           cache.match('/') || 
           new Response('Offline', { status: 503 });
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Static request failed:', error);
    return new Response('Resource not available', { status: 404 });
  }
}

// Helper functions
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Yangi xabar!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-144x144.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ko\'rish',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Yopish',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('INBOLA Kids', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync functions
async function syncCart() {
  try {
    // Get offline cart data from IndexedDB
    const cartData = await getOfflineCartData();
    if (cartData.length > 0) {
      // Sync with server
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData)
      });
      // Clear offline data
      await clearOfflineCartData();
    }
  } catch (error) {
    console.error('SW: Cart sync failed:', error);
  }
}

async function syncOrders() {
  try {
    // Get offline order data
    const orderData = await getOfflineOrderData();
    if (orderData.length > 0) {
      // Sync with server
      await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      // Clear offline data
      await clearOfflineOrderData();
    }
  } catch (error) {
    console.error('SW: Order sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getOfflineCartData() {
  // Implementation would use IndexedDB
  return [];
}

async function clearOfflineCartData() {
  // Implementation would clear IndexedDB
}

async function getOfflineOrderData() {
  // Implementation would use IndexedDB
  return [];
}

async function clearOfflineOrderData() {
  // Implementation would clear IndexedDB
}

console.log('SW: Service worker loaded successfully');
