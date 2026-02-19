import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, RotateCw } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { mockPets } from '../data/mockPets';

interface SeedDataManagerProps {
  onDataLoaded?: (data: any[]) => void;
}

export function SeedDataManager({ onDataLoaded }: SeedDataManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handleLoadMockData = async () => {
    setIsLoading(true);
    try {
      // محاكاة التأخير
      await new Promise(resolve => setTimeout(resolve, 800));

      // حفظ البيانات في localStorage
      localStorage.setItem('mockPets', JSON.stringify(mockPets));

      // استدعاء الدالة إذا تم توفيرها
      if (onDataLoaded) {
        onDataLoaded(mockPets);
      }

      toast.success(
        language === 'ar'
          ? `✅ تم تحميل ${mockPets.length} حيوان وهمي!`
          : `✅ Loaded ${mockPets.length} mock pets!`
      );
    } catch (error) {
      toast.error(language === 'ar' ? '❌ حدث خطأ!' : '❌ Error occurred!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('mockPets');
      toast.success(
        language === 'ar' ? '🗑️ تم مسح البيانات' : '🗑️ Data cleared'
      );
      window.location.reload();
    } catch (error) {
      toast.error(language === 'ar' ? '❌ خطأ!' : '❌ Error!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg"
    >
      <div className="max-w-2xl mx-auto">
        {/* العنوان */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {language === 'ar' ? '📊 إدارة بيانات الحيوانات الأليفة' : '📊 Pet Data Manager'}
        </h3>

        <p className="text-gray-600 mb-6">
          {language === 'ar'
            ? 'قم بتحميل بيانات وهمية لاختبار الموقع وإظهار أمثلة على الحيوانات الأليفة'
            : 'Load demo data to test the site and show pet examples'}
        </p>

        {/* المعلومات */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            {language === 'ar' ? '💡 ماذا سيحدث عند التحميل؟' : '💡 What happens when loaded?'}
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ {language === 'ar' ? 'سيتم إضافة 10 حيوانات أليفة وهمية' : 'Add 10 demo pets'}</li>
            <li>✅ {language === 'ar' ? 'ستظهر على خريطة البحث' : 'Display on search map'}</li>
            <li>✅ {language === 'ar' ? 'يمكنك البحث والتصفية والمطابقة' : 'Test search and matching'}</li>
            <li>✅ {language === 'ar' ? 'لا تؤثر على البيانات الحقيقية' : 'Does not affect real data'}</li>
          </ul>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{mockPets.length}</p>
            <p className="text-sm text-blue-700">{language === 'ar' ? 'حيوان متاح' : 'Pets Available'}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">
              {mockPets.filter(p => p.verified).length}
            </p>
            <p className="text-sm text-green-700">{language === 'ar' ? 'موثق' : 'Verified'}</p>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleLoadMockData}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تحميل البيانات الوهمية' : 'Load Demo Data'}
              </>
            )}
          </Button>

          <Button
            onClick={handleClearData}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'مسح البيانات' : 'Clear Data'}
          </Button>

          <Button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* التحذير */}
        <p className="text-xs text-gray-500 text-center mt-4">
          {language === 'ar'
            ? '⚠️ البيانات الوهمية موجودة فقط لـ 24 ساعة ثم سيتم حذفها تلقائياً'
            : '⚠️ Demo data expires after 24 hours'}
        </p>
      </div>
    </motion.div>
  );
}
