
import React from 'react';
import { Check, Shield, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Maintenance: React.FC = () => {
  const { t } = useLanguage();
  const rawPlans = t<any[]>('maintenance.plans');

  if (!Array.isArray(rawPlans)) {
    return <div>Loading plans...</div>;
  }

  const plans = [
    {
      price: '50',
      icon: Shield,
      popular: false,
      data: rawPlans[0]
    },
    {
      price: '120',
      icon: Zap,
      popular: true,
      data: rawPlans[1]
    },
    {
      price: '250',
      icon: TrendingUp,
      popular: false,
      data: rawPlans[2]
    }
  ];

  return (
    <section className="py-12 bg-[#020610] relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">
              {t('maintenance.why_title')} <span className="text-nexa-primary">Manutenção</span>?
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              {t('maintenance.why_desc')}
            </p>
          </div>
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nexa-primary/10 text-nexa-primary text-sm font-medium border border-nexa-primary/20">
              <HelpCircle className="w-4 h-4" /> {t('maintenance.monthly_plans')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative p-8 rounded-2xl transition-all duration-300 group hover:-translate-y-2 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-gray-900 to-gray-900 border border-nexa-primary/50 shadow-[0_0_30px_-10px_rgba(34,211,238,0.15)]' 
                  : 'bg-glass-effect border border-gray-800 hover:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-nexa-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {t('maintenance.recommended')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${plan.popular ? 'bg-nexa-primary text-black' : 'bg-gray-800 text-white'}`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.data.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-400">€</span>
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-xs text-gray-500">{t('maintenance.per_month')}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-8 h-10">{plan.data.desc}</p>

              <div className="mb-8 space-y-3 text-sm">
                {(plan.data.features || []).map((feature: string, fIdx: number) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-nexa-primary shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className={`block w-full py-3 rounded-lg text-center font-bold text-sm transition-colors ${
                  plan.popular 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {plan.data.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
