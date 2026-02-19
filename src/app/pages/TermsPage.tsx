import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

type LegalResponse = {
  status: string;
  message: string;
  data: {
    lang: string;
    title: string;
    content: string;
  } | null;
};

export default function TermsPage() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const lang = language === 'ar' ? 'ar' : 'en';
    fetch(`/api/v1/legal/terms?lang=${lang}`)
      .then((r) => r.json())
      .then((json: LegalResponse) => {
        if (json?.data) {
          setTitle(json.data.title);
          setContent(json.data.content);
        }
      })
      .catch(() => {
        setTitle(language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions');
        setContent(language === 'ar' ? '<p>لا تتوفر الشروط حالياً.</p>' : '<p>Terms not available.</p>');
      })
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text={language === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
