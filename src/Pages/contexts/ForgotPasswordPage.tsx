import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const { forgotPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await forgotPassword(email);
      setMessage(t('auth.forgot_password_success'));
    } catch (err) {
      // Error is handled and displayed by the context
      console.error("Forgot password request failed");
    }
  };

  return (
    <div className="pt-40 flex flex-col items-center justify-center animate-fade-in min-h-screen px-4">
      <div className="bg-nexa-card p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">{t('auth.forgot_password_title')}</h1>
        <p className="text-gray-400 mb-6">{t('auth.forgot_password_desc')}</p>
        {message ? (
            <p className="text-green-400 bg-green-500/10 p-4 rounded-lg text-sm">{message}</p>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-400">Email</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-nexa-primary focus:border-nexa-primary" />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-nexa-primary text-black rounded-xl font-bold hover:bg-cyan-300 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                  {isLoading ? t('loading') : t('auth.forgot_password_submit')}
              </button>
            </form>
        )}
        <div className="mt-6">
            <Link to="/login" className="text-sm text-nexa-primary hover:underline">{t('auth.back_to_login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;