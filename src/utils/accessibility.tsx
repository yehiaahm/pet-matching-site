/**
 * Accessibility Utilities
 * Helper functions and hooks for WCAG compliance
 */

import React, { useEffect, useRef } from 'react';

// =============================================================================
// ACCESSIBILITY HOOKS
// =============================================================================

/**
 * Hook for managing focus trap within a container
 */
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for announcing messages to screen readers
 */
export const useScreenReaderAnnouncement = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!announcementRef.current) {
      announcementRef.current = document.createElement('div');
      announcementRef.current.setAttribute('aria-live', 'polite');
      announcementRef.current.setAttribute('aria-atomic', 'true');
      announcementRef.current.className = 'sr-only';
      document.body.appendChild(announcementRef.current);
    }

    return () => {
      if (announcementRef.current && announcementRef.current.parentNode) {
        announcementRef.current.parentNode.removeChild(announcementRef.current);
      }
    };
  }, []);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear the message after it's been read
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return announce;
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  items: Array<{ id: string; element?: HTMLElement }>,
  onSelect?: (id: string) => void
) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(items[activeIndex].id);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        // Handle escape if needed
        break;
    }
  };

  useEffect(() => {
    const element = items[activeIndex]?.element;
    if (element) {
      element.focus();
    }
  }, [activeIndex, items]);

  return { activeIndex, handleKeyDown, setActiveIndex };
};

// =============================================================================
// ACCESSIBILITY COMPONENTS
// =============================================================================

/**
 * Skip to main content link
 */
export const SkipLink = ({ children = 'Skip to main content', targetId = 'main-content' }: {
  children?: React.ReactNode;
  targetId?: string;
}) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
    onClick={(e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >
    {children}
  </a>
);

/**
 * Visually hidden element for screen readers
 */
export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

/**
 * Focus indicator component
 */
export const FocusIndicator = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md opacity-0 focus-within:opacity-100 transition-opacity" />
    </div>
  </div>
);

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Generate unique ID for accessibility
 */
export const generateId = (prefix: string = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  if (!element || element.hasAttribute('disabled')) return false;

  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
  ];

  return focusableSelectors.some(selector => {
    try {
      return element.matches(selector);
    } catch {
      return false;
    }
  });
};

/**
 * Get all focusable elements in a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
};

/**
 * Set focus to first focusable element in a container
 */
export const setFocusToFirst = (container: HTMLElement): boolean => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    return true;
  }
  return false;
};

/**
 * Check if element has valid aria attributes
 */
export const validateAriaAttributes = (element: HTMLElement): string[] => {
  const warnings: string[] = [];

  // Check for aria-label or aria-labelledby on interactive elements
  if (element.matches('button, a, input, select, textarea')) {
    const hasLabel = element.hasAttribute('aria-label') || 
                     element.hasAttribute('aria-labelledby') ||
                     element.getAttribute('aria-label') === '' ||
                     element.getAttribute('aria-labelledby') === '';
    
    const hasText = element.textContent?.trim() || 
                    element.getAttribute('title') || 
                    element.getAttribute('alt');

    if (!hasLabel && !hasText) {
      warnings.push('Interactive element lacks accessible name');
    }
  }

  // Check for proper aria-expanded usage
  if (element.hasAttribute('aria-expanded')) {
    const expanded = element.getAttribute('aria-expanded');
    if (expanded !== 'true' && expanded !== 'false') {
      warnings.push('aria-expanded must be "true" or "false"');
    }
  }

  // Check for proper aria-hidden usage
  if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') !== 'true') {
    warnings.push('aria-hidden should be "true" or not present');
  }

  return warnings;
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// =============================================================================
// KEYBOARD NAVIGATION HELPERS
// =============================================================================

/**
 * Handle escape key press
 */
export const useEscapeKey = (callback: () => void) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
};

/**
 * Handle enter key press
 */
export const useEnterKey = (callback: () => void) => {
  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [callback]);
};

/**
 * Handle space key press
 */
export const useSpaceKey = (callback: () => void) => {
  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        callback();
      }
    };

    document.addEventListener('keydown', handleSpace);
    return () => document.removeEventListener('keydown', handleSpace);
  }, [callback]);
};

// =============================================================================
// COLOR CONTRAST UTILITIES
// =============================================================================

/**
 * Calculate relative luminance of a color
 */
export const getRelativeLuminance = (rgb: [number, number, number]): number => {
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const luminance1 = getRelativeLuminance(rgb1);
  const luminance2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color contrast meets WCAG AA standard (4.5:1)
 */
export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

/**
 * Check if color contrast meets WCAG AAA standard (7:1)
 */
export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 7;
};
