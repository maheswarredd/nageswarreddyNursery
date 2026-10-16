const Review = require('../models/Review');
const Plant = require('../models/Plant');
const Order = require('../models/Order');

// Customer: Add Review (Only permitted after a DELIVERED order)
const addReview = async (req, res, next) => {
  try {
    const { plantId, rating, comment, images } = req.body;

    if (!plantId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Plant ID, rating (1-5), and written comment are required.'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found.' });
    }

    // STRICT CHECK: Has user received a DELIVERED order with this plant?
    const deliveredOrder = await Order.findOne({
      customer: req.user._id,
      orderStatus: 'DELIVERED',
      'items.plant': plantId
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: 'Review blocked: Only verified buyers who have received a DELIVERED order of this plant can submit a review.'
      });
    }

    // Check if user already reviewed this plant
    const existingReview = await Review.findOne({
      customer: req.user._id,
      plant: plantId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this plant. Thank you!'
      });
    }

    const review = await Review.create({
      plant: plantId,
      customer: req.user._id,
      customerName: req.user.name,
      order: deliveredOrder._id,
      rating: numRating,
      comment: comment.trim(),
      images: Array.isArray(images) ? images : []
    });

    // Recalculate plant rating average and quantity
    const allReviews = await Review.find({ plant: plantId, isApproved: true });
    const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    plant.ratingsAverage = parseFloat(avg.toFixed(1));
    plant.ratingsQuantity = allReviews.length;
    await plant.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified purchase review has been published.',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get Reviews for a Plant
const getPlantReviews = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const reviews = await Review.find({ plant: plantId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('customer', 'name');

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Reviews
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .populate('plant', 'name images')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete / Moderate Review
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Recalculate plant rating
    const allReviews = await Review.find({ plant: review.plant, isApproved: true });
    const plant = await Plant.findById(review.plant);
    if (plant) {
      if (allReviews.length > 0) {
        const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        plant.ratingsAverage = parseFloat(avg.toFixed(1));
        plant.ratingsQuantity = allReviews.length;
      } else {
        plant.ratingsAverage = 5.0;
        plant.ratingsQuantity = 0;
      }
      await plant.save();
    }

    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getPlantReviews,
  getAllReviews,
  deleteReview
};
