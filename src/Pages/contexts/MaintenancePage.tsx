import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Maintenance } from '../components/Maintenance';
import { CTA } from '../components/CTA';

const MaintenancePage = () => {
  const { t } = useLanguage();
  return (
    <div className="pt-20 animate-fade-in">
      <div className="bg-[#020610] pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('maintenance.title')}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('maintenance.subtitle')}
          </p>
        </div>
      </div>
      <Maintenance />
      <CTA />
    </div>
  );
};

export default MaintenancePage;