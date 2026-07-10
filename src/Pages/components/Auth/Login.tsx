import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import mapServerErrorToKey from '../../../../utils/serverMessageMap';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Added loading state
  const { login, loginWithGoogle, pendingOrder, setPendingOrder, user, isProfileLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Robust redirection logic using useEffect
  useEffect(() => {
    if (isProfileLoaded && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (pendingOrder) {
        navigate('/pagamento', { state: pendingOrder, replace: true });
        setPendingOrder(null);
      } else {
        const from = location.state?.from;
        if (from) {
          navigate(from.pathname, { state: from.state, replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, isProfileLoaded, pendingOrder, navigate, location, setPendingOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmailFormat')); // Assuming you'll add this translation key
      return;
    }

    setIsLoading(true); // Set loading to true on submission
    try {
      const trimmedEmail = email.trim().toLowerCase();
      await login(trimmedEmail, password, rememberMe);
      // Redirection is now handled by the useEffect above
    } catch (err: any) {
      console.warn("[NEXA] Falha na tentativa de login local.");
      const serverMessage = err.message || "auth.loginFailed";
      const mapped = mapServerErrorToKey(serverMessage);

      if (mapped) {
        setError(t(mapped));
      } else {
        setError(serverMessage);
      }
    } finally {
      setIsLoading(false); // Set loading to false after submission (success or failure)
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn("[NEXA] Falha ao logar com Google.");
      // Check for common firebase popup closed error
      if (err.code === 'auth/popup-closed-by-user') {
        setError(t('auth.popupClosed') || 'O pop-up de login foi fechado antes de concluir.');
      } else {
        const serverMessage = err.message || "auth.loginFailed";
        const mapped = mapServerErrorToKey(serverMessage);
        setError(mapped ? t(mapped) : serverMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexa-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements - Similar to Hero section */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nexa-secondary/20 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexa-primary/20 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 glass-effect relative z-10 animate-fade-in-up">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-sans">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('auth.or')}{' '}
            <Link to="/cadastro" className="font-medium text-nexa-primary hover:text-nexa-secondary transition-colors">
              {t('auth.registerNow')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm"
                placeholder={t('auth.emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm mt-2"
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white mt-2 z-20 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-nexa-primary focus:ring-nexa-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                {t('auth.remember_me')}
              </label>
            </div>

            <div className="text-sm">
              <Link to="/esqueci-senha" className="font-medium text-nexa-primary hover:text-nexa-secondary transition-colors">
                {t('auth.forgot_password')}
              </Link>
            </div>
          </div>

          {error && (
            <div className="relative bg-red-800 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4 flex items-center justify-between">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 focus:outline-none"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading} // Disable button when loading
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-black bg-nexa-primary hover:bg-nexa-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexa-primary transition duration-300 shadow-lg shadow-nexa-primary/30 hover:shadow-nexa-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
            >
              {isLoading ? t('auth.loading') : t('auth.signIn')} {/* Show loading key */}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400 font-sans font-medium">{t('auth.or')}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-600 rounded-md text-sm font-semibold text-white bg-gray-700/50 hover:bg-gray-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:border-gray-500 hover:shadow-lg"
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

export default Login;
