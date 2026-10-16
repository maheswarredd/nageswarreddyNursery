const Category = require('../models/Category');
const Plant = require('../models/Plant');

// Get all categories with plant counts
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    
    // Enrich with actual plant count
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const count = await Plant.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          plantCount: count
        };
      })
    );

    res.json({ success: true, categories: enriched });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      icon: icon || 'Leaf',
      displayOrder: displayOrder || 0
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plantsCount = await Plant.countDocuments({ category: id });
    if (plantsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is assigned to ${plantsCount} plants. Reassign them first.`
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
