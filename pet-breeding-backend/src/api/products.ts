// Product API Routes for AI Pet Shop
import express from 'express';
import { PrismaClient, Product, ProductCategory } from '@prisma/client';
import { AIRecommendationService } from '../services/aiRecommendations';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { isActive: true };

    // Build filters
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (brand) where.brand = { contains: brand as string, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { hasSome: [search as string] } },
        { brand: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (featured === 'true') where.isFeatured = true;

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: { rating: true }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    res.json({
      products: productsWithRating,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    res.json({
      ...product,
      averageRating,
      reviewCount: product.reviews.length
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      where: { parentId: null, isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get AI recommendations for a pet
router.get('/recommendations/:petId', authMiddleware, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Check if user owns the pet
    const pet = await prisma.pet.findFirst({
      where: { id: petId, ownerId: userId }
    });

    if (!pet) {
      return res.status(403).json({ error: 'Pet not found or access denied' });
    }

    // Try to get cached recommendations first
    const cachedRecommendations = await AIRecommendationService.getSavedRecommendations(userId, petId);
    
    if (cachedRecommendations.length > 0) {
      return res.json({
        recommendations: cachedRecommendations,
        cached: true
      });
    }

    // Generate new recommendations
    const recommendations = await AIRecommendationService.generateRecommendations(
      petId,
      userId,
      Number(limit)
    );

    // Save recommendations to cache
    await AIRecommendationService.saveRecommendations(userId, petId, recommendations);

    res.json({
      recommendations: recommendations.map(rec => ({
        ...rec,
        product: {
          ...rec.product,
          averageRating: rec.product.reviews.length > 0 
            ? rec.product.reviews.reduce((sum, review) => sum + review.rating, 0) / rec.product.reviews.length
            : 0,
          reviewCount: rec.product.reviews.length
        }
      })),
      cached: false
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        category: true,
        reviews: {
          select: { rating: true }
        }
      },
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    res.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: id },
        category: product.category,
        isActive: true
      },
      include: {
        category: true,
        reviews: {
          select: { rating: true }
        }
      },
      take: Number(limit),
      orderBy: { rating: 'desc' }
    });

    const productsWithRating = relatedProducts.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    res.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ error: 'Failed to fetch related products' });
  }
});

// Search products with advanced filters
router.post('/search', async (req, res) => {
  try {
    const {
      query,
      filters = {},
      pagination = {},
      sort = { createdAt: 'desc' }
    } = req.body;

    const where: any = { isActive: true };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
        { brand: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Apply filters
    if (filters.category) where.category = filters.category;
    if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters.priceRange) {
      where.price = {};
      if (filters.priceRange.min) where.price.gte = filters.priceRange.min;
      if (filters.priceRange.max) where.price.lte = filters.priceRange.max;
    }
    if (filters.rating) where.rating = { gte: filters.rating };
    if (filters.inStock) where.stock = { gt: 0 };

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy = Object.entries(sort).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: { select: { rating: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    res.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Track recommendation click
router.post('/recommendations/track-click', authMiddleware, async (req, res) => {
  try {
    const { recommendationId, productId } = req.body;
    const userId = req.user.id;

    await prisma.aIRecommendation.updateMany({
      where: {
        id: recommendationId,
        userId,
        productId
      },
      data: { isClicked: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Track recommendation purchase
router.post('/recommendations/track-purchase', authMiddleware, async (req, res) => {
  try {
    const { recommendationId, productId } = req.body;
    const userId = req.user.id;

    await prisma.aIRecommendation.updateMany({
      where: {
        id: recommendationId,
        userId,
        productId
      },
      data: { isPurchased: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking purchase:', error);
    res.status(500).json({ error: 'Failed to track purchase' });
  }
});

export default router;
