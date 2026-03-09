import { safeFetch } from '../utils/safeFetch';
import { API_BASE_URL } from '../../lib/api';
import { authService } from './authService';

export type MarketplaceCategory = 'FOOD' | 'TOYS' | 'ACCESSORIES' | 'MEDICAL' | 'GROOMING';
export type MarketplaceOrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

export interface SellerSummary {
  id: string;
  storeName: string;
  commissionRate: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: MarketplaceCategory;
  stock: number;
  images: string[];
  isActive: boolean;
  sellerId: string;
  seller?: SellerSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  lineTotal: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotal: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  commissionRate: number;
  commissionAmount: number;
  sellerEarning: number;
  createdAt: string;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: MarketplaceOrderStatus;
  totalAmount: number;
  commissionAmount: number;
  sellerPayoutAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface SellerAccount {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
};

const joinApiPath = (base: string, suffix: string): string => {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${suffix}`;
};

const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async <T>(endpoint: string, options: RequestInit = {}, hasRetried = false): Promise<T> => {
  const response = await safeFetch<unknown>(joinApiPath(API_BASE_URL, `/marketplace${endpoint}`), {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.success && response.status === 401 && !hasRetried) {
    const refreshed = await authService.refreshToken();
    if (refreshed.success) {
      return request<T>(endpoint, options, true);
    }
  }

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Marketplace request failed');
  }

  const payload = response.data as Record<string, unknown>;
  const normalized = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  return normalized as T;
};

export const marketplaceService = {
  async categories(): Promise<{ categories: Array<{ key: MarketplaceCategory; label: string }> }> {
    return request('/categories');
  },

  async products(params?: { category?: MarketplaceCategory; q?: string; page?: number; limit?: number; sellerId?: string }): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = new URLSearchParams();

    if (params?.category) query.set('category', params.category);
    if (params?.q) query.set('q', params.q);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sellerId) query.set('sellerId', params.sellerId);

    const suffix = query.toString() ? `/products?${query.toString()}` : '/products';
    return request(suffix);
  },

  async productById(id: string): Promise<{ product: Product }> {
    return request(`/products/${id}`);
  },

  async becomeSeller(payload: { storeName: string; description?: string }): Promise<{ seller: SellerAccount }> {
    return request('/seller/become', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async mySellerAccount(): Promise<{ seller: SellerAccount }> {
    return request('/seller/me');
  },

  async mySellerProducts(): Promise<{ products: Product[] }> {
    return request('/seller/products');
  },

  async sellerOrders(): Promise<{ orderItems: Array<OrderItem & { order?: Order }> }> {
    return request('/seller/orders');
  },

  async createProduct(payload: {
    name: string;
    description?: string;
    price: number;
    category: MarketplaceCategory;
    stock: number;
    images: string[];
  }): Promise<{ product: Product }> {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(id: string, payload: Partial<{
    name: string;
    description: string;
    price: number;
    category: MarketplaceCategory;
    stock: number;
    images: string[];
    isActive: boolean;
  }>): Promise<{ product: Product }> {
    return request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async myCart(): Promise<{ cart: Cart }> {
    return request('/cart');
  },

  async addCartItem(payload: { productId: string; quantity: number }): Promise<{ cart: Cart }> {
    return request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCartItem(itemId: string, payload: { quantity: number }): Promise<{ cart: Cart }> {
    return request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async removeCartItem(itemId: string): Promise<{ message: string }> {
    return request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart(): Promise<{ message: string }> {
    return request('/cart', {
      method: 'DELETE',
    });
  },

  async checkout(): Promise<{ order: Order }> {
    return request('/orders/checkout', {
      method: 'POST',
    });
  },

  async myOrders(): Promise<{ orders: Order[] }> {
    return request('/orders/my');
  },

  async updateOrderStatus(orderId: string, status: MarketplaceOrderStatus): Promise<{ order: Order }> {
    return request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
