import api from './api';

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const registerAndSubscribePush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    // Register Service Worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);

    // Get Public Key from Backend
    const res = await api.get('/api/push/public-key');
    const publicKey = res.data.publicKey;

    if (!publicKey) {
      console.warn('VAPID public key not found on server');
      return;
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    // Extract keys
    const p256dh = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    if (p256dh && auth) {
      // Send subscription to backend
      const subscriptionObject = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh)))),
          auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth))))
        }
      };

      await api.post('/api/push/subscribe', subscriptionObject);
      console.log('Push subscription successful');
    }
  } catch (error) {
    console.error('Failed to subscribe to push notifications', error);
  }
};
