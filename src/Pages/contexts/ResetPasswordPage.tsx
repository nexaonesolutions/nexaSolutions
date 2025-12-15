import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }
    if (!token) {
      setError(t('auth.invalid_token'));
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccessMessage(t('auth.reset_password_success'));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  if (!token) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center animate-fade-in min-h-screen px-4">
        <div className="bg-nexa-card p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-400">{t('auth.invalid_token_title')}</h1>
          <p className="text-gray-400 mb-6">{t('auth.invalid_token_desc')}</p>
          <Link to="/" className="text-sm text-nexa-primary hover:underline">{t('nav.home')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 flex flex-col items-center justify-center animate-fade-in min-h-screen px-4">
      <div className="bg-nexa-card p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">{t('auth.reset_password_title')}</h1>
        <p className="text-gray-400 mb-6">{t('auth.reset_password_desc')}</p>
        {successMessage ? (
          <div>
            <p className="text-green-400 bg-green-500/10 p-4 rounded-lg text-sm mb-6">{successMessage}</p>
            <Link to="/login" className="w-full px-6 py-3 bg-nexa-primary text-black rounded-xl font-bold hover:bg-cyan-300 transition-colors flex items-center justify-center">
              {t('auth.login')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="password">{t('auth.new_password')}</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-nexa-primary focus:border-nexa-primary" />
            </div>
            <div>
              <label htmlFor="confirmPassword">{t('auth.confirm_password')}</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-nexa-primary focus:border-nexa-primary" />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-nexa-primary text-black rounded-xl font-bold hover:bg-cyan-300 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center">{isLoading ? t('loading') : t('auth.reset_password_submit')}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;