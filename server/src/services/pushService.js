const { webpush } = require('../config/vapid');
const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');

/**
 * Send Web Push notification to a specific user subscription
 */
const sendPushToUser = async (userId, payload) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return { success: false, reason: 'VAPID keys not configured' };
    }

    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      return { success: false, reason: 'No subscriptions found for user' };
    }

    const stringifiedPayload = JSON.stringify({
      title: payload.title || 'Nageswarreddy Nursery Plants',
      body: payload.message || payload.body || 'You have a new nursery update.',
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      data: {
        url: payload.link || payload.url || '/',
        type: payload.type || 'SYSTEM'
      }
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          };
          return await webpush.sendNotification(pushSubscription, stringifiedPayload);
        } catch (err) {
          // If subscription is expired or gone (410 or 404), clean up
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          }
          throw err;
        }
      })
    );

    return { success: true, results };
  } catch (error) {
    console.error('[WebPush Error] sendPushToUser:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Web Push to all Admin subscriptions
 */
const sendPushToAdmins = async (payload) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
    
    const adminSubs = await PushSubscription.find({ role: 'admin' });
    if (!adminSubs || adminSubs.length === 0) return;

    const stringifiedPayload = JSON.stringify({
      title: payload.title || '🌱 Nursery Admin Alert',
      body: payload.message || payload.body || 'New administrative event',
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      data: {
        url: payload.link || '/admin/orders',
        type: payload.type || 'ADMIN_ALERT'
      }
    });

    for (const sub of adminSubs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, stringifiedPayload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }
  } catch (err) {
    console.error('[WebPush Error] sendPushToAdmins:', err.message);
  }
};

/**
 * Broadcast Web Push to all registered subscriptions (offers, new arrivals, etc.)
 */
const broadcastPush = async (payload) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
    const subs = await PushSubscription.find({});
    
    const stringifiedPayload = JSON.stringify({
      title: payload.title || '🌿 Nageswarreddy Nursery Plants',
      body: payload.message || 'Fresh plant collection arrived!',
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      data: {
        url: payload.link || '/shop',
        type: payload.type || 'BROADCAST'
      }
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, stringifiedPayload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }
  } catch (err) {
    console.error('[WebPush Error] broadcastPush:', err.message);
  }
};

/**
 * Unified dispatch helper: saves In-App Notification and triggers Web Push
 */
const notifyUser = async ({ user, title, message, type = 'SYSTEM', link = '/', isAdminNotification = false, metadata = {} }) => {
  try {
    // 1. Create in-app notification in DB
    const notif = await Notification.create({
      user: user || null,
      isAdminNotification,
      title,
      message,
      type,
      link,
      metadata
    });

    // 2. Send Web Push
    if (isAdminNotification) {
      await sendPushToAdmins({ title, message, link, type });
    } else if (user) {
      await sendPushToUser(user, { title, message, link, type });
    } else {
      await broadcastPush({ title, message, link, type });
    }

    return notif;
  } catch (error) {
    console.error('[Notification Dispatch Error]:', error.message);
  }
};

module.exports = {
  sendPushToUser,
  sendPushToAdmins,
  broadcastPush,
  notifyUser
};
