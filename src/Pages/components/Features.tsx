
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FeatureItem {
  icon: keyof typeof LucideIcons;
  title: string;
  description: string;
}

export const Features: React.FC = () => {
  const { t } = useLanguage();

  // Corrigido: A chave de tradução correta é 'features.list'.
  const featuresList = t<FeatureItem[]>('features.list');

  return (
    <section id="features" className="py-24 bg-nexa-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('features.title')}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(featuresList) && featuresList.map((feature, index) => {
             // Melhoria: Carrega o ícone dinamicamente com base no nome fornecido na tradução.
             const Icon = LucideIcons[feature.icon] as React.ElementType || LucideIcons.HelpCircle;
             return (
              <div 
                key={index} 
                className="group p-8 rounded-2xl glass-effect border border-gray-800 hover:border-nexa-primary/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-nexa-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-white group-hover:text-nexa-primary transition-colors" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
