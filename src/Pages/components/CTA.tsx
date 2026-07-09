
import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const CTA: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-nexa-primary/10 to-nexa-secondary/10"></div>
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
          {t('cta.title')} <br/>
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{t('cta.highlight')}</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          {t('cta.desc')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/planos"
            className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
          >
            {t('cta.btn_primary')} <ArrowRight className="w-5 h-5" />
          </Link>
                    <a
                      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
                      target="_blank" // Open in new tab
                      rel="noopener noreferrer" // Security best practice for target="_blank"
                      className="px-8 py-4 bg-transparent border border-white/20 text-white text-lg font-bold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      {t('cta.btn_secondary')} <MessageCircle className="w-5 h-5" />
                    </a>        </div>
      </div>
    </section>
  );
};
