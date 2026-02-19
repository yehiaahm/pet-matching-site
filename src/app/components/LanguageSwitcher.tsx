import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../../lib/i18n';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={language === 'en' ? 'bg-blue-600 hover:bg-blue-700' : ''}
      >
        EN
      </Button>
      <Button
        variant={language === 'ar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('ar')}
        className={language === 'ar' ? 'bg-blue-600 hover:bg-blue-700' : ''}
      >
        العربية
      </Button>
    </div>
  );
}
