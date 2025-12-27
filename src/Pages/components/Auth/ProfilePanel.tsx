import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ProfilePanel: React.FC = () => {
  const { user, isAuthenticated, logout, updateProfile, changePassword, loadUser, error: authError } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [cpf, setCpf] = useState<string>(user?.cpf || '');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Redirect to login if not authenticated
    } else if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCpf(user.cpf || '');
    }
  }, [isAuthenticated, user, navigate]);

  // Avatar preview (local only)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(String(reader.result));
      reader.readAsDataURL(avatarFile);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setAvatarFile(f);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    try {
      if (!updateProfile) throw new Error('Update not available');
      const success = await updateProfile({ name, email, phone, cpf });
      if (success) {
        setProfileMessage(t('auth.profileUpdateSuccess'));
      }
    } catch (err) {
      setProfileError((err as any)?.message || t('auth.networkError'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('auth.passwordsMismatch'));
      return;
    }

    try {
      if (!changePassword) throw new Error('Change password not available');
      const success = await changePassword(oldPassword, newPassword);
      if (success) {
        setPasswordMessage(t('auth.passwordChangeSuccess'));
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(authError || t('auth.passwordChangeFailed'));
      }
    } catch (err) {
      setPasswordError((err as any)?.message || t('auth.networkError'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-nexa-dark flex flex-col items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nexa-secondary/20 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexa-primary/20 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 p-4 sm:p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 glass-effect relative z-10 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            {t('auth.profileTitle')}
          </h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (user?.name || 'U').split(' ').map(s=>s[0]).slice(0,2).join('')
                )}
              </div>
              <span className="text-sm text-gray-300 hidden sm:inline">{t('auth.changeAvatar') || 'Alterar avatar'}</span>
            </label>
            <button onClick={() => navigate('/perfil')} className="px-4 py-2 text-sm bg-white/5 text-white rounded-md hover:bg-white/10 ml-auto">{t('profile.back') || 'Voltar'}</button>
          </div>
        </div>

        {/* Profile Update Form */}
        <form className="space-y-6" onSubmit={handleProfileUpdate}>
          <h3 className="text-lg sm:text-xl font-bold text-white border-b border-gray-700 pb-3 mb-4">
            {t('auth.personalInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                {t('auth.name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm disabled:opacity-50"
                value={name}
                disabled
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                {t('auth.phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                autoComplete="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-300">
                {t('auth.cpf')}
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm disabled:opacity-50"
                value={cpf}
                disabled
              />
            </div>
          </div>

          {profileError && (
            <div className="text-red-500 text-sm text-center mt-2">{profileError}</div>
          )}
          {profileMessage && (
            <div className="text-green-500 text-sm text-center mt-2">{profileMessage}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-black bg-nexa-primary hover:bg-nexa-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexa-primary transition duration-300 shadow-lg shadow-nexa-primary/30 hover:shadow-nexa-secondary/40"
            >
              {t('auth.updateProfile')}
            </button>
          </div>
        </form>

        {/* Change Password Form */}
        <form className="space-y-6 mt-8" onSubmit={handleChangePassword}>
          <h3 className="text-lg sm:text-xl font-bold text-white border-b border-gray-700 pb-3 mb-4">
            {t('auth.changePassword')}
          </h3>
          <div>
            <label htmlFor="old-password" className="block text-sm font-medium text-gray-300">
              {t('auth.oldPassword')}
            </label>
            <input
              id="old-password"
              name="old-password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">
              {t('auth.newPassword')}
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-300">
              {t('auth.confirmNewPassword')}
            </label>
            <input
              id="confirm-new-password"
              name="confirm-new-password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-nexa-primary focus:border-nexa-primary sm:text-sm"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          {passwordError && (
            <div className="text-red-500 text-sm text-center mt-2">{passwordError}</div>
          )}
          {passwordMessage && (
            <div className="text-green-500 text-sm text-center mt-2">{passwordMessage}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-black bg-nexa-primary hover:bg-nexa-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexa-primary transition duration-300 shadow-lg shadow-nexa-primary/30 hover:shadow-nexa-secondary/40"
            >
              {t('auth.changePasswordBtn')}
            </button>
          </div>
        </form>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-600/40"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
