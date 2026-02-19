import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  HelpCircle,
  FileText,
  Shield,
  X
} from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../lib/api';

interface CustomerSupportPageProps {
  onClose: () => void;
}

export function CustomerSupportPage({ onClose }: CustomerSupportPageProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = language === 'ar' ? [
    { value: 'technical', label: '🔧 مشكلة تقنية' },
    { value: 'account', label: '👤 مشكلة في الحساب' },
    { value: 'payment', label: '💳 مشكلة في الدفع' },
    { value: 'matching', label: '❤️ مشكلة في المطابقة' },
    { value: 'safety', label: '🛡️ قضية أمان' },
    { value: 'feedback', label: '💭 ملاحظات واقتراحات' },
    { value: 'other', label: '📋 أخرى' }
  ] : [
    { value: 'technical', label: '🔧 Technical Issue' },
    { value: 'account', label: '👤 Account Problem' },
    { value: 'payment', label: '💳 Payment Issue' },
    { value: 'matching', label: '❤️ Matching Problem' },
    { value: 'safety', label: '🛡️ Safety Concern' },
    { value: 'feedback', label: '💭 Feedback & Suggestions' },
    { value: 'other', label: '📋 Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.category || !formData.message) {
      toast.error(
        language === 'ar' 
          ? 'الرجاء ملء جميع الحقول المطلوبة' 
          : 'Please fill in all required fields'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        category: formData.category.toUpperCase(),
        message: formData.message.trim(),
        priority: formData.priority.toUpperCase()
      };

      console.log('📤 Sending support ticket:', dataToSend);

      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(dataToSend)
      });

      const responseData = await response.json();
      console.log('📥 Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit');
      }

      console.log('✅ Form submitted successfully!');
      setIsSubmitted(true);
      
      // Toast with sound
      toast.success(
        language === 'ar' 
          ? 'تم إرسال رسالتك بنجاح! سنرد عليك قريباً ✨' 
          : 'Your message has been sent successfully! We will reply soon ✨',
        {
          duration: 5000,
          position: 'top-center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }
        }
      );

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
          priority: 'normal'
        });
        setIsSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى ❌' 
          : 'An error occurred. Please try again ❌',
        {
          duration: 5000,
          position: 'top-center',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? '📧 خدمة العملاء' : '📧 Customer Support'}
              </h2>
              <p className="text-blue-100 text-sm">
                {language === 'ar' 
                  ? 'نحن هنا للمساعدة 24/7 - فريق الدعم جاهز دائماً' 
                  : 'We are here to help 24/7 - Support team always ready'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Left Side - Contact Form */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? '📝 أرسل لنا رسالة' : '📝 Send us a message'}
            </h3>

            {isSubmitted ? (
              <>
                {/* Full Screen Success Modal */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                  onClick={() => setIsSubmitted(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: -100 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    type: 'spring',
                    stiffness: 200,
                    damping: 20
                  }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-2xl mx-4"
                >
                  <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-4 border-green-500 rounded-3xl p-12 text-center shadow-2xl">
                    {/* Success Icon with Animation */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.2,
                        duration: 0.8,
                        type: 'spring',
                        stiffness: 150,
                        damping: 20
                      }}
                      className="mb-6"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: 0.6
                        }}
                      >
                        <CheckCircle className="w-32 h-32 text-green-600 mx-auto" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Main Message */}
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl md:text-5xl font-black text-green-900 mb-4"
                    >
                      {language === 'ar' ? '✨ تم بنجاح! ✨' : '✨ Success! ✨'}
                    </motion.h2>
                    
                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-4 mb-6"
                    >
                      <p className="text-2xl md:text-3xl font-bold text-green-800 leading-relaxed">
                        {language === 'ar' 
                          ? '📨 لقد تم استقبال رسالتك بنجاح' 
                          : '📨 Your message has been received successfully'}
                      </p>
                      
                      <p className="text-xl md:text-2xl font-bold text-green-700 leading-relaxed">
                        {language === 'ar' 
                          ? 'سوف نعمل بكل جد واجتهاد ❤️\nلحل مشكلتك في أقرب وقت ممكن' 
                          : 'We will work hard ❤️\nto solve your problem as soon as possible'}
                      </p>
                    </motion.div>

                    {/* Email Display */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white rounded-2xl p-4 mb-6 border-2 border-green-300 inline-block w-full max-w-md"
                    >
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {language === 'ar' ? '📧 تحقق من بريدك الإلكتروني:' : '📧 Check your email:'}
                      </p>
                      <p className="text-lg text-green-600 font-bold break-all">
                        {formData.email}
                      </p>
                    </motion.div>

                    {/* Response Time */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-3 mb-8"
                    >
                      <div className="flex items-center justify-center gap-3 text-green-800 font-bold text-lg">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          ⚡
                        </motion.span>
                        <span>
                          {language === 'ar' 
                            ? 'متوسط وقت الرد: أقل من ساعة واحدة' 
                            : 'Average response time: Less than 1 hour'}
                        </span>
                        <motion.span
                          animate={{ rotate: -360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          ⚡
                        </motion.span>
                      </div>
                      <p className="text-green-700 font-semibold">
                        {language === 'ar' 
                          ? '🎯 سيتم إغلاق هذه النافذة خلال 5 ثوانٍ...' 
                          : '🎯 This window will close in 5 seconds...'}
                      </p>
                    </motion.div>

                    {/* Close Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      onClick={() => setIsSubmitted(false)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      {language === 'ar' ? '✓ تم الفهم' : '✓ Got it'}
                    </motion.button>
                  </div>
                </motion.div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر الفئة' : 'Select category'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الموضوع' : 'Subject'}
                  </label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={language === 'ar' ? 'موضوع رسالتك' : 'Message subject'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: language === 'ar' ? 'منخفضة' : 'Low', color: 'bg-gray-200' },
                      { value: 'normal', label: language === 'ar' ? 'عادية' : 'Normal', color: 'bg-blue-200' },
                      { value: 'high', label: language === 'ar' ? 'عالية' : 'High', color: 'bg-orange-200' },
                      { value: 'urgent', label: language === 'ar' ? 'عاجلة' : 'Urgent', color: 'bg-red-200' }
                    ].map(priority => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: priority.value })}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                          formData.priority === priority.value
                            ? `${priority.color} ring-2 ring-blue-500 text-gray-900`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="text-white">
                        {language === 'ar' ? '⏳ جاري إرسال الرسالة...' : '⏳ Sending message...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="text-white">
                        {language === 'ar' ? 'إرسال الرسالة ✉️' : 'Send Message ✉️'}
                      </span>
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </div>

          {/* Right Side - Support Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'ar' ? '📞 طرق التواصل الأخرى' : '📞 Other Contact Methods'}
              </h3>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-blue-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </p>
                      <p className="text-sm text-blue-600">support@petmate.com</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {language === 'ar' ? 'الهاتف (واتساب)' : 'Phone (WhatsApp)'}
                      </p>
                      <p className="text-sm text-green-600" dir="ltr">+20 100 123 4567</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-purple-50 rounded-xl border border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                      </p>
                      <p className="text-sm text-purple-600">
                        {language === 'ar' ? '24/7 - متاحون دائماً' : '24/7 - Always Available'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'ar' ? '❓ الأسئلة الشائعة' : '❓ Common Questions'}
              </h3>

              <div className="space-y-3">
                {[
                  {
                    icon: HelpCircle,
                    titleAr: 'كيف أبدأ؟',
                    titleEn: 'How to get started?',
                    descAr: 'سجل حساب، أضف حيوانك الأليف، وابدأ البحث',
                    descEn: 'Register, add your pet, and start browsing',
                    color: 'text-blue-600'
                  },
                  {
                    icon: Shield,
                    titleAr: 'هل بياناتي آمنة؟',
                    titleEn: 'Is my data safe?',
                    descAr: 'نعم، جميع البيانات مشفرة بأعلى معايير الأمان',
                    descEn: 'Yes, all data is encrypted with highest security standards',
                    color: 'text-green-600'
                  },
                  {
                    icon: FileText,
                    titleAr: 'كيف تعمل المطابقة؟',
                    titleEn: 'How does matching work?',
                    descAr: 'الذكاء الاصطناعي يحلل صفات حيوانك ويجد أفضل مطابقة',
                    descEn: 'AI analyzes your pet traits and finds best matches',
                    color: 'text-purple-600'
                  },
                  {
                    icon: AlertCircle,
                    titleAr: 'كيف أبلغ عن مشكلة؟',
                    titleEn: 'How to report an issue?',
                    descAr: 'استخدم النموذج أعلاه أو اتصل بنا مباشرة',
                    descEn: 'Use the form above or contact us directly',
                    color: 'text-orange-600'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-1`} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {language === 'ar' ? item.titleAr : item.titleEn}
                        </p>
                        <p className="text-xs text-gray-600">
                          {language === 'ar' ? item.descAr : item.descEn}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 text-center"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {language === 'ar' ? '⚡ استجابة سريعة' : '⚡ Fast Response'}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'ar' 
                  ? 'متوسط وقت الرد: أقل من ساعة واحدة' 
                  : 'Average response time: Less than 1 hour'}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
