const Query = require('../models/Query');
const { emailTemplates } = require('../services/emailService');
const { notifyUser } = require('../services/pushService');

// Customer: Create Query Ticket
const createQuery = async (req, res, next) => {
  try {
    const { category, subject, description, orderId } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and detailed description are required.'
      });
    }

    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    const query = await Query.create({
      ticketId,
      customer: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      orderId: orderId || '',
      category,
      subject,
      description,
      status: 'OPEN',
      messages: [{
        sender: 'customer',
        senderName: req.user.name,
        message: description
      }]
    });

    // Notify Admin of New Support Query
    notifyUser({
      isAdminNotification: true,
      title: `📩 New Support Query: ${ticketId}`,
      message: `${req.user.name} submitted ticket for "${category}": ${subject}`,
      type: 'SUPPORT_REPLY',
      link: '/admin/queries'
    }).catch(e => console.error(e));

    res.status(201).json({ success: true, message: 'Support ticket submitted successfully.', query });
  } catch (error) {
    next(error);
  }
};

// Customer: Get My Queries
const getMyQueries = async (req, res, next) => {
  try {
    const queries = await Query.find({ customer: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, queries });
  } catch (error) {
    next(error);
  }
};

// Customer / Admin: Get Single Query
const getQueryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = await Query.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketId: id }]
    });

    if (!query) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (req.user.role !== 'admin' && String(query.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, query });
  } catch (error) {
    next(error);
  }
};

// Customer / Admin: Add Message / Reply to Query
const addMessageToQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const query = await Query.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketId: id }]
    });

    if (!query) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const senderRole = isAdmin ? 'admin' : 'customer';

    query.messages.push({
      sender: senderRole,
      senderName: req.user.name,
      message: message.trim()
    });

    // If admin replies, update status to IN_PROGRESS if it was OPEN
    if (isAdmin && query.status === 'OPEN') {
      query.status = 'IN_PROGRESS';
    }

    await query.save();

    // If admin replied, send email and push to customer
    if (isAdmin) {
      emailTemplates.supportReply(query, message).catch(e => console.error(e));
      notifyUser({
        user: query.customer,
        title: `💬 Reply on Support Ticket ${query.ticketId}`,
        message: `Admin replied: "${message.substring(0, 80)}..."`,
        type: 'SUPPORT_REPLY',
        link: '/support'
      }).catch(e => console.error(e));
    } else {
      // If customer replied, notify admin
      notifyUser({
        isAdminNotification: true,
        title: `💬 Customer Response: ${query.ticketId}`,
        message: `${req.user.name} responded to ticket: "${message.substring(0, 80)}..."`,
        type: 'SUPPORT_REPLY',
        link: '/admin/queries'
      }).catch(e => console.error(e));
    }

    res.json({ success: true, query });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Queries with Filtering (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
const getAllQueries = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status !== 'ALL') filter.status = status;
    if (category && category !== 'ALL') filter.category = category;

    if (search) {
      filter.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } }
      ];
    }

    const queries = await Query.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, count: queries.length, queries });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Query Status
const updateQueryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const query = await Query.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketId: id }]
    });

    if (!query) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    await query.save();

    notifyUser({
      user: query.customer,
      title: `Support Ticket ${query.ticketId} Marked ${query.status}`,
      message: `Your query regarding "${query.subject}" has been marked as ${query.status}.`,
      type: 'SUPPORT_REPLY',
      link: '/support'
    }).catch(e => console.error(e));

    res.json({ success: true, message: `Ticket status updated to ${query.status}.`, query });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuery,
  getMyQueries,
  getQueryById,
  addMessageToQuery,
  getAllQueries,
  updateQueryStatus
};
