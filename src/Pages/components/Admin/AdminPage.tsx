import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where, updateDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Users, MessageCircle,
  TrendingUp, Clock, CheckCircle, Send, ChevronDown,
  LogOut, Search, RefreshCw, Eye, Activity as ActivityIcon,
  ShoppingBag, AlertCircle, BarChart3, Calendar, ChevronRight,
  Filter, MoreVertical, Menu, Bell, User
} from 'lucide-react';

import { API_URL } from '@/utils/apiConfig';

interface Stats {
  totalOrders: number;
  totalClients: number;
  totalRevenue: number;
  pendingOrders: number;
  succeededOrders: number;
  activeChats: number;
  progressCounts: Record<string, number>;
}

interface AdminOrder {
  id: string;
  userId: number | string;
  date: string;
  total: number;
  mainPlanName: string;
  maintenancePlanName?: string;
  briefing?: any;
  paymentMethod?: string;
  currency?: string;
  status?: string;
  progress?: string;
  clientName: string;
  clientEmail: string;
}

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  cpf: string;
  phone: string;
  role: string;
  orderCount: number;
}

interface Conversation {
  orderId: string;
  clientName: string;
  clientEmail: string;
  mainPlanName: string;
  progress: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: { id: string; orderId: string; sender: string; text: string; timestamp: string, readByAdmin?: boolean, readByClient?: boolean }[];
}

interface ChatMeta {
  adminOnline: boolean;
  adminLastSeen: any;
  clientOnline: boolean;
  clientLastSeen: any;
  adminTyping: boolean;
  clientTyping: boolean;
}

interface Activity {
  id: string;
  userId?: string | number;
  userName?: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'order' | 'chat' | 'system';
}

type Tab = 'overview' | 'orders' | 'clients' | 'chat';

const PROGRESS_OPTIONS = [
  { value: 'analise', label: 'Em Análise', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'desenvolvimento', label: 'Em Desenvolvimento', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { value: 'bugs', label: 'Corrigindo Bugs', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'finalizado', label: 'Finalizado', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { value: 'entregue', label: 'Entregue', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
];

const AdminPage: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [convoMessages, setConvoMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [meta, setMeta] = useState<ChatMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [selectedClientDetails, setSelectedClientDetails] = useState<AdminUser | null>(null);
  const [showClientOrders, setShowClientOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessageCountRef = useRef<number>(0);
  const prevNotifCountRef = useRef<number>(0);

  const headers = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, chatsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers: headers() }),
        fetch(`${API_URL}/api/admin/orders`, { headers: headers() }),
        fetch(`${API_URL}/api/admin/users`, { headers: headers() }),
        fetch(`${API_URL}/api/admin/chats`, { headers: headers() }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (chatsRes.ok) setConversations(await chatsRes.json());
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
    setLoading(false);
  };

  // Real-time Activity Monitor via Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'activity'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toDate()?.toISOString() || new Date().toISOString()
      })) as Activity[];
      setActivity(activities);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      if (activeTab === 'orders' || activeTab === 'clients') {
        fetchAll();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, token]);

  // Firestore Real-time listener for ALL active conversations
  useEffect(() => {
    if (!token) return;

    // We listen to all messages to update the conversation list in real-time
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toDate()?.toISOString() || new Date().toISOString()
      }));

      // Play sound if new message from client arrives
      const clientMessages = allMessages.filter((m: any) => m.sender !== 'nexa');
      if (prevMessageCountRef.current > 0 && clientMessages.length > prevMessageCountRef.current) {
        try {
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => { });
        } catch (e) { }
      }
      prevMessageCountRef.current = clientMessages.length;

      // Group messages by orderId to build the conversation list
      const groups: Record<string, any[]> = {};
      allMessages.forEach((m: any) => {
        if (!groups[m.orderId]) groups[m.orderId] = [];
        groups[m.orderId].push(m);
      });

      const convos: Conversation[] = Object.entries(groups).map(([orderId, msgs]) => {
        const order = orders.find(o => o.id === orderId);
        const lastMsg = msgs[0]; // Messages are desc
        return {
          orderId,
          clientName: order?.clientName || 'Cliente',
          clientEmail: order?.clientEmail || '',
          mainPlanName: order?.mainPlanName || '',
          progress: order?.progress || 'analise',
          messageCount: msgs.length,
          lastMessage: lastMsg.text,
          lastMessageTime: lastMsg.timestamp,
          unreadCount: msgs.filter((m: any) => m.sender !== 'nexa' && !m.readByAdmin).length,
          messages: [...msgs].reverse() // Partial messages for preview
        };
      });

      setConversations(convos);
    });

    return () => unsubscribe();
  }, [token, orders]);

  // Listener specific for the fully selected conversation to get ALL history
  useEffect(() => {
    if (!selectedConvo || !token) return;

    // Fetch full history for the active conversation
    const q = query(
      collection(db, 'messages'),
      where('orderId', '==', selectedConvo.orderId),
      orderBy('timestamp', 'asc'),
      limit(1000)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toDate()?.toISOString() || new Date().toISOString()
      }));
      setConvoMessages(messages);
    });

    return () => unsubscribe();
  }, [selectedConvo?.orderId, token]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [convoMessages]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (activeTab !== 'chat' || !selectedConvo || !token || convoMessages.length === 0) return;

    const unreadMsgs = convoMessages.filter(m => m.sender !== 'nexa' && !m.readByAdmin);
    if (unreadMsgs.length > 0) {
      unreadMsgs.forEach(msg => {
        const msgRef = doc(db, 'messages', msg.id);
        updateDoc(msgRef, { readByAdmin: true }).catch(console.error);
      });
    }
  }, [selectedConvo, convoMessages, token, activeTab]);

  // Notifications Listener
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toDate()?.toISOString() || new Date().toISOString()
      })) as Notification[];

      setNotifications(notifs);

      const unread = notifs.filter(n => !n.read);
      setUnreadNotifications(unread.length);

      // Play sound for new notifications
      if (notifs.length > prevNotifCountRef.current && prevNotifCountRef.current > 0) {
        try {
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-back-2575.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => { });
        } catch (e) { }
      }
      prevNotifCountRef.current = notifs.length;
    });

    return () => unsubscribe();
  }, []);

  // Global Presence (Admin is always online if on the dashboard)
  useEffect(() => {
    if (!token) return;

    const globalMetaRef = doc(db, 'system', 'adminPresence');
    setDoc(globalMetaRef, {
      adminOnline: true,
      lastSeen: serverTimestamp()
    }, { merge: true }).catch(console.error);

    // Keep updating lastSeen every 5 minutes while active
    const presenceInterval = setInterval(() => {
      setDoc(globalMetaRef, { adminOnline: true, lastSeen: serverTimestamp() }, { merge: true }).catch(() => { });
    }, 5 * 60 * 1000);

    const handleUnload = () => {
      updateDoc(globalMetaRef, { adminOnline: false, lastSeen: serverTimestamp() }).catch(() => { });
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(presenceInterval);
      updateDoc(globalMetaRef, { adminOnline: false, lastSeen: serverTimestamp() }).catch(() => { });
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [token]);

  // Firestore Real-time listener for Chat Meta (Presence/Typing)
  useEffect(() => {
    if (!selectedConvo) return;
    const metaRef = doc(db, 'chat_meta', selectedConvo.orderId);
    const unsubscribe = onSnapshot(metaRef, (docSnap) => {
      if (docSnap.exists()) setMeta(docSnap.data() as ChatMeta);
    });
    return () => unsubscribe();
  }, [selectedConvo?.orderId]);

  // Update Admin Online Presence
  useEffect(() => {
    if (!selectedConvo || activeTab !== 'chat') return;
    const metaRef = doc(db, 'chat_meta', selectedConvo.orderId);

    setDoc(metaRef, {
      adminOnline: true,
      adminLastSeen: serverTimestamp()
    }, { merge: true }).catch(console.error);

    const handleUnload = () => {
      updateDoc(metaRef, { adminOnline: false, adminLastSeen: serverTimestamp(), adminTyping: false }).catch(() => { });
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      updateDoc(metaRef, { adminOnline: false, adminLastSeen: serverTimestamp(), adminTyping: false }).catch(() => { });
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [selectedConvo?.orderId, activeTab]);

  // Lock scroll when Briefing Modal is active
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selectedOrder]);

  const updateProgress = async (orderId: string, progress: string) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/progress`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ progress }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, progress } : o));
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const sendNexaMessage = async (orderId: string) => {
    if (!newMsg.trim() || sending || !user) return;
    setSending(true);

    const order = orders.find(o => o.id === orderId);
    if (!order) { setSending(false); return; }

    try {
      await addDoc(collection(db, 'messages'), {
        orderId,
        sender: 'nexa',
        userId: user.id,
        clientUserId: String(order.userId),
        text: newMsg.trim(),
        timestamp: serverTimestamp()
      });
      setNewMsg('');
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to send message to Firestore:', err);
    }
    setSending(false);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMsg(e.target.value);
    if (!selectedConvo) return;

    const metaRef = doc(db, 'chat_meta', selectedConvo.orderId);
    updateDoc(metaRef, { adminTyping: true }).catch(() => { });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(metaRef, { adminTyping: false }).catch(() => { });
    }, 2000);
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    unread.forEach(n => {
      const docRef = doc(db, 'notifications', n.id);
      updateDoc(docRef, { read: true }).catch(() => { });
    });
    setUnreadNotifications(0);
  };

  const startChat = async (orderId: string) => {
    const existing = conversations.find(c => c.orderId === orderId);
    if (existing) {
      setSelectedConvo(existing);
    } else {
      setSelectedConvo({
        orderId,
        clientName: orders.find(o => o.id === orderId)?.clientName || '',
        clientEmail: orders.find(o => o.id === orderId)?.clientEmail || '',
        mainPlanName: orders.find(o => o.id === orderId)?.mainPlanName || '',
        progress: orders.find(o => o.id === orderId)?.progress || 'analise',
        messageCount: 0,
        lastMessage: '',
        lastMessageTime: '',
        messages: [],
      });
    }
    setActiveTab('chat');
  };

  const formatCurrency = (val: number, currency = 'BRL') =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getProgressBadge = (progress?: string) => {
    const opt = PROGRESS_OPTIONS.find(p => p.value === progress);
    if (!opt) return <span className="text-xs text-gray-500">—</span>;
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.bg} ${opt.color}`}>{opt.label}</span>;
  };

  const filteredOrders = orders.filter(o =>
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.mainPlanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(c =>
    c.role !== 'admin' && (
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sidebarItems: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Visão Geral' },
    { key: 'orders', icon: <ShoppingCart className="w-5 h-5" />, label: 'Pedidos' },
    { key: 'clients', icon: <Users className="w-5 h-5" />, label: 'Clientes' },
    { key: 'chat', icon: <MessageCircle className="w-5 h-5" />, label: 'Chat' },
  ];

  const briefingLabels: Record<string, string> = {
    companyDescription: '📋 Descrição da Empresa',
    productsServices: '🛍️ Produtos / Serviços',
    companyVision: '🎯 Visão da Empresa',
    targetAudience: '👥 Público-Alvo',
    designPreferences: '🎨 Preferências de Design',
    additionalNotes: '📝 Observações',
  };

  return (
    <div className="min-h-[100dvh] bg-gray-950 flex flex-col md:flex-row overflow-hidden h-[100dvh]">
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-gray-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
            N
          </div>
          <p className="text-sm font-bold text-white tracking-tight">NEXA <span className="text-cyan-400">Admin</span></p>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-64 bg-gray-900/95 lg:bg-gray-900/80 border-r border-white/5 flex flex-col py-6 px-4 shrink-0 z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="hidden lg:flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/30">
            N
          </div>
          <div>
            <p className="text-sm font-bold text-white underline decoration-cyan-500/30">NEXA Solutions</p>
            <p className="text-[10px] text-gray-500 truncate w-32">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setSearchTerm('');
                setSelectedOrder(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.key
                ? 'bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/10'
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
            >
              {item.icon}
              {item.label}
              {item.key === 'chat' && conversations.length > 0 && (
                <span className="ml-auto text-[10px] bg-cyan-500 text-white font-bold px-2 py-0.5 rounded-full shadow-sm shadow-cyan-500/20">{conversations.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
          <div className="lg:hidden px-3 mb-4">
            <p className="text-[10px] text-gray-500 mb-1">Logado como</p>
            <p className="text-xs text-white truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header content responsive */}
        <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-gray-950/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-3">
            {sidebarItems.find(i => i.key === activeTab)?.label}
            {loading && <RefreshCw className="w-4 h-4 text-cyan-500 animate-spin" />}
          </h2>

          <div className="flex items-center gap-3 lg:gap-6">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 lg:p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all border border-gray-800 relative hover:border-gray-700 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
              >
                <div className="relative">
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-950 flex items-center justify-center text-[8px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              </button>

              {/* Notification Center Popover */}
              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 md:w-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 z-50 flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 origin-top-right">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gray-950/50">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" /> Notificações
                    </h3>
                    {unreadNotifications > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium tracking-wide">Marcar Lidas</button>
                    )}
                  </div>
                  <div className="flex-1 max-h-96 overflow-y-auto custom-scrollbar p-0 bg-gray-900">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm italic">Nenhuma notificação no momento</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-white/5 flex gap-3 ${!n.read ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-white/5'} transition-colors cursor-pointer`} onClick={() => {
                          // Action on click notification
                        }}>
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-gray-400'}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-cyan-500/50 mt-1 font-medium">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group hidden sm:block">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-40 lg:w-80 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Search for mobile only */}
        <div className="sm:hidden px-4 py-3 bg-gray-900/30 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 custom-scrollbar ${activeTab === 'chat' ? 'overflow-hidden p-0 flex flex-col' : 'overflow-y-auto p-4 lg:p-8'}`}>
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Receita Total', val: formatCurrency(stats?.totalRevenue || 0), icon: <TrendingUp className="text-emerald-400" />, shadow: 'shadow-emerald-500/10' },
                  { label: 'Total de Pedidos', val: stats?.totalOrders || 0, icon: <ShoppingBag className="text-blue-400" />, shadow: 'shadow-blue-500/10' },
                  { label: 'Clientes Ativos', val: stats?.totalClients || 0, icon: <Users className="text-purple-400" />, shadow: 'shadow-purple-500/10' },
                  { label: 'Pedidos Pendentes', val: stats?.pendingOrders || 0, icon: <Clock className="text-amber-400" />, shadow: 'shadow-amber-500/10' },
                ].map((s, i) => (
                  <div key={i} className={`bg-gray-900/50 border border-white/5 p-6 rounded-2xl ${s.shadow} hover:border-white/10 transition-all`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gray-800/50">{s.icon}</div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{s.label}</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{s.val}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Monitor */}
                <section className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col max-h-[500px]">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <ActivityIcon className="w-5 h-5 text-cyan-400" />
                      Monitor de Atividade em Tempo Real
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {activity.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 italic">Sem atividade recente</div>
                    ) : (
                      activity.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-gray-800/30 border border-white/5 hover:bg-gray-800/50 transition-all animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className={`p-2 h-fit rounded-lg ${item.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {item.status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm font-semibold text-white truncate">{item.userName || 'Usuário Desconhecido'}</p>
                              <span className="text-[10px] text-gray-500 tabular-nums">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              {item.status === 'success' ? 'Completou um pagamento de' : 'Teve um pagamento recusado de'}
                              <span className="text-white font-medium mx-1">{formatCurrency(item.amount, item.currency.toUpperCase())}</span>
                            </p>
                            {item.errorMessage && (
                              <div className="text-[10px] bg-red-500/10 text-red-400 p-2 rounded-lg border border-red-500/20">
                                Erro: {item.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Orders Chart Area (Placeholder or List) */}
                <section className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Status dos Projetos
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {PROGRESS_OPTIONS.map(opt => (
                      <div key={opt.value} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{opt.label}</span>
                          <span className="text-white font-bold">{stats?.progressCounts[opt.value] || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${opt.bg.replace('/20', '')}`}
                            style={{ width: `${stats ? ((stats.progressCounts[opt.value] || 0) / stats.totalOrders) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto shadow-xl shadow-black/20">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 whitespace-nowrap">ID / Data</th>
                      <th className="px-6 py-4 whitespace-nowrap">Cliente / Plano</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 whitespace-nowrap">Preço</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <p className="text-white font-mono text-xs mb-1">#{order.id.slice(-6)}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10} /> {formatDate(order.date)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col max-w-[200px] lg:max-w-[300px]">
                            <span className="text-white font-medium truncate" title={order.clientName}>{order.clientName}</span>
                            <span className="text-xs text-gray-500 truncate" title={order.mainPlanName}>{order.mainPlanName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="relative inline-block text-left">
                            <select
                              value={order.progress || 'analise'}
                              onChange={(e) => updateProgress(order.id, e.target.value)}
                              className="bg-transparent text-xs font-semibold appearance-none focus:outline-none cursor-pointer hover:text-white transition-colors"
                            >
                              {PROGRESS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-300">{opt.label}</option>
                              ))}
                            </select>
                            <div className="mt-1">{getProgressBadge(order.progress)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-white whitespace-nowrap">
                          {formatCurrency(order.total, order.currency?.toUpperCase())}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 shrink-0">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                              title="Ver Briefing"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => startChat(order.id)}
                              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                              title="Abrir Chat"
                            >
                              <MessageCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="text-center py-20 bg-gray-900/10">
                    <ShoppingCart className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum pedido encontrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((client) => (
                  <div key={client.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-purple-400 font-bold text-xl">
                        {client.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {client.orderCount} {client.orderCount === 1 ? 'Pedido' : 'Pedidos'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-0.5 truncate">{client.name || 'Cliente'}</h4>
                    <p className="text-xs text-gray-500 mb-4 truncate">{client.email}</p>

                    <div className="space-y-2 mb-6 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 w-8 font-bold">CPF:</span>
                        <span className="tabular-nums">{client.cpf || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 w-8 font-bold">TEL:</span>
                        <span className="tabular-nums">{client.phone || '—'}</span>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="py-2 text-xs font-bold text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setSearchTerm(client.email);
                          setActiveTab('orders');
                        }}
                      >
                        Histórico
                      </button>
                      <button
                        className="py-2 text-xs font-bold text-white bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-600/30 transition-colors"
                        onClick={() => setSelectedClientDetails(client)}
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 italic">Nenhum cliente encontrado.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 w-full h-full flex flex-col md:flex-row bg-[#0b141a] overflow-hidden text-white font-sans rounded-bl-3xl">
              {/* Chat Sidebar */}
              <div className={`w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-white/5 flex flex-col bg-gray-950 ${selectedConvo ? 'hidden md:flex' : 'flex'} shrink-0 z-10 shadow-2xl shadow-black/50`}>
                <div className="h-20 px-6 bg-gray-900 border-b border-white/5 flex items-center justify-between shrink-0">
                  <h2 className="font-bold text-lg text-white tracking-wide">Projetos Ativos</h2>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">{conversations.length}</span>
                </div>

                {/* Search */}
                <div className="p-4 bg-gray-950">
                  <div className="bg-gray-900 border border-white/5 rounded-full p-2.5 flex items-center gap-3 px-4 shadow-inner transition-colors focus-within:border-cyan-500/50">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar cliente ou projeto..."
                      className="bg-transparent text-sm w-full text-white placeholder:text-gray-500 focus:outline-none"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {conversations.length === 0 && (
                    <div className="p-10 text-center text-sm text-gray-500">Nenhum projeto ativo</div>
                  )}
                  {conversations.filter(c => c.clientName.toLowerCase().includes(searchTerm.toLowerCase())).map(convo => (
                    <button
                      key={convo.orderId}
                      onClick={() => setSelectedConvo(convo)}
                      className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-all group
                        ${selectedConvo?.orderId === convo.orderId ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'hover:bg-white/5 border-l-4 border-transparent'}
                      `}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-lg">
                        {convo.clientName.charAt(0).toUpperCase()}
                      </div>

                      {/* Text info */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[15px] font-bold text-white truncate pr-2">{convo.clientName}</span>
                          <span className="text-[11px] font-medium text-gray-400 shrink-0">
                            {convo.lastMessageTime ? new Date(convo.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm truncate flex-1 ${convo.unreadCount > 0 ? 'text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-gray-400'}`}>
                            {convo.lastMessage || 'Sem mensagens...'}
                          </span>
                          {convo.unreadCount > 0 && (
                            <span className="ml-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[11px] font-bold px-1.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col bg-gray-950 relative ${!selectedConvo ? 'hidden md:flex' : 'flex'} z-0`}>
                {/* Nexa Chat Background Pattern (Cubes) */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
                {selectedConvo ? (
                  <>
                    {/* Chat Header */}
                    <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 bg-gray-900/80 backdrop-blur-md z-10 shrink-0">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => { setSelectedConvo(null); setConvoMessages([]); setMeta(null); }}
                          className="md:hidden p-2 -ml-3 text-gray-400 hover:text-white rounded-full transition-colors"
                        >
                          <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>

                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shrink-0 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            {selectedConvo.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${meta?.clientOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                        </div>

                        <div className="flex flex-col">
                          <h4 className="font-bold text-white text-base truncate max-w-[200px] md:max-w-[400px] leading-tight tracking-wide">{selectedConvo.clientName}</h4>
                          {meta?.clientTyping ? (
                            <span className="text-[12px] text-cyan-400 font-medium animate-pulse">digitando...</span>
                          ) : meta?.clientOnline ? (
                            <span className="text-[12px] text-emerald-400 font-medium tracking-wide">online</span>
                          ) : (
                            <span className="text-[12px] text-gray-400 truncate max-w-[200px]">
                              {meta?.clientLastSeen ? `visto por último às ${new Date(meta.clientLastSeen.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : selectedConvo.mainPlanName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        {getProgressBadge(selectedConvo.progress)}
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar relative z-10">
                      {convoMessages.map((msg, index) => {
                        const isNexa = msg.sender === 'nexa';
                        const isFirstInSequence = index === 0 || convoMessages[index - 1].sender !== msg.sender;

                        return (
                          <div key={msg.id} className={`flex ${isNexa ? 'justify-end' : 'justify-start'} w-full animate-in slide-in-from-bottom-2 duration-300`}>
                            <div
                              className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed flex flex-col shadow-lg
                                ${isNexa
                                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-tr-sm border border-white/5 backdrop-blur-md'
                                  : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tl-sm border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'}
                                ${!isFirstInSequence ? (isNexa ? 'rounded-tr-2xl mt-1' : 'rounded-tl-2xl mt-1') : 'mt-4'}
                              `}
                            >
                              <div className="pr-12 md:pr-14">
                                {msg.text}
                              </div>
                              <div className="absolute bottom-1.5 right-3 flex items-center gap-1.5">
                                <span className={`text-[10px] font-medium ${isNexa ? 'text-gray-400' : 'text-cyan-100/70'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isNexa && (
                                  <div className="flex">
                                    {msg.readByClient ? (
                                      <div className="flex -space-x-1">
                                        <svg viewBox="0 0 16 11" height="11" width="16" className="text-cyan-400 drop-shadow-[0_0_2px_rgba(6,182,212,0.8)]" fill="currentColor">
                                          <path d="M11.854 1.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L4.5 7.793l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                          <path d="M15.854 1.146a.5.5 0 0 1 0 .708l-5 5a.5.5 0 0 1-.708 0 .5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708 0z" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <svg viewBox="0 0 16 11" height="11" width="16" className="text-gray-500" fill="currentColor">
                                        <path d="M11.854 1.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L4.5 7.793l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                        <path d="M15.854 1.146a.5.5 0 0 1 0 .708l-5 5a.5.5 0 0 1-.708 0 .5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708 0z" />
                                      </svg>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} className="h-4" />
                    </div>

                    {/* Chat Footer / Input Area */}
                    <form
                      onSubmit={(e) => { e.preventDefault(); sendNexaMessage(selectedConvo.orderId); }}
                      className="p-4 bg-gray-900/90 backdrop-blur-xl border-t border-white/5 z-10 shrink-0"
                    >
                      <div className="flex bg-gray-950 border border-white/10 rounded-full items-center p-1.5 shadow-inner">
                        <input
                          type="text"
                          placeholder="Digite uma mensagem para o cliente..."
                          value={newMsg}
                          onChange={handleTyping}
                          disabled={sending}
                          className="w-full bg-transparent px-5 py-2 text-[14.5px] text-white focus:outline-none placeholder:text-gray-500"
                        />
                        <button
                          type="submit"
                          disabled={sending || !newMsg.trim()}
                          className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${newMsg.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105' : 'bg-white/5 text-gray-500'
                            }`}
                        >
                          {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center z-10 p-8 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                      <MessageCircle size={80} className="text-cyan-500/20 relative drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]" strokeWidth={1} />
                    </div>
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Nexa Project Engine</h2>
                      <p className="text-gray-400 text-[15px] font-medium max-w-md mx-auto leading-relaxed">
                        Selecione um projeto na fila para iniciar o atendimento, visualizar metadados técnicos ou atualizar o status da entrega.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Briefing Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white">📑 Briefing do Pedido</h3>
                <p className="text-xs text-gray-500">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <ChevronDown className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Cliente</p>
                  <p className="text-sm font-bold text-white">{selectedOrder.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">E-mail</p>
                  <p className="text-sm font-bold text-white">{selectedOrder.clientEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Plano Selecionado</p>
                  <p className="text-sm font-bold text-white">{selectedOrder.mainPlanName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Preço Total</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(selectedOrder.total, selectedOrder.currency?.toUpperCase())}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Filter className="w-4 h-4 text-cyan-400" /> Detalhes do Projeto
                </h4>
                {selectedOrder.briefing && Object.entries(selectedOrder.briefing).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <p className="text-xs font-bold text-gray-400">{briefingLabels[key] || key}</p>
                    <div className="p-4 rounded-xl bg-gray-800/50 border border-white/5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {value as string || 'Não informado'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-gray-900/50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 transition-all border border-white/5"
              >
                Fechar
              </button>
              <button
                onClick={() => { startChat(selectedOrder.id); setSelectedOrder(null); }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/20 transition-all"
              >
                Abrir Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10 scale-in-center">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-xl shadow-inner shadow-cyan-500/20">
                  {selectedClientDetails.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Ficha do Cliente</h3>
                  <p className="text-xs text-cyan-400/80 mt-0.5 tracking-wide">{selectedClientDetails.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedClientDetails(null); setShowClientOrders(false); }}
                className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all bg-gray-800/50"
              >
                <ChevronDown className="w-5 h-5 rotate-180" />
              </button>
            </div>

            {showClientOrders ? (
              <div className="p-6 md:p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setShowClientOrders(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold mb-4 flex items-center gap-1 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" /> Voltar para Ficha
                </button>

                {orders.filter(o => o.clientEmail === selectedClientDetails.email).length === 0 ? (
                  <div className="text-center py-12 bg-gray-800/20 rounded-2xl border border-white/5">
                    <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Este cliente ainda não possui pedidos.</p>
                  </div>
                ) : (
                  orders.filter(o => o.clientEmail === selectedClientDetails.email).map(order => (
                    <div key={order.id} className="bg-gray-800/40 p-5 rounded-2xl border border-white/5 space-y-3 hover:bg-gray-800/60 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-gray-500 font-mono mb-1">ID: #{order.id.slice(-6)}</p>
                          <h4 className="text-sm font-bold text-white">{order.mainPlanName}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{formatCurrency(order.total, order.currency?.toUpperCase())}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">{order.paymentMethod || 'Stripe'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Data</p>
                          <p className="text-xs text-white flex items-center gap-1.5"><Calendar size={12} /> {formatDate(order.date)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Progresso</p>
                          <div>{getProgressBadge(order.progress)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-800/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-2"><User size={12} /> Nome Completo</p>
                    <p className="text-sm font-bold text-white truncate" title={selectedClientDetails.name || 'Não informado'}>
                      {selectedClientDetails.name || 'Não informado'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-2">CPF / CNPJ</p>
                      <p className="text-sm font-bold text-white font-mono">{selectedClientDetails.cpf || '—'}</p>
                    </div>
                    <div className="bg-gray-800/30 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-2">Telefone</p>
                      <p className="text-sm font-bold text-white font-mono">{selectedClientDetails.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Status na Plataforma</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                        <ShoppingBag size={12} /> {selectedClientDetails.orderCount} Pedido{selectedClientDetails.orderCount !== 1 && 's'}
                      </span>
                      <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-500/20 flex items-center gap-1.5">
                        <CheckCircle size={12} /> Ativo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 border-t border-white/5 bg-gray-900/80 backdrop-blur-md flex justify-between gap-3 items-center">
              {!showClientOrders && (
                <button
                  onClick={() => setShowClientOrders(true)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-2"
                >
                  <ShoppingBag size={16} /> Ver Pedidos
                </button>
              )}
              <button
                onClick={() => { setSelectedClientDetails(null); setShowClientOrders(false); }}
                className={showClientOrders ? "w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5 ml-auto" : "px-6 py-3 rounded-xl text-sm font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all border border-white/5 ml-auto"}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
