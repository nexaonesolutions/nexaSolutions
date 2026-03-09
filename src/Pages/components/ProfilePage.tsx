import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingCart, FileText, Plus, Trash2, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import { Order } from './types';
import { API_URL } from '../../../utils/apiConfig';
// import { Dialog } from '@headlessui/react';

const ProfilePage: React.FC = () => {
  const { user, token, logout, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshingOrders(true);
    try {
      const headers: Record<string, string> = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/api/orders`, {
        headers,
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
  }, [t, token]);

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
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
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
                {(user?.name || 'U').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold">{t('profile.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-semibold hover:bg-amber-500/30 transition-all flex items-center gap-2">
                Painel Admin
              </button>
            )}
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
                {(user.cpf && formatCPF(user.cpf)) || (user.document && formatCPF(user.document)) || user.nif || 'Não informado'}
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
                    <p className="font-bold text-lg text-white">{order.mainPlanName} {order.paymentMethod ? <span className="text-sm text-gray-400">· {order.paymentMethod}</span> : null}</p>
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
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver Pedido</span>
                      <span className="sm:hidden">Ver</span>
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

      {/* Order detail modal */}
      {selectedOrder && (() => {
        const briefingLabels = {
          companyDescription: '📋 Descrição da Empresa',
          productsServices: '🛍️ Produtos / Serviços',
          companyVision: '🎯 Visão da Empresa',
          targetAudience: '👥 Público-Alvo',
          designPreferences: '🎨 Preferências de Design',
          additionalNotes: '📝 Observações Adicionais',
        };
        const statusConfig = {
          succeeded: { label: 'Aprovado', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
          pending: { label: 'Pendente', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
          failed: { label: 'Falhou', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
        };
        const status = statusConfig[selectedOrder.status || 'pending'] || statusConfig.pending;
        const briefing = selectedOrder.briefing && typeof selectedOrder.briefing === 'object' ? selectedOrder.briefing : null;
        const paymentMethodLabels = { card: '💳 Cartão', pix: '⚡ PIX', sepa_debit: '🏦 SEPA', pending: '⏳ Pendente' };
        const paymentLabel = paymentMethodLabels[selectedOrder.paymentMethod || ''] || selectedOrder.paymentMethod || '—';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nexa-primary via-cyan-400 to-blue-500" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedOrder.mainPlanName}</h3>
                    {selectedOrder.maintenancePlanName && (
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Manutenção: {selectedOrder.maintenancePlanName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Info cards row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Valor</p>
                    <p className="text-base font-bold text-nexa-primary">
                      {new Intl.NumberFormat(language, { style: 'currency', currency: selectedOrder.currency || 'EUR' }).format(selectedOrder.total)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Pagamento</p>
                    <p className="text-sm font-medium text-white">{paymentLabel}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 bg-white/5 rounded-lg px-3 py-2">
                  <span>📅</span>
                  <span>Pedido realizado em <strong className="text-white">{new Date(selectedOrder.date).toLocaleDateString(language, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>

                {/* Progress Stepper */}
                {selectedOrder.progress && (() => {
                  const steps = [
                    { key: 'analise', label: 'Em Análise', icon: '🔍' },
                    { key: 'desenvolvimento', label: 'Em Desenvolvimento', icon: '⚙️' },
                    { key: 'bugs', label: 'Corrigindo Bugs', icon: '🐛' },
                    { key: 'finalizado', label: 'Finalizado', icon: '✅' },
                    { key: 'entregue', label: 'Entregue', icon: '🚀' },
                  ];
                  const currentIdx = steps.findIndex(s => s.key === selectedOrder.progress);

                  return (
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Progresso do Projeto</h4>
                      <div className="flex items-center justify-between relative">
                        {/* Connection line */}
                        <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-white/10" />
                        <div
                          className="absolute top-4 left-[10%] h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                          style={{ width: currentIdx >= 0 ? `${(currentIdx / (steps.length - 1)) * 80}%` : '0%' }}
                        />

                        {steps.map((step, i) => {
                          const isCompleted = i < currentIdx;
                          const isCurrent = i === currentIdx;
                          const isFuture = i > currentIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: '20%' }}>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${isCompleted
                                  ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/20'
                                  : isCurrent
                                    ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/30 animate-pulse'
                                    : 'bg-white/5 border-2 border-white/10 text-gray-600'
                                  }`}
                              >
                                {step.icon}
                              </div>
                              <span className={`text-[10px] mt-1.5 text-center leading-tight font-medium ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-cyan-400' : 'text-gray-600'
                                }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Briefing section */}
                {briefing && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Briefing do Projeto</h4>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {Object.entries(briefing).map(([key, value]) => (
                        <div key={key} className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <p className="text-xs font-semibold text-nexa-primary mb-1">{briefingLabels[key] || key}</p>
                          <p className="text-sm text-gray-200 leading-relaxed">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order ID + Close */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-gray-600 font-mono">ID: {selectedOrder.id}</p>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2 bg-gradient-to-r from-nexa-primary to-cyan-400 text-black rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-nexa-primary/20 transition-all duration-300"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProfilePage;
