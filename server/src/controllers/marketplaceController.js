import prisma from '../prisma/client.js';
import { AppError } from '../utils/appError.js';

const MARKETPLACE_CATEGORIES = ['FOOD', 'TOYS', 'ACCESSORIES', 'MEDICAL', 'GROOMING'];

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildCatalogImageUrl = (name, category) => {
  const categoryImagePools = {
    FOOD: ['/marketplace-images/food.svg'],
    TOYS: ['/marketplace-images/toys.svg'],
    ACCESSORIES: ['/marketplace-images/accessories.svg'],
    MEDICAL: ['/marketplace-images/medical.svg'],
    GROOMING: ['/marketplace-images/grooming.svg'],
  };

  const fallbackPool = ['/marketplace-images/accessories.svg'];
  const pool = categoryImagePools[category] || fallbackPool;
  const index = hashString(`${name}-${category}`) % pool.length;
  return pool[index];
};

const DEFAULT_MARKETPLACE_PRODUCTS = [
  { name: 'Premium Dry Cat Food 2kg', category: 'FOOD', price: 19.99, stock: 120, description: 'Balanced dry food for adult cats.', images: ['https://placehold.co/600x400?text=Cat+Food'] },
  { name: 'Kitten Growth Formula 1.5kg', category: 'FOOD', price: 17.5, stock: 95, description: 'High-protein formula for kittens.', images: ['https://placehold.co/600x400?text=Kitten+Food'] },
  { name: 'Adult Dog Dry Food 5kg', category: 'FOOD', price: 32.0, stock: 140, description: 'Complete nutrition for active dogs.', images: ['https://placehold.co/600x400?text=Dog+Food'] },
  { name: 'Puppy Starter Kibble 3kg', category: 'FOOD', price: 24.75, stock: 110, description: 'Easy-digest puppy kibble for healthy growth.', images: ['https://placehold.co/600x400?text=Puppy+Food'] },
  { name: 'Bird Seed Mix 1kg', category: 'FOOD', price: 8.99, stock: 180, description: 'Vitamin-rich seed blend for pet birds.', images: ['https://placehold.co/600x400?text=Bird+Seed'] },
  { name: 'Rabbit Pellets 2kg', category: 'FOOD', price: 12.5, stock: 130, description: 'Fiber-rich rabbit pellet feed.', images: ['https://placehold.co/600x400?text=Rabbit+Food'] },
  { name: 'Aquarium Fish Flakes 500g', category: 'FOOD', price: 9.25, stock: 200, description: 'Floating flakes for tropical fish.', images: ['https://placehold.co/600x400?text=Fish+Food'] },
  { name: 'Canned Cat Wet Food Pack', category: 'FOOD', price: 14.0, stock: 160, description: 'Mixed flavors wet food combo pack.', images: ['https://placehold.co/600x400?text=Wet+Food'] },
  { name: 'Pet Water Fountain 2L', category: 'ACCESSORIES', price: 28.99, stock: 70, description: 'Automatic filtered water fountain for cats and small dogs.', images: ['https://placehold.co/600x400?text=Water+Fountain'] },
  { name: 'Stainless Steel Double Bowl Set', category: 'ACCESSORIES', price: 11.99, stock: 150, description: 'Food and water bowl set with anti-slip base.', images: ['https://placehold.co/600x400?text=Feeding+Bowl'] },
  { name: 'Travel Bottle for Pets 550ml', category: 'ACCESSORIES', price: 10.5, stock: 100, description: 'Portable water bottle for walks and travel.', images: ['https://placehold.co/600x400?text=Travel+Bottle'] },
  { name: 'Interactive Dog Ball Launcher', category: 'TOYS', price: 25.99, stock: 65, description: 'Active play toy for energetic dogs.', images: ['https://placehold.co/600x400?text=Dog+Toy'] },
  { name: 'Cat Teaser Wand Set', category: 'TOYS', price: 7.99, stock: 170, description: 'Feather teaser wands for cat exercise.', images: ['https://placehold.co/600x400?text=Cat+Wand'] },
  { name: 'Chew Rope Toy Pack', category: 'TOYS', price: 13.5, stock: 145, description: 'Durable chew ropes for dental support.', images: ['https://placehold.co/600x400?text=Rope+Toy'] },
  { name: 'Puzzle Treat Dispenser', category: 'TOYS', price: 16.25, stock: 90, description: 'Mental stimulation toy with reward chamber.', images: ['https://placehold.co/600x400?text=Puzzle+Toy'] },
  { name: 'Hamster Exercise Wheel', category: 'TOYS', price: 12.99, stock: 85, description: 'Silent exercise wheel for small pets.', images: ['https://placehold.co/600x400?text=Hamster+Wheel'] },
  { name: 'Plush Squeaky Toy Set', category: 'TOYS', price: 15.0, stock: 125, description: 'Soft squeaky toys for indoor fun.', images: ['https://placehold.co/600x400?text=Plush+Toy'] },
  { name: 'Adjustable Dog Harness', category: 'ACCESSORIES', price: 18.49, stock: 105, description: 'Comfort-fit harness for daily walks.', images: ['https://placehold.co/600x400?text=Dog+Harness'] },
  { name: 'Reflective Pet Leash 1.5m', category: 'ACCESSORIES', price: 9.75, stock: 160, description: 'Night-safe reflective leash.', images: ['https://placehold.co/600x400?text=Pet+Leash'] },
  { name: 'Cat Litter Box with Scoop', category: 'ACCESSORIES', price: 22.0, stock: 95, description: 'Spacious litter box set with scoop.', images: ['https://placehold.co/600x400?text=Litter+Box'] },
  { name: 'Orthopedic Pet Bed Medium', category: 'ACCESSORIES', price: 34.99, stock: 60, description: 'Memory foam bed for joints support.', images: ['https://placehold.co/600x400?text=Pet+Bed'] },
  { name: 'Pet Carrier Bag Airline Approved', category: 'ACCESSORIES', price: 39.99, stock: 55, description: 'Ventilated travel carrier for cats and small dogs.', images: ['https://placehold.co/600x400?text=Pet+Carrier'] },
  { name: 'Aquarium Water Conditioner 250ml', category: 'MEDICAL', price: 6.99, stock: 140, description: 'Removes chlorine and protects fish.', images: ['https://placehold.co/600x400?text=Water+Conditioner'] },
  { name: 'Pet First Aid Kit', category: 'MEDICAL', price: 21.5, stock: 80, description: 'Essential first aid tools for pets.', images: ['https://placehold.co/600x400?text=First+Aid'] },
  { name: 'Calcium Supplement Chews', category: 'MEDICAL', price: 13.75, stock: 110, description: 'Bone and teeth support supplement.', images: ['https://placehold.co/600x400?text=Supplements'] },
  { name: 'Omega-3 Skin & Coat Oil 200ml', category: 'MEDICAL', price: 18.0, stock: 90, description: 'Supports skin health and shiny coat.', images: ['https://placehold.co/600x400?text=Omega+Oil'] },
  { name: 'Pet Ear Cleaning Solution', category: 'MEDICAL', price: 8.5, stock: 135, description: 'Gentle ear cleaner for dogs and cats.', images: ['https://placehold.co/600x400?text=Ear+Cleaner'] },
  { name: 'Antiparasitic Spot-On Drops', category: 'MEDICAL', price: 20.25, stock: 100, description: 'Monthly parasite protection drops.', images: ['https://placehold.co/600x400?text=Spot-On'] },
  { name: 'De-shedding Grooming Brush', category: 'GROOMING', price: 14.99, stock: 145, description: 'Reduces loose hair and tangles.', images: ['https://placehold.co/600x400?text=Grooming+Brush'] },
  { name: 'Pet Shampoo Sensitive Skin 500ml', category: 'GROOMING', price: 11.5, stock: 150, description: 'Mild shampoo for sensitive skin.', images: ['https://placehold.co/600x400?text=Pet+Shampoo'] },
  { name: 'Nail Clipper with Safety Guard', category: 'GROOMING', price: 9.99, stock: 130, description: 'Safe trimming tool for nails.', images: ['https://placehold.co/600x400?text=Nail+Clipper'] },
  { name: 'Pet Dental Care Kit', category: 'GROOMING', price: 12.99, stock: 120, description: 'Toothbrush and enzymatic toothpaste kit.', images: ['https://placehold.co/600x400?text=Dental+Kit'] },
  { name: 'Dog Paw Balm 60g', category: 'GROOMING', price: 8.25, stock: 115, description: 'Moisturizing balm for dry paws.', images: ['https://placehold.co/600x400?text=Paw+Balm'] },
  { name: 'Bird Cage Cleaning Spray', category: 'GROOMING', price: 7.5, stock: 90, description: 'Safe cleaner for cage hygiene.', images: ['https://placehold.co/600x400?text=Cage+Cleaner'] },
  { name: 'Senior Cat Urinary Care Dry Food 2kg', category: 'FOOD', price: 23.5, stock: 100, description: 'Specialized urinary support formula for senior cats.', images: ['https://placehold.co/600x400?text=Senior+Cat+Food'] },
  { name: 'Dog Joint Support Wet Food 12 Cans', category: 'FOOD', price: 26.99, stock: 85, description: 'Wet food enriched with glucosamine for joint care.', images: ['https://placehold.co/600x400?text=Dog+Wet+Food'] },
  { name: 'Parrot Premium Fruit Mix 800g', category: 'FOOD', price: 13.25, stock: 120, description: 'Nutrient-rich fruit and seed blend for parrots.', images: ['https://placehold.co/600x400?text=Parrot+Mix'] },
  { name: 'Turtle Sticks Floating Food 1kg', category: 'FOOD', price: 11.75, stock: 95, description: 'Floating sticks for aquatic turtles.', images: ['https://placehold.co/600x400?text=Turtle+Food'] },
  { name: 'Guinea Pig Timothy Hay 2kg', category: 'FOOD', price: 15.99, stock: 140, description: 'High-fiber timothy hay for guinea pigs.', images: ['https://placehold.co/600x400?text=Timothy+Hay'] },
  { name: 'Electrolyte Hydration Powder for Pets', category: 'MEDICAL', price: 9.99, stock: 130, description: 'Hydration support mix for recovery and hot weather.', images: ['https://placehold.co/600x400?text=Hydration+Powder'] },
  { name: 'Pet Drinking Bottle with Cage Clip', category: 'ACCESSORIES', price: 6.5, stock: 180, description: 'Leak-resistant drinking bottle for rabbits and rodents.', images: ['https://placehold.co/600x400?text=Drinking+Bottle'] },
  { name: 'Automatic Pet Water Dispenser 3L', category: 'ACCESSORIES', price: 24.5, stock: 90, description: 'Gravity-fed water dispenser for longer hydration.', images: ['https://placehold.co/600x400?text=Water+Dispenser'] },
  { name: 'Ceramic Cat Water Bowl', category: 'ACCESSORIES', price: 12.25, stock: 150, description: 'Whisker-friendly shallow ceramic bowl.', images: ['https://placehold.co/600x400?text=Ceramic+Bowl'] },
  { name: 'Dog Training Clicker Set', category: 'ACCESSORIES', price: 8.0, stock: 160, description: 'Positive reinforcement clickers with wrist straps.', images: ['https://placehold.co/600x400?text=Training+Clicker'] },
  { name: 'Cat Scratching Post with Ball', category: 'TOYS', price: 27.75, stock: 88, description: 'Scratching post with interactive hanging ball.', images: ['https://placehold.co/600x400?text=Scratching+Post'] },
  { name: 'Dog Tug-of-War Ring', category: 'TOYS', price: 10.75, stock: 140, description: 'Durable ring toy for pulling games.', images: ['https://placehold.co/600x400?text=Tug+Ring'] },
  { name: 'Bird Mirror Swing Toy', category: 'TOYS', price: 9.5, stock: 115, description: 'Colorful swing toy with mirror for birds.', images: ['https://placehold.co/600x400?text=Bird+Swing'] },
  { name: 'Aquarium Bubble Stone Kit', category: 'TOYS', price: 8.99, stock: 100, description: 'Decorative bubble stone for fish tanks.', images: ['https://placehold.co/600x400?text=Bubble+Stone'] },
  { name: 'Rabbit Tunnel Play Tube', category: 'TOYS', price: 14.5, stock: 90, description: 'Foldable tunnel for rabbit exploration.', images: ['https://placehold.co/600x400?text=Rabbit+Tunnel'] },
  { name: 'Flea & Tick Comb Stainless Steel', category: 'GROOMING', price: 7.99, stock: 170, description: 'Fine-tooth comb for parasite and debris removal.', images: ['https://placehold.co/600x400?text=Flea+Comb'] },
  { name: 'Cat Tear Stain Remover Pads', category: 'GROOMING', price: 10.25, stock: 130, description: 'Soft pads for cleaning around cat eyes.', images: ['https://placehold.co/600x400?text=Tear+Pads'] },
  { name: 'Dog Coat Conditioner Spray', category: 'GROOMING', price: 11.0, stock: 125, description: 'Leave-in spray for smooth and shiny fur.', images: ['https://placehold.co/600x400?text=Coat+Spray'] },
  { name: 'Paw Cleaning Cup for Dogs', category: 'GROOMING', price: 13.5, stock: 115, description: 'Quick mud-removal paw cleaner cup.', images: ['https://placehold.co/600x400?text=Paw+Cleaner'] },
  { name: 'Pet Probiotic Digestive Chews', category: 'MEDICAL', price: 16.5, stock: 110, description: 'Daily probiotic support for gut health.', images: ['https://placehold.co/600x400?text=Probiotic+Chews'] },
  { name: 'Fish Anti-Fungal Treatment 120ml', category: 'MEDICAL', price: 12.0, stock: 80, description: 'Aquarium treatment for fungal infections.', images: ['https://placehold.co/600x400?text=Fish+Treatment'] },
  { name: 'Pet Multivitamin Tablets 60ct', category: 'MEDICAL', price: 14.75, stock: 140, description: 'Daily vitamins for overall pet wellness.', images: ['https://placehold.co/600x400?text=Multivitamin'] },
  { name: 'Small Animal Nail Trimmer', category: 'GROOMING', price: 8.75, stock: 105, description: 'Compact trimmer for rabbits and rodents.', images: ['https://placehold.co/600x400?text=Small+Nail+Trimmer'] },
  { name: 'Catnip Ball Wall Toy 3-Pack', category: 'TOYS', price: 9.25, stock: 135, description: 'Stick-on wall catnip roller balls.', images: ['https://placehold.co/600x400?text=Catnip+Toy'] },
  { name: 'Dog Slow Feeder Bowl Large', category: 'ACCESSORIES', price: 15.5, stock: 95, description: 'Slows eating speed to improve digestion.', images: ['https://placehold.co/600x400?text=Slow+Feeder'] },
  { name: 'Bird Mineral Block 4-Pack', category: 'MEDICAL', price: 7.25, stock: 150, description: 'Calcium mineral blocks for birds beak and bone health.', images: ['https://placehold.co/600x400?text=Mineral+Block'] },
  { name: 'Aquarium pH Test Strips 100ct', category: 'MEDICAL', price: 10.99, stock: 120, description: 'Fast aquarium water pH monitoring strips.', images: ['https://placehold.co/600x400?text=PH+Test'] },
  { name: 'Rodent Cage Bedding 10L', category: 'ACCESSORIES', price: 9.5, stock: 160, description: 'Dust-free absorbent bedding for hamsters and guinea pigs.', images: ['https://placehold.co/600x400?text=Cage+Bedding'] },
  { name: 'Pet Cooling Mat Summer Edition', category: 'ACCESSORIES', price: 21.99, stock: 85, description: 'Self-cooling mat for hot weather comfort.', images: ['https://placehold.co/600x400?text=Cooling+Mat'] },
];

const ensureMarketplaceSeedCatalog = async () => {
  const seller = await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: 'marketplace@petmat.local' } });

    if (!user) {
      user = await tx.user.create({
        data: {
          name: 'PETMAT Marketplace',
          email: 'marketplace@petmat.local',
          password: 'seeded-catalog-account',
          role: 'admin',
          isVerified: true,
        },
      });
    }

    const sellerAccount = await tx.sellerAccount.upsert({
      where: { userId: user.id },
      update: {
        storeName: 'PETMAT Official Store',
        description: 'Official PETMAT catalog of food, drinks, toys, accessories, medical, and grooming essentials.',
        isActive: true,
      },
      create: {
        userId: user.id,
        storeName: 'PETMAT Official Store',
        description: 'Official PETMAT catalog of food, drinks, toys, accessories, medical, and grooming essentials.',
        commissionRate: 10,
        isActive: true,
      },
    });

    return sellerAccount;
  });

  const existing = await prisma.product.findMany({
    where: { sellerId: seller.id },
    select: { name: true },
  });

  const existingNames = new Set(existing.map((item) => item.name));
  const missingProducts = DEFAULT_MARKETPLACE_PRODUCTS.filter((item) => !existingNames.has(item.name));

  if (missingProducts.length > 0) {
    await prisma.product.createMany({
      data: missingProducts.map((product) => ({
        sellerId: seller.id,
        ...product,
        images: [buildCatalogImageUrl(product.name, product.category)],
        isActive: true,
      })),
    });
  }

  const officialProducts = await prisma.product.findMany({
    where: { sellerId: seller.id },
    select: {
      id: true,
      name: true,
      category: true,
      images: true,
    },
  });

  const productsToRefreshImages = officialProducts.filter((product) => {
    if (!Array.isArray(product.images) || product.images.length === 0) {
      return true;
    }

    return product.images.some(
      (image) =>
        typeof image !== 'string' ||
        image.includes('placehold.co') ||
        image.includes('loremflickr.com') ||
        image.includes('source.unsplash.com') ||
        !image.startsWith('/marketplace-images/')
    );
  });

  if (productsToRefreshImages.length > 0) {
    await prisma.$transaction(
      productsToRefreshImages.map((product) =>
        prisma.product.update({
          where: { id: product.id },
          data: {
            images: [buildCatalogImageUrl(product.name, product.category)],
          },
        })
      )
    );
  }
};

const ensureSellerAccount = async (userId) => {
  const seller = await prisma.sellerAccount.findUnique({ where: { userId } });
  if (!seller) {
    throw new AppError('Seller account not found. Please become a seller first.', 403);
  }
  if (!seller.isActive) {
    throw new AppError('Seller account is inactive', 403);
  }
  return seller;
};

const getOrCreateCart = async (userId) => {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }

  return prisma.cart.create({ data: { userId } });
};

const buildCartSummary = (cart) => {
  const items = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: item.product,
    lineTotal: item.quantity * item.product.price,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    summary: {
      itemCount: items.length,
      subtotal,
    },
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

export const marketplaceCategories = async (_req, res) => {
  res.json({
    categories: MARKETPLACE_CATEGORIES.map((key) => ({
      key,
      label: key.charAt(0) + key.slice(1).toLowerCase(),
    })),
  });
};

export const becomeSeller = async (req, res) => {
  const { storeName, description } = req.body;

  const exists = await prisma.sellerAccount.findUnique({ where: { userId: req.user.id } });
  if (exists) {
    return res.status(409).json({ message: 'User already has a seller account' });
  }

  const commissionRate = Number(process.env.MARKETPLACE_COMMISSION_PERCENT || 10);

  const seller = await prisma.sellerAccount.create({
    data: {
      userId: req.user.id,
      storeName,
      description,
      commissionRate,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({ seller });
};

export const mySellerAccount = async (req, res) => {
  const seller = await prisma.sellerAccount.findUnique({
    where: { userId: req.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          products: true,
          orderItems: true,
        },
      },
    },
  });

  if (!seller) {
    return res.json({ seller: null, canAccessSellerDashboard: false });
  }

  res.json({ seller, canAccessSellerDashboard: true });
};

export const createProduct = async (req, res) => {
  const seller = await ensureSellerAccount(req.user.id);

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      ...req.body,
    },
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          commissionRate: true,
        },
      },
    },
  });

  res.status(201).json({ product });
};

export const updateProduct = async (req, res) => {
  const seller = await ensureSellerAccount(req.user.id);

  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.sellerId !== seller.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          commissionRate: true,
        },
      },
    },
  });

  res.json({ product: updated });
};

export const deleteProduct = async (req, res) => {
  const seller = await ensureSellerAccount(req.user.id);

  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.sellerId !== seller.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Product archived successfully' });
};

export const listProducts = async (req, res) => {
  await ensureMarketplaceSeedCatalog();

  const { category, sellerId, q, page = 1, limit = 20 } = req.query;
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const where = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(sellerId ? { sellerId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products: items,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber) || 1,
    },
  });
};

export const productById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          commissionRate: true,
          isActive: true,
        },
      },
    },
  });

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  res.json({ product });
};

export const myProducts = async (req, res) => {
  const seller = await ensureSellerAccount(req.user.id);

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ products });
};

export const myCart = async (req, res) => {
  await getOrCreateCart(req.user.id);
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  storeName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  res.json({ cart: buildCartSummary(cart) });
};

export const addCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }
  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existing) {
    const nextQuantity = existing.quantity + quantity;
    if (product.stock < nextQuantity) {
      throw new AppError('Insufficient stock for requested quantity', 400);
    }

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  res.status(201).json({ cart: buildCartSummary(updatedCart) });
};

export const updateCartItem = async (req, res) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: req.params.id },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!item || item.cart.userId !== req.user.id) {
    throw new AppError('Cart item not found', 404);
  }

  if (item.product.stock < req.body.quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  await prisma.cartItem.update({
    where: { id: req.params.id },
    data: { quantity: req.body.quantity },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: item.cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  res.json({ cart: buildCartSummary(updatedCart) });
};

export const removeCartItem = async (req, res) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: req.params.id },
    include: {
      cart: true,
    },
  });

  if (!item || item.cart.userId !== req.user.id) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({ where: { id: req.params.id } });

  res.json({ message: 'Cart item removed' });
};

export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ message: 'Cart cleared' });
};

export const checkoutCart = async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const order = await prisma.$transaction(async (tx) => {
    const enrichedItems = [];

    for (const item of cart.items) {
      const latestProduct = await tx.product.findUnique({
        where: { id: item.productId },
        include: { seller: true },
      });

      if (!latestProduct || !latestProduct.isActive) {
        throw new AppError(`Product is unavailable: ${item.product.name}`, 400);
      }

      if (latestProduct.stock < item.quantity) {
        throw new AppError(`Insufficient stock for: ${latestProduct.name}`, 400);
      }

      const lineTotal = latestProduct.price * item.quantity;
      const commissionRate = latestProduct.seller.commissionRate;
      const commissionAmount = (lineTotal * commissionRate) / 100;
      const sellerEarning = lineTotal - commissionAmount;

      enrichedItems.push({
        productId: latestProduct.id,
        sellerId: latestProduct.sellerId,
        quantity: item.quantity,
        unitPrice: latestProduct.price,
        lineTotal,
        commissionRate,
        commissionAmount,
        sellerEarning,
      });

      await tx.product.update({
        where: { id: latestProduct.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const totalAmount = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const commissionAmount = enrichedItems.reduce((sum, item) => sum + item.commissionAmount, 0);
    const sellerPayoutAmount = enrichedItems.reduce((sum, item) => sum + item.sellerEarning, 0);

    const createdOrder = await tx.order.create({
      data: {
        userId: req.user.id,
        status: 'pending',
        totalAmount,
        commissionAmount,
        sellerPayoutAmount,
        items: {
          create: enrichedItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            seller: {
              select: {
                id: true,
                storeName: true,
              },
            },
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  res.status(201).json({ order });
};

export const myOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });

  res.json({ orders });
};

export const orderById = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          product: true,
          seller: {
            select: {
              id: true,
              userId: true,
              storeName: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const isBuyer = order.userId === req.user.id;
  const isSellerInOrder = order.items.some((item) => item.seller.userId === req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSellerInOrder && !isAdmin) {
    throw new AppError('Forbidden', 403);
  }

  res.json({ order });
};

export const sellerOrders = async (req, res) => {
  const seller = await ensureSellerAccount(req.user.id);

  const items = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true,
        },
      },
      order: {
        select: {
          id: true,
          userId: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      },
    },
  });

  res.json({ orderItems: items });
};

export const updateOrderStatus = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          seller: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const isAdmin = req.user.role === 'admin';
  const sellerBelongsToOrder = order.items.some((item) => item.seller.userId === req.user.id);

  if (!isAdmin && !sellerBelongsToOrder) {
    throw new AppError('Only seller in this order or admin can update status', 403);
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: {
      items: true,
    },
  });

  res.json({ order: updated });
};
