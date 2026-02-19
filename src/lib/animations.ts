/**
 * Modern Animation Presets for Framer Motion
 * Production-Ready SaaS Animations
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// TIMING & EASING
// ============================================

export const ease = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  expo: [0.19, 1, 0.22, 1],
} as const;

export const duration = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration.base,
      ease: ease.smooth,
    },
  },
};

export const pageSlideVariants: Variants = {
  initial: {
    opacity: 0,
    x: -100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.slow,
      ease: ease.expo,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: duration.base,
      ease: ease.smooth,
    },
  },
};

// ============================================
// MODAL / DIALOG ANIMATIONS
// ============================================

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.base,
      ease: ease.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: duration.fast,
      ease: ease.smooth,
    },
  },
};

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.base },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

// ============================================
// CARD ANIMATIONS
// ============================================

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: duration.base,
      ease: ease.smooth,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: duration.fast,
      ease: ease.bounce,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// ============================================
// LIST / STAGGER ANIMATIONS
// ============================================

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: duration.base,
      ease: ease.smooth,
    },
  },
};

export const itemSlideVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.base,
      ease: ease.smooth,
    },
  },
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: duration.fast,
      ease: ease.smooth,
    },
  },
  tap: {
    scale: 0.95,
  },
};

export const buttonPulseVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: ease.smooth,
    },
  },
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: duration.base,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast,
    },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.smooth,
    },
  },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

export const slideInLeftVariants: Variants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: duration.slow,
      ease: ease.expo,
    },
  },
};

export const slideInRightVariants: Variants = {
  hidden: {
    x: 100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: duration.slow,
      ease: ease.expo,
    },
  },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleUpVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: duration.base,
      ease: ease.bounce,
    },
  },
};

export const scaleInVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: duration.slow,
      ease: ease.elastic,
    },
  },
};

// ============================================
// NOTIFICATION / TOAST ANIMATIONS
// ============================================

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -100,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: duration.base,
      ease: ease.bounce,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: duration.fast,
      ease: ease.smooth,
    },
  },
};

// ============================================
// SKELETON / LOADING ANIMATIONS
// ============================================

export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

export const pulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================
// SPRING PRESETS
// ============================================

export const springConfig = {
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
  },
  slow: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
  },
};

// ============================================
// HOVER EFFECTS
// ============================================

export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: duration.fast,
      ease: ease.smooth,
    },
  },
};

export const hoverGlow = {
  rest: {
    boxShadow: '0 0 0 rgba(102, 126, 234, 0)',
  },
  hover: {
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.6)',
    transition: {
      duration: duration.base,
    },
  },
};

// ============================================
// UTILITIES
// ============================================

export const defaultTransition: Transition = {
  duration: duration.base,
  ease: ease.smooth,
};

export const fastTransition: Transition = {
  duration: duration.fast,
  ease: ease.smooth,
};

export const slowTransition: Transition = {
  duration: duration.slow,
  ease: ease.smooth,
};
