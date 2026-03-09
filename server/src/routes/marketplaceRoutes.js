import { Router } from 'express';
import {
  addCartItem,
  becomeSeller,
  checkoutCart,
  clearCart,
  createProduct,
  deleteProduct,
  listProducts,
  marketplaceCategories,
  myCart,
  myOrders,
  myProducts,
  mySellerAccount,
  orderById,
  productById,
  removeCartItem,
  sellerOrders,
  updateCartItem,
  updateOrderStatus,
  updateProduct,
} from '../controllers/marketplaceController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  becomeSellerBodySchema,
  cartAddItemBodySchema,
  cartUpdateItemBodySchema,
  idParamSchema,
  productCreateBodySchema,
  productListQuerySchema,
  productUpdateBodySchema,
  updateOrderStatusBodySchema,
} from '../validation/schemas.js';

const router = Router();

router.get('/categories', asyncHandler(marketplaceCategories));

router.post('/seller/become', protect, validate({ body: becomeSellerBodySchema }), asyncHandler(becomeSeller));
router.get('/seller/me', protect, asyncHandler(mySellerAccount));
router.get('/seller/products', protect, asyncHandler(myProducts));
router.get('/seller/orders', protect, asyncHandler(sellerOrders));

router.get('/products', validate({ query: productListQuerySchema }), asyncHandler(listProducts));
router.get('/products/:id', validate({ params: idParamSchema }), asyncHandler(productById));
router.post('/products', protect, validate({ body: productCreateBodySchema }), asyncHandler(createProduct));
router.patch(
  '/products/:id',
  protect,
  validate({ params: idParamSchema, body: productUpdateBodySchema }),
  asyncHandler(updateProduct)
);
router.delete('/products/:id', protect, validate({ params: idParamSchema }), asyncHandler(deleteProduct));

router.get('/cart', protect, asyncHandler(myCart));
router.post('/cart/items', protect, validate({ body: cartAddItemBodySchema }), asyncHandler(addCartItem));
router.patch(
  '/cart/items/:id',
  protect,
  validate({ params: idParamSchema, body: cartUpdateItemBodySchema }),
  asyncHandler(updateCartItem)
);
router.delete('/cart/items/:id', protect, validate({ params: idParamSchema }), asyncHandler(removeCartItem));
router.delete('/cart', protect, asyncHandler(clearCart));

router.post('/orders/checkout', protect, asyncHandler(checkoutCart));
router.get('/orders/my', protect, asyncHandler(myOrders));
router.get('/orders/:id', protect, validate({ params: idParamSchema }), asyncHandler(orderById));
router.patch(
  '/orders/:id/status',
  protect,
  validate({ params: idParamSchema, body: updateOrderStatusBodySchema }),
  asyncHandler(updateOrderStatus)
);

export default router;
