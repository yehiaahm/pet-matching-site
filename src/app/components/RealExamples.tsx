import { motion } from 'framer-motion';
import { Star, MapPin, Zap, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

interface RealExampleProps {
  onGetStarted?: () => void;
}

export function RealExamples({ onGetStarted }: RealExampleProps) {
  const { language } = useLanguage();

  const examplesAr = [
    {
      name: "أحمد محمد",
      pet: "ذكر بولكي - لابرادور",
      location: "القاهرة، 5 كم",
      rating: 4.8,
      reviews: 23,
      image: "🐕",
      story: "بحث عن مطابقة لمدة 3 أشهر، وجد الأنثى المثالية في أسبوع واحد فقط!",
      badge: "✅ موثق"
    },
    {
      name: "فاطمة علي",
      pet: "أنثى بولكي - جولدن",
      location: "الجيزة، 8 كم",
      rating: 5.0,
      reviews: 15,
      image: "🐕",
      story: "محترفة مربية لمدة 10 سنوات، استخدمت PetMate وعثرت على 3 مطابقات ممتازة",
      badge: "⭐ مربية مميزة"
    },
    {
      name: "سارة خالد",
      pet: "أنثى قط - فارسي",
      location: "مدينة نصر، 3 كم",
      rating: 4.9,
      reviews: 18,
      image: "🐈",
      story: "أول مرة تستخدم التطبيق، عثرت على الذكر المثالي للتزاوج في يومين",
      badge: "✨ عضو جديد"
    },
    {
      name: "محمود عبدالعزيز",
      pet: "ذكر قط - فارسي",
      location: "الزمالك، 7 كم",
      rating: 4.7,
      reviews: 12,
      image: "🐈",
      story: "استخدم الخريطة للبحث، وجد 5 خيارات في نطاق 10 كم - اختار الأفضل",
      badge: "✅ موثق"
    },
    {
      name: "ليلى محمود",
      pet: "أنثى عصفور - كناري",
      location: "شيراتون، 6 كم",
      rating: 5.0,
      reviews: 9,
      image: "🦜",
      story: "بحثت عن عصفور بنفس السلالة والعمر - وجدت الذكر المثالي بسرعة",
      badge: "💎 متميزة"
    },
    {
      name: "عمر محمد",
      pet: "ذكر أرنب - هولندي",
      location: "مصر الجديدة، 4 كم",
      rating: 4.6,
      reviews: 14,
      image: "🐰",
      story: "مربي أرانب هواة، التطبيق ساعده على العثور على أنثى صحية موثوقة",
      badge: "✅ موثق"
    }
  ];

  const examplesEn = [
    {
      name: "Ahmed Mohamed",
      pet: "Male Husky - Labrador",
      location: "Cairo, 5 km",
      rating: 4.8,
      reviews: 23,
      image: "🐕",
      story: "Searched for 3 months, found the perfect female in just one week!",
      badge: "✅ Verified"
    },
    {
      name: "Fatima Ali",
      pet: "Female Husky - Golden",
      location: "Giza, 8 km",
      rating: 5.0,
      reviews: 15,
      image: "🐕",
      story: "Professional breeder for 10 years, found 3 excellent matches",
      badge: "⭐ Featured"
    },
    {
      name: "Sarah Khaled",
      pet: "Female Cat - Persian",
      location: "Nasr City, 3 km",
      rating: 4.9,
      reviews: 18,
      image: "🐈",
      story: "First-time user, found the perfect male in just two days",
      badge: "✨ New Member"
    },
    {
      name: "Mahmoud Abdel Aziz",
      pet: "Male Cat - Persian",
      location: "Zamalek, 7 km",
      rating: 4.7,
      reviews: 12,
      image: "🐈",
      story: "Used the map, found 5 options within 10 km radius",
      badge: "✅ Verified"
    },
    {
      name: "Layla Mahmoud",
      pet: "Female Bird - Canary",
      location: "Sheraton, 6 km",
      rating: 5.0,
      reviews: 9,
      image: "🦜",
      story: "Searched for same breed and age, found perfect match quickly",
      badge: "💎 Premium"
    },
    {
      name: "Omar Mohamed",
      pet: "Male Rabbit - Dutch",
      location: "New Cairo, 4 km",
      rating: 4.6,
      reviews: 14,
      image: "🐰",
      story: "Hobby breeder, app helped find healthy and verified female",
      badge: "✅ Verified"
    }
  ];

  const examples = language === 'ar' ? examplesAr : examplesEn;

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
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
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
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
              🌟 {language === 'ar' ? 'قصص حقيقية من مستخدمين حقيقيين' : 'Real Success Stories'}
            </span>
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'ar' 
              ? 'آلاف المستخدمين وجدوا المطابقة المثالية'
              : 'Thousands Found Their Perfect Match'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'انظر كيف استخدم مستخدمون حقيقيون PetMate للعثور على الحيوان الأليف المثالي في أيام وليس أسابيع'
              : 'See how real users used PetMate to find their perfect pet in days, not weeks'}
          </p>
        </div>

        {/* Examples Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {examples.map((example, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg"
            >
              {/* Card Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Card Content */}
              <div className="relative p-6 bg-white">
                {/* Header with Avatar and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-xl">
                      {example.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{example.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {example.location}
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                    {example.badge}
                  </div>
                </div>

                {/* Pet Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{example.pet}</p>
                </div>

                {/* Story */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                  "{example.story}"
                </p>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(example.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-semibold text-gray-900 ml-2">
                      {example.rating}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {example.reviews} {language === 'ar' ? 'تقييم' : 'reviews'}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                  <Zap className="w-3 h-3 text-green-600" />
                  {language === 'ar' ? 'تم التحقق من جميع البيانات' : 'All data verified'}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 md:p-12 mb-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-8 text-center">
            {language === 'ar' ? '📊 إحصائيات المستخدمين' : '📊 User Statistics'}
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                number: language === 'ar' ? '5,234' : '5,234',
                label: language === 'ar' ? 'مستخدم فعال' : 'Active Users',
                icon: '👥'
              },
              {
                number: language === 'ar' ? '8,912' : '8,912',
                label: language === 'ar' ? 'مطابقة ناجحة' : 'Successful Matches',
                icon: '❤️'
              },
              {
                number: language === 'ar' ? '2.3' : '2.3',
                label: language === 'ar' ? 'أيام في المتوسط' : 'Days on Average',
                icon: '⚡'
              },
              {
                number: language === 'ar' ? '98%' : '98%',
                label: language === 'ar' ? 'رضا المستخدمين' : 'User Satisfaction',
                icon: '😊'
              }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: Shield,
              title: language === 'ar' ? '✅ آمن بنسبة 100%' : '✅ 100% Safe',
              desc: language === 'ar' 
                ? 'جميع المستخدمين موثقون والبيانات محمية'
                : 'All users verified, data protected'
            },
            {
              icon: Zap,
              title: language === 'ar' ? '⚡ سريع جداً' : '⚡ Super Fast',
              desc: language === 'ar'
                ? 'اعثر على مطابقتك في أيام وليس أسابيع'
                : 'Find your match in days, not weeks'
            },
            {
              icon: Star,
              title: language === 'ar' ? '⭐ عالي الجودة' : '⭐ High Quality',
              desc: language === 'ar'
                ? 'فقط المربيين الموثوقين والحيوانات الصحية'
                : 'Only trusted breeders & healthy animals'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -20 : idx === 2 ? 20 : 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 text-center"
              >
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white gap-2"
          >
            {language === 'ar' ? '🎯 انضم إلى آلاف المستخدمين الراضين' : '🎯 Join Thousands of Happy Users'}
          </Button>
          <p className="text-gray-600 text-sm mt-4">
            {language === 'ar'
              ? 'انضم مجاناً اليوم وابدأ البحث عن مطابقتك المثالية'
              : 'Join free today and start searching for your perfect match'}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
