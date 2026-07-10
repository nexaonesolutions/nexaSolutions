import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>(''); // New state for name
  const [cpf, setCpf] = useState<string>(''); // New state for CPF
  const [phone, setPhone] = useState<string>(''); // New state for phone
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { register, loginWithGoogle, isLoading, user, isProfileLoaded } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    try {
      await loginWithGoogle();
      setSuccess(t('auth.registrationSuccess') || 'Cadastro efetuado com sucesso!');
    } catch (err: any) {
      console.warn("[NEXA] Falha ao cadastrar com Google.");
      if (err.code === 'auth/popup-closed-by-user') {
        setError('auth.popupClosed');
      } else {
        const msg = err.message || "auth.registrationFailed";
        const mapped = mapServerErrorToKey(msg);
        setError(mapped ? mapped : msg);
      }
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
            <div className="border-t border-white/5 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white z-20 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {/* Confirm Password Input */}
            <div className="border-t border-white/5 relative">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
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
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white z-20 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400 font-sans font-medium">{t('auth.or')}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={showLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-xl text-sm font-bold text-white bg-gray-800/40 backdrop-blur-xl hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:border-gray-500 hover:shadow-lg"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{t('auth.googleSignIn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
