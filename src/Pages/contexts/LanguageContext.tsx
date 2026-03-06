import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

export type Language = 'en' | 'pt-BR' | 'pt-PT' | 'es';
export type Currency = 'USD' | 'BRL' | 'EUR';

// Helper function to safely access nested properties
const get = (obj: Record<string, any>, path: string, defaultValue: any = undefined) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  return result === undefined ? defaultValue : result;
};

// This is a Vite-specific feature for handling dynamic imports.
// It finds all matching files at build time and creates async importers for them.
import { translations as allTranslations } from '../../../utils/translations';

// Define the shape of the context
interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (language: Language) => void;
  t: <T>(key: string) => T | string;
  isLoading: boolean;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Define the props for the provider
interface LanguageProviderProps {
  children: ReactNode;
}

// The provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('language') as Language) || 'pt-BR'
  );
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (lang === 'en') {
      setCurrency('USD');
    } else if (lang === 'pt-BR') {
      setCurrency('BRL');
    } else if (lang === 'es' || lang === 'pt-PT') {
      setCurrency('EUR');
    }
    localStorage.setItem('language', lang);
  };
  
  useEffect(() => {
    setIsLoading(true);
    // Ensure the selected language exists in allTranslations
    if (allTranslations[language]) {
      setTranslations(allTranslations[language]);
      localStorage.setItem('language', language);
    } else {
      console.warn(`Translations for language ${language} not found in utils/translations.ts`);
      // Fallback to a default language if the selected one is not found
      setTranslations(allTranslations['pt-BR'] || {}); // Assuming pt-BR as a safe fallback
      localStorage.setItem('language', 'pt-BR');
    }
    setIsLoading(false);
  }, [language]);

  // A função de tradução
  const t = useCallback(<T,>(key: string): T | string => {
    // Usa lodash.get para acessar chaves aninhadas com segurança
    const translation = get(translations, key);
    // Se a tradução não for encontrada, retorna a própria chave.
    // Isso ajuda a identificar traduções ausentes.
    return (translation as T) || key;
  }, [translations]);

  const value = useMemo(() => ({
    language,
    currency,
    setLanguage,
    t,
    isLoading,
  }), [language, currency, t, isLoading]);

  // Enquanto as traduções iniciais estão carregando, podemos exibir um loader
  if (isLoading && Object.keys(translations).length === 0) {
    return null; // Ou um componente de loading global
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};