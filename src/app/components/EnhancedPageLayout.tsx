import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { EnhancedNavbar } from './EnhancedNavbar';
import { useLanguage } from '../context/LanguageContext';

interface EnhancedPageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showNavbar?: boolean;
  backgroundColor?: string;
}

export function EnhancedPageLayout({
  children,
  title,
  subtitle,
  showNavbar = true,
  backgroundColor = 'from-blue-50 via-white to-green-50',
}: EnhancedPageLayoutProps) {
  const { direction } = useLanguage();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundColor}`}>
      <motion.main
        className={`max-w-7xl mx-auto px-4 py-16 ${direction === 'rtl' ? 'rtl' : 'ltr'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Optional Header Section */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
            
            {/* Decorative Line */}
            <motion.div
              className="mt-8 h-1 w-24 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </motion.div>
        )}

        {/* Page Content */}
        {children}
      </motion.main>

      {/* Decorative Background Elements */}
      <div className="fixed -z-10 inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-72 h-72 bg-green-200/40 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
        />
      </div>
    </div>
  );
}
