import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, MapPin, Heart, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../../lib/i18n';

// 3D Cube component for features display
interface Feature3DProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  gradient: string;
  onSelect?: () => void;
}

const Feature3DCard: React.FC<Feature3DProps> = ({ icon, title, description, delay, gradient, onSelect }) => {
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
        y: -10,
        rotateX: 10,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : -1}
      className={`relative h-80 rounded-3xl overflow-hidden cursor-pointer group perspective`}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 bg-white/10 backdrop-blur"
        animate={isHovered ? { opacity: 0.5 } : { opacity: 0.1 }}
      />

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
        {/* Icon with pulse animation */}
        <motion.div
          animate={isHovered ? { scale: 1.2, rotateZ: 10 } : { scale: 1, rotateZ: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className={`p-5 rounded-2xl ${
            gradient.includes('blue') ? 'bg-white/20' :
            gradient.includes('green') ? 'bg-white/20' :
            gradient.includes('purple') ? 'bg-white/20' :
            'bg-white/20'
          }`}>
            {icon}
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>

        {/* Description */}
        <motion.p
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 5 }}
          className="text-sm md:text-base leading-relaxed text-white/90"
        >
          {description}
        </motion.p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
          animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 3D border effect */}
      <div className="absolute inset-0 rounded-3xl border-2 border-white/20 pointer-events-none" />
    </motion.div>
  );
};

interface Features3DProps {
  onFeatureSelect?: (key: string) => void;
}

export function Features3D({ onFeatureSelect }: Features3DProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const isArabic = language === 'ar';

  const features = [
    {
      key: 'ai',
      icon: <Brain className="w-10 h-10" />,
      title: t.landing.features3d.aiTitle,
      description: t.landing.features3d.aiDesc,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    },
    {
      key: 'gps',
      icon: <MapPin className="w-10 h-10" />,
      title: t.landing.features3d.gpsTitle,
      description: t.landing.features3d.gpsDesc,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      key: 'health',
      icon: <Heart className="w-10 h-10" />,
      title: t.landing.features3d.healthTitle,
      description: t.landing.features3d.healthDesc,
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
    {
      key: 'community',
      icon: <Users className="w-10 h-10" />,
      title: t.landing.features3d.communityTitle,
      description: t.landing.features3d.communityDesc,
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    },
  ];

  return (
    <section className={`py-20 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isArabic ? 'المميزات الرئيسية' : 'Key Features'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isArabic 
              ? 'تقنيات متقدمة تجعل عملية إيجاد الشريك المثالي أسهل وأكثر أماناً'
              : 'Advanced technology that makes finding the perfect match easier and safer'
            }
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Feature3DCard
              key={feature.key}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={idx * 0.1}
              gradient={feature.gradient}
              onSelect={() => onFeatureSelect?.(feature.key)}
            />
          ))}
        </div>

        {/* Interactive Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          {[
            {
              number: '98%',
              label: isArabic ? 'معدل النجاح' : 'Success Rate',
              subtext: isArabic ? 'في عمليات المطابقة' : 'in matches',
            },
            {
              number: '24/7',
              label: isArabic ? 'الدعم المتاح' : 'Support Available',
              subtext: isArabic ? 'خدمة العملاء' : 'customer service',
            },
            {
              number: '100%',
              label: isArabic ? 'الأمان' : 'Security',
              subtext: isArabic ? 'تشفير البيانات' : 'encrypted data',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-center"
            >
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
              <p className="text-sm text-gray-600">{stat.subtext}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
