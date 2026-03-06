import { Request, Response } from 'express';
import { adminDb } from '../services/firebase-admin.service';

// Get all users (admin only) — excludes passwords
export const getAllUsers = async (req: Request, res: Response) => {
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
    try {
        const usersSnap = await adminDb.collection('users').get();
        const ordersSnap = await adminDb.collection('orders').get();
        const orders = ordersSnap.docs.map(doc => doc.data());

        const users = usersSnap.docs.map(doc => {
            const data = doc.data();
            const { password, ...rest } = data;
            return {
                ...rest,
                id: String(doc.id),
                role: rest.role || 'client',
                orderCount: orders.filter(o => String(o.userId) === String(doc.id)).length,
            };
        });
        res.status(200).json(users);
    } catch (e: any) {
        res.status(500).json({ message: 'Error fetching users', error: e.message });
    }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
    try {
        const ordersSnap = await adminDb.collection('orders').get();
        const usersSnap = await adminDb.collection('users').where('role', '==', 'client').get();
        const messagesSnap = await adminDb.collection('messages').get();

        const orders = ordersSnap.docs.map(doc => doc.data());
        const messages = messagesSnap.docs.map(doc => doc.data());

        const totalRevenue = orders
            .filter(o => o.status === 'succeeded')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        const stats = {
            totalOrders: orders.length,
            totalClients: usersSnap.size,
            totalRevenue,
            pendingOrders: orders.filter(o => o.status === 'pending' || !o.status).length,
            succeededOrders: orders.filter(o => o.status === 'succeeded').length,
            progressCounts: {
                analise: orders.filter(o => o.progress === 'analise').length,
                desenvolvimento: orders.filter(o => o.progress === 'desenvolvimento').length,
                bugs: orders.filter(o => o.progress === 'bugs').length,
                finalizado: orders.filter(o => o.progress === 'finalizado').length,
                entregue: orders.filter(o => o.progress === 'entregue').length,
            },
            activeChats: new Set(messages.filter(m => m.sender === 'nexa').map(m => m.orderId)).size,
        };
        res.status(200).json(stats);
    } catch (e: any) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: e.message });
    }
};

// Get all orders (admin only) — with client info
export const getAllOrders = async (req: Request, res: Response) => {
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
    try {
        const ordersSnap = await adminDb.collection('orders').get();
        const usersSnap = await adminDb.collection('users').get();

        const ordersRaw = ordersSnap.docs.map(doc => doc.data());
        const usersRaw = usersSnap.docs.map(doc => Object.assign(doc.data(), { id: doc.id }));

        const orders = ordersRaw.map(order => {
            const client = usersRaw.find(u => String(u.id) === String(order.userId));
            return {
                ...order,
                clientName: (order as any).clientName || client?.name || 'Unknown',
                clientEmail: (order as any).clientEmail || client?.email || 'Unknown',
            };
        });
        // Most recent first
        orders.sort((a, b) => new Date((b as any).date).getTime() - new Date((a as any).date).getTime());
        res.status(200).json(orders);
    } catch (e: any) {
        res.status(500).json({ message: 'Error fetching orders', error: e.message });
    }
};

// Get all chat conversations (admin only)
export const getAllChats = async (req: Request, res: Response) => {
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
    try {
        const messagesSnap = await adminDb.collection('messages').get();
        const ordersSnap = await adminDb.collection('orders').get();
        const usersSnap = await adminDb.collection('users').get();

        const messages = messagesSnap.docs.map(doc => doc.data());
        const orders = ordersSnap.docs.map(doc => doc.data());
        const users = usersSnap.docs.map(doc => Object.assign(doc.data(), { id: doc.id }));

        // Group messages by orderId
        const orderIds = [...new Set(messages.map(m => m.orderId))];
        const conversations = orderIds.map(orderId => {
            const order = orders.find(o => o.id === orderId);
            const client = order ? users.find(u => String(u.id) === String(order.userId)) : null;
            const msgs = messages.filter(m => m.orderId === orderId);
            msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            const lastMsg = msgs[msgs.length - 1];

            return {
                orderId,
                clientName: (order as any)?.clientName || client?.name || 'Unknown',
                clientEmail: (order as any)?.clientEmail || client?.email || 'Unknown',
                mainPlanName: (order as any)?.mainPlanName || 'Unknown',
                progress: order?.progress || 'analise',
                messageCount: msgs.length,
                lastMessage: lastMsg?.text || '',
                lastMessageTime: lastMsg?.timestamp || '',
                messages: msgs,
            };
        });

        conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        res.status(200).json(conversations);
    } catch (e: any) {
        res.status(500).json({ message: 'Error fetching chats', error: e.message });
    }
};

// Get recent activity (admin only)
export const getRecentActivity = async (req: Request, res: Response) => {
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
    try {
        const attemptsSnap = await adminDb.collection('paymentAttempts').orderBy('timestamp', 'desc').limit(20).get();
        const activity = attemptsSnap.docs.map(doc => doc.data());
        res.status(200).json(activity);
    } catch (e: any) {
        res.status(500).json({ message: 'Error fetching activity', error: e.message });
    }
};

// Log activity (public but for logging sales attempts)
export const logPaymentAttempt = async (req: Request, res: Response) => {
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
    const { userId, userName, orderId, amount, currency, status, errorMessage } = req.body;

    try {
        const newAttempt = {
            id: `att_${Date.now()}`,
            userId,
            userName,
            orderId,
            amount,
            currency,
            status,
            errorMessage,
            timestamp: new Date().toISOString()
        };

        await adminDb.collection('paymentAttempts').doc(newAttempt.id).set(newAttempt);
        res.status(201).json(newAttempt);
    } catch (e: any) {
        res.status(500).json({ message: 'Error logging payment attempt', error: e.message });
    }
};
