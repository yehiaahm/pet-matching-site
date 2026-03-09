import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Download, 
  Eye, 
  Clock,
  User,
  DollarSign,
  FileText,
  Check,
  X,
  Search,
  Filter
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface PaymentOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending_review' | 'paid' | 'rejected';
  order_status: 'pending_payment' | 'confirmed' | 'failed';
  uploaded_screenshot?: string;
  time: string;
}

interface AdminPaymentReviewProps {
  onStatusUpdate?: (orderId: string, status: 'paid' | 'rejected') => void;
}

export function AdminPaymentReview({ onStatusUpdate }: AdminPaymentReviewProps) {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Mock data - in production, this would come from API
  useEffect(() => {
    const mockOrders: PaymentOrder[] = [
      {
        id: '1',
        order_id: 'Order-1642778400000',
        customer_name: 'Ahmed Mohamed',
        customer_email: 'ahmed@example.com',
        amount: 19.99,
        payment_method: 'instapay',
        payment_status: 'pending_review',
        order_status: 'pending_payment',
        uploaded_screenshot: '/screenshots/payment1.jpg',
        time: new Date().toISOString()
      },
      {
        id: '2',
        order_id: 'Order-1642778300000',
        customer_name: 'Sarah Ali',
        customer_email: 'sarah@example.com',
        amount: 49.99,
        payment_method: 'instapay',
        payment_status: 'pending_review',
        order_status: 'pending_payment',
        uploaded_screenshot: '/screenshots/payment2.jpg',
        time: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setOrders(mockOrders);
  }, []);

  const handleConfirmPayment = async (orderId: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, payment_status: 'paid', order_status: 'confirmed' }
        : order
    ));
    
    if (onStatusUpdate) {
      onStatusUpdate(orderId, 'paid');
    }
    
    setLoading(false);
    
    // In production, send notification to user
    console.log('Payment confirmed - send notification to user');
  };

  const handleRejectPayment = async (orderId: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, payment_status: 'rejected', order_status: 'failed' }
        : order
    ));
    
    if (onStatusUpdate) {
      onStatusUpdate(orderId, 'rejected');
    }
    
    setLoading(false);
    
    // In production, send notification to user
    console.log('Payment rejected - send notification to user');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || order.payment_status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_review': return 'Under Review';
      case 'paid': return 'Paid';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Review</h2>
          <p className="text-gray-600 mt-1">Review and confirm Instapay payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {orders.filter(o => o.payment_status === 'pending_review').length} Pending
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {orders.filter(o => o.payment_status === 'paid').length} Confirmed
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_review">Pending Review</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.order_id}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {order.customer_name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.payment_status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.payment_status)}
                      {getStatusText(order.payment_status)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">${order.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {new Date(order.time).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Screenshot Preview */}
                {order.uploaded_screenshot && (
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <div className="p-2 bg-gray-100 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">Payment Screenshot</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrder(order)}
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
                      <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {order.payment_status === 'pending_review' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConfirmPayment(order.id)}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Payment
                    </Button>
                    <Button
                      onClick={() => handleRejectPayment(order.id)}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Payment
                    </Button>
                  </div>
                )}

                {/* Status Messages */}
                {order.payment_status === 'paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Payment confirmed successfully</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      User has been notified of payment confirmation.
                    </p>
                  </div>
                )}

                {order.payment_status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Payment rejected</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      User has been notified of payment rejection.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No payments to review at this time'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Screenshot Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
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
                <h3 className="text-xl font-bold">{selectedOrder.order_id}</h3>
                <p className="text-gray-600">{selectedOrder.customer_name}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedOrder(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Payment Screenshot</p>
                  <p className="text-sm text-gray-500 mt-2">{selectedOrder.uploaded_screenshot}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
