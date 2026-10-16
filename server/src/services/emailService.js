const axios = require('axios');
const EmailLog = require('../models/EmailLog');

/**
 * Send Transactional Email via Brevo API (or safely log if not configured)
 */
const sendEmail = async ({ to, toName, subject, htmlContent, templateName = 'CUSTOM' }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@nageswarreddyplants.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Nageswarreddy Nursery Plants';

  const isRealKey = apiKey && apiKey.startsWith('xkeysib-') && !apiKey.includes('placeholder');

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent
  };

  try {
    if (isRealKey) {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 8000
      });

      await EmailLog.create({
        recipient: to,
        subject,
        template: templateName,
        status: 'SENT',
        messageId: response.data?.messageId || 'SENT',
        details: response.data
      });

      console.log(`[Brevo Email Sent] To: ${to} | Subject: ${subject}`);
      return { success: true, messageId: response.data?.messageId };
    } else {
      // Graceful local development logging
      await EmailLog.create({
        recipient: to,
        subject,
        template: templateName,
        status: 'LOGGED',
        messageId: 'DEV_LOGGED_' + Date.now(),
        details: { note: 'Brevo API key not live or in dev mode' }
      });

      console.log(`[Email Logged (Dev Mode)] To: ${to} | Subject: ${subject}`);
      return { success: true, logged: true };
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message;
    console.error(`[Brevo Email Error] To: ${to} - ${errorMsg}`);
    
    await EmailLog.create({
      recipient: to,
      subject,
      template: templateName,
      status: 'FAILED',
      error: errorMsg,
      details: err.response?.data || {}
    });

    return { success: false, error: errorMsg };
  }
};

/**
 * Base Email Wrapper with Nursery Branding
 */
const wrapTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #dcfce7; }
    .header { background: linear-gradient(135deg, #15803d, #166534); padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #bbf7d0; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-weight: 600; border-radius: 9999px; font-size: 12px; margin-bottom: 12px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 16px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Nageswarreddy Nursery Plants</h1>
      <p>Healthy, Hand-Nurtured Living Plants Delivered To Your Doorstep</p>
    </div>
    <div class="content">
      <div class="badge">${title}</div>
      ${bodyContent}
    </div>
    <div class="footer">
      <p><strong>Nageswarreddy Nursery Plants Nursery</strong></p>
      <p>Contact: +91 94901 23456 | support@nageswarreddyplants.com</p>
      <p>© ${new Date().getFullYear()} Nageswarreddy Nursery Plants. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper email triggers
const emailTemplates = {
  welcome: async (user) => {
    const html = wrapTemplate(
      'Welcome to Our Green Family',
      `<h3>Hello ${user.name},</h3>
      <p>Thank you for joining <strong>Nageswarreddy Nursery Plants</strong>! We are dedicated to providing the healthiest, most useful plants for your home, health, and garden.</p>
      <p>You can now explore our extensive catalog of indoor air-purifiers, fruit-yielding trees, sacred medicinal plants, and balcony greens.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/shop" class="btn">Explore Plants Now</a>`
    );
    return sendEmail({ to: user.email, toName: user.name, subject: '🌿 Welcome to Nageswarreddy Nursery Plants!', htmlContent: html, templateName: 'WELCOME' });
  },

  orderConfirmation: async (order) => {
    const itemsList = order.items.map(it => `<li><strong>${it.name}</strong> x ${it.quantity} — ₹${it.price * it.quantity}</li>`).join('');
    const html = wrapTemplate(
      'Order Confirmed',
      `<h3>Thank you for your order, ${order.deliveryAddress.fullName}!</h3>
      <p>Your order ID is: <strong>${order.orderId}</strong></p>
      <div class="card">
        <p><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Delivery Address:</strong> ${order.deliveryAddress.houseNumber}, ${order.deliveryAddress.street}, ${order.deliveryAddress.villageTown}, ${order.deliveryAddress.mandal}, ${order.deliveryAddress.district}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pinCode}</p>
      </div>
      <h4>Plants Ordered:</h4>
      <ul>${itemsList}</ul>
      <p>Our nursery experts are preparing your plants with moist root-care packaging.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" class="btn">View Order Details</a>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `🌱 Order Received [${order.orderId}] - Nageswarreddy Nursery Plants`, htmlContent: html, templateName: 'ORDER_CONFIRMATION' });
  },

  paymentSubmitted: async (order) => {
    const html = wrapTemplate(
      'UPI Payment Verification In Progress',
      `<h3>Payment Details Received</h3>
      <p>Hello ${order.deliveryAddress.fullName}, we received your UPI Transaction ID / UTR <strong>${order.upiDetails.utr}</strong> for Order <strong>${order.orderId}</strong>.</p>
      <p>Our team is currently verifying the payment with the nursery bank account. Your order will be accepted immediately once verified.</p>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `Payment Verification Pending - Order [${order.orderId}]`, htmlContent: html, templateName: 'PAYMENT_SUBMITTED' });
  },

  paymentVerified: async (order) => {
    const html = wrapTemplate(
      'Payment Verified Successfully',
      `<h3>Payment Confirmed!</h3>
      <p>Your payment of <strong>₹${order.totalAmount}</strong> for Order <strong>${order.orderId}</strong> has been successfully verified.</p>
      <p>We have queued your live plants for secure potting and dispatch!</p>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `✅ Payment Verified - Order [${order.orderId}]`, htmlContent: html, templateName: 'PAYMENT_VERIFIED' });
  },

  paymentRejected: async (order, reason) => {
    const html = wrapTemplate(
      'Payment Verification Issue',
      `<h3>Attention Needed for Order ${order.orderId}</h3>
      <p>We could not verify the UPI payment with UTR <strong>${order.upiDetails.utr}</strong>.</p>
      <div class="card" style="border-left: 4px solid #ef4444; background: #fef2f2;">
        <strong>Reason:</strong> ${reason || 'UTR could not be matched with bank statement.'}
      </div>
      <p>Please log in to your account and resubmit your valid UTR or contact our nursery team.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" class="btn">Update Payment</a>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `⚠️ Payment Action Required - Order [${order.orderId}]`, htmlContent: html, templateName: 'PAYMENT_REJECTED' });
  },

  orderAccepted: async (order) => {
    const html = wrapTemplate(
      'Order Accepted by Nursery',
      `<h3>Your plants are being nurtured & packed!</h3>
      <p>Order <strong>${order.orderId}</strong> has been officially accepted. Our horticulturists are inspecting the health and root system of your plants before protective boxing.</p>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `🌿 Order Accepted [${order.orderId}] - Getting Ready!`, htmlContent: html, templateName: 'ORDER_ACCEPTED' });
  },

  orderDelayed: async (order) => {
    const dateStr = order.delayInfo?.expectedDeliveryDate ? new Date(order.delayInfo.expectedDeliveryDate).toLocaleDateString() : 'Soon';
    const html = wrapTemplate(
      'Order Delivery Update',
      `<h3>Delivery Timeline Update for Order ${order.orderId}</h3>
      <p>To ensure your live plants arrive in top condition, their dispatch has been slightly rescheduled.</p>
      <div class="card">
        <p><strong>Reason:</strong> ${order.delayInfo?.reason || 'Plant conditioning & safe transit'}</p>
        <p><strong>Expected Delivery Date:</strong> ${dateStr}</p>
        <p><strong>Message:</strong> ${order.delayInfo?.message || 'We are monitoring moisture levels for a safe journey.'}</p>
      </div>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `📦 Delivery Update for Order [${order.orderId}]`, htmlContent: html, templateName: 'ORDER_DELAYED' });
  },

  outForDelivery: async (order) => {
    const html = wrapTemplate(
      'Out For Delivery',
      `<h3>Your greens are on their way!</h3>
      <p>Order <strong>${order.orderId}</strong> is out for delivery to <strong>${order.deliveryAddress.villageTown || order.deliveryAddress.district}</strong> today.</p>
      <p>Please keep someone available at your address to receive the live plant package.</p>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `🚚 Out for Delivery - Order [${order.orderId}]`, htmlContent: html, templateName: 'OUT_FOR_DELIVERY' });
  },

  delivered: async (order) => {
    const html = wrapTemplate(
      'Order Delivered Successfully',
      `<h3>Your plants have arrived! 🌿</h3>
      <p>Order <strong>${order.orderId}</strong> has been marked as delivered.</p>
      <p><strong>Plant Care Tip:</strong> Unbox immediately, place in bright indirect shade for 24 hours, and mist the leaves with water to help them acclimate.</p>
      <p>Please take 30 seconds to rate your plants and experience:</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" class="btn">Leave a Plant Review</a>`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `🎉 Plants Delivered! How are they doing? [${order.orderId}]`, htmlContent: html, templateName: 'DELIVERED' });
  },

  cancelled: async (order) => {
    const html = wrapTemplate(
      'Order Cancelled',
      `<h3>Order ${order.orderId} has been cancelled</h3>
      <div class="card" style="border-left: 4px solid #ef4444;">
        <p><strong>Reason:</strong> ${order.cancellation?.reason || 'Cancelled'}</p>
        ${order.cancellation?.details ? `<p><strong>Details:</strong> ${order.cancellation.details}</p>` : ''}
      </div>
      ${order.paymentMethod === 'UPI' && order.paymentStatus === 'VERIFIED' ? '<p><strong>Refund Notice:</strong> Since payment was verified, your refund will be credited back within 3-5 business days.</p>' : ''}`
    );
    return sendEmail({ to: order.customerEmail, toName: order.customerName, subject: `Order Cancelled [${order.orderId}]`, htmlContent: html, templateName: 'CANCELLED' });
  },

  supportReply: async (query, replyMessage) => {
    const html = wrapTemplate(
      `Support Update: Ticket ${query.ticketId}`,
      `<h3>Response from Nursery Team</h3>
      <p>Hello ${query.customerName}, our support team has replied to your query regarding <strong>"${query.subject}"</strong>:</p>
      <div class="card" style="background: #f0fdf4; border-color: #86efac;">
        <p><em>"${replyMessage}"</em></p>
      </div>
      <p>Status: <strong>${query.status}</strong></p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/support" class="btn">View Support Conversation</a>`
    );
    return sendEmail({ to: query.customerEmail, toName: query.customerName, subject: `Support Ticket Update [${query.ticketId}]`, htmlContent: html, templateName: 'SUPPORT_REPLY' });
  },

  backInStock: async (user, plant) => {
    const html = wrapTemplate(
      'Back In Stock Alert!',
      `<h3>Good news, ${user.name}!</h3>
      <p>The plant from your wishlist, <strong>${plant.name}</strong>, is now back in stock at Nageswarreddy Nursery Plants!</p>
      <p>Price: <strong>₹${plant.discountPrice || plant.price}</strong> | Available Quantity: <strong>${plant.stock}</strong></p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/plant/${plant.slug || plant._id}" class="btn">Order Now Before Stock Runs Out</a>`
    );
    return sendEmail({ to: user.email, toName: user.name, subject: `🌿 Back in Stock: ${plant.name}!`, htmlContent: html, templateName: 'BACK_IN_STOCK' });
  }
};

module.exports = { sendEmail, emailTemplates };
