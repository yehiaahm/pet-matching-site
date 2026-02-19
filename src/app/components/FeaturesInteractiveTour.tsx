import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface TourStep {
  featureId: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  videoUrl?: string;
  actionAr: string;
  actionEn: string;
  actionUrl?: string;
}

const tourSteps: TourStep[] = [
  {
    featureId: 'ai',
    titleAr: '🤖 ابدأ مع المطابقة الذكية',
    titleEn: '🤖 Start with AI Matching',
    descAr: 'اكتشف كيف تجد النظام أفضل زوج لحيوانك بالذكاء الاصطناعي. ستذهل من دقة التوصيات!',
    descEn: 'Discover how the system finds the perfect match for your pet using AI. You\'ll be amazed by the accuracy!',
    actionAr: 'شاهد كيفية العمل',
    actionEn: 'See How It Works',
    actionUrl: '/ai',
  },
  {
    featureId: 'gps',
    titleAr: '📍 جرب البحث بـ GPS',
    titleEn: '📍 Try GPS Search',
    descAr: 'ابحث عن أقرب المربيين والحيوانات الأليفة. لا مزيد من البحث في كل مكان!',
    descEn: 'Find the closest breeders and pets near you. No more searching everywhere!',
    actionAr: 'فعّل البحث بالموقع',
    actionEn: 'Enable Location Search',
    actionUrl: '/gps',
  },
  {
    featureId: 'health',
    titleAr: '💚 نظّم السجلات الصحية',
    titleEn: '💚 Organize Health Records',
    descAr: 'احفظ جميع البيانات الصحية في مكان واحد آمن. تنبيهات تلقائية للمواعيد!',
    descEn: 'Save all health data in one secure place. Automatic appointment reminders!',
    actionAr: 'ابدأ الآن',
    actionEn: 'Get Started',
    actionUrl: '/health',
  },
  {
    featureId: 'alerts',
    titleAr: '⚡ فعّل التنبيهات الفورية',
    titleEn: '⚡ Enable Instant Alerts',
    descAr: 'لن تفوت أي مطابقة مثالية. ستصل إليك الإشعارات فوراً على هاتفك!',
    descEn: 'Never miss a perfect match. Get instant notifications on your phone!',
    actionAr: 'فعّل الآن',
    actionEn: 'Enable Now',
    actionUrl: '/alerts',
  },
  {
    featureId: 'featured',
    titleAr: '✨ اجعل ملفك مميزاً',
    titleEn: '✨ Make Your Profile Featured',
    descAr: 'اظهر في أول النتائج. 300% أكثر تفاعلات من المربيين الآخرين!',
    descEn: 'Appear at the top of results. 300% more engagement from other breeders!',
    actionAr: 'ميّز ملفك',
    actionEn: 'Get Featured',
    actionUrl: '/featured',
  },
];

interface FeaturesInteractiveTourProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function FeaturesInteractiveTour({
  onComplete,
  autoStart = false,
}: FeaturesInteractiveTourProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(autoStart);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (autoStart && !hasStarted) {
      setHasStarted(true);
    }
  }, []);

  const currentTour = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem('features-tour-completed', 'true');
    onComplete?.();
  };

  return (
    <>
      {/* Open Button (when closed) */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-40 group"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-4 shadow-lg">
              <Play className="w-6 h-6" />
            </div>
          </div>
        </motion.button>
      )}

      {/* Tour Modal */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className="overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
                  <div className="absolute inset-0 opacity-20 bg-pattern" />
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      {isArabic ? '🎓 جولة إرشادية' : '🎓 Feature Tour'}
                    </h2>
                    <motion.button
                      onClick={() => handleComplete()}
                      className="text-white/80 hover:text-white transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Step Counter */}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {isArabic ? 'الخطوة' : 'Step'} {currentStep + 1} {isArabic ? 'من' : 'of'}{' '}
                      {tourSteps.length}
                    </p>
                  </div>

                  {/* Feature Title */}
                  <motion.div
                    key={currentTour.featureId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {isArabic
                        ? currentTour.titleAr
                        : currentTour.titleEn}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {isArabic
                        ? currentTour.descAr
                        : currentTour.descEn}
                    </p>
                  </motion.div>

                  {/* Visual Indicator */}
                  <motion.div
                    className="grid grid-cols-5 gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {tourSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all ${
                          idx <= currentStep
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => {
                      if (currentTour.actionUrl) {
                        window.location.href = currentTour.actionUrl;
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isArabic
                      ? currentTour.actionAr
                      : currentTour.actionEn}
                  </motion.button>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="flex-1 py-2 px-3 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {isArabic ? 'السابق' : 'Previous'}
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={handleNext}
                      className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-sm font-medium">
                        {currentStep === tourSteps.length - 1
                          ? isArabic
                            ? 'انتهى'
                            : 'Finish'
                          : isArabic
                          ? 'التالي'
                          : 'Next'}
                      </span>
                      {currentStep < tourSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>

                  {/* Skip Button */}
                  <button
                    onClick={() => handleComplete()}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {isArabic ? 'تخطي الجولة' : 'Skip Tour'}
                  </button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
