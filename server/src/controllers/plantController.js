const Plant = require('../models/Plant');
const Category = require('../models/Category');
const User = require('../models/User');
const { emailTemplates } = require('../services/emailService');
const { notifyUser } = require('../services/pushService');

// Get All Plants with Search, Filtering, and Pagination
const getPlants = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sunlight,
      availability, // 'available' | 'soldout' | 'all'
      minPrice,
      maxPrice,
      sort,
      featured,
      popular,
      newArrival,
      page = 1,
      limit = 24
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { benefits: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      // Can be category ID or slug
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) query.category = catDoc._id;
      }
    }

    if (sunlight && sunlight !== 'all') {
      query.sunlightRequirement = { $regex: sunlight, $options: 'i' };
    }

    if (availability === 'available') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    } else if (availability === 'soldout') {
      query.$or = [{ isAvailable: false }, { stock: 0 }];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') query.isFeatured = true;
    if (popular === 'true') query.isPopular = true;
    if (newArrival === 'true') query.isNewArrival = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { ratingsAverage: -1 };
    else if (sort === 'popular') sortOption = { isPopular: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const totalPlants = await Plant.countDocuments(query);
    const plants = await Plant.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: plants.length,
      total: totalPlants,
      pages: Math.ceil(totalPlants / Number(limit)),
      currentPage: Number(page),
      plants
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Plant by Slug or ID
const getPlantBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let plant = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      plant = await Plant.findById(identifier).populate('category', 'name slug');
    }

    if (!plant) {
      plant = await Plant.findOne({ slug: identifier }).populate('category', 'name slug');
    }

    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found.' });
    }

    // Check related plants in the same category
    const relatedPlants = await Plant.find({
      category: plant.category._id || plant.category,
      _id: { $ne: plant._id }
    }).limit(4);

    res.json({ success: true, plant, relatedPlants });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Plant
const createPlant = async (req, res, next) => {
  try {
    const {
      name,
      category,
      images,
      description,
      price,
      discountPrice,
      stock,
      plantAge,
      height,
      potSize,
      sunlightRequirement,
      wateringRequirement,
      soilRequirement,
      growingInformation,
      benefits,
      plantingSeason,
      deliveryInformation,
      isFeatured,
      isPopular,
      isNewArrival
    } = req.body;

    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Plant name, category, price, and stock are required.' });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category selected.' });
    }

    // Generate unique slug
    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Plant.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const numStock = Number(stock);
    const plant = await Plant.create({
      name,
      slug,
      category: categoryDoc._id,
      categoryName: categoryDoc.name,
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80'],
      description: description || 'Healthy, pest-free organic plant nurtured at Nageswarreddy Nursery Plants.',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: numStock,
      isAvailable: numStock > 0,
      plantAge: plantAge || '6-12 Months',
      height: height || '1 - 1.5 Feet',
      potSize: potSize || '6 inch Nursery Pot',
      sunlightRequirement: sunlightRequirement || 'Bright Indirect Sunlight',
      wateringRequirement: wateringRequirement || 'Moderate watering when topsoil dries',
      soilRequirement: soilRequirement || 'Well-draining potting soil with compost',
      growingInformation: growingInformation || 'Keep in indirect light for 48 hours after receiving. Water gently and avoid direct scorching sun initially.',
      benefits: Array.isArray(benefits) ? benefits : (typeof benefits === 'string' ? benefits.split(',').map(b => b.trim()) : ['Air Purifying', 'Easy to Grow', 'Natural Aesthetics']),
      plantingSeason: plantingSeason || 'All Year Round',
      deliveryInformation: deliveryInformation || 'Safely packed in multi-layered ventilated protective boxes with moisture gel.',
      isFeatured: Boolean(isFeatured),
      isPopular: Boolean(isPopular),
      isNewArrival: Boolean(isNewArrival)
    });

    // Notify all users about New Plant Arrival
    notifyUser({
      title: `🌱 New Plant Added: ${plant.name}`,
      message: `Fresh batch of ${plant.name} is now available in our nursery!`,
      type: 'NEW_PLANT',
      link: `/plant/${plant.slug}`
    }).catch(err => console.error('Notification error:', err.message));

    res.status(201).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Plant
const updatePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);

    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found.' });
    }

    const oldStock = plant.stock;
    const wasSoldOut = !plant.isAvailable || plant.stock <= 0;

    // If category changed, update categoryName
    if (req.body.category && req.body.category !== String(plant.category)) {
      const cat = await Category.findById(req.body.category);
      if (cat) {
        req.body.categoryName = cat.name;
      }
    }

    // Process fields
    if (req.body.stock !== undefined) {
      const newStock = Number(req.body.stock);
      req.body.stock = newStock;
      req.body.isAvailable = newStock > 0;
    }

    Object.assign(plant, req.body);
    await plant.save();

    // Check if previously sold-out plant is now BACK IN STOCK
    if (wasSoldOut && plant.stock > 0 && plant.isAvailable) {
      // Find all users who wishlisted this plant
      const usersWithWishlist = await User.find({ wishlist: plant._id });
      for (const u of usersWithWishlist) {
        // Send email and in-app notification
        emailTemplates.backInStock(u, plant).catch(e => console.error('Back in stock email error:', e.message));
        notifyUser({
          user: u._id,
          title: `🌿 ${plant.name} is Back in Stock!`,
          message: `The plant from your wishlist is now ready for order. Hurry before stock finishes!`,
          type: 'BACK_IN_STOCK',
          link: `/plant/${plant.slug}`
        }).catch(e => console.error('Wishlist notification error:', e.message));
      }
    }

    res.json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Plant
const deletePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plant = await Plant.findByIdAndDelete(id);

    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found.' });
    }

    res.json({ success: true, message: 'Plant deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlants,
  getPlantBySlugOrId,
  createPlant,
  updatePlant,
  deletePlant
};
