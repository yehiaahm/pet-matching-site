import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CreditCard,
  Sparkles,
  Bell,
  Settings,
  Users,
  RefreshCw,
  Activity,
  Store,
  ClipboardList,
  LogIn,
  Clock3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';

type PanelShortcut = {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: any;
};

type SuperAdminStats = {
  totalUsers: number;
  totalBackendPayments: number;
  pendingManualPayments: number;
  totalMarketplaceProducts: number;
  totalOrders: number;
  pendingOrders: number;
  marketplacePendingPayments: number;
  loginsToday: number;
};

type LoginActivity = {
  id: string;
  email: string;
  role: string;
  time: string;
};

type AdminOrder = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: {
    email?: string;
    name?: string;
  };
};

type PaymentRequestRecord = {
  id?: string;
  order_id?: string;
  payment_status?: string;
  customer_email?: string;
  amount?: number;
  plan_name?: string;
  flow_type?: string;
  time?: string;
};

const PAYMENT_REQUESTS_STORAGE_KEY = 'petmat_payment_requests';
const LOGIN_ACTIVITY_STORAGE_KEY = 'petmat_login_activity';

const defaultStats: SuperAdminStats = {
  totalUsers: 0,
  totalBackendPayments: 0,
  pendingManualPayments: 0,
  totalMarketplaceProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  marketplacePendingPayments: 0,
  loginsToday: 0,
};

export default function SuperAdminPanelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<SuperAdminStats>(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [recentLogins, setRecentLogins] = useState<LoginActivity[]>([]);
  const [pendingQueue, setPendingQueue] = useState<PaymentRequestRecord[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken');

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchJsonArrayCount = async (url: string): Promise<number> => {
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return 0;
      }

      const payload = await response.json();
      if (Array.isArray(payload)) {
        return payload.length;
      }

      if (Array.isArray(payload?.data)) {
        return payload.data.length;
      }

      return 0;
    } catch {
      return 0;
    }
  };

  const fetchJsonArray = async <T,>(url: string): Promise<T[]> => {
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return [];
      }

      const payload = await response.json();
      if (Array.isArray(payload)) {
        return payload as T[];
      }

      if (Array.isArray(payload?.data)) {
        return payload.data as T[];
      }

      return [];
    } catch {
      return [];
    }
  };

  const readPaymentRequests = (): PaymentRequestRecord[] => {
    try {
      const raw = localStorage.getItem(PAYMENT_REQUESTS_STORAGE_KEY);
      if (!raw) return [];
      const requests = JSON.parse(raw);
      return Array.isArray(requests) ? requests : [];
    } catch {
      return [];
    }
  };

  const readLoginActivity = (): LoginActivity[] => {
    try {
      const raw = localStorage.getItem(LOGIN_ACTIVITY_STORAGE_KEY);
      if (!raw) return [];
      const events = JSON.parse(raw);
      return Array.isArray(events) ? events : [];
    } catch {
      return [];
    }
  };

  const computePendingManualPayments = (): number => {
    return readPaymentRequests().filter((item) => item?.payment_status === 'pending_review').length;
  };

  const computeMarketplacePendingPayments = (): number => {
    return readPaymentRequests().filter(
      (item) => item?.flow_type === 'marketplace_checkout' && item?.payment_status === 'pending_review'
    ).length;
  };

  const computeLoginsToday = (): number => {
    const today = new Date().toDateString();
    return readLoginActivity().filter((item) => new Date(item?.time || '').toDateString() === today).length;
  };

  const loadLiveStats = async () => {
    setStatsLoading(true);
    try {
      const [usersCount, backendPaymentsCount, marketplaceProductsTotal, allOrders] = await Promise.all([
        fetchJsonArrayCount('/api/v1/admin/users'),
        fetchJsonArrayCount('/api/v1/admin/payments'),
        (async () => {
          try {
            const response = await marketplaceService.products({ page: 1, limit: 1 });
            return response?.pagination?.total || 0;
          } catch {
            return 0;
          }
        })(),
        fetchJsonArray<AdminOrder>('/api/v1/admin/orders'),
      ]);

      const pendingManualPayments = computePendingManualPayments();
      const marketplacePendingPayments = computeMarketplacePendingPayments();
      const loginActivity = readLoginActivity();
      const paymentRequests = readPaymentRequests();
      const pendingOrders = allOrders.filter((order) => order?.status === 'pending').length;
      const pendingPayments = paymentRequests
        .filter((item) => item?.payment_status === 'pending_review')
        .sort((a, b) => new Date(b?.time || '').getTime() - new Date(a?.time || '').getTime())
        .slice(0, 6);

      setStats({
        totalUsers: usersCount,
        totalBackendPayments: backendPaymentsCount,
        pendingManualPayments,
        totalMarketplaceProducts: marketplaceProductsTotal,
        totalOrders: allOrders.length,
        pendingOrders,
        marketplacePendingPayments,
        loginsToday: computeLoginsToday(),
      });

      setRecentLogins(
        [...loginActivity]
          .sort((a, b) => new Date(b?.time || '').getTime() - new Date(a?.time || '').getTime())
          .slice(0, 8)
      );
      setPendingQueue(pendingPayments);
      setRecentOrders(allOrders.slice(0, 8));
      setLastUpdated(new Date().toLocaleString());
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    void loadLiveStats();
  }, []);

  const shortcuts = useMemo<PanelShortcut[]>(
    () => [
      {
        id: 'admin',
        title: 'Admin Panel',
        description: 'Users, moderation, reports, settings',
        path: '/admin',
        icon: Shield,
      },
      {
        id: 'payments',
        title: 'Payment Overview',
        description: 'Review and confirm subscription payments',
        path: '/admin/payments',
        icon: CreditCard,
      },
      {
        id: 'ai',
        title: 'AI Dashboard',
        description: 'AI assistants, monitoring, diagnostics',
        path: '/ai-dashboard',
        icon: Sparkles,
      },
      {
        id: 'notifications',
        title: 'Notifications Center',
        description: 'Alerts, announcements, and inbox',
        path: '/notifications',
        icon: Bell,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Settings className="w-7 h-7 text-indigo-600" />
              Super Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Welcome {user?.email || 'Super Admin'}. This is your unified control center for all platform panels.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={() => void loadLiveStats()} disabled={statsLoading}>
                <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                Refresh Live Stats
              </Button>
              <span className="text-sm text-gray-500">
                {lastUpdated ? `Last updated: ${lastUpdated}` : 'Waiting for first load...'}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Logins Today</p>
                  <p className="text-2xl font-bold">{stats.loginsToday}</p>
                </div>
                <LogIn className="w-6 h-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">DB Payments</p>
                  <p className="text-2xl font-bold">{stats.totalBackendPayments}</p>
                </div>
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payment Reviews</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingManualPayments}</p>
                </div>
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Marketplace Products</p>
                  <p className="text-2xl font-bold">{stats.totalMarketplaceProducts}</p>
                </div>
                <Store className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ClipboardList className="w-6 h-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                </div>
                <Clock3 className="w-6 h-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Marketplace Payment Queue</p>
                  <p className="text-2xl font-bold text-rose-600">{stats.marketplacePendingPayments}</p>
                </div>
                <CreditCard className="w-6 h-6 text-rose-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <Button className="w-full" onClick={() => navigate(item.path)}>
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LogIn className="w-5 h-5 text-emerald-600" />
                Recent User Logins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLogins.length === 0 ? (
                <p className="text-sm text-gray-500">No login activity recorded yet.</p>
              ) : (
                recentLogins.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{entry.email || 'Unknown user'}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.time).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">{entry.role || 'user'}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-orange-600" />
                Pending Payment Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingQueue.length === 0 ? (
                <p className="text-sm text-gray-500">No pending payment requests.</p>
              ) : (
                pendingQueue.map((item) => (
                  <div key={item.id || item.order_id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{item.customer_email || 'Unknown customer'}</p>
                      <p className="text-xs text-gray-500">{item.order_id || 'No order id'} • ${Number(item.amount || 0).toFixed(2)}</p>
                    </div>
                    <Badge>{item.flow_type === 'marketplace_checkout' ? 'Marketplace' : 'Subscription'}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              Recent Marketplace Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No marketplace orders available.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">#{order.id.slice(0, 8)} • {order.user?.email || order.user?.name || 'Unknown user'}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${Number(order.totalAmount || 0).toFixed(2)}</p>
                    <Badge variant={order.status === 'pending' ? 'destructive' : 'outline'}>{order.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
