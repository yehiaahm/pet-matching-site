import { usePremiumFeatures } from '../context/PremiumFeaturesContext';
import { toast } from 'sonner';

interface UsePremiumFeatureProps {
  featureName: string;
  onUpgradeNeeded: () => void; // Called when user needs to upgrade
}

/**
 * Hook to check and enforce premium feature limits
 * Blocks access after free attempts are exhausted
 */
export function usePremiumFeature({ featureName, onUpgradeNeeded }: UsePremiumFeatureProps) {
  const { canUseFeature, recordFeatureAttempt, getRemainingAttempts } = usePremiumFeatures();

  const tryUseFeature = (): boolean => {
    const canUse = canUseFeature(featureName);

    if (!canUse) {
      // No more free attempts - must upgrade
      toast.error('انتهت المحاولات المجانية! 🔒', {
        description: 'اشترك الآن للحصول على وصول غير محدود',
        duration: 4000,
      });
      setTimeout(() => onUpgradeNeeded(), 800);
      return false;
    }

    // Record this attempt
    recordFeatureAttempt(featureName);
    
    const remaining = getRemainingAttempts(featureName);
    if (remaining === 1) {
      toast.warning(`متبقي محاولة واحدة مجانية فقط! ⚠️`, {
        description: 'اشترك للحصول على وصول غير محدود',
        duration: 3000,
      });
    } else if (remaining === 0) {
      toast.info('هذه آخر محاولة مجانية! 📢', {
        description: 'اشترك الآن لمواصلة الاستخدام',
        duration: 3000,
      });
    }

    return true;
  };

  return { 
    tryUseFeature,
    canUseFeature: () => canUseFeature(featureName),
    remainingAttempts: getRemainingAttempts(featureName),
  };
}
