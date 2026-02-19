import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CustomerSupportPage } from './CustomerSupportPage';

export function FAQSection() {
  const { language } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);

  const faqAr = [
    {
      id: '1',
      q: 'هل PetMate حقاً مجاني؟',
      a: 'نعم! التسجيل والبحث عن مطابقات مجاني بنسبة 100%. قد نقدم خدمات مدفوعة اختيارية في المستقبل، لكن الأساسيات ستظل مجانية دائماً.'
    },
    {
      id: '2',
      q: 'كيف أتأكد من أن المستخدمين موثوقون؟',
      a: 'جميع المستخدمين يمرون بعملية تحقق صارمة. نطلب صورة شخصية، معرف حكومي، وتقييمات من المستخدمين الآخرين. كل ملف شخصي يحمل شارة ✅ عند التحقق.'
    },
    {
      id: '3',
      q: 'ما الفرق بين PetMate والمتاجر التقليدية؟',
      a: 'في PetMate تتواصل مباشرة مع مربيين موثوقين - لا وسطاء، أسعار أفضل، وأمان أعلى. تقدر تشوف سجل صحي كامل وتتحدث مع المربي مباشرة.'
    },
    {
      id: '4',
      q: 'كم يستغرق العثور على مطابقة؟',
      a: 'في المتوسط، المستخدمون يجدون مطابقة في 2-3 أيام فقط. بعضهم يجد في أقل من يوم، وبعضهم قد ينتظر أسبوع حسب متطلباتهم.'
    },
    {
      id: '5',
      q: 'هل البيانات الشخصية آمنة؟',
      a: 'تماماً! نستخدم تشفير من درجة البنك، و لا نشارك بياناتك مع أي شخص ثالث. خصوصيتك هي أولويتنا.'
    },
    {
      id: '6',
      q: 'هل يمكن إلغاء الحساب في أي وقت؟',
      a: 'نعم، يمكنك حذف حسابك في أي وقت من إعدادات ملفك الشخصي. سيتم حذف جميع بياناتك نهائياً في غضون 30 يوماً.'
    },
    {
      id: '7',
      q: 'هل يمكن البحث عن أنواع مختلفة من الحيوانات؟',
      a: 'نعم! ندعم كلاب، قطط، طيور، أرانب، وأنواع أخرى. استخدم الفلاتر لاختيار النوع الذي تريده.'
    },
    {
      id: '8',
      q: 'ماذا إذا واجهت مشكلة مع مستخدم آخر؟',
      a: 'نوفر نظام إبلاغ للمشاكل. اضغط "إبلاغ" على أي ملف شخصي أو رسالة، وفريقنا سيتعامل معها في غضون 24 ساعة.'
    }
  ];

  const faqEn = [
    {
      id: '1',
      q: 'Is PetMate really free?',
      a: 'Yes! Registration and searching for matches is 100% free. We may offer optional paid services in the future, but the basics will always remain free.'
    },
    {
      id: '2',
      q: 'How do I know users are trustworthy?',
      a: 'All users go through a strict verification process. We require a profile photo, government ID, and ratings from other users. Every verified profile has a ✅ badge.'
    },
    {
      id: '3',
      q: 'What makes PetMate different from traditional stores?',
      a: 'On PetMate you communicate directly with verified breeders - no middlemen, better prices, and higher safety. You can see complete health records and talk to breeders directly.'
    },
    {
      id: '4',
      q: 'How long does it take to find a match?',
      a: 'On average, users find a match in 2-3 days. Some find in less than a day, others may wait a week depending on their requirements.'
    },
    {
      id: '5',
      q: 'Are my personal details safe?',
      a: 'Absolutely! We use bank-grade encryption and never share your data with third parties. Your privacy is our priority.'
    },
    {
      id: '6',
      q: 'Can I delete my account anytime?',
      a: 'Yes, you can delete your account anytime from your profile settings. All your data will be permanently deleted within 30 days.'
    },
    {
      id: '7',
      q: 'Can I search for different types of animals?',
      a: 'Yes! We support dogs, cats, birds, rabbits, and other types. Use the filters to select the type you want.'
    },
    {
      id: '8',
      q: 'What if I have an issue with another user?',
      a: 'We provide a reporting system for issues. Click "Report" on any profile or message, and our team will handle it within 24 hours.'
    }
  ];

  const faq = language === 'ar' ? faqAr : faqEn;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            {language === 'ar' ? '❓ أسئلة شائعة' : '❓ Frequently Asked Questions'}
          </motion.h2>
          <p className="text-lg text-gray-600">
            {language === 'ar'
              ? 'إجابات لأكثر الأسئلة التي يسأل عنها المستخدمون'
              : 'Answers to the most common questions from users'}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faq.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-all overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <span className="text-left font-semibold text-gray-900">{item.q}</span>
                <motion.div
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-blue-600 flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Answer */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: expandedId === item.id ? 1 : 0,
                  height: expandedId === item.id ? 'auto' : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-200 text-center"
        >
          <p className="text-gray-900 font-semibold mb-2">
            {language === 'ar' ? '🤔 هل لديك سؤال آخر؟' : '🤔 Have another question?'}
          </p>
          <p className="text-gray-600 mb-4">
            {language === 'ar'
              ? 'لا تتردد في التواصل معنا - فريق الدعم جاهز للمساعدة 24/7'
              : "Don't hesitate to contact us - our support team is ready to help 24/7"}
          </p>
          <button 
            onClick={() => setShowSupport(true)}
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {language === 'ar' ? '📧 اتصل بنا' : '📧 Contact Us'}
          </button>
        </motion.div>
      </div>

      {/* Customer Support Dialog */}
      {showSupport && <CustomerSupportPage onClose={() => setShowSupport(false)} />}
    </motion.section>
  );
}
