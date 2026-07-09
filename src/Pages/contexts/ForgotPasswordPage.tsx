import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { API_URL } from '@/utils/apiConfig';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';

type Step = 'email' | 'code' | 'password' | 'success';

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'code' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setStep('code');
      } else {
        setError(data.message || 'Erro ao enviar código.');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if full
    if (value && index === 5 && newCode.every(c => c !== '')) {
      verifyCode(newCode.join(''));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
      });
      const data = await res.json();

      if (res.ok) {
        setResetToken(data.token);
        setStep('password');
      } else {
        setError(data.message || 'Código inválido.');
      }
    } catch (err) {
      setError('Falha na verificação do código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setStep('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Erro ao redefinir a senha.');
      }
    } catch (err) {
      setError('Falha na redefinição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexa-dark flex flex-col items-center justify-center pt-20 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
      </div>

      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header Pattern */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />

        <div className="p-8 sm:p-10">
          {/* Back Button */}
          {step !== 'success' && (
            <button
              onClick={() => step === 'email' ? navigate('/login') : setStep(step === 'password' ? 'code' : 'email')}
              className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Voltar
            </button>
          )}

          {step === 'email' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Mail className="w-7 h-7 text-cyan-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Recuperar Senha</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Digite o e-mail associado à sua conta Nexa. Nós enviaremos um código de 6 dígitos para você.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-mail de Cadastro</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all sm:text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? 'Enviando Código...' : (
                    <>
                      Enviar Código
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'code' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <KeyRound className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Verifique seu E-mail</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Enviamos um código de 6 dígitos para <span className="text-cyan-400 font-medium">{email}</span>. O código expira em 15 minutos.
              </p>

              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold text-white bg-gray-950/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all uppercase"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                <button
                  onClick={() => verifyCode(code.join(''))}
                  disabled={isLoading || code.some(c => c === '')}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-black bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? 'Verificando...' : 'Verificar Código'}
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-gray-500">
                Não recebeu o e-mail? <button onClick={handleEmailSubmit} className="text-cyan-400 hover:text-white font-medium transition-colors">Reenviar agara</button>
              </p>
            </div>
          )}

          {step === 'password' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Lock className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Nova Senha</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Quase lá! Crie uma nova senha forte para sua conta.
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Digite a Nova Senha</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Pelo menos 8 caracteres com letras maiúsculas e minúsculas.</p>
                </div>

                {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-black bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? 'Redefinindo...' : 'Atualizar e Entrar'}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center animate-in fade-in zoom-in duration-500 py-8">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Tudo Certo!</h2>
              <p className="text-gray-400 text-sm mb-6">Sua senha foi redefinida com sucesso.</p>
              <div className="inline-flex items-center text-sm text-cyan-400 animate-pulse">
                Redirecionando para o login...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;