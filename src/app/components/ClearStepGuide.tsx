import { motion } from 'framer-motion';
import { CheckCircle, Users, Heart, MapPin, MessageSquare, Trophy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StepGuideProps {
  onGetStarted?: () => void;
}

export function ClearStepGuide({ onGetStarted }: StepGuideProps) {
  const { language } = useLanguage();

  const stepsAr = [
    {
      icon: Users,
      number: "1",
      title: "سجل حسابك",
      desc: "أنشئ حساب في 30 ثانية فقط - بريد وكلمة مرور",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Heart,
      number: "2",
      title: "أضف حيوانك",
      desc: "أضف صور وتفاصيل حيوانك - النوع، السلالة، العمر",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: MapPin,
      number: "3",
      title: "ابحث بالخريطة",
      desc: "استخدم الخريطة للبحث عن مطابقات بالقرب منك",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: MessageSquare,
      number: "4",
      title: "تواصل آمن",
      desc: "أرسل رسائل موثوقة 100% للمربيين الآخرين",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: CheckCircle,
      number: "5",
      title: "تحقق من التفاصيل",
      desc: "راجع السجلات الصحية والتاريخ بعناية",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Trophy,
      number: "6",
      title: "أنهِ الصفقة",
      desc: "عندما تجد المطابقة المثالية - اضغط 'نعم'!",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    }
  ];

  const stepsEn = [
    {
      icon: Users,
      number: "1",
      title: "Sign Up",
      desc: "Create account in just 30 seconds - email & password",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Heart,
      number: "2",
      title: "Add Your Pet",
      desc: "Add photos and details - type, breed, age",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: MapPin,
      number: "3",
      title: "Search by Map",
      desc: "Use the map to find matches near you",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: MessageSquare,
      number: "4",
      title: "Safe Chat",
      desc: "Send verified and 100% secure messages",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: CheckCircle,
      number: "5",
      title: "Verify Details",
      desc: "Review health records and history carefully",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Trophy,
      number: "6",
      title: "Close the Deal",
      desc: "When you find the perfect match - click 'Yes'!",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    }
  ];

  const steps = language === 'ar' ? stepsAr : stepsEn;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ {language === 'ar' ? 'سهل وسريع' : 'Simple & Fast'}
            </span>
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'ar' 
              ? '6 خطوات بسيطة للبدء'
              : '6 Simple Steps to Get Started'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'تم تصميم العملية لتكون سهلة وسريعة. من التسجيل إلى العثور على مطابقتك المثالية في أقل من ساعة'
              : 'We\'ve designed the process to be simple and fast. From signup to finding your perfect match in less than an hour'}
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative group"
              >
                {/* Card Background */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300`} />

                {/* Card Content */}
                <div className={`relative ${step.bgColor} p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all h-full`}>
                  {/* Step Number Circle */}
                  <div className="mb-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {step.number}
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 text-gray-700`} />
                    </motion.div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>

                  {/* Step Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>

                  {/* Checkmark */}
                  <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    {language === 'ar' ? 'مضمون 100%' : '100% Guaranteed'}
                  </div>

                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="absolute -right-7 top-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 hidden lg:block origin-right"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Timeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 border border-gray-200 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? '⏱️ المدة المتوقعة' : '⏱️ Expected Duration'}
          </h3>
          <div className="space-y-4">
            {[
              {
                step: language === 'ar' ? 'التسجيل' : 'Sign Up',
                time: language === 'ar' ? '30 ثانية' : '30 seconds',
                icon: '⚡'
              },
              {
                step: language === 'ar' ? 'إضافة الحيوان' : 'Add Pet',
                time: language === 'ar' ? '2-3 دقائق' : '2-3 minutes',
                icon: '🐾'
              },
              {
                step: language === 'ar' ? 'البحث والمطابقة' : 'Search & Match',
                time: language === 'ar' ? '5-10 دقائق' : '5-10 minutes',
                icon: '🔍'
              },
              {
                step: language === 'ar' ? 'التواصل' : 'Communication',
                time: language === 'ar' ? '15-30 دقيقة' : '15-30 minutes',
                icon: '💬'
              },
              {
                step: language === 'ar' ? 'العثور على المطابقة المثالية' : 'Find Perfect Match',
                time: language === 'ar' ? 'ساعة واحدة' : '1 hour',
                icon: '✅'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-gray-900">{item.step}</span>
                </div>
                <span className="text-sm font-mono bg-white px-3 py-1 rounded-lg text-gray-600 border border-gray-200">
                  {item.time}
                </span>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-4 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-green-600 rounded-full origin-left"
          />
          <p className="mt-4 text-sm text-gray-600">
            {language === 'ar'
              ? '⏳ في المجموع: أقل من ساعة واحدة من البداية إلى النهاية'
              : '⏳ Total: Less than 1 hour from start to finish'}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {language === 'ar' ? '🚀 ابدأ الآن - مجاني تماماً' : '🚀 Start Now - Completely Free'}
          </button>
          <p className="text-gray-600 text-sm mt-3">
            {language === 'ar'
              ? '❌ بدون بطاقة ائتمان | ✅ مجاني 100% للبدء'
              : '❌ No credit card | ✅ 100% free to start'}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
