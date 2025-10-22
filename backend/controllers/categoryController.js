const Category = require('../models/Category');
const logger = require('../utils/logger');

// Pre-populate categories
const seedCategories = async () => {
  try {
    const categories = [
      {
        name: "Academic",
        description: "Subject-specific and academic clubs",
        icon: "📚",
        color: "#3B82F6",
        sortOrder: 1
      },
      {
        name: "Sports & Recreation",
        description: "Athletic and recreational activities",
        icon: "⚽",
        color: "#10B981",
        sortOrder: 2
      },
      {
        name: "Arts & Culture",
        description: "Creative and cultural activities",
        icon: "🎨",
        color: "#8B5CF6",
        sortOrder: 3
      },
      {
        name: "Technology",
        description: "Programming, robotics, and tech clubs",
        icon: "💻",
        color: "#F59E0B",
        sortOrder: 4
      },
      {
        name: "Community Service",
        description: "Volunteer and service organizations",
        icon: "🤝",
        color: "#EF4444",
        sortOrder: 5
      },
      {
        name: "Professional",
        description: "Career and professional development",
        icon: "💼",
        color: "#6B7280",
        sortOrder: 6
      },
      {
        name: "Special Interest",
        description: "Hobby and special interest groups",
        icon: "🌟",
        color: "#EC4899",
        sortOrder: 7
      },
      {
        name: "Greek Life",
        description: "Fraternities and sororities",
        icon: "🏛️",
        color: "#7C3AED",
        sortOrder: 8
      }
    ];

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        await Category.create(categoryData);
        logger.info(`Category created: ${categoryData.name}`);
      }
    }

    logger.info('Categories seeding completed');
  } catch (error) {
    logger.error('Error seeding categories:', error);
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
};

module.exports = {
  seedCategories,
  getCategories,
  getCategory
};
