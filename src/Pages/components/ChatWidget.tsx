import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '@/utils/apiConfig';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';

interface ChatMessage {
    id: string;
    orderId: string;
    sender: 'nexa' | 'client';
    text: string;
    timestamp: any;
    readByAdmin?: boolean;
    readByClient?: boolean;
}

interface ChatMeta {
    adminOnline: boolean;
    adminLastSeen: any;
    clientOnline: boolean;
    clientLastSeen: any;
    adminTyping: boolean;
    clientTyping: boolean;
}

const ChatWidget: React.FC = () => {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeOrderIds, setActiveOrderIds] = useState<string[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [meta, setMeta] = useState<ChatMeta | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load: Fetch orders from API to know which chats to listen to
    useEffect(() => {
        if (!user || !token) return;

        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const ids = data.map((o: any) => o.id);
                    setActiveOrderIds(ids);
                    if (ids.length > 0 && !selectedOrderId) {
                        setSelectedOrderId(ids[0]);
                    }
                }
            } catch (err: any) {
                if (err.message === 'Failed to fetch') {
                    console.error("[Chat] Falha crítica de conexão com a API de pedidos. Verifique o status do backend e as configurações de CORS.");
                } else {
                    console.error("Error fetching orders for chat:", err);
                }
            }
        };

        fetchOrders();
    }, [user, token]);

    // Firestore Real-time listener for messages
    useEffect(() => {
        if (!user || activeOrderIds.length === 0) return;

        const q = query(
            collection(db, 'messages'),
            where('clientUserId', '==', String(user.id))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: (doc.data() as any).timestamp?.toDate()?.toISOString() || new Date().toISOString()
            })) as ChatMessage[];

            // Ordenação local (bypassa a necessidade de criar um Índice Composto no Firestore)
            msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setMessages(msgs);

            // Play notification sound for unread messages when closed
            const nexaUnread = msgs.filter(m => m.sender === 'nexa' && !m.readByClient);
            if (nexaUnread.length > 0) {
                if (!isOpen) {
                    setUnreadCount(nexaUnread.length);
                    // Play notification sound only once per new message batch
                    if (nexaUnread.length > unreadCount) {
                        try {
                            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3');
                            audio.volume = 0.5;
                            audio.play().catch(() => { });
                        } catch (e) { }
                    }
                }
            } else {
                setUnreadCount(0);
            }
        });

        return () => unsubscribe();
    }, [user, activeOrderIds, isOpen, unreadCount]);

    const [globalAdminMeta, setGlobalAdminMeta] = useState<any>(null);

    // Firestore Real-time listener for Chat Meta (Presence/Typing)
    useEffect(() => {
        if (!selectedOrderId) return;
        const metaRef = doc(db, 'chat_meta', selectedOrderId);
        const unsubscribe = onSnapshot(metaRef, (docSnap) => {
            if (docSnap.exists()) {
                setMeta(docSnap.data() as ChatMeta);
            }
        });
        return () => unsubscribe();
    }, [selectedOrderId]);

    // Firestore Real-time listener for Global Admin Presence
    useEffect(() => {
        if (!user) return; // Prevent "permission-denied" by only listening if authenticated
        const globalMetaRef = doc(db, 'system', 'adminPresence');
        const unsubscribe = onSnapshot(globalMetaRef, (docSnap) => {
            if (docSnap.exists()) {
                setGlobalAdminMeta(docSnap.data());
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Update Client Online Presence
    useEffect(() => {
        if (!selectedOrderId || !isOpen) return;
        const metaRef = doc(db, 'chat_meta', selectedOrderId);

        // Use setDoc with merge to ensure doc exists
        setDoc(metaRef, {
            clientOnline: true,
            clientLastSeen: serverTimestamp()
        }, { merge: true }).catch(console.error);

        const handleUnload = () => {
            updateDoc(metaRef, { clientOnline: false, clientLastSeen: serverTimestamp(), clientTyping: false }).catch(() => { });
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            updateDoc(metaRef, { clientOnline: false, clientLastSeen: serverTimestamp(), clientTyping: false }).catch(() => { });
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [selectedOrderId, isOpen]);

    // Scroll to bottom when messages change or panel opens
    useEffect(() => {
        if (isOpen && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isOpen, selectedOrderId]);

    // Mark as read when opening
    useEffect(() => {
        if (!isOpen || !selectedOrderId) return;
        const unreadNexaMsgs = messages.filter(m => m.sender === 'nexa' && !m.readByClient);
        if (unreadNexaMsgs.length > 0) {
            unreadNexaMsgs.forEach(msg => {
                const msgRef = doc(db, 'messages', msg.id);
                updateDoc(msgRef, { readByClient: true }).catch(console.error);
            });
            setUnreadCount(0);
        }
    }, [isOpen, messages, selectedOrderId]);

    // Paralyze background scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedOrderId || sending || !user) return;
        setSending(true);

        try {
            await addDoc(collection(db, 'messages'), {
                orderId: selectedOrderId,
                sender: 'client',
                userId: user.id,
                clientUserId: String(user.id),
                text: newMessage.trim(),
                timestamp: serverTimestamp()
            });
            setNewMessage('');
            inputRef.current?.focus();
        } catch (err) {
            console.error('Failed to send message to Firestore:', err);
        }
        setSending(false);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (!selectedOrderId) return;

        const metaRef = doc(db, 'chat_meta', selectedOrderId);
        updateDoc(metaRef, { clientTyping: true }).catch(() => { });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            updateDoc(metaRef, { clientTyping: false }).catch(() => { });
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Only show if orders exist
    if (activeOrderIds.length === 0 || !user) return null;

    const filteredMessages = selectedOrderId
        ? messages.filter(m => m.orderId === selectedOrderId)
        : messages;

    // Calculate 12-hour visual online logic
    const globalLastSeenDate = globalAdminMeta?.lastSeen?.toDate();
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const isGlobalAdminOnline = globalAdminMeta?.adminOnline || (globalLastSeenDate && globalLastSeenDate > twelveHoursAgo);

    // Admin is shown as online if they are locally focused or globally active
    const displayAdminOnline = meta?.adminOnline || isGlobalAdminOnline;

    // Choose the most recent last seen available to display if offline
    const displayLastSeen = meta?.adminLastSeen || globalAdminMeta?.lastSeen;

    return (
        <>
            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-20 right-4 z-[999] w-[92%] sm:w-[380px] h-[80vh] sm:h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 border border-white/10 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 bg-gray-950/95 backdrop-blur-xl font-sans"
                >
                    {/* Premium Chat Background Pattern */}
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />

                    {/* Header */}
                    <div className="relative px-5 py-4 flex items-center justify-between border-b border-white/5 bg-gray-900/80 backdrop-blur-lg z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-bold text-lg text-white">
                                        N
                                    </div>
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${displayAdminOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-[16px] font-bold text-white tracking-wide">Nexa Solutions</h4>
                                {meta?.adminTyping ? (
                                    <span className="text-[12px] text-cyan-400 font-medium animate-pulse">digitando...</span>
                                ) : displayAdminOnline ? (
                                    <span className="text-[12px] text-emerald-400 font-medium tracking-wide">online</span>
                                ) : (
                                    <span className="text-[12px] text-gray-400 tracking-wide">
                                        {displayLastSeen ? `visto por último às ${new Date(displayLastSeen.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'offline'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Orders Selector if multiple orders */}
                    {activeOrderIds.length > 1 && (
                        <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Selecione seu projeto:</span>
                            <div className="relative group">
                                <select
                                    value={selectedOrderId || ''}
                                    onChange={(e) => setSelectedOrderId(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold text-cyan-400 appearance-none focus:outline-none pr-4 cursor-pointer"
                                >
                                    {activeOrderIds.map(id => (
                                        <option key={id} value={id} className="bg-slate-900">Projeto #{id.slice(-6)}</option>
                                    ))}
                                </select>
                                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative z-10">
                        {filteredMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                                    <MessageCircle size={36} strokeWidth={1.5} />
                                </div>
                                <p className="text-white font-bold text-lg tracking-wide mb-2">Central de Projetos</p>
                                <p className="text-sm text-gray-400 leading-relaxed">O progresso do seu projeto é atualizado aqui em tempo real. Converse diretamente com nosso time.</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg, index) => {
                                const isClient = msg.sender === 'client';
                                const isFirstInSequence = index === 0 || filteredMessages[index - 1].sender !== msg.sender;

                                return (
                                    <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'} w-full animate-in slide-in-from-bottom-2 duration-300`}>
                                        <div
                                            className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed flex flex-col shadow-lg
                                                ${isClient
                                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-sm border border-cyan-500/30 shadow-cyan-900/20'
                                                    : 'bg-gray-800/90 text-gray-100 rounded-tl-sm border border-white/5 shadow-black/40 backdrop-blur-md'}
                                                ${!isFirstInSequence ? (isClient ? 'rounded-tr-2xl mt-1' : 'rounded-tl-2xl mt-1') : 'mt-4'}
                                            `}
                                        >
                                            <div className="pr-12">
                                                {msg.text}
                                            </div>

                                            <div className="absolute bottom-1.5 right-3 flex items-center gap-1.5">
                                                <span className={`text-[10px] font-medium ${isClient ? 'text-cyan-100/70' : 'text-gray-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isClient && (
                                                    <div className="flex">
                                                        {msg.readByAdmin ? (
                                                            <div className="flex -space-x-1">
                                                                <svg viewBox="0 0 16 11" height="11" width="16" className="text-cyan-300 drop-shadow-[0_0_2px_rgba(6,182,212,0.8)]" fill="currentColor">
                                                                    <path d="M11.854 1.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L4.5 7.793l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                                                    <path d="M15.854 1.146a.5.5 0 0 1 0 .708l-5 5a.5.5 0 0 1-.708 0 .5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708 0z" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <svg viewBox="0 0 16 11" height="11" width="16" className="text-cyan-100/50" fill="currentColor">
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
                            })
                        )}
                        <div ref={messagesEndRef} className="h-2" />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-gray-900/90 backdrop-blur-xl border-t border-white/5 z-10 shrink-0">
                        <div className="flex bg-gray-950 border border-white/10 rounded-full items-center p-1.5 shadow-inner">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Escreva sua mensagem..."
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyDown={handleKeyDown}
                                disabled={sending}
                                className="w-full bg-transparent px-4 py-2 text-[14px] text-white placeholder:text-gray-500 focus:outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim() || sending}
                                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${newMessage.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-white/5 text-gray-500'
                                    }`}
                            >
                                <Send size={18} className={`${sending ? 'opacity-50' : ''} ml-0.5`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[1000] p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-90 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
                >
                    <div className="relative">
                        <MessageCircle size={28} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-gray-950 animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </button>
            )}
        </>
    );
};

export default ChatWidget;
