import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, Translations, getTranslations, detectLanguage } from '@/i18n/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    // Check localStorage first, then detect from browser
    const stored = localStorage.getItem('aione-language');
    if (stored && ['fr', 'en', 'es', 'de', 'it', 'pt', 'ja', 'zh', 'ko'].includes(stored)) {
      return stored as SupportedLanguage;
    }
    return detectLanguage();
  });

  const [translations, setTranslations] = useState<Translations>(getTranslations(language));

  useEffect(() => {
    setTranslations(getTranslations(language));
    localStorage.setItem('aione-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
