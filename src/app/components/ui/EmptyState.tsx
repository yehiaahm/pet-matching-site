/**
 * Modern Empty State Component
 * Beautiful & Engaging Empty States
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { fadeInUpVariants } from '../../../lib/animations';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  animated?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  animated = true,
}) => {
  const content = (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <motion.div
          className="mb-6 p-6 rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10"
          animate={animated ? {
            y: [0, -10, 0],
          } : undefined}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="w-16 h-16 text-primary" strokeWidth={1.5} />
        </motion.div>
      )}
      
      <h3 className="text-2xl font-bold mb-2 text-foreground">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <motion.button
          className="btn-primary"
          onClick={action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </div>
  );

  if (!animated) {
    return content;
  }

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
    >
      {content}
    </motion.div>
  );
};

// ============================================
// EMPTY STATE PRESETS
// ============================================

import { Search, Inbox, AlertCircle, Package, Users } from 'lucide-react';

export const EmptySearch: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    icon={Search}
    title="لا توجد نتائج"
    description="لم نتمكن من العثور على ما تبحث عنه. جرب تعديل البحث."
    action={onReset ? {
      label: 'إعادة تعيين البحث',
      onClick: onReset,
    } : undefined}
  />
);

export const EmptyInbox: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={Inbox}
    title="صندوق الوارد فارغ"
    description="لا توجد رسائل جديدة في الوقت الحالي."
  />
);

export const EmptyData: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={Package}
    title="لا توجد بيانات"
    description="ابدأ بإضافة عناصر جديدة."
    action={onCreate ? {
      label: 'إضافة جديد',
      onClick: onCreate,
    } : undefined}
  />
);

export const EmptyUsers: React.FC = () => (
  <EmptyState
    icon={Users}
    title="لا يوجد مستخدمون"
    description="لم يتم العثور على مستخدمين في الوقت الحالي."
  />
);
