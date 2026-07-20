import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
    return (
        <div className="bg-nexa-dark min-h-screen text-gray-300 font-sans antialiased pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Início
                </Link>

                <div className="bg-nexa-card/40 border border-gray-800 rounded-2xl p-8 sm:p-12 shadow-xl">
                    <div className="flex items-center gap-4 border-b border-gray-800 pb-8 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Termos de Uso</h1>
                            <p className="text-gray-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-base leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
                            <p>
                                Ao acessar e contratar os serviços da Nexa Solutions ("Contratada"), o Cliente ("Contratante") concorda integralmente com estes Termos de Uso. O desenvolvimento, licenciamento e manutenção de páginas web (Landing Pages e Websites) são regidos pelas regras abaixo, com base nas normativas de Softwares as a Service (SaaS).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Serviços Prestados</h2>
                            <p className="mb-4">
                                A Nexa Solutions fornece serviços de design de interfaces, desenvolvimento front-end/back-end e infraestrutura em nuvem. A contratação divide-se em duas naturezas interdependentes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li><strong className="text-gray-300">Desenvolvimento (Setup):</strong> Criação do ativo digital personalizado conforme Briefing. Valorado como taxa única.</li>
                                <li><strong className="text-gray-300">Infraestrutura e Manutenção:</strong> Serviço recorrente de hospedagem, segurança, SSL e tráfego de dados. Valorado em assinatura mensal.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Pagamentos e Assinaturas</h2>
                            <p className="mb-4">
                                O pagamento da <strong>Taxa de Setup é devido no ato da contratação</strong>. Caso o projeto englobe um plano de manutenção mensal, <strong>o primeiro mês do ciclo de desenvolvimento é isento</strong>. A cobrança recorrente será ativada automaticamente 30 dias após o ato da compra, via cartão de crédito ou meio eletrônico vigente.
                            </p>
                            <div className="bg-gray-800/50 border-l-4 border-cyan-500 p-4 rounded-r-lg">
                                <p className="text-sm">
                                    A inadimplência da assinatura de manutenção confere à Nexa Solutions o direito de suspender a hospedagem e serviços associados ao domínio, até que a pendência seja regularizada.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Propriedade Intelectual e Migração</h2>
                            <p>
                                A Nexa Solutions atua em formato SaaS fechado ou Plataforma Própria de Nuvem (Cloud). O código fonte, lógicas de retaguarda (backends) e arquitetura nativa são de propriedade intelectual da Nexa Solutions. O Cliente adquire o <strong>Direito de Uso Contínuo Licenciado</strong> (via plano de manutenção). Portanto, arquivos finais de código (.tsx, .jsx, banco de dados complexo) não são empacotados para migração para hospedagens de terceiros sob pena de quebra de arquitetura proprietária.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Isenção de Ganhos e Resultados</h2>
                            <p>
                                A Nexa Solutions fornece tecnologia de ponta para otimização de vendas. Entretanto, <strong>não configuramos agência de Marketing de Performance nem garantimos volume de tráfego, lucros ou faturamento</strong>. A conversão de visitantes em clientes depende intrinsecamente do Produto do cliente e do Tráfego (Ads) gerenciado pelo mesmo.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Cancelamento Comercial e Devoluções</h2>
                            <p>
                                Por se tratar de um serviço imediato de encomenda personalizada (art. 49 CTN aplicável a escopos de código laborais intransferíveis a terceiros), onde desenvolvedores são alocados no instante da contraprestação financeira, a <strong>Taxa de Setup (Desenvolvimento) é não-reembolsável</strong>. O assinante possui livre direito para cancelar a Assinatura Mensal de Manutenção a qualquer momento de seu painel administrativo, isentando-o de próximas faturas, e por consequência, desativando a veiculação web do serviço.
                            </p>
                        </section>

                        <section className="mt-12 pt-8 border-t border-gray-800">
                            <p className="text-sm text-gray-500 text-center">
                                Estes termos complementam o "Contrato de Prestação de Serviços" apresentado no ato do pagamento.
                                Dúvidas? Entre em contato com nossa equipe em contato@nexa.solutions
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
