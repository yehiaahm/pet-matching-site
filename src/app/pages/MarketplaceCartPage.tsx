import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { marketplaceService, type Cart, type Order } from '../services/marketplaceService';
import { useSellerAccess } from '../hooks/useSellerAccess';
import { useAuth } from '../context/AuthContext';
import { ModernPaymentSection } from '../components/ModernPaymentSection';

const PAYMENT_REQUESTS_STORAGE_KEY = 'petmat_payment_requests';

export default function MarketplaceCartPage() {
  const { canAccessSellerDashboard } = useSellerAccess();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutPayment, setShowCheckoutPayment] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cartResponse, ordersResponse] = await Promise.all([
        marketplaceService.myCart(),
        marketplaceService.myOrders(),
      ]);
      setCart(cartResponse.cart);
      setOrders(ordersResponse.orders);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const response = await marketplaceService.updateCartItem(itemId, { quantity });
      setCart(response.cart);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update quantity';
      toast.error(message);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await marketplaceService.removeCartItem(itemId);
      await loadData();
      toast.success('Item removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove item';
      toast.error(message);
    }
  };

  const clearCart = async () => {
    try {
      await marketplaceService.clearCart();
      await loadData();
      toast.success('Cart cleared');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear cart';
      toast.error(message);
    }
  };

  const markPaymentAsMarketplaceCheckout = (paymentRequestId: string, orderId: string) => {
    try {
      const raw = localStorage.getItem(PAYMENT_REQUESTS_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const updated = parsed.map((item) =>
        item?.id === paymentRequestId
          ? {
              ...item,
              flow_type: 'marketplace_checkout',
              plan_name: 'Marketplace Checkout',
              marketplace_order_id: orderId,
              order_id: orderId,
              order_status: 'pending_review',
            }
          : item
      );

      localStorage.setItem(PAYMENT_REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // no-op
    }
  };

  const checkoutAfterPayment = async (paymentData?: { id?: string }) => {
    try {
      setCheckoutLoading(true);
      const response = await marketplaceService.checkout();

      if (paymentData?.id && response?.order?.id) {
        markPaymentAsMarketplaceCheckout(paymentData.id, response.order.id);
      }

      await loadData();
      setShowCheckoutPayment(false);
      toast.success('Order created and payment submitted for review');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      toast.error(message);
    } finally {
      setCheckoutLoading(false);
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
          {canAccessSellerDashboard && (
            <Button asChild variant="secondary">
              <Link to="/marketplace/seller">Seller Dashboard</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-slate-500">Loading cart...</p>
              ) : !cart || cart.items.length === 0 ? (
                <p className="text-slate-500">Your cart is empty.</p>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-slate-500">${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => void updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        value={item.quantity}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (Number.isFinite(value) && value > 0) {
                            void updateQuantity(item.id, value);
                          }
                        }}
                        className="w-16 text-center"
                      />
                      <Button variant="outline" size="icon" onClick={() => void updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">${item.lineTotal.toFixed(2)}</p>
                      <Button variant="destructive" size="icon" onClick={() => void removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{cart?.summary.itemCount || 0}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>${(cart?.summary.subtotal || 0).toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                disabled={!cart || cart.items.length === 0 || checkoutLoading}
                loading={checkoutLoading}
                onClick={() => setShowCheckoutPayment(true)}
              >
                Checkout & Pay
              </Button>
              <Button className="w-full" variant="outline" disabled={!cart || cart.items.length === 0} onClick={() => void clearCart()}>
                Clear Cart
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-slate-500">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{order.status}</Badge>
                    <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCheckoutPayment} onOpenChange={setShowCheckoutPayment}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Marketplace Checkout Payment</DialogTitle>
            <DialogDescription>
              Use the same payment flow as subscription renewal. Your order is created after payment proof is submitted.
            </DialogDescription>
          </DialogHeader>

          <ModernPaymentSection
            selectedPlan={{
              id: 'marketplace_checkout',
              name: 'Marketplace Checkout',
              price: Number(cart?.summary.subtotal || 0),
              period: 'once',
              currency: '$',
            }}
            user={{
              name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'User',
              email: user?.email || 'user@example.com',
            }}
            onPaymentComplete={(paymentData) => {
              void checkoutAfterPayment(paymentData);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
