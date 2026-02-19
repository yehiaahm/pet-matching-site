import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Chrome, Facebook, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  isLoading?: boolean;
}

export function SocialLogin({
  onGoogleLogin,
  onFacebookLogin,
  isLoading = false,
}: SocialLoginProps) {
  const [showNote, setShowNote] = useState(false);

  const handleGoogleClick = () => {
    toast.info('جاري التحضير لتسجيل الدخول عبر Google...');
    // في المستقبل، سيتم ربط مع Google OAuth
    // const googleAuthUrl = `${API_BASE_URL}/auth/google`;
    // window.location.href = googleAuthUrl;
    onGoogleLogin?.();
  };

  const handleFacebookClick = () => {
    toast.info('جاري التحضير لتسجيل الدخول عبر Facebook...');
    // في المستقبل، سيتم ربط مع Facebook OAuth
    // const fbAuthUrl = `${API_BASE_URL}/auth/facebook`;
    // window.location.href = fbAuthUrl;
    onFacebookLogin?.();
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            أو سجل بسهولة
          </span>
        </div>
      </div>

      {/* Info Alert */}
      {showNote && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
              التسجيل الفوري بدون كلمة مرور - يكفي بريدك الإلكتروني
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl border border-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setShowNote(true)}
          onMouseLeave={() => setShowNote(false)}
        >
          <Chrome className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Google</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={handleFacebookClick}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl border border-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setShowNote(true)}
          onMouseLeave={() => setShowNote(false)}
        >
          <Facebook className="w-5 h-5 text-blue-700" />
          <span className="text-sm font-medium">Facebook</span>
        </motion.button>
      </div>

      {/* Benefits */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs font-semibold text-foreground">
          ✨ مميزات التسجيل السريع:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>✓ لا توجد كلمة مرور يجب تذكرها</li>
          <li>✓ تسجيل فوري (ثانية واحدة)</li>
          <li>✓ آمن تماماً</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
