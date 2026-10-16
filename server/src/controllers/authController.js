const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { emailTemplates } = require('../services/emailService');
const { notifyUser } = require('../services/pushService');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'nageswarreddy_necessary_plants_jwt_secret_secure_key_2026',
    { expiresIn: '30d' }
  );
};

// Customer Registration
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Role check: If email matches ADMIN_EMAIL from env, grant admin role
    const isAdmin = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: isAdmin ? 'admin' : 'customer'
    });

    const token = generateToken(user);

    // Send Welcome Email
    emailTemplates.welcome(user).catch(err => console.error('Welcome email error:', err.message));

    // Send in-app notification
    notifyUser({
      user: user._id,
      title: '🌿 Welcome to Nageswarreddy Nursery Plants!',
      message: 'Browse our collection of hand-tended indoor, fruit, flowering, and medicinal plants.',
      type: 'SYSTEM',
      link: '/shop'
    }).catch(err => console.error('Welcome notif error:', err.message));

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Customer / Admin Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    // Check if matching admin credentials directly from environment variables
    const isEnvAdminEmail = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const isEnvAdminPass = process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (isEnvAdminEmail && isEnvAdminPass) {
      // Ensure admin user exists in DB
      if (!user) {
        user = await User.create({
          name: 'Nageswarreddy Admin',
          email: process.env.ADMIN_EMAIL.toLowerCase(),
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
          phone: '+91 94901 23456'
        });
      } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    } else {
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User Profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('wishlist', 'name slug images price discountPrice isAvailable stock categoryName');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add Delivery Address
const addAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      mobile,
      houseNumber,
      street,
      villageTown,
      mandal,
      district,
      state,
      pinCode,
      landmark,
      deliveryInstructions,
      isDefault
    } = req.body;

    if (!fullName || !mobile || !houseNumber || !street || !villageTown || !mandal || !district || !state || !pinCode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory address fields: Full Name, Mobile, House/Door No, Street, Village/Town, Mandal, District, State, and PIN Code.'
      });
    }

    const user = await User.findById(req.user._id);

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    user.addresses.push({
      fullName,
      mobile,
      houseNumber,
      street,
      villageTown,
      mandal,
      district,
      state,
      pinCode,
      landmark: landmark || '',
      deliveryInstructions: deliveryInstructions || '',
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Update Delivery Address
const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Delete Delivery Address
const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    user.addresses.pull({ _id: addressId });
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Toggle Wishlist Item
const toggleWishlist = async (req, res, next) => {
  try {
    const { plantId } = req.body;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(plantId);
    let isAdded = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      isAdded = false;
    } else {
      user.wishlist.push(plantId);
      isAdded = true;
    }

    await user.save();
    res.json({ success: true, isAdded, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist
};
