import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingCart, FileText, Plus } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout, isLoading, orders, fetchOrders } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="pt-40 flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando perfil...</p>
      </div>
    );
  }

  if (!user) {
    // This case is unlikely if ProtectedRoute is used, but it's a good safeguard.
    return null;
  }

  return (
    <div className="pt-32 sm:pt-40 flex flex-col items-center justify-start animate-fade-in min-h-screen px-4">
      <div className="bg-nexa-card p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl text-center">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xl">
              {(user?.name || 'U').split(' ').map(s => s[0]).slice(0,2).join('')}
            </div>
            <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          </div>
          <div>
            <button onClick={() => navigate('/perfil/editar')} className="ml-4 px-4 py-2 bg-nexa-primary text-black rounded-lg font-semibold hover:bg-cyan-300 transition-colors">
              {t('profile.edit_profile') || 'Editar perfil'}
            </button>
          </div>
        </div>
        
        <div className="space-y-6 text-left">
          <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
            <User className="w-6 h-6 text-nexa-primary" />
            <div>
              <p className="text-sm text-gray-400">{t('profile.name')}</p>
              <p className="text-lg font-medium text-white">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
            <Mail className="w-6 h-6 text-nexa-primary" />
            <div>
              <p className="text-sm text-gray-400">{t('profile.email')}</p>
              <p className="text-lg font-medium text-white">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-800"></div>

        <div className="text-left">
          <h2 className="text-2xl font-bold mb-4">{t('profile.order_history_title')}</h2>
          {!orders ? (
            <p className="text-gray-500">{t('loading')}</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 px-4 bg-gray-900/50 rounded-lg">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">{t('profile.no_orders')}</p>
              <button onClick={() => navigate('/planos')} className="px-6 py-2 bg-nexa-primary text-black rounded-lg font-bold hover:bg-cyan-300 transition-colors">
                Ver Planos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-900/50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-grow">
                    <p className="font-bold text-lg text-white">{order.mainPlanName}</p>
                    {order.maintenancePlanName && (
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> {order.maintenancePlanName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t('profile.order_date')}: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <p className="text-xl font-bold text-nexa-primary">€{order.total}</p>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('profile.invoice_btn')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-300 rounded-xl font-bold hover:bg-red-500/30 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;