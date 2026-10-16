const webpush = require('web-push');

const setupVapid = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@nageswarreddyplants.com';

  if (publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      console.log('[WebPush] VAPID configured successfully.');
    } catch (err) {
      console.error('[WebPush] VAPID configuration error:', err.message);
    }
  } else {
    console.warn('[WebPush] VAPID keys not fully set in environment.');
  }
};

module.exports = { setupVapid, webpush };
