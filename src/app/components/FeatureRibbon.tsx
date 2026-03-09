import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ModernButton } from './ui/ModernButton';
import { containerVariants, itemVariants, cardVariants } from '../../lib/animations';
import {
  MessageSquare,
  FileText,
  MapPin,
  Bot,
  Users,
  Stethoscope,
  Star,
  CreditCard,
  Hospital,
  CalendarClock,
} from 'lucide-react';

interface FeatureRibbonProps {
  onRequests: () => void;
  onHealth: () => void;
  onGpsMatching: () => void;
  onAIMatching?: () => void;
  onCommunitySupport?: () => void;
  onVets: () => void;
  onProfile: () => void;
  onAddPet: () => void;
  onSubscription: () => void;
  onMessages: () => void;
}

/**
 * FeatureRibbon – modern, glassy 3D strip showcasing main features.
 * Pure UI: uses passed handlers; no app logic changes.
 */
export function FeatureRibbon({
  onRequests,
  onHealth,
  onGpsMatching,
  onAIMatching = () => {},
  onCommunitySupport,
  onVets,
  onProfile,
  onAddPet,
  onSubscription,
  onMessages,
}: FeatureRibbonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -6; // rotateX
    const ry = ((x / rect.width) - 0.5) * 6;   // rotateY
    el.style.setProperty('--ribbon-rot-x', `${rx}deg`);
    el.style.setProperty('--ribbon-rot-y', `${ry}deg`);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--ribbon-rot-x', `0deg`);
    el.style.setProperty('--ribbon-rot-y', `0deg`);
  };

  const items = [
    { key: 'requests', label: 'طلبات التزاوج', icon: MessageSquare, action: onRequests, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'health', label: 'السجل الصحي', icon: FileText, action: onHealth, gradient: 'from-green-500 to-emerald-500' },
    { key: 'gps', label: 'التطابق الجغرافي', icon: MapPin, action: onGpsMatching, gradient: 'from-purple-500 to-pink-500' },
    { key: 'ai-matching', label: 'AI Matching', icon: Bot, action: onAIMatching, gradient: 'from-indigo-500 to-blue-600' },
    { key: 'community-support', label: 'Community Support', icon: Users, action: onCommunitySupport ?? onMessages, gradient: 'from-teal-500 to-cyan-600' },
    { key: 'vets', label: 'العيادات البيطرية', icon: Stethoscope, action: onVets, gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <motion.div
      className="relative z-30"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 shadow-xl p-6 rounded-2xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {items.map(({ key, label, icon: Icon, action, gradient }, index) => (
            <motion.button
              key={key}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={action}
              className="relative group"
            >
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 shadow-xl p-4 rounded-xl hover:shadow-2xl transition-all duration-300">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${gradient} p-2.5 flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-full h-full text-white" />
                </motion.div>
                
                {/* Label */}
                <p className="text-xs font-medium text-center text-foreground/90 group-hover:text-foreground transition-colors">
                  {label}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FeatureRibbon;
