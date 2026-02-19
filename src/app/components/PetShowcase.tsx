import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Star, Shield, Verified } from 'lucide-react';
import { mockPets } from '../data/mockPets';
import { useLanguage } from '../context/LanguageContext';

interface PetShowcaseProps {
  maxPets?: number;
  filterType?: string;
  onPetSelect?: (pet: any) => void;
}

export function PetShowcase({ maxPets = 6, filterType, onPetSelect }: PetShowcaseProps) {
  const { language } = useLanguage();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // تصفية الحيوانات
  const displayPets = filterType
    ? mockPets.filter(pet => pet.type === filterType).slice(0, maxPets)
    : mockPets.slice(0, maxPets);

  const toggleFavorite = (petId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      {/* العنوان */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {language === 'ar' ? '🐾 الحيوانات المتاحة' : '🐾 Available Pets'}
        </h2>
        <p className="text-lg text-gray-600">
          {language === 'ar'
            ? `${displayPets.length} حيوان من الخيارات الرائعة`
            : `${displayPets.length} great options to choose from`}
        </p>
      </div>

      {/* شبكة الحيوانات */}
      {displayPets.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayPets.map((pet) => (
            <motion.div
              key={pet.id}
              variants={itemVariants}
              onClick={() => {
                setSelectedPet(pet);
                onPetSelect?.(pet);
              }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            >
              {/* الصورة */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                <img
                  src={pet.images?.[0] || pet.image || ''}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* شارات */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {pet.verified && (
                    <div className="bg-green-500 text-white rounded-full p-2 flex items-center gap-1 text-xs font-bold">
                      <Verified className="w-4 h-4" />
                      {language === 'ar' ? 'موثق' : 'Verified'}
                    </div>
                  )}
                </div>

                {/* زر القلب */}
                <button
                  onClick={(e) => toggleFavorite(pet.id, e)}
                  className={`absolute top-3 left-3 rounded-full p-2 transition-all ${
                    favorites.includes(pet.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 hover:bg-red-500 hover:text-white text-gray-500'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={favorites.includes(pet.id) ? 'currentColor' : 'none'} />
                </button>

                {/* حالة التوفر */}
                {!pet.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                      {language === 'ar' ? 'غير متاح' : 'Not Available'}
                    </span>
                  </div>
                )}
              </div>

              {/* المحتوى */}
              <div className="p-4">
                {/* الاسم والنوع */}
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
                  <p className="text-sm text-gray-600">
                    {pet.breed} • {pet.age} {language === 'ar' ? 'سنة' : 'yr'}
                  </p>
                </div>

                {/* الموقع */}
                <div className="flex items-center gap-1 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{pet.location}</span>
                </div>

                {/* التقييم */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(pet.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {pet.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({pet.reviews} {language === 'ar' ? 'تقييم' : 'reviews'})
                  </span>
                </div>

                {/* الشهادات */}
                {pet.healthCertificate && (
                  <div className="flex items-center gap-1 text-green-600 mb-3 text-sm">
                    <Shield className="w-4 h-4" />
                    {language === 'ar' ? 'بها شهادة صحية' : 'Health certificate'}
                  </div>
                )}

                {/* السعر */}
                {pet.price && (
                  <div className="text-lg font-bold text-blue-600 mb-3">
                    {pet.price.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                  </div>
                )}

                {/* الوصف */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {pet.description}
                </p>

                {/* الأزرار */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg transition-all">
                    {language === 'ar' ? '💬 التواصل' : '💬 Contact'}
                  </button>
                  <button className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 rounded-lg transition-all">
                    {language === 'ar' ? '📋 التفاصيل' : '📋 Details'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ar' ? 'لم يتم العثور على حيوانات' : 'No pets found'}
          </h3>
          <p className="text-gray-600">
            {language === 'ar'
              ? 'جرب تعديل معايير البحث'
              : 'Try adjusting your search filters'}
          </p>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {language === 'ar' ? '✨ لماذا اختيار هذه الحيوانات؟' : '✨ Why These Pets?'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl mb-2">✅</div>
            <h4 className="font-bold text-gray-900 mb-2">
              {language === 'ar' ? '100% موثقة' : '100% Verified'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'ar'
                ? 'جميع المربيين موثقون ومعروفون'
                : 'All breeders are verified and trusted'}
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">🏥</div>
            <h4 className="font-bold text-gray-900 mb-2">
              {language === 'ar' ? 'شهادات صحية' : 'Health Certified'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'ar'
                ? 'جميع الحيوانات بها شهادات صحية'
                : 'All pets have health certificates'}
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">⭐</div>
            <h4 className="font-bold text-gray-900 mb-2">
              {language === 'ar' ? 'تقييم عالي' : 'Top Rated'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'ar'
                ? 'متوسط التقييم 4.8/5'
                : 'Average rating 4.8/5'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
