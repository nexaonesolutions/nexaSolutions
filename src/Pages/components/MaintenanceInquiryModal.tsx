import React from 'react';
import { X } from 'lucide-react';

interface MaintenanceInquiryModalProps {
  onConfirm: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const MaintenanceInquiryModal: React.FC<MaintenanceInquiryModalProps> = ({ onConfirm, onDecline, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="relative bg-gray-900/50 glass-effect border border-nexa-primary/20 rounded-2xl shadow-2xl shadow-nexa-primary/10 p-6 sm:p-8 max-w-md w-full text-center animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-nexa-primary/20 rounded-full p-2 transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white">Deseja adicionar um pacote de manutenção?</h2>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-nexa-primary text-black rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:bg-cyan-300 shadow-cyan-900/20 hover:shadow-cyan-500/40"
          >
            Sim, adicionar
          </button>
          <button
            onClick={onDecline}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            Não, obrigado
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceInquiryModal;
