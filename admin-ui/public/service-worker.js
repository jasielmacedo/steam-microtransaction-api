// Service Worker for Web Push Notifications
const CACHE_NAME = 'microtrax-cache-v1';

// No caching of static assets - just use the service worker for notifications
// This avoids cache errors that can happen with missing assets

// Install event - minimal setup without caching
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing');
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log('[ServiceWorker] Install completed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[ServiceWorker] Activate completed');
      return self.clients.claim();
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    console.error('[ServiceWorker] Error parsing notification data', e);
    // Default values if parsing fails
    notificationData = {
      title: 'New Notification',
      body: 'You have a new notification from MicroTrax.',
      icon: '/favicon.ico'
    };
  }
  
  const title = notificationData.title || 'MicroTrax';
  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/favicon.ico',
    badge: notificationData.badge || '/favicon.ico',
    data: notificationData.data || {},
    tag: notificationData.tag || 'default',
    requireInteraction: notificationData.requireInteraction || false,
    // If the notification has actions, add them here
    actions: notificationData.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received:', event);
  
  // Close the notification
  event.notification.close();
  
  // Handle click actions based on which action was clicked
  if (event.action) {
    // Custom action handling based on action ID
    console.log('[ServiceWorker] Action clicked:', event.action);
    // You can add specific handling for different actions here
  } else {
    // Default action when notification body is clicked
    console.log('[ServiceWorker] Notification clicked (no specific action)');
  }
  
  // This will open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/admin-ui') && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Fetch event - simple passthrough, no caching
self.addEventListener('fetch', (event) => {
  // Simple passthrough, let the browser handle the request normally
  // This avoids any caching issues that were causing errors
  // The service worker is only used for push notifications
  return;
});