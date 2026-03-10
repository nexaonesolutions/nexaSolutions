import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { auth, db } from '../../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { API_URL } from '../../../utils/apiConfig';

// --- Interfaces ---
// Define a estrutura do objeto de usuário
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role?: 'client' | 'admin';
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

// JWT Helpers removed as we use Firebase tokens now


// Define o que o nosso AuthContext irá fornecer
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, cpf: string, phone: string) => Promise<any>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>; // Note: token not used in same way with Firebase, but kept for interface compatibility
  isLoading: boolean;
  error: string | null;
  pendingOrder: PendingOrder | null;
  setPendingOrder: React.Dispatch<React.SetStateAction<PendingOrder | null>>;
  orders: Order[] | null;
  fetchOrders: () => void;
  isAuthenticated: boolean;
  updateProfile: (data: { name: string; email: string; phone: string; cpf: string; }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>; // Handled via email in Firebase usually, but can be done
  loadUser: () => Promise<void>;
  isProfileLoaded: boolean;
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

// Safe hook variant that returns null when used outside a provider.
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context || null;
};

// --- Componente Provedor ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [orders, setOrders] = useState<Order[] | null>([]);
  const isAuthenticated = !!user;

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only set global isLoading to true if we don't have a user yet and it's the initial load
      // or if we're explicitly waiting for a profile.
      // Important: don't set isLoading(true) here if we're in the middle of a login attempt
      // that might fail, to avoid ProtectedRoute remounting.

      if (firebaseUser) {
        setIsLoading(true); // Still show loading while fetching doc
        setIsProfileLoaded(false);
        const isNexaAdmin = firebaseUser.email === 'nexa2114@gmail.com';
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || '',
            role: isNexaAdmin ? 'admin' : (userData.role || 'client'),
            cpf: userData.cpf,
            phone: userData.phone
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: '',
            role: isNexaAdmin ? 'admin' : 'client'
          });
        }
        const userToken = await firebaseUser.getIdToken();
        setToken(userToken);
        setIsProfileLoaded(true);
      } else {
        setUser(null);
        setToken(null);
        setIsProfileLoaded(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUser = useCallback(async () => {
    // Firebase handles this via onAuthStateChanged, but kept for interface
  }, []);

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
    if (!auth.currentUser) return false;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), data);
      setUser(prev => prev ? { ...prev, ...data } : null);
      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      return false;
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!token) return false;
    try {
      await apiCall('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      return true;
    } catch (err) {
      console.error("Change password error:", err);
      return false;
    }
  }, [token]);


  // Função genérica para chamadas à API
  const apiCall = async (endpoint: string, options: any = {}) => {
    setIsLoading(true);
    setError(null);
    // Garante que não haja barras duplicadas se API_URL terminar com /
    const baseUrl = API_URL.replace(/\/$/, '');
    const url = `${baseUrl}${endpoint}`;

    try {
      // If no Authorization header provided by caller, attach valid token automatically
      if (!options.headers) options.headers = {};
      const hdrs = options.headers as Record<string, any>;
      if (!hdrs['Authorization'] && token) {
        hdrs['Authorization'] = `Bearer ${token}`;
      }

      const method = (options.method || 'GET').toString().toUpperCase();

      // Sanitize Authorization header: don't send 'Bearer null' or 'Bearer undefined'
      if (options.headers && (options as any).headers['Authorization']) {
        const authVal = (options as any).headers['Authorization'];
        if (!authVal || /Bearer\s*(null|undefined|""|')/i.test(authVal)) {
          // remove invalid Authorization header
          const { Authorization, ...rest } = options.headers as Record<string, any>;
          options.headers = rest as HeadersInit;
        }
      }

      const fetchHeaders: Record<string, any> = { ...((options.headers as Record<string, any>) || {}) };
      if (options.body) {
        // Ensure body is a string for fetch
        if (typeof options.body !== 'string') {
          (options as any).body = JSON.stringify(options.body);
        }
        fetchHeaders['Content-Type'] = 'application/json';
      }
      // Always accept JSON responses
      fetchHeaders['Accept'] = 'application/json';

      // Prepare final options for fetch
      const finalOptions: any = { ...options };
      finalOptions.headers = fetchHeaders;

      const response = await fetch(url, finalOptions);

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(`Erro inesperado do servidor (${response.status})`);
      }

      if (!response.ok) {
        // Se o status for 401 ou 403, mapeamos para login failed se não houver mensagem específica
        const errorMsg = data.message || data.error || (response.status === 401 ? 'Unauthorized' : 'Ocorreu um erro.');
        throw new Error(errorMsg);
      }

      return data;
    } catch (err: any) {
      const message = err.message;
      setError(message);
      throw err; // Re-throw para que o componente trate localmente também
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      console.warn("Firebase Login Error, checking backend fallback...", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
        try {
          // Legacy migration fallback: Backend will verify hash and sync with Firebase Auth
          await apiCall('/api/auth/login', {
            method: 'POST',
            body: { email, password }
          });
          // Retry Firebase auth after sync
          const retryCredential = await signInWithEmailAndPassword(auth, email, password);
          return retryCredential.user;
        } catch (backendErr: any) {
          setError(backendErr.message);
          throw backendErr;
        }
      }

      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, cpf: string, phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanCpf = cpf.replace(/[^\d]+/g, '');
      const cleanPhone = phone.replace(/[^\d]+/g, '');

      await apiCall('/api/auth/register', {
        method: 'POST',
        body: { name, email, password, cpf: cleanCpf, phone: cleanPhone }
      });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      console.error("Register Error:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resetPassword = async (token: string, password: string) => {
    // Handled natively by Firebase via reset links
    throw new Error("Password reset is handled via email link.");
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
    isProfileLoaded,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;