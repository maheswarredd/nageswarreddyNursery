const Order = require('../models/Order');
const Setting = require('../models/Setting');
const QRCode = require('qrcode');
const { emailTemplates } = require('../services/emailService');
const { notifyUser } = require('../services/pushService');

// Get UPI Configuration and Dynamic QR Code for an Order
const getUpiDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const settings = (await Setting.findOne()) || {
      upiId: process.env.UPI_ID || 'nageswarreddyplants@okaxis',
      upiName: process.env.UPI_NAME || 'Nageswarreddy Nursery Plants'
    };

    let amount = 0;
    if (orderId) {
      const order = await Order.findOne({
        $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId }]
      });
      if (order) {
        amount = order.totalAmount;
      }
    }

    // Standard NPCI UPI URI Scheme
    const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Plants Order ' + (orderId || ''))}`;
    
    // Generate QR code data URI
    const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 280,
      color: {
        dark: '#14532d',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      upiId: settings.upiId,
      upiName: settings.upiName,
      amount,
      upiUri,
      qrCodeDataUrl
    });
  } catch (error) {
    next(error);
  }
};

// Customer: Submit UPI Payment Details (Payer Name and Mandatory UTR)
const submitUpiPayment = async (req, res, next) => {
  try {
    const { orderId, payerName, utr } = req.body;

    if (!orderId || !payerName || !utr) {
      return res.status(400).json({
        success: false,
        message: 'Both Payer Name and UTR / Transaction ID are mandatory to submit UPI payment details.'
      });
    }

    const trimmedUtr = utr.trim();
    if (trimmedUtr.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 12-digit UPI Reference Number / UTR.'
      });
    }

    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId }],
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Update order with UTR and set status to SUBMITTED (Never auto-trusted!)
    order.paymentMethod = 'UPI';
    order.paymentStatus = 'SUBMITTED';
    order.orderStatus = 'PAYMENT_SUBMITTED';
    order.upiDetails = {
      payerName: payerName.trim(),
      utr: trimmedUtr,
      submittedAt: new Date(),
      rejectionReason: ''
    };

    order.statusHistory.push({
      status: 'PAYMENT_SUBMITTED',
      comment: `Customer submitted UPI UTR: ${trimmedUtr}. Awaiting nursery manual bank verification.`,
      updatedBy: req.user.name
    });

    await order.save();

    // Notify customer
    emailTemplates.paymentSubmitted(order).catch(e => console.error(e));
    notifyUser({
      user: req.user._id,
      title: `💳 Payment Details Submitted: ${order.orderId}`,
      message: `UTR ${trimmedUtr} received. We are verifying it against our bank records.`,
      type: 'PAYMENT_SUBMITTED',
      link: '/orders'
    }).catch(e => console.error(e));

    // Notify Admin of Payment to Verify
    notifyUser({
      isAdminNotification: true,
      title: `💰 Verify UPI Payment: Order ${order.orderId}`,
      message: `Customer ${payerName} submitted UTR: ${trimmedUtr} for ₹${order.totalAmount}. Click to verify.`,
      type: 'PAYMENT_SUBMITTED',
      link: '/admin/payments'
    }).catch(e => console.error(e));

    res.json({
      success: true,
      message: 'Payment details submitted successfully. Verification is in progress.',
      order
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Verify UPI Payment
const verifyUpiPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'VERIFIED';
    if (order.orderStatus === 'PENDING' || order.orderStatus === 'PAYMENT_SUBMITTED') {
      order.orderStatus = 'ACCEPTED';
    }
    order.upiDetails.verifiedAt = new Date();
    order.upiDetails.rejectionReason = '';

    order.statusHistory.push({
      status: order.orderStatus,
      comment: `UPI Payment VERIFIED by Admin (${req.user.name}). Amount ₹${order.totalAmount} received.`,
      updatedBy: req.user.name
    });

    await order.save();

    // Send notifications to customer
    emailTemplates.paymentVerified(order).catch(e => console.error(e));
    notifyUser({
      user: order.customer,
      title: `✅ Payment Verified: Order ${order.orderId}`,
      message: `Your payment of ₹${order.totalAmount} has been verified and your order is accepted!`,
      type: 'PAYMENT_VERIFIED',
      link: '/orders'
    }).catch(e => console.error(e));

    res.json({ success: true, message: 'Payment marked as verified successfully.', order });
  } catch (error) {
    next(error);
  }
};

// Admin: Reject UPI Payment
const rejectUpiPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderId }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const rejectionReason = reason || 'UTR could not be matched with our nursery bank account statement.';
    order.paymentStatus = 'REJECTED';
    order.upiDetails.rejectionReason = rejectionReason;

    order.statusHistory.push({
      status: order.orderStatus,
      comment: `UPI Payment REJECTED. Reason: ${rejectionReason}`,
      updatedBy: req.user.name
    });

    await order.save();

    // Send rejection email & notification
    emailTemplates.paymentRejected(order, rejectionReason).catch(e => console.error(e));
    notifyUser({
      user: order.customer,
      title: `⚠️ Payment Unverified: Order ${order.orderId}`,
      message: `Payment rejected: ${rejectionReason}. Please resubmit valid UTR.`,
      type: 'PAYMENT_REJECTED',
      link: '/orders'
    }).catch(e => console.error(e));

    res.json({ success: true, message: 'Payment marked as rejected.', order });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all payments list (pending, verified, rejected)
const getAllPayments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { paymentMethod: 'UPI' };

    if (status && status !== 'ALL') {
      query.paymentStatus = status;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { 'upiDetails.utr': { $regex: search, $options: 'i' } },
        { 'upiDetails.payerName': { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Order.find(query)
      .select('orderId customer customerName customerEmail totalAmount paymentMethod paymentStatus upiDetails orderStatus createdAt')
      .sort({ 'upiDetails.submittedAt': -1, createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUpiDetails,
  submitUpiPayment,
  verifyUpiPayment,
  rejectUpiPayment,
  getAllPayments
};
