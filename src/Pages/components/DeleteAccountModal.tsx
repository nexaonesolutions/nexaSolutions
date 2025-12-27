import React, { useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (e) {
      // O erro é tratado pelo componente pai, mas precisamos parar o carregamento aqui
    }
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-nexa-card border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 w-full max-w-md p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Deletar Conta</h2>
        <p className="text-gray-400 mb-8">
          Você tem certeza? Esta ação é irreversível. Todos os seus dados, incluindo histórico de pedidos, serão permanentemente removidos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onClose} disabled={isLoading} className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleConfirmClick} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed">
            {isLoading ? (<><Loader className="w-5 h-5 animate-spin" /> Deletando...</>) : ('Sim, deletar conta')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;