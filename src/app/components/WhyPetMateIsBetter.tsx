import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function WhyPetMateIsBetter() {
  const { language } = useLanguage();

  const comparison = [
    {
      categoryAr: '💰 التكلفة',
      categoryEn: '💰 Cost',
      petmateAr: 'مجاني تماماً',
      petmateEn: 'Completely Free',
      tradAr: 'عادة 50-300 ريال إضافي',
      tradEn: 'Usually 50-300 extra',
      petmateBetter: true
    },
    {
      categoryAr: '⏱️ السرعة',
      categoryEn: '⏱️ Speed',
      petmateAr: '2-3 أيام في المتوسط',
      petmateEn: '2-3 days average',
      tradAr: 'أسابيع أو شهور',
      tradEn: 'Weeks or months',
      petmateBetter: true
    },
    {
      categoryAr: '🔒 الأمان',
      categoryEn: '🔒 Safety',
      petmateAr: '100% موثوق - هوية محققة',
      petmateEn: '100% verified identity',
      tradAr: 'عادة غير موثوق',
      tradEn: 'Usually unverified',
      petmateBetter: true
    },
    {
      categoryAr: '📱 سهولة الاستخدام',
      categoryEn: '📱 Ease of Use',
      petmateAr: 'تطبيق سهل جداً',
      petmateEn: 'Very easy app',
      tradAr: 'قد تضطر للذهاب شخصياً',
      tradEn: 'May need to visit',
      petmateBetter: true
    },
    {
      categoryAr: '📋 معلومات صحية',
      categoryEn: '📋 Health Records',
      petmateAr: 'سجل صحي كامل مرئي',
      petmateEn: 'Full health record visible',
      tradAr: 'قد لا توجد معلومات',
      tradEn: 'May not have info',
      petmateBetter: true
    },
    {
      categoryAr: '💬 التواصل',
      categoryEn: '💬 Communication',
      petmateAr: 'محادثة آمنة مباشرة',
      petmateEn: 'Secure direct chat',
      tradAr: 'هاتف أو لقاء مباشر فقط',
      tradEn: 'Phone or in-person only',
      petmateBetter: true
    }
  ];

  const reasons = [
    {
      titleAr: 'لا توجد رسوم خفية',
      titleEn: 'No Hidden Fees',
      descAr: 'ما تراه هو ما تدفعه - لا توجد رسوم مفاجئة',
      descEn: 'What you see is what you pay - no surprises',
      icon: '✨'
    },
    {
      titleAr: 'مراقبة صارمة',
      titleEn: 'Strict Monitoring',
      descAr: 'كل ملف شخصي يتم التحقق منه يدويًا',
      descEn: 'Every profile manually verified',
      icon: '🔍'
    },
    {
      titleAr: 'دعم 24/7',
      titleEn: '24/7 Support',
      descAr: 'فريق دعم متاح دائماً لمساعدتك',
      descEn: 'Support team always available',
      icon: '💬'
    },
    {
      titleAr: 'ضمان الرضا',
      titleEn: 'Satisfaction Guarantee',
      descAr: 'إذا لم تكن راضياً، نساعدك في العثور على بديل',
      descEn: 'If unsatisfied, we help find alternative',
      icon: '✅'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-b from-white to-orange-50"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            🏆 {language === 'ar' ? 'لماذا PetMate أفضل؟' : 'Why PetMate is Better?'}
          </motion.h2>
          <p className="text-lg text-gray-600">
            {language === 'ar'
              ? 'المقارنة الكاملة مع الطرق التقليدية'
              : 'Complete comparison with traditional methods'}
          </p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl overflow-hidden border border-gray-200 mb-16 shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-right font-bold">
                    {language === 'ar' ? 'المميز' : 'Feature'}
                  </th>
                  <th className="px-6 py-4 text-center font-bold">
                    🐾 PetMate
                  </th>
                  <th className="px-6 py-4 text-center font-bold">
                    {language === 'ar' ? '🏪 المتاجر التقليدية' : '🏪 Traditional Stores'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparison.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {language === 'ar' ? row.categoryAr : row.categoryEn}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-500 font-bold" />
                        <span className="ml-2 text-gray-900 font-semibold">
                          {language === 'ar' ? row.petmateAr : row.petmateEn}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <X className="w-6 h-6 text-red-500" />
                        <span className="ml-2 text-gray-600">
                          {language === 'ar' ? row.tradAr : row.tradEn}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Why Choose PetMate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white rounded-2xl border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all text-center"
            >
              <div className="text-5xl mb-4">{reason.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">
                {language === 'ar' ? reason.titleAr : reason.titleEn}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? reason.descAr : reason.descEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-12 bg-gradient-to-r from-orange-100 to-pink-100 rounded-3xl border-2 border-orange-300"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {language === 'ar' ? '🚀 جاهز للبدء؟' : '🚀 Ready to Get Started?'}
          </h3>
          <p className="text-gray-700 mb-6">
            {language === 'ar'
              ? 'انضم إلى آلاف المستخدمين السعيدين الذين وجدوا حيواناتهم الأليفة المثالية'
              : 'Join thousands of happy users who found their perfect pets'}
          </p>
          <button className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all hover:shadow-lg">
            {language === 'ar' ? '🎉 سجل مجاناً الآن' : '🎉 Sign Up Free Now'}
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
