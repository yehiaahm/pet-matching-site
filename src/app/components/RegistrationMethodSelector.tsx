import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { GradientButton } from './ui/ModernButton';
import {
  Zap,
  FileText,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface RegistrationMethodSelectorProps {
  onSelectSimplified: () => void;
  onSelectDetailed: () => void;
  isLoading?: boolean;
}

export function RegistrationMethodSelector({
  onSelectSimplified,
  onSelectDetailed,
  isLoading = false,
}: RegistrationMethodSelectorProps) {
  const [selected, setSelected] = useState<'simple' | 'detailed' | null>(null);

  const handleSimplified = () => {
    setSelected('simple');
    setTimeout(onSelectSimplified, 300);
  };

  const handleDetailed = () => {
    setSelected('detailed');
    setTimeout(onSelectDetailed, 300);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            PetMate
          </h1>
          <p className="text-xl text-muted-foreground">
            اختر طريقة التسجيل المناسبة لك
          </p>
        </motion.div>

        {/* Method Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Simplified Method */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleSimplified}
            className="cursor-pointer group"
          >
            <Card
              className={`relative h-full p-6 transition-all duration-300 backdrop-blur-xl ${
                selected === 'simple'
                  ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 hover:border-primary/30 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {selected === 'simple' && (
                <motion.div
                  className="absolute top-3 right-3 bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓ مختار
                </motion.div>
              )}

              {/* Icon */}
              <motion.div
                className="mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <h2 className="text-xl font-bold mb-2">التسجيل السريع ⚡</h2>
              <p className="text-sm text-muted-foreground mb-6">
                انضم في 3 خطوات فقط بدون معلومات معقدة
              </p>

              {/* Features */}
              <motion.ul
                className="space-y-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[
                  '3 خطوات بسيطة فقط',
                  'بريد إلكتروني وكلمة مرور',
                  'الاسم (اختياري)',
                  'لا مشاكل في التذكر',
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Time */}
              <motion.div
                className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs font-bold text-green-700 dark:text-green-400">
                  ⏱ أقل من دقيقة واحدة
                </p>
              </motion.div>

              {/* Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all group-hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {selected === 'simple' ? 'جاري التحضير...' : 'ابدأ الآن'}
                <ChevronRight className="w-5 h-5 mr-2 inline" />
              </motion.button>
            </Card>
          </motion.div>

          {/* Detailed Method */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleDetailed}
            className="cursor-pointer group"
          >
            <Card
              className={`relative h-full p-6 transition-all duration-300 backdrop-blur-xl ${
                selected === 'detailed'
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 hover:border-blue-500/30 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {selected === 'detailed' && (
                <motion.div
                  className="absolute top-3 right-3 bg-blue-500/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓ مختار
                </motion.div>
              )}

              {/* Icon */}
              <motion.div
                className="mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <h2 className="text-xl font-bold mb-2">الطريقة التفصيلية 📋</h2>
              <p className="text-sm text-muted-foreground mb-6">
                ملء جميع البيانات الشاملة للحساب
              </p>

              {/* Features */}
              <motion.ul
                className="space-y-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  'بيانات كاملة',
                  'اسم أول + اسم أخير',
                  'رقم الهاتف',
                  'تحكم كامل بالحساب',
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Time */}
              <motion.div
                className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  ⏱ دقيقتان تقريباً
                </p>
              </motion.div>

              {/* Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl transition-all group-hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {selected === 'detailed' ? 'جاري التحضير...' : 'ابدأ الآن'}
                <ChevronRight className="w-5 h-5 mr-2 inline" />
              </motion.button>
            </Card>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold mb-6">مقارنة سريعة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {[
                  ['عدد الخطوات', '3', '5+'],
                  ['الوقت المطلوب', '< 1 دقيقة', '2-3 دقائق'],
                  ['المعلومات المطلوبة', 'بريد + اسم', 'بيانات شاملة'],
                  ['سهولة الاستخدام', '⭐⭐⭐⭐⭐', '⭐⭐⭐⭐'],
                  ['التحكم بالحساب', 'ممتاز', 'متقدم'],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{row[0]}</td>
                    <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">
                      {row[1]}
                    </td>
                    <td className="py-3 px-4 text-blue-600 dark:text-blue-400">
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          يمكنك تغيير اختيارك لاحقاً من إعدادات حسابك
        </motion.p>
      </div>
    </motion.div>
  );
}
