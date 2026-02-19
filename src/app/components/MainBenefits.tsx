import { motion } from 'framer-motion';
import { Heart, MapPin, Shield, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MainBenefitsProps {
  onGetStarted?: () => void;
}

export function MainBenefits({ onGetStarted }: MainBenefitsProps) {
  const { language } = useLanguage();

  const benefitsAr = [
    {
      icon: Heart,
      title: "❤️ احصل على مطابقات مثالية",
      desc: "الذكاء الاصطناعي ينقح البحث عن الحيوانات المتطابقة - نفس السلالة، العمر، الحالة الصحية",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: MapPin,
      title: "📍 ابحث بالخريطة",
      desc: "اعثر على حيوانات قرب موقعك - شوف من تحتك مباشرة على الخريطة",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "🛡️ آمن 100%",
      desc: "جميع المستخدمين موثقون، تنبيهات تلقائية عند حدوث حالات طوارئ",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: MessageSquare,
      title: "💬 رسائل آمنة",
      desc: "تواصل مع مربيين موثوقين - محادثات خاصة وآمنة بنسبة 100%",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Zap,
      title: "⚡ سريع جداً",
      desc: "من التسجيل إلى العثور على مطابقتك في أقل من ساعة واحدة",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "📈 سجلات صحية كاملة",
      desc: "اطلع على التاريخ الصحي، التطعيمات، والفحوصات البيطرية لكل حيوان",
      color: "from-teal-500 to-green-600"
    }
  ];

  const benefitsEn = [
    {
      icon: Heart,
      title: "❤️ Get Perfect Matches",
      desc: "AI refines the search for matching animals - same breed, age, health status",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: MapPin,
      title: "📍 Search by Map",
      desc: "Find animals near you - see who's closest on the interactive map",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "🛡️ 100% Safe",
      desc: "All users verified, automatic alerts for emergency situations",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: MessageSquare,
      title: "💬 Safe Messaging",
      desc: "Chat with verified breeders - private and 100% secure conversations",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Zap,
      title: "⚡ Super Fast",
      desc: "From signup to finding your match in less than one hour",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "📈 Complete Health Records",
      desc: "Check health history, vaccinations, and vet checkups for every animal",
      color: "from-teal-500 to-green-600"
    }
  ];

  const benefits = language === 'ar' ? benefitsAr : benefitsEn;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            {language === 'ar'
              ? '✨ لماذا يختار المستخدمون PetMate؟'
              : '✨ Why Users Choose PetMate?'}
          </motion.h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'ar'
              ? '6 ميزات تجعل البحث عن حيوانك الأليف المثالي سهل جداً'
              : '6 features that make finding your perfect pet incredibly easy'}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${benefit.color} rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-300`} />

                {/* Card */}
                <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all h-full">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4 text-white text-2xl`}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>

                  {/* Checkmark */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    className="mt-4 flex items-center gap-2 text-green-600 text-xs font-semibold"
                  >
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    {language === 'ar' ? 'متضمن مجاناً' : 'Included free'}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-8 md:p-12 border border-blue-200"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {language === 'ar' ? '📊 مقارنة سريعة' : '📊 Quick Comparison'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    {language === 'ar' ? 'الميزة' : 'Feature'}
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="font-bold text-green-600 flex items-center justify-center gap-2">
                      🐾 PetMate
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="font-bold text-gray-600">{language === 'ar' ? 'الطرق التقليدية' : 'Traditional'}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: language === 'ar' ? 'السرعة' : 'Speed',
                    petmate: language === 'ar' ? 'ساعة واحدة' : '1 hour',
                    traditional: language === 'ar' ? 'أسابيع' : 'Weeks'
                  },
                  {
                    feature: language === 'ar' ? 'الأمان' : 'Safety',
                    petmate: language === 'ar' ? '100% موثق' : '100% Verified',
                    traditional: language === 'ar' ? 'غير موثق' : 'Unverified'
                  },
                  {
                    feature: language === 'ar' ? 'سهولة الاستخدام' : 'Ease of Use',
                    petmate: language === 'ar' ? 'سهل جداً' : 'Very Easy',
                    traditional: language === 'ar' ? 'معقد' : 'Complex'
                  },
                  {
                    feature: language === 'ar' ? 'المرونة' : 'Flexibility',
                    petmate: language === 'ar' ? 'بحث متقدم' : 'Advanced Search',
                    traditional: language === 'ar' ? 'بحث أساسي' : 'Basic Search'
                  },
                  {
                    feature: language === 'ar' ? 'التكلفة' : 'Cost',
                    petmate: language === 'ar' ? 'مجاني' : 'Free',
                    traditional: language === 'ar' ? 'متغير' : 'Variable'
                  }
                ].map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-200 hover:bg-white/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-green-600 font-bold">✅ {row.petmate}</td>
                    <td className="py-4 px-4 text-center text-gray-500">❌ {row.traditional}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
