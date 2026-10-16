import api from './api';

// Helper to convert base64 VAPID public key to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Request permission and subscribe to Web Push
export const subscribeToWebPush = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[WebPush] Push messaging is not supported in this browser.');
      return { success: false, reason: 'unsupported' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[WebPush] Permission not granted:', permission);
      return { success: false, reason: 'denied' };
    }

    // VAPID Public Key generated for the application
    const vapidPublicKey = 'BMr9fs1wMX3VKixTUWKWzpD3yrWwbaoYnFKLN7-c-3om3jNWFsXjiId_RVeJD3jVn-4wmA_qXAgxNyytlXGfOb0';
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Send subscription to backend
    await api.post('/notifications/subscribe', subscription);
    console.log('[WebPush] Subscribed and registered with server.');
    return { success: true };
  } catch (error) {
    console.error('[WebPush] Subscription error:', error);
    return { success: false, error: error.message };
  }
};
