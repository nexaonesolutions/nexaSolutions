import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { register, isLoading, user, isProfileLoaded } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    try {
      // Pass new fields to the register function in the correct order
      await register(name, email, password, cpf, phone);
      setSuccess(t('auth.registrationSuccess'));
    } catch (err: any) {
      console.warn("[NEXA] Falha na tentativa de cadastro local.");
      const msg = err.message || "auth.registrationFailed";
      const mapped = mapServerErrorToKey(msg);
      setError(mapped ? mapped : msg);
    }
  };

  return (
    <div className="min-h-screen bg-nexa-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements - Similar to Hero section */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nexa-secondary/20 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexa-primary/20 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 glass-effect relative z-10 animate-fade-in-up">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-sans">
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('auth.or')}{' '}
            <Link to="/login" className="font-medium text-nexa-primary hover:text-nexa-secondary transition-colors">
              {t('auth.loginNow')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="sr-only">
                {t('auth.name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {/* CPF Input */}
            <div className="mt-2">
              <label htmlFor="cpf" className="sr-only">
                {t('auth.cpf')}
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
                placeholder={t('auth.cpf')}
                value={cpf}
                onChange={(e) => {
                  setCpf(formatCpf(e.target.value));
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Phone Input */}
            <div className="mt-2">
              <label htmlFor="phone" className="sr-only">
                {t('auth.phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
                placeholder={t('auth.phone')}
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Existing Email Input */}
            <div className="mt-2">
              <label htmlFor="email-address" className="sr-only">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
                placeholder={t('auth.emailAddress')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Existing Password Input */}
            <div className="mt-2">
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            {/* Existing Confirm Password Input */}
            <div className="mt-2">
              <label htmlFor="confirm-password" className="sr-only">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
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
            <div className="text-red-500 text-sm text-center mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
              <p>{t(error)}</p>
              {error === 'auth.emailAlreadyInUse' && (
                <div className="mt-4 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-xs font-bold rounded-md text-black bg-nexa-primary hover:bg-nexa-secondary transition-all"
                  >
                    {t('auth.loginAction')}
                  </Link>
                  <Link
                    to="/esqueci-senha"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 text-xs font-bold rounded-md text-white hover:bg-gray-700 transition-all"
                  >
                    {t('auth.resetPasswordAction')}
                  </Link>
                </div>
              )}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-sm text-center mt-4">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-black bg-nexa-primary hover:bg-nexa-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexa-primary transition duration-300 shadow-lg shadow-nexa-primary/30 hover:shadow-nexa-secondary/40 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('auth.loading') : t('auth.register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
