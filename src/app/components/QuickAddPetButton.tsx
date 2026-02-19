import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

interface QuickAddPetProps {
  onAddPet?: (petData: any) => void;
}

export function QuickAddPetButton({ onAddPet }: QuickAddPetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    type: 'dog',
    age: '1',
    location: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من البيانات
      if (!formData.name.trim()) {
        toast.error(language === 'ar' ? 'يرجى إدخال اسم الحيوان' : 'Please enter pet name');
        setIsLoading(false);
        return;
      }

      if (!formData.location.trim()) {
        toast.error(language === 'ar' ? 'يرجى إدخال الموقع' : 'Please enter location');
        setIsLoading(false);
        return;
      }

      // محاكاة التأخير
      await new Promise(resolve => setTimeout(resolve, 500));

      // إنشاء كائن الحيوان الجديد
      const newPet = {
        id: `pet-${Date.now()}`,
        name: formData.name,
        breed: formData.breed || 'سلالة غير محددة',
        type: formData.type,
        age: parseInt(formData.age) || 1,
        location: formData.location,
        description: formData.description,
        image: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=500`,
        owner: 'أنت',
        verified: false,
        rating: 0,
        reviews: 0,
        badges: [],
        createdAt: new Date(),
        available: true
      };

      // استدعاء الدالة إذا تم توفيرها
      if (onAddPet) {
        onAddPet(newPet);
      }

      // رسالة النجاح
      toast.success(
        language === 'ar'
          ? `تم إضافة ${formData.name} بنجاح!`
          : `${formData.name} added successfully!`
      );

      // إعادة تعيين النموذج
      setFormData({
        name: '',
        breed: '',
        type: 'dog',
        age: '1',
        location: '',
        description: ''
      });

      setIsOpen(false);
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ ما!' : 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* زر الإضافة السريعة */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all hover:scale-110 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* نموذج الإضافة السريعة */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold">
                {language === 'ar' ? '➕ أضف حيوانك الأليف' : '➕ Add Your Pet'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* المحتوى */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* اسم الحيوان */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? '🐾 اسم الحيوان' : '🐾 Pet Name'}
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'مثال: ماكس' : 'e.g., Max'}
                  className="w-full"
                  required
                />
              </div>

              {/* نوع الحيوان */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? '🦮 نوع الحيوان' : '🦮 Pet Type'}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dog">{language === 'ar' ? '🐕 كلب' : '🐕 Dog'}</option>
                  <option value="cat">{language === 'ar' ? '🐱 قطة' : '🐱 Cat'}</option>
                  <option value="bird">{language === 'ar' ? '🦜 طائر' : '🦜 Bird'}</option>
                  <option value="rabbit">{language === 'ar' ? '🐰 أرنب' : '🐰 Rabbit'}</option>
                  <option value="other">{language === 'ar' ? '🦎 آخر' : '🦎 Other'}</option>
                </select>
              </div>

              {/* السلالة */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? '📋 السلالة' : '📋 Breed'}
                </label>
                <Input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'مثال: جولدن ريتريفر' : 'e.g., Golden Retriever'}
                  className="w-full"
                />
              </div>

              {/* السن */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? '📅 السن (سنة)' : '📅 Age (years)'}
                </label>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full"
                />
              </div>

              {/* الموقع */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? '📍 الموقع' : '📍 Location'}
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'مثال: الرياض، حي النخيل' : 'e.g., Riyadh, Al-Nakheel'}
                  className="w-full"
                  required
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? '💬 الوصف' : '💬 Description'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'صف حيوانك...' : 'Describe your pet...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* الأزرار */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'أضف' : 'Add'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  {language === 'ar' ? 'إغلاق' : 'Cancel'}
                </Button>
              </div>

              {/* ملاحظة */}
              <p className="text-xs text-gray-500 text-center pt-2">
                {language === 'ar'
                  ? '✨ سيتم التحقق من حيوانك خلال 24 ساعة'
                  : '✨ Your pet will be verified within 24 hours'}
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
