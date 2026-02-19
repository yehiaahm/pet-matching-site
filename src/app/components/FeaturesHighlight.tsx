import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import {
  Brain,
  MapPin,
  Heart,
  Zap,
  Shield,
  TrendingUp,
  MessageSquare,
  Bell,
  Award,
  Camera,
  Gauge,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';
import { GradientButton } from './ui/ModernButton';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

const featuresList = [
  {
    id: 'ai',
    icon: Brain,
    titleAr: '🤖 مطابقة ذكية بـ AI',
    titleEn: 'AI-Powered Matching',
    descAr: 'خوارزمية متقدمة تجد أفضل زوج سلالة بناءً على الوراثة والصحة والسلوك',
    descEn: 'Advanced algorithm finds perfect breeding matches based on genetics, health, and behavior',
    benefitsAr: [
      'توصيات دقيقة 99.5%',
      'توافق عالي مع أقل مشاكل',
      'توفير وقت البحث (ساعات → دقائق)',
    ],
    benefitsEn: [
      '99.5% accuracy in recommendations',
      'Highest compatibility rates',
      'Save hours of research',
    ],
    ctaAr: 'جرب المطابقة الذكية',
    ctaEn: 'Try AI Matching',
    gradient: 'from-blue-500 to-cyan-500',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'gps',
    icon: MapPin,
    titleAr: '📍 بحث بـ GPS',
    titleEn: 'GPS-Based Search',
    descAr: 'ابحث عن حيوانات أليفة متوافقة بناءً على قربك الجغرافي',
    descEn: 'Find compatible pets near you with geographic proximity matching',
    benefitsAr: [
      'عرض خريطة تفاعلية',
      'محاسبة المسافة الفعلية',
      'ترتيب الأقرب أولاً',
    ],
    benefitsEn: [
      'Interactive map display',
      'Real distance calculation',
      'Closest matches first',
    ],
    ctaAr: 'ابحث بالموقع',
    ctaEn: 'Search by Location',
    gradient: 'from-green-500 to-emerald-500',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    id: 'health',
    icon: Heart,
    titleAr: '💚 سجلات صحية',
    titleEn: 'Health Records',
    descAr: 'إدارة كاملة للسجلات الطبية والتحصينات والفحوصات',
    descEn: 'Complete health management with vaccinations and medical tests',
    benefitsAr: [
      'تتبع جميع اللقاحات',
      'فحوصات وراثية موثقة',
      'تنبيهات تلقائية للمواعيد',
    ],
    benefitsEn: [
      'Track all vaccinations',
      'Documented genetic tests',
      'Automatic appointment alerts',
    ],
    ctaAr: 'عرض السجلات',
    ctaEn: 'View Records',
    gradient: 'from-pink-500 to-rose-500',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
  },
  {
    id: 'alerts',
    icon: Bell,
    titleAr: '⚡ تنبيهات فورية',
    titleEn: 'Instant Alerts',
    descAr: 'احصل على إخطارات فورية عندما يظهر مطابقة مثالية',
    descEn: 'Get instant notifications when perfect matches appear',
    benefitsAr: [
      'لا تفوّت أي فرصة',
      'إشعارات في الوقت الفعلي',
      'ترشيحات مخصصة',
    ],
    benefitsEn: [
      'Never miss opportunities',
      'Real-time notifications',
      'Personalized recommendations',
    ],
    ctaAr: 'تفعيل التنبيهات',
    ctaEn: 'Enable Alerts',
    gradient: 'from-yellow-500 to-orange-500',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  {
    id: 'security',
    icon: Shield,
    titleAr: '🔒 حماية آمنة',
    titleEn: 'Secure Protection',
    descAr: 'تشفير كامل للبيانات والخصوصية الشاملة',
    descEn: 'Complete data encryption and comprehensive privacy protection',
    benefitsAr: [
      'تشفير من طرف لطرف',
      'حماية بيانات الملكية',
      'تحكم كامل بالخصوصية',
    ],
    benefitsEn: [
      'End-to-end encryption',
      'Ownership data protection',
      'Full privacy control',
    ],
    ctaAr: 'معرفة المزيد',
    ctaEn: 'Learn More',
    gradient: 'from-red-500 to-purple-500',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    id: 'messaging',
    icon: MessageSquare,
    titleAr: '💬 رسائل مباشرة',
    titleEn: 'Direct Messaging',
    descAr: 'تواصل آمن ومباشر مع المربيين الآخرين',
    descEn: 'Secure direct messaging with other breeders',
    benefitsAr: [
      'محادثات آمنة وسرية',
      'نقل الملفات والصور',
      'محفوظ ومؤرشف',
    ],
    benefitsEn: [
      'Secure private chats',
      'File and image sharing',
      'Archived and organized',
    ],
    ctaAr: 'ابدأ المحادثة',
    ctaEn: 'Start Messaging',
    gradient: 'from-indigo-500 to-blue-500',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    id: 'portfolio',
    icon: Camera,
    titleAr: '📸 معرض احترافي',
    titleEn: 'Professional Portfolio',
    descAr: 'عرض صور احترافية لحيواناتك الأليفة',
    descEn: 'Showcase professional photos of your pets',
    benefitsAr: [
      'معرض صور محسّن',
      'شارة "موثق" رسمية',
      'زيادة المصداقية',
    ],
    benefitsEn: [
      'Optimized photo gallery',
      'Official "Verified" badge',
      'Increased credibility',
    ],
    ctaAr: 'أنشئ معرضك',
    ctaEn: 'Create Gallery',
    gradient: 'from-purple-500 to-pink-500',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    id: 'analytics',
    icon: TrendingUp,
    titleAr: '📊 تحليلات متقدمة',
    titleEn: 'Advanced Analytics',
    descAr: 'إحصائيات شاملة عن أداء ملفك وتفاعلات المستخدمين',
    descEn: 'Comprehensive stats on your profile performance and engagement',
    benefitsAr: [
      'عدد الزوار والتفاعلات',
      'احصائيات البحث',
      'تحسين الأداء',
    ],
    benefitsEn: [
      'Views and engagement stats',
      'Search analytics',
      'Performance insights',
    ],
    ctaAr: 'عرض الإحصائيات',
    ctaEn: 'View Stats',
    gradient: 'from-teal-500 to-green-500',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
  },
  {
    id: 'ratings',
    icon: Award,
    titleAr: '⭐ نظام التقييمات',
    titleEn: 'Rating System',
    descAr: 'احصل على تقييمات من المربيين الآخرين وقيّمهم',
    descEn: 'Get rated by other breeders and rate them',
    benefitsAr: [
      'بناء سمعة قوية',
      'شفافية كاملة',
      'ثقة مرتفعة',
    ],
    benefitsEn: [
      'Build strong reputation',
      'Complete transparency',
      'High trust factor',
    ],
    ctaAr: 'شاهد التقييمات',
    ctaEn: 'View Ratings',
    gradient: 'from-amber-500 to-orange-500',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    id: 'featured',
    icon: Sparkles,
    titleAr: '✨ ملف مميز',
    titleEn: 'Featured Profile',
    descAr: 'ظهور بارز في البحث والقوائم الموصى بها',
    descEn: 'Prominent visibility in search and recommendations',
    benefitsAr: [
      'ظهور الأول في النتائج',
      'شارة "مميز" رسمية',
      'زيادة التفاعلات 300%',
    ],
    benefitsEn: [
      'Top search results',
      'Official "Featured" badge',
      '300% more engagement',
    ],
    ctaAr: 'ميّز ملفك',
    ctaEn: 'Get Featured',
    gradient: 'from-fuchsia-500 to-purple-500',
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
  },
  {
    id: 'integration',
    icon: Gauge,
    titleAr: '🏥 تكامل بيطري',
    titleEn: 'Vet Integration',
    descAr: 'ربط مباشر مع العيادات البيطرية المعتمدة',
    descEn: 'Direct connection with certified veterinary clinics',
    benefitsAr: [
      'وصول مباشر للفحوصات',
      'تقارير موثقة رسمياً',
      'موثوقية عالية',
    ],
    benefitsEn: [
      'Direct test access',
      'Officially verified reports',
      'High credibility',
    ],
    ctaAr: 'اربط عيادتك',
    ctaEn: 'Link Clinic',
    gradient: 'from-cyan-500 to-blue-500',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  {
    id: 'breeding',
    icon: Zap,
    titleAr: '🧬 مدير التربية',
    titleEn: 'Breeding Manager',
    descAr: 'إدارة دورات التربية وتتبع النسل والنتائج',
    descEn: 'Manage breeding cycles, track offspring and results',
    benefitsAr: [
      'تتبع دقيق للنسل',
      'جداول زمنية تلقائية',
      'نتائج موثقة',
    ],
    benefitsEn: [
      'Precise lineage tracking',
      'Automated timelines',
      'Documented results',
    ],
    ctaAr: 'ابدأ التتبع',
    ctaEn: 'Start Tracking',
    gradient: 'from-lime-500 to-green-500',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50 dark:bg-lime-950/30',
  },
];

export function FeaturesHighlight() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const selected = selectedFeature
    ? featuresList.find((f) => f.id === selectedFeature)
    : null;

  const handleCTA = (featureId: string) => {
    toast.success(`جاري الانتقال إلى ${featuresList.find((f) => f.id === featureId)?.titleAr}...`);
  };

  return (
    <motion.section
      className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-5 h-5" />
            {isArabic ? '12 ميزة متقدمة' : '12 Advanced Features'}
          </motion.div>

          <h2 className="text-4xl font-bold mb-4">
            {isArabic
              ? '✨ ميزات لا تعرفها معظم الناس'
              : '✨ Features Most People Don\'t Know About'}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isArabic
              ? 'اكتشف الميزات المتقدمة التي تجعل PetMate المنصة الأقوى للتربية المسؤولة'
              : 'Discover advanced features that make PetMate the most powerful responsible breeding platform'}
          </p>
        </motion.div>

        {/* Features Grid + Detail View */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Features Grid */}
          <motion.div
            className="lg:col-span-2 space-y-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {featuresList.map((feature, idx) => {
                const Icon = feature.icon;
                const isSelected = selectedFeature === feature.id;
                const isHovered = hoveredFeature === feature.id;

                return (
                  <motion.button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className={`p-4 rounded-xl transition-all text-right ${
                      isSelected
                        ? `bg-gradient-to-br ${feature.gradient} text-white shadow-lg shadow-primary/20`
                        : `${feature.bgColor} border border-current/10 hover:border-current/30`
                    }`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <motion.div
                        animate={{
                          rotate: isSelected || isHovered ? 10 : 0,
                          scale: isSelected ? 1.2 : 1,
                        }}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isSelected ? 'text-white' : feature.color
                          }`}
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-sm line-clamp-2 ${
                            isSelected ? 'text-white' : feature.color
                          }`}
                        >
                          {isArabic ? feature.titleAr : feature.titleEn}
                        </h3>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-white"
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Detail Panel */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`relative overflow-hidden bg-gradient-to-br ${selected.gradient} text-white p-6 h-full`}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-pattern" />

                    <div className="relative z-10 space-y-4">
                      {/* Icon */}
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <selected.icon className="w-7 h-7 text-white" />
                      </motion.div>

                      {/* Title */}
                      <div>
                        <h3 className="text-2xl font-bold">
                          {isArabic
                            ? selected.titleAr
                            : selected.titleEn}
                        </h3>
                        <p className="text-white/80 text-sm mt-1">
                          {isArabic
                            ? selected.descAr
                            : selected.descEn}
                        </p>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-white/70 uppercase">
                          {isArabic ? 'الفوائد الرئيسية' : 'Key Benefits'}
                        </p>
                        <div className="space-y-2">
                          {(isArabic
                            ? selected.benefitsAr
                            : selected.benefitsEn
                          ).map((benefit, i) => (
                            <motion.div
                              key={i}
                              className="flex items-start gap-2 text-sm"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="mt-1">
                                <Check className="w-4 h-4 text-white flex-shrink-0" />
                              </div>
                              <span>{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        onClick={() => handleCTA(selected.id)}
                        className="w-full mt-4 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isArabic ? selected.ctaAr : selected.ctaEn}
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>

                      {/* Feature ID */}
                      <p className="text-xs text-white/50 text-center mt-2">
                        #{selected.id.toUpperCase()}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className={`${featuresList[0].bgColor} rounded-xl p-8 h-full flex items-center justify-center text-center`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div>
                    <Sparkles className={`w-12 h-12 ${featuresList[0].color} mx-auto mb-4`} />
                    <p className={featuresList[0].color}>
                      {isArabic
                        ? 'اختر ميزة لعرض التفاصيل'
                        : 'Select a feature to view details'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-4">
            <GradientButton size="lg" className="group">
              {isArabic
                ? '🚀 اكتشف جميع الميزات'
                : '🚀 Explore All Features'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
