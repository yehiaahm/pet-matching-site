// Internationalization (i18n) configuration
export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Navigation
    nav: {
      signin: 'Sign In',
      startNow: 'Get Started',
      aboutFeatures: 'About Features',
      language: 'Language',
    },
    // Landing Page
    landing: {
      trusted: 'Trusted Platform',
      brandName: 'PetMate',
      subtitle: 'Find Your Pet\'s Perfect Match with Smart Technology',
      description: 'A trusted platform that connects pet owners with smart matching tools, health records, and complete support for safe and responsible breeding.',
      getStarted: 'Start Free',
      learnMore: 'Learn More',
      stats: {
        users: 'Active Users',
        matches: 'Successful Matches',
        safety: 'Safety & Trust',
      },
      stats_values: {
        users: '5000+',
        matches: '10000+',
        safety: '100%',
      },
      fastestWay: 'The fastest way to find the perfect match',
      features: {
        safety: {
          title: 'Safety & Trust',
          desc: 'Verified health records and pre-match health checks',
        },
        location: {
          title: 'Location Matching',
          desc: 'Find nearby partners through GPS technology',
        },
        smooth: {
          title: 'Smooth Experience',
          desc: 'User-friendly interface with continuous support',
        },
      },
      // 3D Features
      features3d: {
        aiTitle: 'AI-Powered Matching',
        aiDesc: 'Intelligent matching algorithm that finds the perfect breed pair based on genetics and health',
        gpsTitle: 'GPS Proximity',
        gpsDesc: 'Location-based search to find nearby compatible pets',
        healthTitle: 'Health Records',
        healthDesc: 'Complete health documentation and vaccination history',
        communityTitle: 'Community Support',
        communityDesc: 'Connect with experienced breeders and get expert advice',
      },
      // Subscription Plans
      subscription: {
        starter: 'Starter',
        professional: 'Professional',
        eliteBreeder: 'Elite Breeder',
        mostPopular: 'Most Popular',
        perfectForTrying: 'Perfect for trying out',
        bestForActiveBreeders: 'Best for active breeders',
        forProfessionalBreeding: 'For professional breeding',
        perMonth: '/month',
        free: 'Free',
        upgradeTo: 'Upgrade to',
        upgradeNow: 'Upgrade Now',
        currentPlan: 'Current Plan',
        cancelSubscription: 'Cancel Subscription',
        whyUpgrade: 'Why Upgrade Your Plan?',
      },
    },
  },
  ar: {
    // Navigation
    nav: {
      signin: 'تسجيل الدخول',
      startNow: 'ابدأ الآن',
      aboutFeatures: 'تعرّف على المزايا',
      language: 'اللغة',
    },
    // Landing Page
    landing: {
      trusted: 'منصة موثوقة',
      brandName: 'PetMate',
      subtitle: 'اعثر على شريك مناسب لحيوانك الأليف بسهولة وأمان',
      description: 'منصة عربية موثوقة تجمع أصحاب الحيوانات الأليفة مع أدوات مطابقة ذكية، سجلات صحية، ودعم كامل لضمان تجربة آمنة.',
      getStarted: 'ابدأ مجاناً',
      learnMore: 'تعرّف على المزايا',
      stats: {
        users: 'مستخدم نشط',
        matches: 'مطابقة ناجحة',
        safety: 'أمان وموثوقية',
      },
      stats_values: {
        users: '5000+',
        matches: '10000+',
        safety: '100%',
      },
      fastestWay: 'أسرع طريقة لإيجاد شريك مثالي',
      features: {
        safety: {
          title: 'أمان وموثوقية',
          desc: 'توثيق السجلات الصحية والفحوصات قبل المطابقة',
        },
        location: {
          title: 'مطابقة بالموقع',
          desc: 'ابحث عن أقرب الشركاء المناسبين عبر GPS',
        },
        smooth: {
          title: 'تجربة سلسة',
          desc: 'واجهة عربية سهلة مع دعم متواصل',
        },
      },
      // 3D Features
      features3d: {
        aiTitle: 'مطابقة ذكية بـ AI',
        aiDesc: 'خوارزمية تطابق ذكية تجد أفضل زوج سلالة بناءً على الوراثة والصحة',
        gpsTitle: 'البحث بالموقع',
        gpsDesc: 'بحث قائم على الموقع الجغرافي لإيجاد حيوانات أليفة متوافقة قريبة',
        healthTitle: 'السجلات الصحية',
        healthDesc: 'توثيق صحي شامل وسجل التطعيمات',
        communityTitle: 'دعم المجتمع',
        communityDesc: 'تواصل مع المربيين ذوي الخبرة واحصل على نصائح متخصصة',
      },
      // Subscription Plans
      subscription: {
        starter: 'مبتدئ',
        professional: 'احترافي',
        eliteBreeder: 'مربي النخبة',
        mostPopular: 'الأكثر شهرة',
        perfectForTrying: 'مثالي لتجربة الخدمة',
        bestForActiveBreeders: 'الأفضل للمربيين النشطين',
        forProfessionalBreeding: 'للتربية الاحترافية',
        perMonth: '/شهر',
        free: 'مجاني',
        upgradeTo: 'ترقية إلى',
        upgradeNow: 'ترقية الآن',
        currentPlan: 'الخطة الحالية',
        cancelSubscription: 'إلغاء الاشتراك',
        whyUpgrade: 'لماذا تقوم بالترقية؟',
      },
    },
  },
};

export function getLanguageDirection(language: Language): 'ltr' | 'rtl' {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function useTranslation(language: Language) {
  return translations[language];
}
