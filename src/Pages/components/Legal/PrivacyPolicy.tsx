import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-nexa-dark min-h-screen text-gray-300 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Início
                </Link>

                <div className="bg-nexa-card/40 border border-gray-800 rounded-2xl p-8 sm:p-12 shadow-xl">
                    <div className="flex items-center gap-4 border-b border-gray-800 pb-8 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
                            <p className="text-gray-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-base leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Coleta de Informações</h2>
                            <p>
                                A Nexa Solutions coleta informações pessoais (como nome, e-mail e telefone) fornecidas voluntariamente no momento de cadastro, contato ou compra. Adicionalmente, coletamos dados de navegação anonimizados (cookies e analytics) para melhorar a experiência do usuário.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Uso e Compartilhamento de Dados</h2>
                            <p className="mb-4">
                                Seus dados são utilizados exclusivamente para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Fornecer e gerenciar os serviços contratados.</li>
                                <li>Processar pagamentos através de parceiros seguros (como Stripe).</li>
                                <li>Enviar comunicações sobre atualizações de sistema ou projetos em andamento.</li>
                            </ul>
                            <p className="mt-4">
                                <strong>A Nexa Solutions não vende, não aluga e não compartilha dados pessoais</strong> com terceiros para fins de marketing ou prospecção sem consentimento expresso.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Segurança dos Dados</h2>
                            <p>
                                Adotamos rigorosas medidas de segurança, incluindo o uso de bancos de dados criptografados e comunicação via SSL (HTTPS). Senhas são "cacheadas" utilizando hashes irrecuperáveis e o painel de clientes exige autenticação segura. No entanto, nenhum método de transmissão eletrônica é 100% seguro.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Política de Cookies</h2>
                            <p>
                                O nosso site utiliza Cookies para autenticação de sessões ativas e análises de tráfego. Você pode configurar o seu navegador para recusar todos os cookies ou para indicar quando um cookie está sendo enviado. Contudo, algumas funcionalidades do sistema poderão não funcionar corretamente.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Direitos do Titular (LGPD)</h2>
                            <p>
                                Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar o acesso, a correção ou a exclusão dos seus dados pessoais a qualquer momento. Caso deseje exercer esses direitos, basta entrar em contato conosco através do e-mail oficial de suporte.
                            </p>
                        </section>

                        <section className="mt-12 pt-8 border-t border-gray-800">
                            <p className="text-sm text-gray-500 text-center">
                                Dúvidas sobre nossa política de privacidade? Entre em contato com nossa equipe em contato@nexa.solutions
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
