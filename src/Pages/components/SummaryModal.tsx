import React from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';

interface Plan {
  name: string;
  price: string | number;
  currency: string;
}

interface SummaryModalProps {
  onClose: () => void;
  onConfirm: () => void;
  mainPlan: Plan | null;
  maintenancePlan?: Plan | null;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ onClose, onConfirm, mainPlan, maintenancePlan }) => {
  const total = (mainPlan ? Number(String(mainPlan.price).replace(/[^0-9.-]+/g,"")) : 0) + (maintenancePlan ? Number(String(maintenancePlan.price).replace(/[^0-9.-]+/g,"")) : 0);
  const currency = mainPlan?.currency || maintenancePlan?.currency || '€';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="relative bg-gray-900/50 glass-effect border border-nexa-primary/20 rounded-2xl shadow-2xl shadow-nexa-primary/10 p-6 sm:p-8 max-w-lg w-full text-left animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-nexa-primary/20 rounded-full p-2 transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-nexa-primary"/>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Resumo do Pedido</h2>
        </div>

        <div className="space-y-4">
            {mainPlan && (
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <span className="font-medium text-gray-200">Plano: {mainPlan.name}</span>
                    <span className="font-bold text-white">{currency}{mainPlan.price}</span>
                </div>
            )}
            {maintenancePlan && (
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <span className="font-medium text-gray-200">Manutenção: {maintenancePlan.name}</span>
                    <span className="font-bold text-white">{currency}{maintenancePlan.price}/mês</span>
                </div>
            )}
        </div>
        
        <div className="border-t border-gray-700 my-6"></div>

        <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-semibold text-gray-300">Total:</span>
            <span className="text-2xl font-extrabold text-nexa-primary">{currency}{total}{maintenancePlan ? '/mês' : ''}</span>
        </div>

        <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-nexa-primary text-black rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:bg-cyan-300 shadow-cyan-900/20 hover:shadow-cyan-500/40"
        >
            Ir Para Pagamento
            <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SummaryModal;
