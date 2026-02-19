import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, getLanguageDirection } from '../../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language or default to 'en'
    const saved = localStorage.getItem('petmate-language') as Language | null;
    return saved || 'en';
  });

  const direction = getLanguageDirection(language);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('petmate-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = direction === 'rtl' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
