declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data?.text() ?? '{ title: "" }');
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: data.icon,
      data: {
        url: data?.url,
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data.url) {
    return self.clients.openWindow(event.notification.data.url);
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i]?.focused) {
              client = clientList[i];
            }
          }
          return client?.focus();
        }
        return self.clients.openWindow("/");
      })
  );
});

export {};
