import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import mapServerErrorToKey from '../../../../utils/serverMessageMap';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Added loading state
  const { login, pendingOrder, setPendingOrder, user, isProfileLoaded } = useAuth();
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
      const trimmedPassword = password;

      if (!trimmedPassword) {
        setError(t('auth.password') || 'Password is required');
        setIsLoading(false);
        return;
      }

      await login(trimmedEmail, trimmedPassword, rememberMe);
      // Redirection is now handled by the useEffect above
    } catch (err: any) {
      // Prefer server-provided message when available. Map to translation key when possible.
      const serverMessage: string | null = err?.message || null;
      if (serverMessage) {
        const mapped = mapServerErrorToKey(serverMessage);
        if (mapped) setError(t(mapped)); else setError(serverMessage);
      } else {
        setError(t('auth.loginFailed'));
      }
    } finally {
      setIsLoading(false); // Set loading to false after submission (success or failure)
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
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary focus:z-10 sm:text-sm mt-2"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
      </div>
    </div>
  );
};

export default Login;
