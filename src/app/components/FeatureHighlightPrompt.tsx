import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Lock,
  Unlock,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface FeaturePromptProps {
  featureName: string;
  featureIcon?: React.ReactNode;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  ctaAr: string;
  ctaEn: string;
  onAction?: () => void;
  isPremium?: boolean;
  position?: 'top' | 'bottom' | 'center';
  autoClose?: number; // milliseconds
}

export function FeatureHighlightPrompt({
  featureName,
  featureIcon,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  ctaAr,
  ctaEn,
  onAction,
  isPremium = false,
  position = 'bottom',
  autoClose = 0,
}: FeaturePromptProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const positions = {
    top: 'top-8',
    bottom: 'bottom-8',
    center: 'top-1/2 -translate-y-1/2',
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positions[position]} right-8 z-40 max-w-sm`}
          initial={{ opacity: 0, x: 400, y: position === 'center' ? 0 : -20 }}
          animate={{ opacity: 1, x: 0, y: position === 'center' ? 0 : 0 }}
          exit={{ opacity: 0, x: 400, y: position === 'center' ? 0 : -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10 p-4">
              {/* Header with Icon */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {featureIcon ? (
                    <motion.div
                      className="mt-0.5"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {featureIcon}
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    </motion.div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-sm leading-tight">
                      {isArabic ? titleAr : titleEn}
                    </h3>
                    {isPremium && (
                      <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 rounded-full">
                        ⭐ {isArabic ? 'ميزة مميزة' : 'Premium'}
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 text-right">
                {isArabic ? descriptionAr : descriptionEn}
              </p>

              {/* CTA Button */}
              <motion.button
                onClick={() => {
                  onAction?.();
                  setIsVisible(false);
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{isArabic ? ctaAr : ctaEn}</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* Progress Bar */}
              {autoClose > 0 && (
                <motion.div
                  className="mt-3 h-0.5 bg-muted-foreground/30 rounded-full overflow-hidden"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoClose / 1000, ease: 'linear' }}
                />
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Batch Feature Highlights - Show multiple features discovering
 */
interface FeaturesDiscoveryProps {
  onDismiss?: () => void;
}

export function FeaturesDiscovery({ onDismiss }: FeaturesDiscoveryProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      titleAr: '✨ اكتشف 12 ميزة متقدمة',
      titleEn: '✨ Discover 12 Advanced Features',
      descAr: 'نحن أضفنا ميزات جديدة تماماً لتحسين تجربتك',
      descEn: 'We\'ve added brand new features to improve your experience',
      ctaAr: 'استكشف الميزات',
      ctaEn: 'Explore Features',
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      titleAr: '⚡ مطابقة ذكية فورية',
      titleEn: '⚡ Instant AI Matching',
      descAr: 'احصل على توصيات مثالية في ثوانٍ بدلاً من ساعات!',
      descEn: 'Get perfect recommendations in seconds instead of hours!',
      ctaAr: 'جرب الآن',
      ctaEn: 'Try Now',
    },
    {
      icon: <Unlock className="w-6 h-6 text-green-500" />,
      titleAr: '🔓 ميزات جديدة مفتوحة',
      titleEn: '🔓 New Features Unlocked',
      descAr: 'تحديثات جديدة تماماً خاصة بك كمستخدم مميز',
      descEn: 'Brand new updates exclusive to you as a valued member',
      ctaAr: 'شاهد الكل',
      ctaEn: 'See All',
    },
  ];

  const current = features[currentFeatureIndex];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onDismiss?.()}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            {/* Header Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
              <div className="absolute inset-0 opacity-20 bg-pattern" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold">
                  {isArabic ? '🎉 تحديث جديد!' : '🎉 New Update!'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isArabic ? 'اكتشف الميزات الجديدة' : 'Discover what\'s new'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeatureIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-3"
                >
                  <motion.div className="flex justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {current.icon}
                    </motion.div>
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {isArabic ? current.titleAr : current.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isArabic ? current.descAr : current.descEn}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2">
                {features.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentFeatureIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentFeatureIndex
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-6'
                        : 'bg-muted w-2'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <motion.button
                  onClick={() => {
                    toast.success(
                      isArabic ? 'جاري التحميل...' : 'Loading...'
                    );
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isArabic ? current.ctaAr : current.ctaEn}
                </motion.button>

                <button
                  onClick={() => onDismiss?.()}
                  className="w-full py-2 px-4 rounded-lg border border-border hover:bg-muted transition-all text-sm"
                >
                  {isArabic ? 'ربما لاحقاً' : 'Maybe Later'}
                </button>
              </div>

              {/* Feature Counter */}
              <p className="text-xs text-center text-muted-foreground">
                {isArabic ? 'الميزة' : 'Feature'} {currentFeatureIndex + 1} {isArabic ? 'من' : 'of'}{' '}
                {features.length}
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
