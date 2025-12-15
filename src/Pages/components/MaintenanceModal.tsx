import React from 'react';
import { X, Check, Shield, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Plan {
  name: string;
  price: string;
  currency: string;
}

interface MaintenanceModalProps {
  onClose: () => void;
  onSelectPlan: (plan: Plan) => void;
  onSkip: () => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ onClose, onSelectPlan, onSkip }) => {
  const { t } = useLanguage();
  const rawPlans: { name: string; desc: string; btn: string, price: string, currency: string, features: string[] }[] = t('maintenance.plans') as any;

  const plans = rawPlans.map((planData, index) => {
    let iconComponent: any; // Type as any for Lucide icon
    let popularStatus = false;

    // Assign price and icon based on index or specific logic
    if (index === 0) { // Basic
      iconComponent = Shield;
      popularStatus = false;
    } else if (index === 1) { // Standard
      iconComponent = Zap;
      popularStatus = true; // Assuming Standard is 'popular'
    } else if (index === 2) { // Premium
      iconComponent = TrendingUp;
      popularStatus = false;
    }

    return {
      icon: iconComponent,
      popular: popularStatus,
      data: planData
    };
  });

  const handleSelect = (plan: typeof plans[0]) => {
    onSelectPlan({ name: plan.data.name, price: plan.data.price, currency: plan.data.currency });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end sm:items-center z-50 animate-fade-in p-4 sm:p-8" onClick={onClose}>
      <div className="relative bg-gray-900/50 glass-effect border border-nexa-primary/20 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-nexa-primary/10 max-w-4xl w-full flex flex-col max-h-[95vh] sm:max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/60 rounded-t-2xl sm:rounded-t-2xl sticky top-0 z-10 shrink-0">
            <div className="max-w-3xl">
              <h2 className="text-lg sm:text-2xl font-bold">
                {t('maintenance.add_plan_title')} <span className="text-nexa-primary">{t('maintenance.add_plan_highlight')}</span>?
              </h2>
            </div>
            <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-nexa-primary/20 rounded-full transition-colors duration-300 z-20"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-3xl">
                    {t('maintenance.why_desc')}
                </p>
                <div className="shrink-0">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nexa-primary/10 text-nexa-primary text-sm font-medium border border-nexa-primary/20">
                        <HelpCircle className="w-4 h-4" /> {t('maintenance.monthly_plans')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                <div 
                    key={idx}
                    className={`relative p-6 sm:p-8 rounded-2xl transition-all duration-300 group hover:-translate-y-2 ${
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
                        <span className="text-sm text-gray-400">{plan.data.currency}</span>
                        <span className="text-xl sm:text-2xl font-bold">{plan.data.price}</span>
                        <span className="text-xs text-gray-500">{t('maintenance.per_month')}</span>
                        </div>
                    </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-8 min-h-[100px]">{plan.data.desc}</p>
                    


                    <button 
                    onClick={() => handleSelect(plan)}
                    className={`block w-full py-3 rounded-lg text-center font-bold text-sm transition-all duration-300 transform group-hover:scale-105 shadow-lg ${
                        plan.popular 
                        ? 'bg-nexa-primary text-black hover:bg-cyan-300 shadow-cyan-900/20 hover:shadow-cyan-500/40' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    >
                    {plan.data.btn}
                    </button>
                </div>
                ))}
            </div>
            <div className="text-center mt-12">
                                <button
                                    onClick={onSkip}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                                >
                                    {t('maintenance.no_plan_button')}
                                </button>            </div>
          </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
