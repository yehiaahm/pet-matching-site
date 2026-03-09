import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  marketplaceService,
  type MarketplaceCategory,
  type MarketplaceOrderStatus,
  type Product,
  type SellerAccount,
} from '../services/marketplaceService';

const categories: MarketplaceCategory[] = ['FOOD', 'TOYS', 'ACCESSORIES', 'MEDICAL', 'GROOMING'];

export default function MarketplaceSellerPage() {
  const [seller, setSeller] = useState<SellerAccount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<Array<{ id: string; order?: { id: string; status: MarketplaceOrderStatus; createdAt: string }; lineTotal: number; product?: { name?: string } }>>([]);
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('FOOD');
  const [images, setImages] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const sellerResponse = await marketplaceService.mySellerAccount();
      setSeller(sellerResponse.seller);

      const [productsResponse, sellerOrdersResponse] = await Promise.all([
        marketplaceService.mySellerProducts(),
        marketplaceService.sellerOrders(),
      ]);

      setProducts(productsResponse.products);
      setOrderItems(sellerOrdersResponse.orderItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load seller dashboard';
      if (message.toLowerCase().includes('not found')) {
        setSeller(null);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const becomeSeller = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const response = await marketplaceService.becomeSeller({
        storeName,
        description: storeDescription || undefined,
      });
      setSeller(response.seller);
      toast.success('Seller account created');
      setStoreName('');
      setStoreDescription('');
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to become seller';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const createProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const parsedPrice = Number(price);
      const parsedStock = Number(stock);
      const parsedImages = images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      await marketplaceService.createProduct({
        name,
        description: description || undefined,
        price: parsedPrice,
        stock: parsedStock,
        category,
        images: parsedImages,
      });

      toast.success('Product created');
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImages('');
      setCategory('FOOD');
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStatus = useMemo<Record<MarketplaceOrderStatus, MarketplaceOrderStatus | null>>(
    () => ({
      pending: 'paid',
      paid: 'shipped',
      shipped: 'delivered',
      delivered: null,
    }),
    []
  );

  const advanceOrder = async (orderId: string, status: MarketplaceOrderStatus) => {
    const next = nextStatus[status];
    if (!next) return;

    try {
      await marketplaceService.updateOrderStatus(orderId, next);
      toast.success(`Order moved to ${next}`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link to="/marketplace">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/marketplace/cart">Open Cart</Link>
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-slate-500">Loading seller dashboard...</CardContent>
          </Card>
        ) : !seller ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Become a Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={becomeSeller} className="space-y-3">
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Store name"
                  required
                />
                <Textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Store description (optional)"
                  rows={4}
                />
                <Button type="submit" loading={submitting}>Create Seller Account</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{seller.storeName}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Badge variant="outline">Commission: {seller.commissionRate}%</Badge>
                <Badge variant={seller.isActive ? 'default' : 'destructive'}>{seller.isActive ? 'Active' : 'Inactive'}</Badge>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createProduct} className="space-y-3">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" required />
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="Price" required />
                      <Input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min="0" step="1" placeholder="Stock" required />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
                      className="w-full h-10 rounded-md border bg-background px-3"
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      value={images}
                      onChange={(e) => setImages(e.target.value)}
                      placeholder="Image URLs separated by comma"
                      rows={2}
                    />
                    <Button type="submit" loading={submitting}>Publish Product</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    My Products ({products.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[480px] overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-slate-500">No products yet.</p>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-slate-500">${product.price.toFixed(2)} • Stock: {product.stock}</p>
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Seller Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderItems.length === 0 ? (
                  <p className="text-slate-500">No order items yet.</p>
                ) : (
                  orderItems.map((item) => {
                    const status = item.order?.status || 'pending';
                    const orderId = item.order?.id || '';
                    const canAdvance = Boolean(nextStatus[status]) && Boolean(orderId);

                    return (
                      <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-slate-500">Order #{orderId.slice(0, 8)} • ${item.lineTotal.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{status}</Badge>
                          <Button
                            variant="outline"
                            disabled={!canAdvance}
                            onClick={() => {
                              if (!orderId) return;
                              void advanceOrder(orderId, status);
                            }}
                          >
                            {canAdvance ? `Move to ${nextStatus[status]}` : 'Final status'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
