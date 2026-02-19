import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Shield, MapPin, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../../lib/i18n';
import { Features3D } from './Features3D';
import { AdvancedFeatures3D } from './AdvancedFeatures3D';
import { AIVideoGuide } from './AIVideoGuide';
import { ClearStepGuide } from './ClearStepGuide';
import { RealExamples } from './RealExamples';
import { MainBenefits } from './MainBenefits';
import { TrustAndSafety } from './TrustAndSafety';
import { WhyPetMateIsBetter } from './WhyPetMateIsBetter';
import { FAQSection } from './FAQSection';

// Simple landing page shown before authentication
export function LandingPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const t = useTranslation(language);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      <motion.header
        className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t.landing.trusted}</p>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">{t.landing.brandName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              {t.nav.startNow}
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: direction === 'rtl' ? -40 : 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">{t.landing.fastestWay}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {t.landing.subtitle}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t.landing.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg shadow-blue-100">
                {t.landing.getStarted}
                <ArrowRight className={`w-5 h-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('video-guide')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 hover:bg-blue-50 transition-colors"
              >
                {language === 'ar' ? '🎥 شاهد الفيديو' : '🎥 Watch Video'}
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 text-center text-gray-700">
              <div><p className="text-3xl font-bold text-gray-900">{t.landing.stats_values.users}</p><p className="text-sm">{t.landing.stats.users}</p></div>
              <div><p className="text-3xl font-bold text-gray-900">{t.landing.stats_values.matches}</p><p className="text-sm">{t.landing.stats.matches}</p></div>
              <div><p className="text-3xl font-bold text-gray-900">{t.landing.stats_values.safety}</p><p className="text-sm">{t.landing.stats.safety}</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: direction === 'rtl' ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative">
            <div className="p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'أمان عالي' : 'High Security'}</p>
                  <p className="font-semibold text-gray-900">{t.landing.features.safety.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-green-100 text-green-700">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'مطابقة دقيقة' : 'Precise Matching'}</p>
                  <p className="font-semibold text-gray-900">{t.landing.features.location.title}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 p-5 border border-blue-100">
                <p className="text-sm text-gray-600">
                  {language === 'ar'
                    ? 'جميع المستخدمين موثقون، مع دعم على مدار الساعة لتجربة تزاوج صحية ومسؤولة.'
                    : 'All users are verified with 24/7 support for a safe and responsible breeding experience.'}
                </p>
              </div>
            </div>
            <div className="absolute -z-10 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl top-10 left-10" />
            <div className="absolute -z-10 w-72 h-72 bg-green-200/40 rounded-full blur-3xl bottom-10 right-10" />
          </motion.div>
        </div>

        {/* Traditional Features Section */}
        <section id="features" className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            {
              title: t.landing.features.safety.title,
              desc: t.landing.features.safety.desc,
              icon: <Shield className="w-5 h-5" />
            },
            {
              title: t.landing.features.location.title,
              desc: t.landing.features.location.desc,
              icon: <MapPin className="w-5 h-5" />
            },
            {
              title: t.landing.features.smooth.title,
              desc: t.landing.features.smooth.desc,
              icon: <Sparkles className="w-5 h-5" />
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* AI Video Guide */}
        <div id="video-guide">
          <AIVideoGuide language={language} />
        </div>

        {/* Clear Step Guide */}
        <ClearStepGuide onGetStarted={() => navigate('/dashboard')} />

        {/* 3D Features Section */}
        <Features3D onFeatureSelect={() => navigate('/dashboard')} />

        {/* Main Benefits Section */}
        <MainBenefits onGetStarted={() => navigate('/dashboard')} />

        {/* Real Examples */}
        <RealExamples onGetStarted={() => navigate('/dashboard')} />

        {/* Why PetMate is Better */}
        <WhyPetMateIsBetter />

        {/* Advanced Features Section */}
        <AdvancedFeatures3D onFeatureSelect={() => navigate('/dashboard')} />

        {/* Trust and Safety */}
        <TrustAndSafety />

        {/* FAQ Section */}
        <FAQSection />
      </main>
    </div>
  );
}
