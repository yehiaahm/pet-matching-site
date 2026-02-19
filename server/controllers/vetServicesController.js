/**
 * Vet Services Controller - Production Ready
 * Complete CRUD operations for veterinary services
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @desc    Create vet service
 * @route   POST /api/vet-services
 * @access  Private (admin only)
 */
const createVetService = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      description,
      category,
      price,
      duration,
      location,
      contactPhone,
      contactEmail,
      website,
      services,
      workingHours,
      images = [],
      rating = 0,
      verified = false
    } = req.body;

    // Validation
    if (!name || !description || !category || !price || !location || !contactPhone) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, category, price, location, and contact phone are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate category
    const validCategories = ['GENERAL', 'SURGERY', 'DENTAL', 'EMERGENCY', 'GROOMING', 'VACCINATION', 'CHECKUP'];
    if (!validCategories.includes(category.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be GENERAL, SURGERY, DENTAL, EMERGENCY, GROOMING, VACCINATION, or CHECKUP',
        timestamp: new Date().toISOString()
      });
    }

    // Create vet service
    const vetService = await prisma.vetService.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category.toUpperCase(),
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : null,
        location: location.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail ? contactEmail.trim() : null,
        website: website ? website.trim() : null,
        services: services || [],
        workingHours: workingHours || {},
        images,
        rating: parseFloat(rating),
        verified,
        createdBy: userId
      }
    });

    console.log(`✅ Vet service created: ${vetService.name} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: { vetService },
      message: 'Vet service created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create vet service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating vet service',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get all vet services
 * @route   GET /api/vet-services
 * @access  Public
 */
const getAllVetServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      location,
      verified = true,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const where = {
      verified: verified === 'true'
    };

    // Add filters
    if (category) {
      where.category = category.toUpperCase();
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          location: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Build sort object
    const orderBy = {};
    orderBy[sortBy] = sortOrder.toLowerCase();

    // Get vet services with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [vetServices, totalCount] = await Promise.all([
      prisma.vetService.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      prisma.vetService.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        vetServices,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get vet services error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching vet services',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get vet service by ID
 * @route   GET /api/vet-services/:id
 * @access  Public
 */
const getVetServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const vetService = await prisma.vetService.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    if (!vetService) {
      return res.status(404).json({
        success: false,
        error: 'Vet service not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: { vetService },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get vet service by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching vet service',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Update vet service
 * @route   PUT /api/vet-services/:id
 * @access  Private (admin or creator only)
 */
const updateVetService = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      name,
      description,
      category,
      price,
      duration,
      location,
      contactPhone,
      contactEmail,
      website,
      services,
      workingHours,
      images,
      verified
    } = req.body;

    // Check if vet service exists
    const existingService = await prisma.vetService.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Vet service not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check permissions (admin or creator)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (existingService.createdBy !== userId && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own vet services',
        timestamp: new Date().toISOString()
      });
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.toUpperCase();
    if (price) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
    if (location) updateData.location = location.trim();
    if (contactPhone) updateData.contactPhone = contactPhone.trim();
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail.trim() || null;
    if (website !== undefined) updateData.website = website.trim() || null;
    if (services !== undefined) updateData.services = services;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (images !== undefined) updateData.images = images;
    if (verified !== undefined && user.role === 'ADMIN') updateData.verified = verified;

    const updatedService = await prisma.vetService.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`✅ Vet service updated: ${updatedService.name} by user ${userId}`);

    res.status(200).json({
      success: true,
      data: { vetService: updatedService },
      message: 'Vet service updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update vet service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating vet service',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Delete vet service
 * @route   DELETE /api/vet-services/:id
 * @access  Private (admin or creator only)
 */
const deleteVetService = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if vet service exists
    const existingService = await prisma.vetService.findUnique({
      where: { id },
      select: { createdBy: true, name: true }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Vet service not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check permissions (admin or creator)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (existingService.createdBy !== userId && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own vet services',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.vetService.delete({
      where: { id }
    });

    console.log(`🗑️ Vet service deleted: ${existingService.name} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Vet service deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete vet service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting vet service',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Add review to vet service
 * @route   POST /api/vet-services/:id/reviews
 * @access  Private
 */
const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating is required and must be between 1 and 5',
        timestamp: new Date().toISOString()
      });
    }

    // Check if vet service exists
    const vetService = await prisma.vetService.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!vetService) {
      return res.status(404).json({
        success: false,
        error: 'Vet service not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already reviewed
    const existingReview = await prisma.vetServiceReview.findUnique({
      where: {
        userId_vetServiceId: {
          userId,
          vetServiceId: id
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this vet service',
        timestamp: new Date().toISOString()
      });
    }

    // Create review
    const review = await prisma.vetServiceReview.create({
      data: {
        userId,
        vetServiceId: id,
        rating: parseInt(rating),
        comment: comment ? comment.trim() : null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update average rating
    const allReviews = await prisma.vetServiceReview.findMany({
      where: { vetServiceId: id },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

    await prisma.vetService.update({
      where: { id },
      data: { rating: averageRating }
    });

    console.log(`⭐ Review added: ${rating} stars for vet service ${id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: { review },
      message: 'Review added successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Add review error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while adding review',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  createVetService,
  getAllVetServices,
  getVetServiceById,
  updateVetService,
  deleteVetService,
  addReview
};
