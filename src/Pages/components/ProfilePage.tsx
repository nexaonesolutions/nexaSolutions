import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingCart, FileText, Plus, Trash2, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import { Order } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfilePage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: signal instanceof AbortSignal ? signal : undefined
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setOrdersError(null);
      } else if (response.status === 429) {
        setOrdersError(t('profile.errors.too_many_requests', 'Muitas tentativas. Por favor, aguarde alguns instantes.'));
      } else {
        setOrdersError(t('profile.errors.fetch_orders', 'Não foi possível carregar seus pedidos.'));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("Erro ao buscar pedidos:", error);
      setOrdersError(t('profile.errors.fetch_orders_generic', 'Ocorreu um erro de rede. Tente novamente.'));
    } finally {
      setIsRefreshingOrders(false);
    }
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();
    if (user) {
      fetchOrders(controller.signal);
    }
    return () => controller.abort();
  }, [user?.id, fetchOrders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Falha ao deletar a conta.');
      }

      // On successful deletion, log out and redirect
      handleLogout();
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  const formatCPF = (cpf: string) => {
    const numeric = cpf.replace(/\D/g, '');
    if (numeric.length === 11) {
      return numeric.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
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
    <div className="pt-32 sm:pt-40 flex flex-col items-center justify-start animate-fade-in px-4 py-8 w-full">
      <div className="bg-nexa-card p-4 sm:p-8 rounded-2xl shadow-lg w-full max-w-4xl text-center mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-nexa-primary"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xl">
                {(user?.name || 'U').split(' ').map((s: string) => s[0]).slice(0,2).join('')}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold">{t('profile.title')}</h1>
          </div>
          <div>
            <button onClick={() => navigate('/perfil/editar')} className="px-4 py-2 bg-nexa-primary text-black rounded-lg font-semibold hover:bg-cyan-300 transition-colors">
              {t('profile.edit_profile') || 'Editar perfil'}
            </button>
          </div>
        </div>
        
        <div className="space-y-4 text-left">
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
          <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
            <FileText className="w-6 h-6 text-nexa-primary" />
            <div>
              <p className="text-sm text-gray-400">CPF / NIF</p>
              <p className="text-lg font-medium text-white">
                { (user.cpf && formatCPF(user.cpf)) || (user.document && formatCPF(user.document)) || user.nif || 'Não informado' }
              </p>
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-gray-800"></div>

        <div className="text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">{t('profile.order_history_title')}</h2>
            <button 
              onClick={fetchOrders} 
              className={`p-2 hover:bg-gray-800 rounded-full transition-all ${isRefreshingOrders ? 'animate-spin text-nexa-primary' : 'text-gray-400 hover:text-white'}`}
              title="Atualizar pedidos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          {!orders && !ordersError ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg h-24 animate-pulse"></div>
              ))}
            </div>
          ) : ordersError ? (
            <div className="text-center py-8 px-4 bg-red-900/20 text-red-300 border border-red-800 rounded-lg">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="font-semibold mb-4">{ordersError}</p>
              <button onClick={fetchOrders} className="px-6 py-2 bg-nexa-primary text-black rounded-lg font-bold hover:bg-cyan-300 transition-colors">
                {t('profile.retry', 'Tentar Novamente')}
              </button>
            </div>
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
                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                    <p className="text-lg sm:text-xl font-bold text-nexa-primary sm:text-right">
                      {new Intl.NumberFormat(language, { style: 'currency', currency: order.currency || 'EUR' }).format(order.total)}
                    </p>
                    <button 
                      onClick={() => order.invoiceUrl && window.open(order.invoiceUrl, '_blank')}
                      disabled={!order.invoiceUrl}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('profile.invoice_btn')}</span>
                      <span className="sm:hidden">{t('profile.invoice_btn_short', 'Ver')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {deleteError && (
          <div className="mt-4 p-4 bg-red-900/50 text-red-300 border border-red-800 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span>{deleteError}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/20 text-gray-300 rounded-xl font-bold hover:bg-gray-500/30 hover:text-gray-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('auth.logout')}</span>
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-300 rounded-xl font-bold hover:bg-red-500/30 hover:text-red-200 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Deletar Conta</span>
          </button>
        </div>
      </div>

      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteAccount} />
    </div>
  );
};

export default ProfilePage;