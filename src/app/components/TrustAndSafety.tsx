import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, AlertCircle, Users, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function TrustAndSafety() {
  const { language } = useLanguage();

  const safetyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      titleAr: '✅ التحقق من الهوية',
      titleEn: '✅ Identity Verification',
      descAr: 'كل مستخدم يمر بتحقق صارم - معرف حكومي وصورة شخصية',
      descEn: 'Every user passes strict verification - government ID & photo',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      titleAr: '🔒 تشفير من درجة البنك',
      titleEn: '🔒 Bank-Grade Encryption',
      descAr: 'بياناتك مشفرة بالكامل وآمنة 100%',
      descEn: 'Your data is fully encrypted and 100% secure',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      titleAr: '⭐ تقييمات موثوقة',
      titleEn: '⭐ Verified Reviews',
      descAr: 'التقييمات تأتي فقط من مستخدمين فعليين تم التحقق منهم',
      descEn: 'Reviews come only from verified real users',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      titleAr: '🚨 نظام الإبلاغ 24/7',
      titleEn: '🚨 24/7 Report System',
      descAr: 'أبلغ عن أي مشكلة وسيتم التعامل معها في أقل من ساعة',
      descEn: 'Report any issue and it will be handled within hours',
      color: 'from-red-400 to-red-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      titleAr: '👥 فريق إشراف نشط',
      titleEn: '👥 Active Moderation Team',
      descAr: 'فريق متفرغ يراقب السلوك المريب ويزيله فوراً',
      descEn: 'Full-time team monitoring and removing suspicious behavior',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: <Award className="w-8 h-8" />,
      titleAr: '🏆 معايير عالية جداً',
      titleEn: '🏆 Highest Standards',
      descAr: 'نلتزم بأعلى معايير الأمان الدولية والخصوصية',
      descEn: 'We comply with highest international security standards',
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const guarantees = [
    { ar: '✅ 100% خالي من الرسوم المخفية', en: '✅ 100% Free - No Hidden Fees' },
    { ar: '✅ المزابع والمحتالون محظوران فوراً', en: '✅ Scammers & Bots Banned Instantly' },
    { ar: '✅ حذف حسابك بنقرة واحدة', en: '✅ Delete Your Account with One Click' },
    { ar: '✅ لا توجد رسائل غير مرغوبة أو بريد عشوائي', en: '✅ No Spam or Unsolicited Messages' },
    { ar: '✅ خصوصيتك لا تُباع أبداً', en: '✅ Your Privacy is Never Sold' },
    { ar: '✅ دعم عملاء متاح دائماً', en: '✅ Support Always Available' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-b from-white via-blue-50 to-white"
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
            🔐 {language === 'ar' ? 'الأمان و الثقة' : 'Safety & Trust'}
          </motion.h2>
          <p className="text-lg text-gray-600">
            {language === 'ar'
              ? 'أمانك وخصوصيتك هما أولويتنا الأساسية'
              : 'Your safety and privacy are our top priorities'}
          </p>
        </div>

        {/* Safety Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {safetyFeatures.map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <div className="h-full rounded-2xl p-8 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {language === 'ar' ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-gray-600">
                  {language === 'ar' ? feature.descAr : feature.descEn}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Guarantees Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-white mb-16"
        >
          <h3 className="text-3xl font-bold mb-8 text-center">
            {language === 'ar' ? '✨ ضماناتنا لك' : '✨ Our Guarantees to You'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guarantees.map((guarantee, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="text-2xl">✓</div>
                <p className="text-lg">
                  {language === 'ar' ? guarantee.ar : guarantee.en}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              number: '5,234',
              labelAr: 'مستخدم موثوق',
              labelEn: 'Verified Users',
              icon: '👥'
            },
            {
              number: '8,912',
              labelAr: 'عملية نجحت',
              labelEn: 'Successful Matches',
              icon: '💚'
            },
            {
              number: '98%',
              labelAr: 'رضا العملاء',
              labelEn: 'Customer Satisfaction',
              icon: '⭐'
            }
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{metric.icon}</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metric.number}
              </div>
              <p className="text-gray-600">
                {language === 'ar' ? metric.labelAr : metric.labelEn}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
