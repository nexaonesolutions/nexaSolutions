import { Request, Response } from 'express';
import { adminDb } from '../services/firebase-admin.service';

export const getMessages = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = (req as any).userId;
    const userRole = (req as any).user?.role;

    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

    try {
        const orderSnap = await adminDb.collection('orders').doc(orderId).get();
        if (!orderSnap.exists) return res.status(404).json({ message: 'Order not found' });

        const orderData = orderSnap.data();
        if (userRole !== 'admin' && String(orderData?.userId) !== String(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messagesSnap = await adminDb.collection('messages').where('orderId', '==', orderId).get();
        const orderMessages = messagesSnap.docs.map(doc => doc.data());
        orderMessages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return res.status(200).json(orderMessages);
    } catch (e: any) {
        return res.status(500).json({ message: 'Error fetching messages', error: e.message });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { text } = req.body;
    const userId = (req as any).userId;

    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

    try {
        const orderSnap = await adminDb.collection('orders').doc(orderId).get();
        if (!orderSnap.exists) return res.status(404).json({ message: 'Order not found' });

        const orderData = orderSnap.data();
        if (String(orderData?.userId) !== String(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const newMessage = {
            id: `msg_${Date.now()}`,
            orderId,
            sender: 'client' as const,
            text: text.trim(),
            timestamp: new Date().toISOString(),
        };

        await adminDb.collection('messages').doc(newMessage.id).set(newMessage);
        return res.status(201).json(newMessage);
    } catch (e: any) {
        return res.status(500).json({ message: 'Error sending message', error: e.message });
    }
};

export const sendNexaMessage = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

    try {
        const orderSnap = await adminDb.collection('orders').doc(orderId).get();
        if (!orderSnap.exists) return res.status(404).json({ message: 'Order not found' });

        const newMessage = {
            id: `msg_${Date.now()}`,
            orderId,
            sender: 'nexa' as const,
            text: text.trim(),
            timestamp: new Date().toISOString(),
        };

        await adminDb.collection('messages').doc(newMessage.id).set(newMessage);
        return res.status(201).json(newMessage);
    } catch (e: any) {
        return res.status(500).json({ message: 'Error sending nexa message', error: e.message });
    }
};

// Get all messages for the authenticated user (across all their orders)
export const getUserMessages = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

    try {
        const ordersSnap = await adminDb.collection('orders').where('userId', 'in', [String(userId), Number(userId)]).get();
        const userOrderIds = ordersSnap.docs.map(doc => doc.id);

        if (userOrderIds.length === 0) {
            return res.status(200).json({ messages: [], orderIds: [] });
        }

        // Firestore 'in' has a limit of 10. For scale, we'd batch, but here we can just fetch all messages for user orders.
        // It's easier just to query messages where orderId in userOrderIds up to 10.
        // If more than 10 orders, chunk them.
        const chunkedArray = (arr: string[], size: number) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
            return chunks;
        };

        const chunks = chunkedArray(userOrderIds, 10);
        let allMessages: any[] = [];

        for (const chunk of chunks) {
            const msgsSnap = await adminDb.collection('messages').where('orderId', 'in', chunk).get();
            allMessages = allMessages.concat(msgsSnap.docs.map(doc => doc.data()));
        }

        const orderIdsWithNexaMessages = new Set(
            allMessages.filter(m => m.sender === 'nexa').map(m => m.orderId)
        );

        const messages = allMessages.filter(m => orderIdsWithNexaMessages.has(m.orderId));
        messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return res.status(200).json({ messages, orderIds: [...orderIdsWithNexaMessages] });
    } catch (e: any) {
        return res.status(500).json({ message: 'Error fetching user messages', error: e.message });
    }
};
