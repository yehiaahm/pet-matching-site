import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Clock,
  CheckCircle,
  Search,
  Eye,
  Send,
  X,
  RefreshCw,
  TrendingUp,
  Users,
  MessageCircle,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../lib/api';

interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
  status: string;
  replies?: Array<{
    message: string;
    from: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AdminSupportDashboardProps {
  onClose: () => void;
}

export function AdminSupportDashboard({ onClose }: AdminSupportDashboardProps) {
  const { language } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Fetch all tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support/admin/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.tickets || []);
      setFilteredTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error(
        language === 'ar'
          ? 'فشل تحميل التذاكر'
          : 'Failed to load tickets'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter tickets
  useEffect(() => {
    let filtered = tickets;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        t =>
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status.toLowerCase() === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority.toLowerCase() === priorityFilter);
    }

    setFilteredTickets(filtered);
  }, [searchQuery, statusFilter, priorityFilter, tickets]);

  // Send reply
  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/support/tickets/${selectedTicket.id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: replyMessage })
        }
      );

      if (!response.ok) throw new Error('Failed to send reply');

      toast.success(
        language === 'ar'
          ? 'تم إرسال الرد بنجاح ✅'
          : 'Reply sent successfully ✅'
      );

      setReplyMessage('');
      await fetchTickets();
      
      // Update selected ticket
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(
        language === 'ar'
          ? 'فشل إرسال الرد'
          : 'Failed to send reply'
      );
    } finally {
      setIsReplying(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/support/admin/tickets/${ticketId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(
        language === 'ar'
          ? 'تم تحديث الحالة ✅'
          : 'Status updated ✅'
      );

      await fetchTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(
        language === 'ar'
          ? 'فشل تحديث الحالة'
          : 'Failed to update status'
      );
    }
  };

  // Statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    replied: tickets.filter(t => t.status === 'REPLIED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
    urgent: tickets.filter(t => t.priority === 'URGENT').length
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      TECHNICAL: { ar: '🔧 تقنية', en: '🔧 Technical' },
      ACCOUNT: { ar: '👤 حساب', en: '👤 Account' },
      PAYMENT: { ar: '💳 دفع', en: '💳 Payment' },
      MATCHING: { ar: '❤️ مطابقة', en: '❤️ Matching' },
      SAFETY: { ar: '🛡️ أمان', en: '🛡️ Safety' },
      FEEDBACK: { ar: '💭 ملاحظات', en: '💭 Feedback' },
      OTHER: { ar: '📋 أخرى', en: '📋 Other' }
    };
    return labels[category]?.[language] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-700',
      NORMAL: 'bg-blue-100 text-blue-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      REPLIED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      OPEN: { ar: 'مفتوحة', en: 'Open' },
      IN_PROGRESS: { ar: 'قيد المعالجة', en: 'In Progress' },
      REPLIED: { ar: 'تم الرد', en: 'Replied' },
      CLOSED: { ar: 'مغلقة', en: 'Closed' }
    };
    return labels[status]?.[language] || status;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {language === 'ar' ? '📊 لوحة تحكم الدعم الفني' : '📊 Support Dashboard'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {language === 'ar'
                    ? 'إدارة تذاكر خدمة العملاء'
                    : 'Manage customer support tickets'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTickets}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-500/30 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-xs">{language === 'ar' ? 'مفتوحة' : 'Open'}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.open}</p>
            </div>
            <div className="bg-yellow-500/30 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{language === 'ar' ? 'جاري' : 'Progress'}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-green-500/30 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">{language === 'ar' ? 'تم الرد' : 'Replied'}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.replied}</p>
            </div>
            <div className="bg-gray-500/30 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">{language === 'ar' ? 'مغلقة' : 'Closed'}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.closed}</p>
            </div>
            <div className="bg-red-500/30 backdrop-blur rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">{language === 'ar' ? 'عاجلة' : 'Urgent'}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.urgent}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Ticket List */}
          <div className="w-full md:w-1/2 lg:w-2/5 border-r border-gray-200 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="open">{language === 'ar' ? 'مفتوحة' : 'Open'}</option>
                  <option value="in_progress">{language === 'ar' ? 'جاري' : 'In Progress'}</option>
                  <option value="replied">{language === 'ar' ? 'تم الرد' : 'Replied'}</option>
                  <option value="closed">{language === 'ar' ? 'مغلقة' : 'Closed'}</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">{language === 'ar' ? 'جميع الأولويات' : 'All Priority'}</option>
                  <option value="urgent">{language === 'ar' ? 'عاجلة' : 'Urgent'}</option>
                  <option value="high">{language === 'ar' ? 'عالية' : 'High'}</option>
                  <option value="normal">{language === 'ar' ? 'عادية' : 'Normal'}</option>
                  <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
                </select>
              </div>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Mail className="w-16 h-16 mb-4 text-gray-300" />
                  <p>{language === 'ar' ? 'لا توجد تذاكر' : 'No tickets found'}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-sm text-gray-600">{ticket.name} • {ticket.email}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getCategoryLabel(ticket.category)}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(ticket.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Ticket Details */}
          <div className="flex-1 flex flex-col">
            {selectedTicket ? (
              <>
                {/* Ticket Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedTicket.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{selectedTicket.name}</span>
                        <span>•</span>
                        <span>{selectedTicket.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="OPEN">{language === 'ar' ? 'مفتوحة' : 'Open'}</option>
                        <option value="IN_PROGRESS">{language === 'ar' ? 'جاري' : 'In Progress'}</option>
                        <option value="REPLIED">{language === 'ar' ? 'تم الرد' : 'Replied'}</option>
                        <option value="CLOSED">{language === 'ar' ? 'مغلقة' : 'Closed'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {getStatusLabel(selectedTicket.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {/* Original Message */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        {selectedTicket.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedTicket.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedTicket.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    selectedTicket.replies.map((reply, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 shadow-sm ${
                          reply.from === 'support'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                              reply.from === 'support'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-white'
                            }`}
                          >
                            {reply.from === 'support' ? '👨‍💼' : '👤'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {reply.from === 'support'
                                ? language === 'ar' ? 'فريق الدعم' : 'Support Team'
                                : selectedTicket.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {reply.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={
                        language === 'ar'
                          ? 'اكتب ردك هنا...'
                          : 'Type your reply here...'
                      }
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={isReplying || !replyMessage.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isReplying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">
                    {language === 'ar'
                      ? 'اختر تذكرة لعرض التفاصيل'
                      : 'Select a ticket to view details'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
