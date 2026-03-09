import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { marketplaceService, type MarketplaceCategory, type Product } from '../services/marketplaceService';
import { useSellerAccess } from '../hooks/useSellerAccess';

const categoryLabel: Record<MarketplaceCategory, string> = {
  FOOD: 'Food',
  TOYS: 'Toys',
  ACCESSORIES: 'Accessories',
  MEDICAL: 'Medical',
  GROOMING: 'Grooming',
};

const categoryFallbackImage: Record<MarketplaceCategory, string> = {
  FOOD: '/marketplace-images/food.svg',
  TOYS: '/marketplace-images/toys.svg',
  ACCESSORIES: '/marketplace-images/accessories.svg',
  MEDICAL: '/marketplace-images/medical.svg',
  GROOMING: '/marketplace-images/grooming.svg',
};

const resolveProductImage = (product: Product): string => {
  const rawImages = (product as Product & { images?: unknown }).images;

  if (Array.isArray(rawImages)) {
    const firstValid = rawImages.find((image) => typeof image === 'string' && image.trim().length > 0);
    if (typeof firstValid === 'string') {
      return firstValid;
    }
  }

  if (typeof rawImages === 'string' && rawImages.trim()) {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) {
        const firstValid = parsed.find((image) => typeof image === 'string' && image.trim().length > 0);
        if (typeof firstValid === 'string') {
          return firstValid;
        }
      }
    } catch {
      return rawImages;
    }
  }

  return categoryFallbackImage[product.category] || '/marketplace-images/accessories.svg';
};

export default function MarketplacePage() {
  const { canAccessSellerDashboard } = useSellerAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartBusy, setIsCartBusy] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await marketplaceService.products({
        q: search || undefined,
        category: category === 'ALL' ? undefined : category,
        page: 1,
        limit: 60,
      });
      setProducts(response.products);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load products';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => ['ALL', 'FOOD', 'TOYS', 'ACCESSORIES', 'MEDICAL', 'GROOMING'] as const, []);

  useEffect(() => {
    const queryCategory = searchParams.get('category');
    const querySearch = searchParams.get('q') || '';

    if (search !== querySearch) {
      setSearch(querySearch);
    }

    if (!queryCategory) {
      if (category !== 'ALL') setCategory('ALL');
      return;
    }

    const normalized = queryCategory.toUpperCase();
    if (categories.includes(normalized as (typeof categories)[number])) {
      if (category !== normalized) {
        setCategory(normalized as MarketplaceCategory | 'ALL');
      }
      return;
    }

    if (category !== 'ALL') setCategory('ALL');
  }, [searchParams, categories, category, search]);

  useEffect(() => {
    void loadProducts();
  }, [category, search]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (search.trim()) {
        next.set('q', search.trim());
      } else {
        next.delete('q');
      }
      return next;
    });
    await loadProducts();
  };

  const addToCart = async (productId: string) => {
    try {
      setIsCartBusy(productId);
      await marketplaceService.addCartItem({ productId, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      toast.error(message);
    } finally {
      setIsCartBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">PETMAT Marketplace</CardTitle>
              <p className="text-white/90 mt-2">Amazon-style shopping for pet food, toys, accessories, medical, and grooming.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link to="/marketplace/cart">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>
              </Button>
              {canAccessSellerDashboard && (
                <Button asChild variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20">
                  <Link to="/marketplace/seller">
                    <Store className="h-4 w-4" />
                    Seller Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={category === item ? 'default' : 'outline'}
                  onClick={() => {
                    setCategory(item);
                    if (item === 'ALL') {
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete('category');
                        return next;
                      });
                    } else {
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.set('category', item);
                        return next;
                      });
                    }
                  }}
                >
                  {item === 'ALL' ? 'All categories' : categoryLabel[item]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="h-72 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">No products found.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-44 bg-slate-100">
                  <img
                    src={resolveProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallbackApplied === 'true') {
                        return;
                      }

                      event.currentTarget.dataset.fallbackApplied = 'true';
                      event.currentTarget.src = categoryFallbackImage[product.category] || '/marketplace-images/accessories.svg';
                    }}
                  />
                </div>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{categoryLabel[product.category]}</Badge>
                    <span className="text-sm text-slate-500">Stock: {product.stock}</span>
                  </div>
                  <CardTitle className="text-base line-clamp-2 min-h-10">{product.name}</CardTitle>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-10">{product.description || 'No description provided'}</p>
                  <p className="text-xl font-bold text-emerald-600">${product.price.toFixed(2)}</p>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={product.stock <= 0 || isCartBusy === product.id}
                    loading={isCartBusy === product.id}
                    onClick={() => void addToCart(product.id)}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of stock'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
