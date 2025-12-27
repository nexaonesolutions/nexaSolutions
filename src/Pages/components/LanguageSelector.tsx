
import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recuperar idioma salvo ao montar o componente (Solução alternativa se não estiver no Context)
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && saved !== language && ['pt', 'en', 'es'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    localStorage.setItem('language', code); // Salva a escolha
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-transparent hover:border-gray-700"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium uppercase">{language.split('-')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-nexa-card border border-gray-700 shadow-2xl py-2 z-50 animate-fade-in-down">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-nexa-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
