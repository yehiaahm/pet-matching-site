import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

const PAYMENT_REQUESTS_STORAGE_KEY = 'petmat_payment_requests';
const USER_SUBSCRIPTIONS_STORAGE_KEY = 'petmat_user_subscriptions';
const SUBSCRIPTION_NOTIFICATIONS_STORAGE_KEY = 'petmat_subscription_notifications';

// Mock data - in production, this would come from API
const mockPayments = [
  {
    id: '1',
    order_id: 'Order-1642778400000',
    customer_name: 'أحمد محمد',
    customer_email: 'ahmed@example.com',
    amount: 19.99,
    payment_method: 'instapay',
    payment_status: 'pending_review',
    order_status: 'pending_payment',
    uploaded_screenshot: '/screenshots/payment1.jpg',
    time: new Date().toISOString(),
    plan_name: 'Premium'
  },
  {
    id: '2',
    order_id: 'Order-1642778300000',
    customer_name: 'سارة علي',
    customer_email: 'sarah@example.com',
    amount: 49.99,
    payment_method: 'instapay',
    payment_status: 'paid',
    order_status: 'confirmed',
    uploaded_screenshot: '/screenshots/payment2.jpg',
    time: new Date(Date.now() - 3600000).toISOString(),
    plan_name: 'Enterprise',
    confirmed_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: '3',
    order_id: 'Order-1642778200000',
    customer_name: 'محمد أحمد',
    customer_email: 'mohamed@example.com',
    amount: 9.99,
    payment_method: 'instapay',
    payment_status: 'rejected',
    order_status: 'failed',
    uploaded_screenshot: '/screenshots/payment3.jpg',
    time: new Date(Date.now() - 7200000).toISOString(),
    plan_name: 'Basic',
    rejected_at: new Date(Date.now() - 5400000).toISOString(),
    rejection_reason: 'Payment screenshot unclear'
  }
];

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedRequests = localStorage.getItem(PAYMENT_REQUESTS_STORAGE_KEY);
    if (savedRequests) {
      try {
        setPayments(JSON.parse(savedRequests));
      } catch {
        setPayments([]);
      }
    }
  }, []);

  const persistPayments = (updatedPayments: any[]) => {
    setPayments(updatedPayments);
    localStorage.setItem(PAYMENT_REQUESTS_STORAGE_KEY, JSON.stringify(updatedPayments));
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || payment.payment_status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleConfirmPayment = async (paymentId) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedPayments = payments.map(payment => 
      payment.id === paymentId 
        ? {
            ...payment,
            payment_status: 'paid',
            order_status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            subscription_activated: true,
          }
        : payment
    );

    persistPayments(updatedPayments);

    const confirmedPayment = updatedPayments.find(payment => payment.id === paymentId);
    if (confirmedPayment?.customer_email) {
      const existingSubscriptionsRaw = localStorage.getItem(USER_SUBSCRIPTIONS_STORAGE_KEY);
      const existingSubscriptions = existingSubscriptionsRaw ? JSON.parse(existingSubscriptionsRaw) : {};

      existingSubscriptions[confirmedPayment.customer_email.toLowerCase()] = {
        active: true,
        tier: (confirmedPayment.plan_name || 'Premium').toUpperCase(),
        activatedAt: new Date().toISOString(),
        orderId: confirmedPayment.order_id,
      };

      localStorage.setItem(USER_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(existingSubscriptions));

      const existingNotificationsRaw = localStorage.getItem(SUBSCRIPTION_NOTIFICATIONS_STORAGE_KEY);
      const existingNotifications = existingNotificationsRaw ? JSON.parse(existingNotificationsRaw) : {};

      existingNotifications[confirmedPayment.customer_email.toLowerCase()] = {
        message: 'تم الاشتراك بنجاح ✅ تم تفعيل مميزات الباقة الخاصة بك.',
        tier: confirmedPayment.plan_name || 'Premium',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(SUBSCRIPTION_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    }
    
    setLoading(false);
    
    console.log('Payment confirmed - subscription activated and user notified');
  };

  const handleRejectPayment = async (paymentId) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedPayments = payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, payment_status: 'rejected', order_status: 'failed', rejected_at: new Date().toISOString(), rejection_reason: 'Payment verification failed' }
        : payment
    );

    persistPayments(updatedPayments);
    
    setLoading(false);
    
    // In production, send notification to user
    console.log('Payment rejected - send notification to user');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_review': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_review': return 'قيد المراجعة';
      case 'paid': return 'مدفوع';
      case 'rejected': return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.payment_status === 'pending_review').length,
    confirmed: payments.filter(p => p.payment_status === 'paid').length,
    rejected: payments.filter(p => p.payment_status === 'rejected').length,
    totalRevenue: payments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-purple-600" />
              مراجعة الدفع
            </h1>
            <p className="text-gray-600 mt-2">إدارة وتأكيد دفعات Instapay</p>
          </div>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الدفعات</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">قيد المراجعة</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">مدفوع</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">مرفوض</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم أو رقم الطلب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending_review">قيد المراجعة</option>
                <option value="paid">مدفوع</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPayments.map((payment) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{payment.order_id}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4" />
                      {payment.customer_name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(payment.payment_status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(payment.payment_status)}
                      {getStatusText(payment.payment_status)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Payment Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المبلغ:</span>
                    <span className="font-semibold">${payment.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الخطة:</span>
                    <span className="font-medium">{payment.plan_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الطريقة:</span>
                    <span className="font-medium capitalize">{payment.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الوقت:</span>
                    <span className="font-medium">
                      {new Date(payment.time).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>

                {/* Screenshot Preview */}
                {payment.uploaded_screenshot && (
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <div className="p-2 bg-gray-100 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">صورة الدفع</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPayment(payment)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <img
                        src={payment.uploaded_screenshot}
                        alt="payment proof"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {payment.payment_status === 'pending_review' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConfirmPayment(payment.id)}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                      تأكيد الدفع
                    </Button>
                    <Button
                      onClick={() => handleRejectPayment(payment.id)}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض الدفع
                    </Button>
                  </div>
                )}

                {/* Status Messages */}
                {payment.payment_status === 'paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">تم تأكيد الدفع بنجاح</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      تم إشعار المستخدم بتأكيد الدفع.
                    </p>
                  </div>
                )}

                {payment.payment_status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">تم رفض الدفع</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      السبب: {payment.rejection_reason || 'فشل التحقق من الدفع'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد دفعات</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'جرب تعديل البحث أو الفلاتر'
                : 'لا توجد دفعات لمراجعتها حالياً'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Screenshot Modal */}
      {selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedPayment.order_id}</h3>
                <p className="text-gray-600">{selectedPayment.customer_name}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPayment(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <img
                src={selectedPayment.uploaded_screenshot}
                alt="payment screenshot"
                className="w-full max-h-[70vh] object-contain rounded-lg bg-gray-100"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
