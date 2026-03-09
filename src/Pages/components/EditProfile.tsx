import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Save, ArrowLeft, Loader, Lock, Image as ImageIcon, FileText } from 'lucide-react';
// import PasswordInput from './PasswordInput';
import { motion, useAnimation } from 'framer-motion';
import { API_URL } from '../../../utils/apiConfig';

const EditProfile: React.FC = () => {
  const { user, token, updateUser: updateAuthUser } = useAuth(); // 1. Obtenha a função de atualização do contexto
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    avatar: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const formAnimation = useAnimation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        document: user.cpf || user.nif || user.document || '',
        avatar: user.avatar || '',
        password: '',
        confirmPassword: ''
      });
      setAvatarLoadError(false);
    }
  }, [user]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [formData.avatar]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length <= 11) { // CPF
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ
      value = value.slice(0, 14);
      value = value.replace(/(\d{2})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1/$2');
      value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    setFormData({ ...formData, document: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordMismatch || !isEmailValid) {
      formAnimation.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4, ease: "easeInOut" }
      });
      if (passwordMismatch) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      } else if (!isEmailValid) {
        setMessage({ type: 'error', text: 'Por favor, insira um e-mail válido.' });
      }
      return;
    }
    setIsLoading(true);

    try {
      const documentValue = formData.document.replace(/\D/g, '');
      const updatePayload: { [key: string]: any } = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
      };

      // Assume 11 digits is CPF, otherwise it's NIF (if not empty)
      if (documentValue.length === 11) {
        updatePayload.cpf = documentValue;
      } else if (documentValue.length > 0) {
        updatePayload.nif = documentValue;
      }

      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(updatePayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar perfil');
      }

      updateAuthUser(data); // 2. Atualize o estado global do usuário
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });

      // Navega de volta para o perfil após o sucesso
      setTimeout(() => {
        navigate('/perfil');
        // window.location.reload(); // 3. Remova o reload
      }, 1500);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const isEmailValid = useMemo(() => {
    if (!formData.email) return false; // Inválido se estiver vazio, pois é obrigatório
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email);
  }, [formData.email]);

  const showEmailError = formData.email.length > 0 && !isEmailValid;

  return (
    <div className="pt-32 sm:pt-40 flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <motion.div
        className="bg-nexa-card p-4 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto"
        animate={formAnimation}
      >
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white">Editar Perfil</h1>

        <div className="flex justify-center mb-8">
          {formData.avatar && !avatarLoadError ? (
            <img
              src={formData.avatar}
              alt="Prévia do Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-nexa-primary"
              onError={() => setAvatarLoadError(true)}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-3xl border-4 border-gray-600">
              {(user?.name || 'U').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-nexa-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full bg-gray-900/50 border rounded-lg p-3 text-white focus:border-nexa-primary focus:outline-none transition-colors ${showEmailError ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
              required
            />
            {showEmailError && (
              <p className="text-xs text-red-400 mt-1">Por favor, insira um e-mail válido.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> URL do Avatar (Imagem)
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://exemplo.com/foto.jpg"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-nexa-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> CPF / NIF
            </label>
            <input
              type="text"
              value={formData.document}
              onChange={handleDocumentChange}
              placeholder="Seu CPF ou NIF"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-nexa-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Nova Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Deixe em branco para manter a atual"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-nexa-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full bg-gray-900/50 border rounded-lg p-3 text-white focus:border-nexa-primary focus:outline-none transition-colors ${passwordMismatch ? "border-red-500 focus:border-red-500" : "border-gray-700"}`}
                />
                {passwordMismatch && (
                  <p className="text-xs text-red-400 mt-1">As senhas não coincidem.</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-nexa-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-8"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;