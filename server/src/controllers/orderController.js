const Order = require('../models/Order');
const Plant = require('../models/Plant');
const Setting = require('../models/Setting');
const { emailTemplates } = require('../services/emailService');
const { notifyUser } = require('../services/pushService');
const { generateInvoiceHtml } = require('../services/invoiceService');

// Create New Order (With strict server-side price and stock validation)
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.mobile || !deliveryAddress.houseNumber || !deliveryAddress.street || !deliveryAddress.villageTown || !deliveryAddress.mandal || !deliveryAddress.district || !deliveryAddress.state || !deliveryAddress.pinCode) {
      return res.status(400).json({
        success: false,
        message: 'All delivery address fields are mandatory (Name, Mobile, House No, Street, Village/Town, Mandal, District, State, PIN).'
      });
    }

    if (!['COD', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method selected.' });
    }

    // 1. Fetch store settings for delivery charges
    const settings = (await Setting.findOne()) || { deliveryCharge: 49, freeDeliveryThreshold: 499 };

    // 2. Validate all plants and quantities atomically against database
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const plant = await Plant.findById(item.plantId || item._id || item.plant);
      if (!plant) {
        return res.status(400).json({
          success: false,
          message: `Plant with ID "${item.plantId || item._id}" is no longer available in our nursery catalog.`
        });
      }

      if (plant.stock <= 0 || !plant.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${plant.name}" is currently SOLD OUT. Please remove it from your cart to proceed.`
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (plant.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${plant.stock} units of "${plant.name}" available in stock, but ${qty} was requested.`
        });
      }

      // Secure server-side unit price validation
      const unitPrice = plant.discountPrice && plant.discountPrice > 0 ? plant.discountPrice : plant.price;
      const itemTotal = unitPrice * qty;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        plant: plant._id,
        name: plant.name,
        image: plant.images && plant.images.length > 0 ? plant.images[0] : '',
        price: unitPrice,
        quantity: qty,
        total: itemTotal
      });
    }

    // 3. Calculate delivery charge
    const deliveryCharge = calculatedSubtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge;
    const totalAmount = calculatedSubtotal + deliveryCharge;

    // 4. Decrement stock atomically and update plant availability
    for (const it of validatedItems) {
      const plant = await Plant.findById(it.plant);
      plant.stock = Math.max(0, plant.stock - it.quantity);
      if (plant.stock === 0) {
        plant.isAvailable = false;
      }
      await plant.save();
    }

    // 5. Generate human-readable Order ID
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `NNP-${dateStr}-${randomSuffix}`;

    // 6. Create the Order
    const order = await Order.create({
      orderId,
      customer: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || deliveryAddress.mobile,
      items: validatedItems,
      deliveryAddress,
      subtotal: calculatedSubtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      statusHistory: [{
        status: 'PENDING',
        comment: `Order placed via ${paymentMethod}.`,
        updatedBy: req.user.name
      }]
    });

    // 7. Send In-App & Web Push Notification to Customer
    notifyUser({
      user: req.user._id,
      title: `🌱 Order Placed: ${order.orderId}`,
      message: `Your plant order of ₹${order.totalAmount} has been received.`,
      type: 'ORDER_PLACED',
      link: `/orders`
    }).catch(err => console.error('Push error:', err.message));

    // 8. Send Notification to Admin
    notifyUser({
      isAdminNotification: true,
      title: `🛒 New Order: ${order.orderId}`,
      message: `New ${paymentMethod} order placed for ₹${order.totalAmount} by ${req.user.name}.`,
      type: 'ORDER_PLACED',
      link: `/admin/orders`
    }).catch(err => console.error('Admin push error:', err.message));

    // 9. Send Confirmation Email via Brevo
    emailTemplates.orderConfirmation(order).catch(err => console.error('Order email error:', err.message));

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Get My Orders (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.plant', 'name slug images');

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// Get Single Order By ID (Customer or Admin)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }]
    }).populate('items.plant', 'name slug images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Customer: Cancel Order
const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }],
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Can only cancel if order is PENDING, PAYMENT_SUBMITTED, or ACCEPTED
    const cancellableStatuses = ['PENDING', 'PAYMENT_SUBMITTED', 'ACCEPTED'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage (${order.orderStatus}). Please contact customer support.`
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancellation = {
      requestedBy: 'customer',
      reason: reason || 'Customer requested cancellation',
      details: details || '',
      cancelledAt: new Date()
    };
    order.statusHistory.push({
      status: 'CANCELLED',
      comment: `Customer cancelled order. Reason: ${reason || 'Customer request'}`,
      updatedBy: req.user.name
    });

    await order.save();

    // Restock the items
    for (const it of order.items) {
      const plant = await Plant.findById(it.plant);
      if (plant) {
        plant.stock += it.quantity;
        if (plant.stock > 0) plant.isAvailable = true;
        await plant.save();
      }
    }

    // Send notifications & email
    emailTemplates.cancelled(order).catch(e => console.error(e));
    notifyUser({
      user: order.customer,
      title: `❌ Order Cancelled: ${order.orderId}`,
      message: `Your cancellation request has been completed.`,
      type: 'ORDER_CANCELLED',
      link: '/orders'
    }).catch(e => console.error(e));

    notifyUser({
      isAdminNotification: true,
      title: `⚠️ Order Cancelled by Customer`,
      message: `Order ${order.orderId} was cancelled by ${req.user.name}.`,
      type: 'ORDER_CANCELLED',
      link: '/admin/orders'
    }).catch(e => console.error(e));

    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Orders with Advanced Filtering
const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentMethod, paymentStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'ALL') query.orderStatus = status;
    if (paymentMethod && paymentMethod !== 'ALL') query.paymentMethod = paymentMethod;
    if (paymentStatus && paymentStatus !== 'ALL') query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { 'upiDetails.utr': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.district': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.pinCode': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('items.plant', 'name images');

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / Number(limit)),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Order Status (ACCEPTED, PROCESSING, READY_FOR_DELIVERY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment, cancellationReason, cancellationDetails } = req.body;

    const validStatuses = [
      'PENDING',
      'PAYMENT_SUBMITTED',
      'ACCEPTED',
      'PROCESSING',
      'READY_FOR_DELIVERY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status code.' });
    }

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'DELIVERED') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = 'VERIFIED'; // COD collected
      }
    }

    if (status === 'CANCELLED') {
      if (!cancellationReason) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required (e.g. plant unavailable, payment not verified, invalid address, delivery unavailable, stock issue, customer requested cancellation, or other).'
        });
      }
      order.cancellation = {
        requestedBy: 'admin',
        reason: cancellationReason,
        details: cancellationDetails || comment || '',
        cancelledAt: new Date()
      };

      // Restock items if previous status was not already cancelled
      if (previousStatus !== 'CANCELLED') {
        for (const it of order.items) {
          const plant = await Plant.findById(it.plant);
          if (plant) {
            plant.stock += it.quantity;
            if (plant.stock > 0) plant.isAvailable = true;
            await plant.save();
          }
        }
      }
    }

    order.statusHistory.push({
      status,
      comment: comment || `Status updated to ${status} by Nursery Admin.`,
      updatedBy: req.user.name || 'Admin'
    });

    await order.save();

    // Trigger specific email & push notifications based on status
    if (status === 'ACCEPTED') {
      emailTemplates.orderAccepted(order).catch(e => console.error(e));
      notifyUser({
        user: order.customer,
        title: `🌿 Order Accepted: ${order.orderId}`,
        message: `Your plants have been accepted and are undergoing health check!`,
        type: 'ORDER_ACCEPTED',
        link: '/orders'
      }).catch(e => console.error(e));
    } else if (status === 'OUT_FOR_DELIVERY') {
      emailTemplates.outForDelivery(order).catch(e => console.error(e));
      notifyUser({
        user: order.customer,
        title: `🚚 Out For Delivery: ${order.orderId}`,
        message: `Your plants are arriving today!`,
        type: 'OUT_FOR_DELIVERY',
        link: '/orders'
      }).catch(e => console.error(e));
    } else if (status === 'DELIVERED') {
      emailTemplates.delivered(order).catch(e => console.error(e));
      notifyUser({
        user: order.customer,
        title: `🎉 Plants Delivered! [${order.orderId}]`,
        message: `Your plants have arrived! Please leave a review to help others.`,
        type: 'ORDER_DELIVERED',
        link: '/orders'
      }).catch(e => console.error(e));
    } else if (status === 'CANCELLED') {
      emailTemplates.cancelled(order).catch(e => console.error(e));
      notifyUser({
        user: order.customer,
        title: `❌ Order Cancelled: ${order.orderId}`,
        message: `Order cancelled. Reason: ${cancellationReason}`,
        type: 'ORDER_CANCELLED',
        link: '/orders'
      }).catch(e => console.error(e));
    } else {
      notifyUser({
        user: order.customer,
        title: `📦 Order Update: ${order.orderId}`,
        message: `Status updated to: ${status}`,
        type: 'ORDER_PROCESSING',
        link: '/orders'
      }).catch(e => console.error(e));
    }

    res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (error) {
    next(error);
  }
};

// Admin: Set Order Delay
const delayOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, expectedDeliveryDate, message } = req.body;

    const validReasons = [
      'weather',
      'plant preparation',
      'transport issue',
      'address issue',
      'high order volume',
      'stock issue',
      'other'
    ];

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: `Delay reason is required. Allowed options: ${validReasons.join(', ')}`
      });
    }

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.delayInfo = {
      isDelayed: true,
      reason,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      message: message || `Delivery rescheduled due to ${reason}.`,
      updatedAt: new Date()
    };

    order.statusHistory.push({
      status: order.orderStatus,
      comment: `Delivery Delay Notice: ${reason}. Expected: ${expectedDeliveryDate || 'TBD'}`,
      updatedBy: req.user.name || 'Admin'
    });

    await order.save();

    // Send Delay Notification & Email
    emailTemplates.orderDelayed(order).catch(e => console.error(e));
    notifyUser({
      user: order.customer,
      title: `⏳ Delivery Update: ${order.orderId}`,
      message: `Your plant dispatch has been rescheduled due to ${reason}. Expected: ${new Date(expectedDeliveryDate).toLocaleDateString()}`,
      type: 'ORDER_DELAYED',
      link: '/orders'
    }).catch(e => console.error(e));

    res.json({ success: true, message: 'Order delay recorded and customer notified.', order });
  } catch (error) {
    next(error);
  }
};

// Download / View Invoice HTML
const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }]
    });

    if (!order) {
      return res.status(404).send('<h2>Order not found</h2>');
    }

    // Permission check
    if (req.user && req.user.role !== 'admin' && String(order.customer) !== String(req.user._id)) {
      return res.status(403).send('<h2>Unauthorized</h2>');
    }

    const settings = (await Setting.findOne()) || {};
    const html = generateInvoiceHtml(order, settings);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
  delayOrder,
  getInvoice
};
