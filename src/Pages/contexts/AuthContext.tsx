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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [orders, setOrders] = useState<Order[] | null>([]);
  const isAuthenticated = !!user;

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
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
          // Fallback if doc doesn't exist yet
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: '',
            role: isNexaAdmin ? 'admin' : 'client'
          });
        }
        const userToken = await firebaseUser.getIdToken();
        setToken(userToken);
        console.log(`[Auth] User loaded: ${firebaseUser.email}, Role: ${isNexaAdmin ? 'admin' : 'client'}`);
      } else {
        setUser(null);
        setToken(null);
      }
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
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
      // If we have a token, we include it in the headers. 
      // Firebase automatically handles token refreshing.

      // If no Authorization header provided by caller, attach valid token automatically
      if (!options.headers) options.headers = {};
      const hdrs = options.headers as Record<string, any>;
      if (!hdrs['Authorization'] && token) {
        hdrs['Authorization'] = `Bearer ${token}`;
      }

      const method = (options.method || 'GET').toString().toUpperCase();
      const startTime = Date.now();

      // Prepare redacted headers for logging
      const rawHeaders = (options.headers || {}) as Record<string, any>;
      const redactedHeaders = { ...rawHeaders };
      if (redactedHeaders['Authorization']) {
        redactedHeaders['Authorization'] = 'Bearer [REDACTED]';
      }

      // Friendly, colored grouped logs for easier reading in console
      try {
        console.groupCollapsed(`%c[API] ${method} ${endpoint}`, 'color:#0b5cff;font-weight:700');
        console.log('URL:', url);
        console.log('Headers:', redactedHeaders);
        if (options.body) {
          try {
            console.log('Body:', JSON.parse(options.body as string));
          } catch (e) {
            console.log('Body:', options.body);
          }
        }
      } catch (e) {
        // In some environments console.groupCollapsed may fail; ignore
      }

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

      // Prepare final options for fetch without allowing the original `options` to overwrite our headers
      const finalOptions: any = { ...options };
      finalOptions.headers = fetchHeaders;

      // Final debug log of what will be sent to the network
      try {
        console.log('%c[API] Final fetch payload', 'color:#094a86;font-weight:700', { url, method, headers: finalOptions.headers, body: finalOptions.body });
      } catch (e) { }

      const response = await fetch(url, finalOptions);

      // Tenta ler como texto primeiro para evitar erros de parse em respostas vazias ou HTML
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        try { console.warn('%c[API] Resposta não é JSON', 'color:orange;'); console.log(text); } catch (_) { }
        throw new Error(`Erro inesperado do servidor (${response.status})`);
      }

      const duration = Date.now() - startTime;
      try {
        console.log('%c[API] Response', 'color:green;font-weight:700', { status: response.status, duration: `${duration}ms`, data });
      } catch (e) { }
      try { console.groupEnd(); } catch (e) { }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Ocorreu um erro.');
      }

      return data;
    } catch (err: any) {
      try { console.groupEnd(); } catch (e) { }
      console.error('%c[API] Erro na requisição', 'color:#c62828;font-weight:700', err);
      let message = err.message;
      if (message === 'Failed to fetch' || message.includes('NetworkError') || message.includes('Connection refused')) {
        message = `Não foi possível conectar ao servidor em ${url}. Verifique se o backend está rodando.`;
      }
      setError(message);
      throw new Error(message); // Re-lança o erro para que o componente que chamou possa tratar
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Data is handled by onAuthStateChanged
      return userCredential.user;
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
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
          const errMsg = backendErr.message || "Falha no login. Verifique suas credenciais.";
          setError(errMsg);
          throw new Error(errMsg);
        }
      }

      let msg = "Falha no login. Verifique suas credenciais.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, cpf: string, phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        cpf: cpf.replace(/[^\d]+/g, ''),
        phone: phone.replace(/[^\d]+/g, ''),
        role: email === 'nexa2114@gmail.com' ? 'admin' : 'client',
        createdAt: new Date().toISOString()
      });

      return userCredential.user;
    } catch (err: any) {
      let msg = "Erro ao registrar usuário.";
      if (err.code === 'auth/email-already-in-use') {
        msg = "auth.emailAlreadyInUse";
      }
      setError(msg);
      throw new Error(msg);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;