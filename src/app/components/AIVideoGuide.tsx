import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shield, Heart, Search, MessageCircle, CheckCircle, Sparkles, Navigation, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface AIVideoGuideProps {
  language: 'en' | 'ar';
}

export function AIVideoGuide({ language }: AIVideoGuideProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const scenes = [
    {
      id: 0,
      title: language === 'ar' ? "مرحباً بكم في PetMate" : "Welcome to PetMate",
      subtitle: language === 'ar' ? "المنصة الأكثر أماناً لتزويج الأليفة" : "The safest platform for pet breeding",
      icon: <Heart className="w-16 h-16 text-red-500" />,
      color: "from-blue-500 to-indigo-600",
      caption: language === 'ar' ? "نحن نجمع بين عشاق الحيوانات الأليفة في بيئة آمنة واحترافية" : "Combining pet lovers in a safe and professional environment"
    },
    {
      id: 1,
      title: language === 'ar' ? "ابحث عن الشريك المثالي" : "Find the Perfect Match",
      subtitle: language === 'ar' ? "خوارزمية ذكية تعتمد على الموقع والسلالة" : "Smart AI based on location and breed",
      icon: <Search className="w-16 h-16 text-blue-500" />,
      color: "from-blue-400 to-cyan-500",
      caption: language === 'ar' ? "نظامنا يبحث آلياً عن أفضل الخيارات القريبة منك" : "Our system automatically finds the best options near you"
    },
    {
      id: 2,
      title: language === 'ar' ? "أمان وتوثيق كامل" : "Full Security & Verification",
      subtitle: language === 'ar' ? "كل المربيين موثقون لدينا" : "All breeders are verified by our team",
      icon: <Shield className="w-16 h-16 text-green-500" />,
      color: "from-green-500 to-emerald-600",
      caption: language === 'ar' ? "سلامة حيوانك هي أولويتنا القصوى، لذا نفحص كل ملف بدقة" : "Your pet's safety is our priority, we verify every profile"
    },
    {
      id: 3,
      title: language === 'ar' ? "دردشة آمنة وفورية" : "Secure Instant Chat",
      subtitle: language === 'ar' ? "تواصل مباشرة مع المربيين الآخرين" : "Connect directly with other owners",
      icon: <MessageCircle className="w-16 h-16 text-purple-500" />,
      color: "from-purple-500 to-pink-600",
      caption: language === 'ar' ? "تعرف على الطرف الآخر وناقش التفاصيل قبل أي اتفاق" : "Get to know the other party and discuss details first"
    },
    {
      id: 4,
      title: language === 'ar' ? "انضم إلى مجتمعنا" : "Join Our Community",
      subtitle: language === 'ar' ? "آلاف المربيين في انتظارك" : "Thousands of owners are waiting",
      icon: <Users className="w-16 h-16 text-orange-500" />,
      color: "from-orange-500 to-yellow-500",
      caption: language === 'ar' ? "ابدأ رحلتك اليوم وابحث عن الأفضل لحيوانك الأليف" : "Start your journey today and find the best for your pet"
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentScene((prevScene) => (prevScene + 1) % scenes.length);
            return 0;
          }
          return prev + 1;
        });
      }, 50); // Each scene lasts 5 seconds (100 * 50ms)
    }
    return () => clearInterval(interval);
  }, [isPlaying, scenes.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-br from-gray-50 to-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl mt-12 mb-12"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg shadow-blue-200">
              ✨ {language === 'ar' ? 'فيديو تعريفي تفاعلي' : 'Interactive Intro Motion'}
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {language === 'ar' ? "كيف يعمل PetMate؟" : "How PetMate Works?"}
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {language === 'ar'
              ? "عرض توضيحي صممه الذكاء الاصطناعي ليشرح لك المنصة في ثوانٍ"
              : "An AI-designed presentation explaining the platform in seconds"}
          </p>
        </div>

        {/* Motion "Video" Container */}
        <div className="relative max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden bg-gray-900 aspect-video shadow-[0_30px_70px_rgba(0,0,0,0.2)] border-8 border-white group">

          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 z-20 overflow-hidden flex">
            {scenes.map((_, idx) => (
              <div key={idx} className="flex-1 h-full border-r border-black/10 relative">
                <div
                  className={`absolute inset-0 bg-blue-500 transition-all duration-300 ${idx < currentScene ? 'w-full' : idx === currentScene ? '' : 'w-0'}`}
                  style={idx === currentScene ? { width: `${progress}%` } : {}}
                />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className={`absolute inset-0 bg-gradient-to-br ${scenes[currentScene].color} flex items-center justify-center overflow-hidden`}
            >
              {/* Background Decorative Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"
              />

              <div className="relative z-10 text-center text-white p-8">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 flex justify-center"
                >
                  <div className="p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
                    {scenes[currentScene].icon}
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-5xl font-black mb-4 leading-tight"
                >
                  {scenes[currentScene].title}
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl md:text-2xl text-white/80 font-medium"
                >
                  {scenes[currentScene].subtitle}
                </motion.p>
              </div>

              {/* Decorative Floating shapes */}
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  y: [0, 50, 0],
                  scale: [1, 0.8, 1],
                  rotate: [0, -90, 0]
                }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute bottom-20 left-20 w-48 h-48 bg-black/10 rounded-[4rem] blur-2xl"
              />
            </motion.div>
          </AnimatePresence>

          {/* Captions Overlay */}
          <div className="absolute bottom-24 left-0 right-0 z-20 px-8 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-block px-6 py-2 rounded-full bg-black/40 backdrop-blur-md text-white md:text-lg border border-white/10"
              >
                {scenes[currentScene].caption}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all"
                onClick={togglePlay}
              >
                {isPlaying ? <Navigation className="w-6 h-6 rotate-90 fill-current" /> : <Play className={`w-6 h-6 ${language === 'ar' ? '' : 'ml-1'} fill-current`} />}
              </Button>
              <div className="hidden md:flex flex-col">
                <span className="text-xs text-white/50 uppercase font-black tracking-widest leading-none mb-1">
                  {language === 'ar' ? 'المشهد الحالي' : 'Current Scene'}
                </span>
                <span className="text-white font-bold leading-none">
                  {currentScene + 1} / {scenes.length}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {scenes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentScene(idx); setProgress(0); setIsPlaying(true); }}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${idx === currentScene ? 'w-10 bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>

            <Button
              className="px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 gap-2 shadow-xl shadow-blue-500/30"
              onClick={() => setIsPlaying(true)}
            >
              {isPlaying ? (language === 'ar' ? 'متابعة...' : 'Playing...') : (language === 'ar' ? 'ابدأ العرض' : 'Start Show')}
              {!isPlaying && <Sparkles className="w-4 h-4" />}
            </Button>
          </div>

          {/* Big Play Button Overlay */}
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-28 h-28 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] border-8 border-blue-600"
              >
                <Play className={`w-12 h-12 ${language === 'ar' ? '' : 'ml-2'} fill-current`} />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Features Cards Grid Below */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 px-4">
          {[
            {
              title: language === 'ar' ? "تزويج مسؤول" : "Responsible Breeding",
              desc: language === 'ar' ? "نحن نشجع فقط التزاوج المسؤول والصحي للحيوانات" : "We only encourage responsible and healthy breeding",
              icon: <CheckCircle className="w-5 h-5 text-green-500" />
            },
            {
              title: language === 'ar' ? "خرائط ذكية" : "Smart Maps",
              desc: language === 'ar' ? "تواصل مع جيرانك من عشاق الأليفة بسهولة" : "Connect with fellow pet lovers nearby",
              icon: <Navigation className="w-5 h-5 text-blue-500" />
            },
            {
              title: language === 'ar' ? "دعم مستمر" : "24/7 Support",
              desc: language === 'ar' ? "فريقنا متواجد دائماً لمساعدتك في أي استفسار" : "Our team is always here for your questions",
              icon: <Sparkles className="w-5 h-5 text-purple-500" />
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[2rem] bg-white border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900">{item.title}</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
