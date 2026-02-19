import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../hooks/usePets';
import { aiMatchingEngine, EnhancedMatchScore } from '../services/advancedAIService';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/badge';
import { Heart, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Pet } from '../App';

interface RecommendationCard extends EnhancedMatchScore {
  matchedPet?: Pet;
  matchedPetId: string;
  petName?: string;
}

export default function AIMatchingPage() {
  const { user, token } = useAuth();
  const { pets } = usePets();
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<RecommendationCard | null>(null);
  const [detailedScore, setDetailedScore] = useState<any>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  // Auto-select first pet
  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0].id);
    }
  }, [pets, selectedPet]);

  const handleFetchRecommendations = async () => {
    if (!selectedPet || pets.length === 0) {
      toast.error('الرجاء إضافة حيوان أليف أولاً');
      return;
    }

    setLoading(true);
    try {
      const currentPet = pets.find(p => p.id === selectedPet);
      if (!currentPet) {
        toast.error('لم يتم العثور على الحيوان المختار');
        return;
      }

      // استخدام محرك AI المتقدم لحساب التوافق مع جميع الحيوانات الأخرى
      const allRecommendations: RecommendationCard[] = [];

      for (const otherPet of pets) {
        if (otherPet.id !== selectedPet) {
          const score = aiMatchingEngine.calculateComprehensiveScore(currentPet, otherPet);
          allRecommendations.push({
            ...score,
            matchedPetId: otherPet.id,
            matchedPet: otherPet,
            petName: otherPet.name,
          });
        }
      }

      // ترتيب حسب النقاط (تنازلي)
      const sorted = allRecommendations.sort((a, b) => b.totalScore - a.totalScore);
      
      setRecommendations(sorted.slice(0, 8)); // أعلى 8 مطابقات
      
      if (sorted.length === 0) {
        toast.info('لا توجد حيوانات أخرى لعمل مطابقات معها');
      } else {
        toast.success(`🎉 تم تحليل ${sorted.length} حيوان! العثور على ${sorted.length} مطابقات ممتازة`);
      }
    } catch (error) {
      toast.error('خطأ في جلب التوصيات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDetailed = async (matchedPetId: string) => {
    setLoadingScore(true);
    try {
      const currentPet = pets.find(p => p.id === selectedPet);
      const matchedPet = pets.find(p => p.id === matchedPetId);
      
      if (currentPet && matchedPet) {
        const detailedScores = aiMatchingEngine.calculateComprehensiveScore(currentPet, matchedPet);
        setDetailedScore(detailedScores);
      }
    } catch (error) {
      toast.error('خطأ في حساب النقاط التفصيلية');
      console.error(error);
    } finally {
      setLoadingScore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - خرافي وجميل */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              className="absolute -inset-8 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-2xl opacity-30"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            <h1 className="relative text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🚀 مطابقة ذكية بـ AI
            </h1>
          </div>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تقنية الذكاء الاصطناعي المتقدمة تحلل الوراثة والصحة والسلوك للعثور على أفضل شريك لحيوانك
          </p>
        </motion.div>

        {/* Selection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="text-red-500" />
            اختر حيوانك الأليف
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <motion.button
                  key={pet.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPet(pet.id)}
                  className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                    selectedPet === pet.id
                      ? 'ring-4 ring-purple-500 bg-gradient-to-br from-purple-100 to-pink-100'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold text-lg text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">{pet.breed}</p>
                    <Badge className="mt-2" variant={selectedPet === pet.id ? 'default' : 'outline'}>
                      {pet.gender === 'male' ? '🐕‍🦺 ذكر' : '🐩 أنثى'}
                    </Badge>
                  </div>
                  {selectedPet === pet.id && (
                    <motion.div
                      layoutId="selected-pet"
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle className="text-purple-500 w-6 h-6" />
                    </motion.div>
                  )}
                </motion.button>
              ))
            ) : (
              <p className="col-span-full text-gray-500 text-center py-8">
                لا توجد حيوانات أليفة. الرجاء إضافة حيوان أولاً.
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFetchRecommendations}
            disabled={loading || !selectedPet || pets.length < 2}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                جاري البحث عن المطابقات...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                ابحث عن أفضل المطابقات (AI Power 🔥)
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Recommendations Grid - خرافي */}
        <AnimatePresence mode="wait">
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Zap className="text-yellow-500" />
                أفضل المطابقات المخصصة
                <Badge className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600">
                  {recommendations.length} نتيجة
                </Badge>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.matchedPetId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 border-2 border-gradient-to-r from-purple-200 to-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300 p-0"
                  >
                    {/* Animated Background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:via-pink-600/10 group-hover:to-blue-600/10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    />

                    <div className="relative p-8 h-full flex flex-col">
                      {/* Score Badge */}
                      <div className="absolute top-4 right-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl shadow-lg"
                        >
                          {rec.totalScore}%
                        </motion.div>
                      </div>

                      {/* Pet Name */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-2">
                        {rec.petName || rec.matchedPetId}
                      </h3>

                      {/* Recommendation */}
                      <p className="text-sm text-gray-600 mb-6">
                        {rec.recommendation}
                      </p>

                      {/* Compatibility Bars */}
                      <div className="space-y-4 mb-8 flex-grow">
                        {[
                          { label: 'الوراثة', value: rec.geneticScore, icon: '📊' },
                          { label: 'الصحة', value: rec.healthScore, icon: '💪' },
                          { label: 'السلوك', value: rec.behaviorScore, icon: '😊' },
                          { label: 'الموقع', value: rec.locationScore, icon: '📍' },
                        ].map((comp) => (
                          <div key={comp.label}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold text-gray-700">
                                {comp.icon} {comp.label}
                              </span>
                              <span className="text-sm font-bold text-purple-600">
                                {Math.round(comp.value)}%
                              </span>
                            </div>
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${comp.value}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.05 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedMatch(rec);
                          handleCalculateDetailed(rec.matchedPetId);
                        }}
                        disabled={loadingScore && selectedMatch?.matchedPetId === rec.matchedPetId}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all duration-300"
                      >
                        {loadingScore && selectedMatch?.matchedPetId === rec.matchedPetId ? (
                          'جاري التحليل...'
                        ) : (
                          '🔍 عرض التفاصيل الكاملة'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed Score Modal */}
        <AnimatePresence>
          {detailedScore && selectedMatch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailedScore(null)}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedMatch.petName}
                    </h2>
                    <p className="text-gray-600 mt-2">{selectedMatch.recommendation}</p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setDetailedScore(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </motion.button>
                </div>

                {detailedScore && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
                      <p className="text-sm text-gray-600 mb-2">درجة التوافق الإجمالية</p>
                      <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        {detailedScore.totalScore}/100
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        مستوى الثقة: <span className="font-bold capitalize">{detailedScore.confidenceLevel}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'الوراثة', value: detailedScore.geneticScore },
                        { label: 'الصحة', value: detailedScore.healthScore },
                        { label: 'السلوك', value: detailedScore.behaviorScore },
                        { label: 'الموقع', value: detailedScore.locationScore },
                        { label: 'توافق العمر', value: detailedScore.ageCompatibilityScore },
                        { label: 'نقاء السلالة', value: detailedScore.breedPurityScore },
                        { label: 'الخبرة السابقة', value: detailedScore.previousSuccessScore },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 font-semibold mb-2">
                            {label}
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(value)}%
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={() => setDetailedScore(null)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        ✓ ممتاز! أرسل طلب مطابقة
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && recommendations.length === 0 && pets.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              ابدأ البحث لاكتشاف أفضل المطابقات
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
