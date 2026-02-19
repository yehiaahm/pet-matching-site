import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MapPin, Heart, Users, Sparkles, Shield, BarChart3, Zap, Award, TrendingUp, Lock, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdvancedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  gradient: string;
  onSelect?: () => void;
}

const AdvancedFeatureCard: React.FC<AdvancedFeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  delay, 
  gradient,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ 
        y: -15,
        rotateX: 15,
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : -1}
      className={`relative h-72 rounded-3xl overflow-hidden cursor-pointer group`}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-95`} />
      
      {/* Animated Backdrop */}
      <motion.div
        className="absolute inset-0 bg-white/15 backdrop-blur-sm"
        animate={isHovered ? { opacity: 0.6 } : { opacity: 0.2 }}
      />

      {/* Animated Background Orbs */}
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
        animate={isHovered ? { scale: 1.2, opacity: 0.4 } : { scale: 1, opacity: 0.2 }}
      />
      <motion.div
        className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
        animate={isHovered ? { scale: 1.2, opacity: 0.4 } : { scale: 1, opacity: 0.2 }}
      />

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
        {/* Icon with Animation */}
        <motion.div
          animate={isHovered ? { scale: 1.3, rotateZ: 20 } : { scale: 1, rotateZ: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="mb-6"
        >
          <div className="p-6 rounded-2xl bg-white/25 backdrop-blur-sm">
            {icon}
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>

        {/* Description */}
        <motion.p
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 5 }}
          className="text-sm md:text-base leading-relaxed text-white/90"
        >
          {description}
        </motion.p>

        {/* Bottom Bar Animation */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"
          animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating Icon */}
        <motion.div
          className="absolute top-4 right-4 text-white/40"
          animate={isHovered ? { y: -5, opacity: 0.8 } : { y: 0, opacity: 0.4 }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
};

interface AdvancedFeatures3DProps {
  onFeatureSelect?: (key: string) => void;
}

export function AdvancedFeatures3D({ onFeatureSelect }: AdvancedFeatures3DProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const features = [
    {
      key: 'ai',
      icon: <Brain className="w-10 h-10" />,
      title: isArabic ? 'مطابقة ذكية بـ AI' : 'AI-Powered Matching',
      description: isArabic 
        ? 'خوارزمية متقدمة تجد أفضل زوج سلالة بناءً على الوراثة والصحة والسلوك'
        : 'Advanced algorithm that finds the perfect breed pair based on genetics, health and behavior',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    },
    {
      key: 'gps',
      icon: <MapPin className="w-10 h-10" />,
      title: isArabic ? 'البحث بالموقع' : 'GPS Proximity',
      description: isArabic
        ? 'بحث قائم على الموقع الجغرافي لإيجاد حيوانات أليفة متوافقة قريبة منك'
        : 'Location-based search to find nearby compatible pets with precision mapping',
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      key: 'health',
      icon: <Heart className="w-10 h-10" />,
      title: isArabic ? 'السجلات الصحية' : 'Health Records',
      description: isArabic
        ? 'توثيق صحي شامل وسجل التطعيمات والفحوصات البيطرية المفصلة'
        : 'Complete health documentation including vaccination history and detailed vet checkups',
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
    {
      key: 'community',
      icon: <Users className="w-10 h-10" />,
      title: isArabic ? 'دعم المجتمع' : 'Community Support',
      description: isArabic
        ? 'تواصل مع المربيين ذوي الخبرة واحصل على نصائح متخصصة وإرشادات'
        : 'Connect with experienced breeders and get expert advice from the community',
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    },
    {
      key: 'analytics',
      icon: <BarChart3 className="w-10 h-10" />,
      title: isArabic ? 'تحليلات متقدمة' : 'Advanced Analytics',
      description: isArabic
        ? 'احصائيات مفصلة عن المطابقات والنجاحات وتقارير الأداء الشاملة'
        : 'Detailed statistics about matches, success rates and comprehensive performance reports',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    },
    {
      key: 'security',
      icon: <Shield className="w-10 h-10" />,
      title: isArabic ? 'أمان وخصوصية' : 'Security & Privacy',
      description: isArabic
        ? 'حماية كاملة للبيانات مع تشفير من الدرجة الأولى والمراقبة المستمرة'
        : 'Complete data protection with enterprise-grade encryption and continuous monitoring',
      gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
    },
    {
      key: 'quality',
      icon: <TrendingUp className="w-10 h-10" />,
      title: isArabic ? 'تحسن الجودة' : 'Quality Improvement',
      description: isArabic
        ? 'تتبع تحسن صفات السلالة على مدى الأجيال مع توصيات بناء على البيانات'
        : 'Track breed quality improvements across generations with data-driven recommendations',
      gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
    {
      key: 'alerts',
      icon: <Zap className="w-10 h-10" />,
      title: isArabic ? 'تنبيهات فورية' : 'Instant Alerts',
      description: isArabic
        ? 'اعلام فوري عند ظهور مطابقات جديدة مناسبة تتطابق مع معايير البحث'
        : 'Real-time notifications for new compatible matches that meet your criteria',
      gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    },
    {
      key: 'verification',
      icon: <Award className="w-10 h-10" />,
      title: isArabic ? 'شهادات التحقق' : 'Verification Badges',
      description: isArabic
        ? 'شهادات موثقة للمربيين المعتمدين مع سجل نظيف وتقييمات عالية'
        : 'Verified breeder badges for certified breeders with clean records and high ratings',
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    {
      key: 'scheduling',
      icon: <Clock className="w-10 h-10" />,
      title: isArabic ? 'جدولة ذكية' : 'Smart Scheduling',
      description: isArabic
        ? 'جدولة آلية للتزاوج مع حساب دقيق للفترات المثالية والدورات'
        : 'Automated breeding schedule calculation with precise optimal timing and cycles',
      gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
    },
    {
      key: 'contracts',
      icon: <Lock className="w-10 h-10" />,
      title: isArabic ? 'عقود آمنة' : 'Smart Contracts',
      description: isArabic
        ? 'عقود ذكية توثق الاتفاقيات وتحمي حقوق جميع الأطراف بشكل رسمي'
        : 'Smart contracts that document agreements and protect all parties legally',
      gradient: 'bg-gradient-to-br from-green-600 to-green-800',
    },
    {
      key: 'recommendations',
      icon: <Sparkles className="w-10 h-10" />,
      title: isArabic ? 'توصيات مخصصة' : 'Personalized Recommendations',
      description: isArabic
        ? 'توصيات مخصصة تناسب احتياجاتك بناء على السلوك والتفضيلات والتاريخ'
        : 'Customized recommendations tailored to your needs based on behavior and history',
      gradient: 'bg-gradient-to-br from-pink-600 to-pink-800',
    },
  ];

  return (
    <section className={`py-24 px-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {isArabic ? 'المميزات المتقدمة' : 'Advanced Features'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isArabic
              ? 'منصة شاملة مع 12 ميزة متقدمة لتحسين تجربتك وضمان النجاح'
              : 'Comprehensive platform with 12 advanced features to enhance your experience and ensure success'
            }
          </p>
        </motion.div>

        {/* Features Grid - 4 columns, responsive */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <AdvancedFeatureCard
              key={feature.key}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={idx * 0.08}
              gradient={feature.gradient}
              onSelect={() => onFeatureSelect?.(feature.key)}
            />
          ))}
        </div>

        {/* Interactive Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-28 grid md:grid-cols-4 gap-8"
        >
          {[
            {
              number: '12',
              label: isArabic ? 'مميزة متقدمة' : 'Advanced Features',
              icon: '⭐',
            },
            {
              number: '99.9%',
              label: isArabic ? 'معدل التوفر' : 'Uptime Guarantee',
              icon: '🛡️',
            },
            {
              number: '24/7',
              label: isArabic ? 'دعم فني' : 'Technical Support',
              icon: '🎧',
            },
            {
              number: '100%',
              label: isArabic ? 'رضا المستخدمين' : 'User Satisfaction',
              icon: '😊',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -10 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 text-center"
            >
              <div className="text-5xl mb-3">{stat.icon}</div>
              <motion.div
                className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.5, type: 'spring' }}
              >
                {stat.number}
              </motion.div>
              <p className="font-semibold text-gray-900 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
