
import React, { useState, useEffect } from 'react';
import { Check, X, Info, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import MaintenanceModal from './MaintenanceModal';
import { useAuth } from '../contexts/AuthContext';
import SummaryModal from './SummaryModal';

interface PlanData {

  name: string;

  price: string;

  currency: string;

  description: string;

  button_text: string;

}



interface Plan {
  name: string;
  price: string | number;
  currency: string;
}



interface FullPlan extends Plan {

  id: string;

  isPopular: boolean;

  isPremium: boolean;

  data: PlanData; // You might want to type this more strictly

  level: 'basic' | 'inter' | 'adv';

  currency: string;

}


export const Pricing: React.FC = () => {
  const { t, isLoading: isLanguageLoading } = useLanguage();
  const { user, setPendingOrder } = useAuth();
  const navigate = useNavigate();
  // State for original details modal
  const [activePlanDetails, setActivePlanDetails] = useState<string | null>(null);
  
  // State for the new checkout flow
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FullPlan | null>(null);
  const [selectedMaintenancePlan, setSelectedMaintenancePlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<FullPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLanguageLoading) {
      setIsLoading(true);
      return;
    }

    // Now that translations are loaded, we can get the plan data.
    const planBasic = t<PlanData>('pricing.plan_basic');
    const planPro = t<PlanData>('pricing.plan_pro');
    const planEnterprise = t<PlanData>('pricing.plan_enterprise');

    // Safeguard to ensure the translations returned are objects, not the key strings
    if (typeof planBasic === 'string' || typeof planPro === 'string' || typeof planEnterprise === 'string') {
      // Keep loading until we get the right data.
      setIsLoading(true); 
      return;
    }

    const fetchedPlans: FullPlan[] = [
      { id: 'plan_basic', price: planBasic.price, currency: planBasic.currency, isPopular: false, isPremium: false, data: planBasic, level: 'basic', name: planBasic.name },
      { id: 'plan_pro', price: planPro.price, currency: planPro.currency, isPopular: true, isPremium: false, data: planPro, level: 'inter', name: planPro.name },
      { id: 'plan_enterprise', price: planEnterprise.price, currency: planEnterprise.currency, isPopular: false, isPremium: true, data: planEnterprise, level: 'adv', name: planEnterprise.name }
    ];

    setPlans(fetchedPlans);
    setIsLoading(false); // Done loading plans

  }, [isLanguageLoading, t]);

  // Lock body scroll and handle Escape key when any modal is open
  useEffect(() => {
    const isModalOpen = activePlanDetails || showMaintenanceModal || showSummaryModal;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeAllModals();
        }
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [activePlanDetails, showMaintenanceModal, showSummaryModal]);

  const closeAllModals = () => {
    setActivePlanDetails(null);
    setShowMaintenanceModal(false);
    setShowSummaryModal(false);
    setSelectedPlan(null);
    setSelectedMaintenancePlan(null);
  }

  // Flow Handlers
  const handlePlanSelection = (plan: FullPlan) => {
    if (!user) {
      setPendingOrder({ mainPlan: plan, maintenancePlan: null });
      navigate('/login');
    } else {
      setSelectedPlan(plan);
      setShowMaintenanceModal(true);
    }
  };
  
  const handleMaintenanceSelect = (maintenancePlan: Plan) => {
    setSelectedMaintenancePlan(maintenancePlan);
    setShowMaintenanceModal(false);
    setShowSummaryModal(true);
  };

  const handleMaintenanceSkip = () => {
    setSelectedMaintenancePlan(null);
    setShowMaintenanceModal(false);
    setShowSummaryModal(true);
  }

  const handleSummaryConfirm = () => {
    navigate('/pagamento', {
      state: {
        mainPlan: selectedPlan,
        maintenancePlan: selectedMaintenancePlan,
      },
    });
    closeAllModals();
  };

  // Helper to generate details based on plan level
  const getPlanDetails = (level: 'basic' | 'inter' | 'adv') => [
    {
      category: t('comparison.categories.design'),
      items: [
        { label: t('features_list.design_custom'), value: true },
        { label: t('features_list.responsive'), value: true },
        { label: t('features_list.micro_animations'), value: level !== 'basic' },
        { label: t('features_list.id_premium'), value: level !== 'basic' },
        { label: t('features_list.dark_mode'), value: level === 'adv' },
      ]
    },
    {
      category: t('comparison.categories.tech'),
      items: [
        { label: t('features_list.hosting'), value: true },
        { label: t('features_list.ssl'), value: true },
        { label: t('features_list.speed_opt'), value: level === 'basic' ? t('features_list.values.basic') : level === 'inter' ? t('features_list.values.advanced') : t('features_list.values.extreme') },
        { label: t('features_list.whatsapp'), value: true },
        { label: t('features_list.crm_api'), value: level === 'basic' ? false : level === 'inter' ? t('features_list.values.basic') : t('features_list.values.total') },
      ]
    },
    {
      category: t('comparison.categories.marketing'),
      items: [
        { label: t('features_list.contact_form'), value: true },
        { label: t('features_list.copywriting'), value: level !== 'basic' },
        { label: t('features_list.pixel'), value: level !== 'basic' },
        { label: t('features_list.analytics'), value: level !== 'basic' },
        { label: t('features_list.ab_testing'), value: level === 'adv' },
      ]
    },
    {
      category: t('comparison.categories.support'),
      items: [
        { label: t('features_list.delivery'), value: level === 'basic' ? t('features_list.values.days3') : level === 'inter' ? t('features_list.values.days5') : t('features_list.values.days10') },
        { label: t('features_list.revisions'), value: level === 'basic' ? t('features_list.values.rev1') : level === 'inter' ? t('features_list.values.rev2') : t('features_list.values.rev_unl') },
        { label: t('features_list.training'), value: level !== 'basic' },
        { label: t('features_list.priority'), value: level === 'adv' },
      ]
    }
  ];

  return (
    <section id="pricing" className="py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nexa-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      {isLoading && (
        <div className="text-center text-gray-400 py-10">Carregando planos...</div>
      )}

      {!isLoading && plans.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-500 ease-out group isolate
                ${plan.isPopular 
                  ? 'bg-nexa-card border-2 border-nexa-primary/80 shadow-[0_0_30px_-10px_rgba(34,211,238,0.4)] transform lg:-translate-y-4 z-10' 
                  : 'bg-nexa-card/40 border border-gray-800 hover:bg-nexa-card/60'
                }
                hover:scale-[1.02]
                ${plan.isPopular ? 'hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.6)] hover:border-nexa-primary' : ''}
                ${plan.isPremium ? 'hover:border-nexa-secondary hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.5)]' : ''}
                ${!plan.isPopular && !plan.isPremium ? 'hover:border-white/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]' : ''}
              `}
            >
              {/* Atmospheric Glow Effect inside card */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl
                 ${plan.isPopular ? 'from-nexa-primary/10 to-transparent' : ''}
                 ${plan.isPremium ? 'from-nexa-secondary/10 to-transparent' : ''}
                 ${!plan.isPopular && !plan.isPremium ? 'from-white/5 to-transparent' : ''}
              `}></div>

              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-nexa-primary to-blue-500 text-black font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 z-20">
                  {t('pricing.popular')}
                </div>
              )}
              {plan.isPremium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-nexa-secondary text-white font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider shadow-lg shadow-purple-900/50 z-20">
                  {t('pricing.premium')}
                </div>
              )}

              <div className="mb-6 relative z-10">
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300
                   ${plan.isPremium 
                      ? 'text-nexa-secondary group-hover:text-violet-300' 
                      : plan.isPopular
                        ? 'text-white group-hover:text-nexa-primary'
                        : 'text-white group-hover:text-gray-200'
                   }
                `}>
                  {plan.data.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-400">{plan.data.currency}</span>
                  <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight transition-colors duration-300 ${plan.isPopular ? 'text-white group-hover:text-cyan-50' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-500 text-sm">{t('pricing.per_unique')}</span>
                </div>
                <p className="text-gray-400 mt-4 text-sm leading-relaxed min-h-[48px]">
                  {plan.data.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 relative z-10">
                <button
                  onClick={() => setActivePlanDetails(plan.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white transition-all group/btn bg-white/5 hover:bg-white/10"
                >
                  <span className="font-medium text-sm">{t('pricing.about_btn')}</span>
                  <Info className="w-4 h-4 text-nexa-primary group-hover/btn:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handlePlanSelection(plan)}
                  className={`block w-full py-4 rounded-xl text-center font-bold transition-all duration-300 transform group-hover:scale-[1.02] shadow-lg ${
                    plan.isPopular
                      ? 'bg-nexa-primary text-black hover:bg-cyan-300 shadow-cyan-900/20 hover:shadow-cyan-500/40'
                      : plan.isPremium
                      ? 'bg-nexa-secondary text-white hover:bg-violet-600 shadow-violet-900/20 hover:shadow-violet-600/40'
                      : 'bg-white text-black hover:bg-gray-200 hover:shadow-white/10'
                  }`}
                >
                  {plan.data.button_text}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
      
      {/* MODAL FLOW RENDER */}

      {showMaintenanceModal && (
        <MaintenanceModal 
          onClose={closeAllModals}
          onSelectPlan={handleMaintenanceSelect}
          onSkip={handleMaintenanceSkip}
        />
      )}

      {showSummaryModal && (
        <SummaryModal 
          mainPlan={selectedPlan}
          maintenancePlan={selectedMaintenancePlan}
          onClose={closeAllModals}
          onConfirm={handleSummaryConfirm}
        />
      )}


      {/* Plan Details Modal */}
      {activePlanDetails && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
           {/* Backdrop with Blur */}
           <div 
             className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in transition-opacity"
             onClick={() => setActivePlanDetails(null)}
           ></div>
           
           <div className="relative bg-nexa-card border-t sm:border border-gray-700 w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl animate-fade-in-up sm:animate-fade-in-down flex flex-col overflow-hidden">
              
              <div className="p-5 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-nexa-dark sticky top-0 z-10 shrink-0">
                <div>
                   <h3 className="text-xl font-bold text-white flex items-center gap-3">
                     {t('pricing.modal_title')} 
                     <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                       activePlanDetails === 'intermediate' ? 'bg-nexa-primary text-black' : 
                       activePlanDetails === 'advanced' ? 'bg-nexa-secondary text-white' : 'bg-gray-700 text-white'
                     }`}>
                       {plans.find(p => p.id === activePlanDetails)?.data.name}
                     </span>
                   </h3>
                </div>
                <button 
                  onClick={() => setActivePlanDetails(null)}
                  className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-8">
                 {getPlanDetails(plans.find(p => p.id === activePlanDetails)?.level || 'basic').map((section, idx) => (
                   <div key={idx}>
                     <h4 className="text-xs font-extrabold text-nexa-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2 after:content-[''] after:h-px after:bg-gray-800 after:flex-1">
                       {section.category}
                     </h4>
                     <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                       {section.items.map((item, iIdx) => (
                         <li key={iIdx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                            {typeof item.value === 'boolean' ? (
                              item.value ? (
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-nexa-primary/20 text-nexa-primary flex items-center justify-center shrink-0 shadow-[0_0_10px_-3px_rgba(34,211,238,0.3)]">
                                  <Check className="w-3 h-3" />
                                </div>
                              ) : (
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-800 text-gray-600 flex items-center justify-center shrink-0">
                                  <X className="w-3 h-3" />
                                </div>
                              )
                            ) : (
                              <div className="mt-0.5 w-5 h-5 rounded-full bg-nexa-secondary/20 text-nexa-secondary flex items-center justify-center shrink-0">
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            )}
                            <div>
                               <span className={`text-sm leading-tight block ${typeof item.value === 'boolean' && !item.value ? 'text-gray-500 line-through decoration-gray-700' : 'text-gray-200'}`}>
                                 {item.label}
                               </span>
                               {typeof item.value !== 'boolean' && (
                                 <p className="text-xs text-nexa-primary font-bold mt-1 inline-block px-1.5 py-0.5 bg-nexa-primary/10 rounded">{item.value}</p>
                                )}
                            </div>
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
                 <div className="h-4"></div>
              </div>

              <div className="p-4 sm:p-5 border-t border-gray-800 bg-nexa-dark flex justify-end shrink-0 pb-safe-area">
                <button 
                   onClick={() => setActivePlanDetails(null)}
                   className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  {t('pricing.close')}
                </button>
              </div>
           </div>
        </div>
      )}
    </section>
  );
};
