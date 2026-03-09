import React from 'react';
import { ScrollText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ContractViewerProps {
    clientName: string;
    mainPlanName: string;
    mainPlanPrice: number | string;
    maintenancePlanName?: string;
    maintenancePlanPrice?: number | string;
    currencySymbol: string;
    onAccept: () => void;
}

const ContractViewer: React.FC<ContractViewerProps> = ({
    clientName,
    mainPlanName,
    mainPlanPrice,
    maintenancePlanName,
    maintenancePlanPrice,
    currencySymbol,
    onAccept
}) => {
    // Current date logic
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');

    // Trial end date (30 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const formattedTrialEndDate = trialEndDate.toLocaleDateString('pt-BR');

    return (
        <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ScrollText size={120} />
            </div>

            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                <div>
                    <h2 className="text-2xl font-bold text-white">Contrato de Prestação de Serviços</h2>
                    <p className="text-sm text-gray-400">Termos de Desenvolvimento e Infraestrutura</p>
                </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar text-sm text-gray-300 space-y-4 font-mono leading-relaxed">
                <p className="text-center font-bold text-white mb-6">LICENÇA DE USO E DESENVOLVIMENTO DE SOFTWARE</p>

                <p>
                    Pelo presente instrumento, a <strong>Nexa Solutions</strong> (CONTRATADA) e o <strong>Cliente: {clientName || 'Usuário'}</strong> (CONTRATANTE), firmam o presente acordo de prestação de serviços tecnológicos e licenciamento de infraestrutura sob os seguintes termos:
                </p>

                <h3 className="font-bold text-cyan-400 mt-6">- CLÁUSULA 1: DO OBJETO (SETUP E DESENVOLVIMENTO)</h3>
                <p>
                    A CONTRATADA compromete-se a desenvolver e entregar o ativo digital denominado <strong>{mainPlanName}</strong>.
                    O valor acordado referente à Taxa de Setup Única para o desenvolvimento deste software é de <strong>{currencySymbol} {mainPlanPrice}</strong>, pagável na data de aceite deste contrato ({formattedDate}).
                </p>

                {maintenancePlanName && (
                    <>
                        <h3 className="font-bold text-cyan-400 mt-6">- CLÁUSULA 2: DA INFRAESTRUTURA E MANUTENÇÃO (RECORRÊNCIA)</h3>
                        <p>
                            Para assegurar a estabilidade e funcionamento ininterrupto do ativo desenvolvido na Cláusula 1, o CONTRATANTE adere ao plano contínuo de infraestrutura denominado <strong>{maintenancePlanName}</strong>.
                        </p>
                        <p>
                            Fica acordado o valor recorrente de <strong>{currencySymbol} {maintenancePlanPrice} por mês</strong>. O primeiro mês de manutenção (período de desenvolvimento) será concedido de forma <strong>gratuita</strong>. A primeira cobrança da assinatura ocorrerá automaticamente no cartão de crédito cadastrado na data de <strong>{formattedTrialEndDate}</strong>.
                        </p>
                    </>
                )}

                <h3 className="font-bold text-cyan-400 mt-6">- CLÁUSULA 3: CANCELAMENTO E DEVOLUÇÃO (RISCOS)</h3>
                <p>
                    Dado que o desenvolvimento de software (Cláusula 1) demanda alocação exclusiva de engenheiros e designers a partir do momento do pagamento, <strong>a Taxa de Setup de {currencySymbol} {mainPlanPrice} possui caráter irrevogável e não está sujeita à devolução parcial ou integral</strong> (Art. 49 CTN adaptado a serviços de elaboração customizada).
                </p>
                {maintenancePlanName && (
                    <p>
                        A rescisão do plano de manutenção (Cláusula 2) não exime as obrigações passadas, resultando na imediata suspensão da hospedagem e dos acessos públicos ao projeto digital. Neste caso, o pacote de código fonte não será exportado, dado o regime de SaaS (Software As A Service).
                    </p>
                )}

                <div className="bg-red-900/10 border-l-4 border-red-500 p-4 mt-6">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                        <AlertTriangle size={18} />
                        ATENÇÃO
                    </div>
                    <p className="text-red-200/80">
                        A Nexa Solutions não garante promessas de lucros fixos ou faturamentos decorrentes do uso das landing pages elaboradas, sendo estas apenas ativos tecnológicos de alta performance para converter tráfego fornecido pelo cliente.
                    </p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
                <button
                    onClick={onAccept}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group text-lg"
                >
                    <CheckCircle2 className="group-hover:scale-110 transition-transform" />
                    Li e Aceito os Termos de Serviço
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                    Ao confirmar, você atesta força legal equivalente à assinatura física neste documento, gerando logs e rastros de IP.
                </p>
            </div>
        </div>
    );
};

export default ContractViewer;
