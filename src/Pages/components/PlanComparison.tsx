
import React, { useState } from 'react';
import { Check, Minus, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const PlanComparison: React.FC = () => {
  const { t } = useLanguage();
  
  // State to manage collapsible sections. Defaulting to all open allows easy scanning,
  // but users can close them to save space.
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1, 2, 3]);

  const toggleCategory = (index: number) => {
    setOpenIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const categories = [
    {
      name: t('comparison.categories.design'),
      features: [
        { name: t('features_list.design_custom'), basic: true, inter: true, adv: true },
        { name: t('features_list.responsive'), basic: true, inter: true, adv: true },
        { name: t('features_list.micro_animations'), basic: false, inter: true, adv: true },
        { name: t('features_list.id_premium'), basic: false, inter: true, adv: true },
        { name: t('features_list.dark_mode'), basic: false, inter: false, adv: true },
      ]
    },
    {
      name: t('comparison.categories.tech'),
      features: [
        { name: t('features_list.hosting'), basic: true, inter: true, adv: true },
        { name: t('features_list.ssl'), basic: true, inter: true, adv: true },
        { name: t('features_list.speed_opt'), basic: t('features_list.values.basic'), inter: t('features_list.values.advanced'), adv: t('features_list.values.extreme') },
        { name: t('features_list.whatsapp'), basic: true, inter: true, adv: true },
        { name: t('features_list.crm_api'), basic: false, inter: t('features_list.values.basic'), adv: t('features_list.values.total') },
      ]
    },
    {
      name: t('comparison.categories.marketing'),
      features: [
        { name: t('features_list.contact_form'), basic: true, inter: true, adv: true },
        { name: t('features_list.copywriting'), basic: false, inter: true, adv: true },
        { name: t('features_list.pixel'), basic: false, inter: true, adv: true },
        { name: t('features_list.analytics'), basic: false, inter: true, adv: true },
        { name: t('features_list.ab_testing'), basic: false, inter: false, adv: true },
      ]
    },
    {
      name: t('comparison.categories.support'),
      features: [
        { name: t('features_list.delivery'), basic: t('features_list.values.days3'), inter: t('features_list.values.days5'), adv: t('features_list.values.days10') },
        { name: t('features_list.revisions'), basic: t('features_list.values.rev1'), inter: t('features_list.values.rev2'), adv: t('features_list.values.rev_unl') },
        { name: t('features_list.training'), basic: false, inter: true, adv: true },
        { name: t('features_list.priority'), basic: false, inter: false, adv: true },
      ]
    }
  ];

  return (
    <section id="comparison" className="py-16 bg-nexa-dark border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('comparison.title')}</h2>
          <p className="text-gray-400 text-sm md:text-base">{t('comparison.subtitle')}</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-3 bg-nexa-dark sticky left-0 z-20 w-1/4 border-b border-gray-800"></th>
                <th className="p-3 text-center w-1/4 border-b border-gray-800">
                  <div className="text-lg font-bold text-gray-200">{t('pricing.plan_basic.name')}</div>
                  <div className="text-nexa-primary font-bold text-sm">150€</div>
                </th>
                <th className="p-3 text-center w-1/4 relative bg-nexa-card/50 rounded-t-xl border-t border-x border-nexa-primary/20">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-nexa-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-lg shadow-cyan-500/20 whitespace-nowrap">
                    {t('pricing.popular')}
                  </div>
                  <div className="text-lg font-bold text-white">{t('pricing.plan_pro.name')}</div>
                  <div className="text-nexa-primary font-bold text-sm">250€</div>
                </th>
                <th className="p-3 text-center w-1/4 border-b border-gray-800">
                  <div className="text-lg font-bold text-nexa-secondary">{t('pricing.plan_enterprise.name')}</div>
                  <div className="text-nexa-secondary font-bold text-sm">400€</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {categories.map((category, idx) => {
                const isOpen = openIndices.includes(idx);
                return (
                  <React.Fragment key={idx}>
                    {/* Category Header Row */}
                    <tr 
                      onClick={() => toggleCategory(idx)} 
                      className="cursor-pointer group hover:bg-white/5 transition-colors"
                    >
                      <td colSpan={4} className="p-0">
                        <div className="sticky left-0 bg-nexa-dark/95 backdrop-blur-sm z-10 w-full flex items-center justify-between p-3 border-b border-gray-800 group-hover:bg-white/5 transition-colors">
                            <span className="font-bold text-gray-400 uppercase text-xs tracking-wider flex items-center gap-2">
                              {category.name}
                            </span>
                            <div className="text-gray-500 group-hover:text-nexa-primary transition-colors pr-2">
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Feature Rows */}
                    {isOpen && category.features.map((feature, fIdx) => (
                      <tr key={fIdx} className="hover:bg-white/5 transition-colors group">
                        <td className="p-3 text-gray-300 text-sm font-medium sticky left-0 bg-nexa-dark sm:bg-transparent z-10 flex items-center gap-2 border-r border-gray-800/50 sm:border-r-0 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.5)] sm:shadow-none">
                          <span className="truncate">{feature.name}</span>
                          <HelpCircle className="w-3 h-3 text-gray-700 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                        
                        {/* Basic */}
                        <td className="p-3 text-center">
                          {typeof feature.basic === 'boolean' ? (
                            feature.basic ? <Check className="w-4 h-4 text-nexa-primary mx-auto" /> : <Minus className="w-4 h-4 text-gray-800 mx-auto" />
                          ) : (
                            <span className="text-xs text-gray-400">{feature.basic}</span>
                          )}
                        </td>

                        {/* Intermediate */}
                        <td className="p-3 text-center bg-nexa-card/30 border-x border-gray-800/50">
                          {typeof feature.inter === 'boolean' ? (
                            feature.inter ? <Check className="w-4 h-4 text-nexa-primary mx-auto" /> : <Minus className="w-4 h-4 text-gray-800 mx-auto" />
                          ) : (
                            <span className="text-xs font-bold text-white">{feature.inter}</span>
                          )}
                        </td>

                        {/* Advanced */}
                        <td className="p-3 text-center">
                          {typeof feature.adv === 'boolean' ? (
                            feature.adv ? <Check className="w-4 h-4 text-nexa-secondary mx-auto" /> : <Minus className="w-4 h-4 text-gray-800 mx-auto" />
                          ) : (
                            <span className="text-xs font-bold text-nexa-secondary">{feature.adv}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              
              {/* Footer Buttons */}
              <tr>
                <td className="p-4 sticky left-0 bg-nexa-dark z-10"></td>
                <td className="p-4 pt-6">
                  <a href="#contact" className="block w-full py-2 border border-gray-700 rounded-lg text-center text-xs font-bold text-gray-300 hover:bg-white hover:text-black transition-all">
                    {t('comparison.btn')}
                  </a>
                </td>
                <td className="p-4 pt-6 bg-nexa-card/30 border-x border-gray-800/50 rounded-b-xl">
                  <a href="#contact" className="block w-full py-2 bg-nexa-primary rounded-lg text-center text-xs font-bold text-black hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-900/20">
                    {t('comparison.btn')}
                  </a>
                </td>
                <td className="p-4 pt-6">
                  <a href="#contact" className="block w-full py-2 bg-nexa-secondary rounded-lg text-center text-xs font-bold text-white hover:bg-violet-600 transition-all shadow-lg shadow-violet-900/20">
                    {t('comparison.btn')}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
