import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
// Replaced `react-input-mask` because it calls legacy `findDOMNode` which
// is not available in the React client renderer used here. We apply
// simple formatting helpers instead.
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import mapServerErrorToKey from '../../../../utils/serverMessageMap';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>(''); // New state for name
  const [cpf, setCpf] = useState<string>(''); // New state for CPF
  const [phone, setPhone] = useState<string>(''); // New state for phone
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { register, isLoading, user, isProfileLoaded } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isFieldError = (field: string) => {
    if (!error) return false;
    const lowerError = error.toLowerCase();
    return lowerError.includes(field.toLowerCase());
  };

  const getFieldClass = (field: string, position: 'top' | 'middle' | 'bottom' | 'none' = 'middle') => {
    const base = "appearance-none relative block w-full px-3 py-2.5 border placeholder-gray-500 text-white bg-gray-700/50 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-300";
    const rounded = position === 'top' ? 'rounded-t-lg' : position === 'bottom' ? 'rounded-b-lg' : 'rounded-none';
    const border = isFieldError(field)
      ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-600 focus:ring-nexa-primary focus:border-nexa-primary';

    return `${base} ${rounded} ${border}`;
  };

  // Robust redirection logic using useEffect
  useEffect(() => {
    if (isProfileLoaded && user) {
      // Se houve sucesso, esperamos o delay para o usuário ler a mensagem
      if (success) {
        const timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Redirecionamento imediato se já estiver logado (ex: acessou a página logado)
        navigate('/', { replace: true });
      }
    }
  }, [user, isProfileLoaded, navigate, success]);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass new fields to the register function in the correct order
      await register(name, email, password, cpf, phone);
      setSuccess(t('auth.registrationSuccess'));
    } catch (err: any) {
      console.warn("[NEXA] Falha na tentativa de cadastro local.");
      const msg = err.message || "auth.registrationFailed";
      const mapped = mapServerErrorToKey(msg);
      setError(mapped ? mapped : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLoading = isLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-nexa-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nexa-secondary/10 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexa-primary/10 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[#0a0a0b] opacity-40"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 relative z-10 animate-fade-in-up">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('auth.or')}{' '}
            <Link to="/login" className="font-semibold text-nexa-primary hover:text-nexa-secondary transition-all">
              {t('auth.loginNow')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-inner overflow-hidden border border-white/5 bg-gray-950/20">
            {/* Name Input */}
            <div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={getFieldClass('name', 'top')}
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {/* CPF Input */}
            <div className="border-t border-white/5">
              <input
                id="cpf"
                name="cpf"
                type="text"
                required
                className={getFieldClass('cpf')}
                placeholder={t('auth.cpf')}
                value={cpf}
                onChange={(e) => {
                  setCpf(formatCpf(e.target.value));
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Phone Input */}
            <div className="border-t border-white/5">
              <input
                id="phone"
                name="phone"
                type="text"
                required
                className={getFieldClass('phone')}
                placeholder={t('auth.phone')}
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Email Input */}
            <div className="border-t border-white/5">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={getFieldClass('email')}
                placeholder={t('auth.emailAddress')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Password Input */}
            <div className="border-t border-white/5">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={getFieldClass('password')}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Confirm Password Input */}
            <div className="border-t border-white/5">
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className={getFieldClass('password_mismatch', 'bottom')}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-3 text-red-400 text-sm mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{t(error)}</p>
                {error === 'auth.emailAlreadyInUse' && (
                  <div className="mt-3 flex space-x-2">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-black bg-nexa-primary hover:bg-nexa-secondary transition-all"
                    >
                      {t('auth.loginAction')}
                    </Link>
                    <Link
                      to="/esqueci-senha"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-white border border-white/10 hover:bg-white/5 transition-all"
                    >
                      {t('auth.resetPasswordAction')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-center space-x-2 text-green-400 text-sm mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">{success}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={showLoading}
              className={`group relative w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-nexa-primary hover:bg-nexa-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexa-primary transition-all duration-300 shadow-xl shadow-nexa-primary/20 hover:shadow-nexa-secondary/30 ${showLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {showLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('auth.loading')}
                </>
              ) : (
                t('auth.register')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
