import React, { useState } from 'react';
import { FileText, Target, Eye, MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectBriefingModalProps {
  isOpen: boolean;
  onSubmit: (data: any) => void;
  planName: string;
}

const ProjectBriefingModal: React.FC<ProjectBriefingModalProps> = ({ isOpen, onSubmit, planName }) => {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('nexa_briefing_draft');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Error parsing saved briefing data', e);
      }
    }
    return {
      companyDescription: '',
      productsServices: '',
      companyVision: '',
      targetAudience: '',
      designPreferences: '',
      additionalNotes: ''
    };
  });

  React.useEffect(() => {
    localStorage.setItem('nexa_briefing_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Optionally clear it here, or let it persist until final checkout.
    // For safety, let's keep it until they actually pay successfully,
    // so if they go back from checkout, it's still there.
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-cyan-400" />
                  Briefing do Projeto
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Vamos personalizar seu <span className="text-cyan-400 font-semibold">{planName}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow">
              <div className="bg-cyan-900/20 border border-cyan-800/50 rounded-lg p-4 mb-6">
                <p className="text-cyan-200 text-sm">
                  Para entregarmos um resultado alinhado com suas expectativas, precisamos entender a essência do seu negócio.
                  Por favor, preencha as informações abaixo.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                    <FileText size={16} />
                    Descrição da Empresa
                  </label>
                  <textarea
                    name="companyDescription"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-black focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all min-h-[100px]"
                    placeholder="Conte-nos sobre sua empresa. Quem são vocês? Há quanto tempo estão no mercado? Qual é a sua história?"
                    value={formData.companyDescription}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                    <Target size={16} />
                    Produtos / Serviços e Ações
                  </label>
                  <textarea
                    name="productsServices"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-black focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all min-h-[100px]"
                    placeholder="Quais são os principais produtos ou serviços? O que você espera que o visitante faça no site (comprar, agendar, entrar em contato)?"
                    value={formData.productsServices}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                    <Eye size={16} />
                    Visão da Empresa
                  </label>
                  <textarea
                    name="companyVision"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-black focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all min-h-[100px]"
                    placeholder="Qual é a visão de futuro da sua empresa? Quais valores e imagem você quer transmitir através do site?"
                    value={formData.companyVision}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-cyan-400">Público Alvo</label>
                    <input
                      type="text"
                      name="targetAudience"
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-black focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                      placeholder="Quem são seus clientes ideais?"
                      value={formData.targetAudience}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-cyan-400">Preferências de Design</label>
                    <input
                      type="text"
                      name="designPreferences"
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-black focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                      placeholder="Cores, estilo (moderno, clássico)..."
                      value={formData.designPreferences}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                    <MessageSquare size={16} />
                    Observações Adicionais
                  </label>
                  <textarea
                    name="additionalNotes"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-black focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all min-h-[80px]"
                    placeholder="Alguma outra informação importante que devamos saber para o desenvolvimento?"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button
                  type="submit"
                  className="w-full bg-cyan-500 text-black font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all transform hover:scale-[1.01] shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  Salvar e Ir para Pagamento
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectBriefingModal;