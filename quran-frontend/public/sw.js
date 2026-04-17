self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  console.log('Received Push Event:', data);

  const title = data.title || 'Waktu Sholat';
  const options = {
    body: data.body || 'Saatnya sholat.',
    icon: '/mosque-icon.png', // Fallback icon (ensure to create or provide one)
    badge: '/mosque-icon.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    requireInteraction: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  if (urlToOpen) {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(windowClients) {
        let matchingClient = null;
        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url === urlToOpen) {
            matchingClient = windowClient;
            break;
          }
        }
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
