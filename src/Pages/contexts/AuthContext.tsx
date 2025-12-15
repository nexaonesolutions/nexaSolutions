import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

/**
 * ENDEREÇO DO SEU BACKEND
 * Todas as requisições do frontend para o backend usarão esta URL como base.
 */
const API_URL = 'http://localhost:3000';

// --- Interfaces ---
// Define a estrutura do objeto de usuário
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
}

interface Plan {
    name: string;
    price: string | number;
}
  
  interface FullPlan extends Plan {
    id: string;
    isPopular: boolean;
    isPremium: boolean;
    data: any; 
    level: 'basic' | 'inter' | 'adv';
}

interface PendingOrder {
    mainPlan: FullPlan;
    maintenancePlan: Plan | null;
}

interface Order {
    id: string;
    mainPlanName: string;
    maintenancePlanName?: string;
    date: string;
    total: number;
}
  

// Define o que o nosso AuthContext irá fornecer
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (name: string, email: string, password: string, cpf: string, phone: string) => Promise<any>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  pendingOrder: PendingOrder | null;
  setPendingOrder: React.Dispatch<React.SetStateAction<PendingOrder | null>>;
  orders: Order[] | null;
  fetchOrders: () => void;
  isAuthenticated: boolean;
  updateProfile: (data: { name: string; email: string; phone: string; cpf: string; }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Componente Provedor ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
    const [orders, setOrders] = useState<Order[] | null>([]);
    const isAuthenticated = !!token;
  
    const loadUser = useCallback(async () => {
      if (!token) return;
      try {
        const userData = await apiCall('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUser(userData);
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to load user data:", err);
        logout(); // If token is invalid, log out the user
      }
    }, [token]);
  
    // Load user data on initial load if token exists
    useEffect(() => {
      if (token && !user) {
        loadUser();
      }
    }, [token, user, loadUser]);
  
    const fetchOrders = useCallback(async () => {
      if (!token) return;
      try {
        const userOrders = await apiCall('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]); 
      }
    }, [token]);
  
    const updateProfile = useCallback(async (data: { name: string; email: string; phone: string; cpf: string; }) => {
      try {
        const updatedUser = await apiCall('/api/users/profile', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data),
        });
        setUser(updatedUser);
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));
        return true;
      } catch (err) {
        return false;
      }
    }, [token]);
  
    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
      try {
        await apiCall('/api/users/change-password', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ oldPassword, newPassword }),
        });
        return true;
      } catch (err) {
        return false;
      }
    }, [token]);
  

  // Função genérica para chamadas à API
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro.');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-lança o erro para que o componente que chamou possa tratar
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('user', JSON.stringify(data.user));
    
    return data;
  };

  const register = async (name: string, email: string, password: string, cpf: string, phone: string) => {
    return await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, cpf, phone }),
    });
    // Opcional: Fazer login automaticamente após o registro
    // await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const forgotPassword = async (email: string) => {
    await apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (token: string, password: string) => {
    await apiCall('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isLoading,
    error,
    pendingOrder,
    setPendingOrder,
    orders,
    fetchOrders,
    isAuthenticated,
    updateProfile,
    changePassword,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;