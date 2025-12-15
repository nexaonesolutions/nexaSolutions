import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Portfolio } from '../components/Portfolio';
import { CTA } from '../components/CTA';

const PortfolioPage = () => {
  const { t } = useLanguage();
  return (
    <div className="pt-20 animate-fade-in">
      <div className="bg-nexa-dark pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('portfolio.title')}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('portfolio.subtitle')}
          </p>
        </div>
      </div>
      <Portfolio />
      <CTA />
    </div>
  );
};

export default PortfolioPage;