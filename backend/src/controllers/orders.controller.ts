import { Request, Response } from 'express';
import { adminDb } from '../services/firebase-admin.service';

interface Order {
  id: string;
  userId: number | string;
  date: string;
  total: number;
  mainPlanName: string;
  maintenancePlanName?: string;
  briefing?: any;
  paymentMethod?: string;
  paymentDetails?: any;
  currency?: string;
  clientName?: string;
  clientEmail?: string;
  invoiceUrl?: string;
  status?: string;
  progress?: 'analise' | 'desenvolvimento' | 'bugs' | 'finalizado' | 'entregue';
}

const generateId = () => 'ord_' + Date.now();

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log(`[Orders] Fetching orders for userId: ${userId}`);
    if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

    const ordersSnap = await adminDb.collection('orders').where('userId', 'in', [String(userId), Number(userId)]).get();
    const userOrders = ordersSnap.docs.map(doc => doc.data() as Order);

    res.status(200).json(userOrders);
  } catch (error: any) {
    console.error(`[Orders] Error in getUserOrders: ${error.message}`);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const authUserId = (req as any).userId;
  console.log(`Criando pedido, authUserId=${authUserId}`, { ip: req.ip, authHeader: req.headers['authorization'] });
  console.log('Order POST body:', req.body);

  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  const {
    id: incomingId,
    orderId,
    total,
    mainPlanName,
    maintenancePlanName,
    userId: bodyUserId,
    briefing,
    paymentMethod,
    paymentDetails,
    currency,
    clientName,
    clientEmail,
    invoiceUrl,
  } = req.body as Partial<Order> & { orderId?: string; userId?: number };

  const finalUserId = authUserId || bodyUserId;

  if (!total || !mainPlanName || !finalUserId) {
    return res.status(400).send({ message: 'Missing required order fields' });
  }

  const lookupId = orderId || incomingId;
  let orderRef = undefined;
  let existingSnap = undefined;

  if (lookupId) {
    orderRef = adminDb.collection('orders').doc(lookupId);
    existingSnap = await orderRef.get();
  }

  try {
    if (existingSnap && existingSnap.exists) {
      const existingData = existingSnap.data() as Order;
      const updatedOrder = {
        ...existingData,
        total: Number(total),
        mainPlanName,
        maintenancePlanName: maintenancePlanName || existingData.maintenancePlanName,
        userId: finalUserId as any,
        briefing: briefing || existingData.briefing,
        paymentMethod: paymentMethod || existingData.paymentMethod || 'unknown',
        paymentDetails: paymentDetails || existingData.paymentDetails || null,
        currency: currency || existingData.currency || 'eur',
        clientName: clientName || (existingData as any).clientName,
        clientEmail: clientEmail || (existingData as any).clientEmail,
        invoiceUrl: invoiceUrl || existingData.invoiceUrl,
        status: 'succeeded',
      };

      await orderRef!.update(updatedOrder);
      console.log('Order updated from pending:', existingSnap.id);
      return res.status(200).send(updatedOrder);
    }

    const newOrder: Order = {
      id: orderId || `ord_${Date.now()}`,
      userId: finalUserId as any,
      date: new Date().toISOString(),
      total: Number(total),
      mainPlanName,
      maintenancePlanName,
      briefing,
      paymentMethod,
      paymentDetails,
      currency,
      clientName,
      clientEmail,
      invoiceUrl,
    };

    await adminDb.collection('orders').doc(newOrder.id).set(newOrder);
    console.log('Order created:', newOrder.id);
    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

const VALID_PROGRESS = ['analise', 'desenvolvimento', 'bugs', 'finalizado', 'entregue'];

export const updateOrderProgress = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { progress } = req.body;

  if (!progress || !VALID_PROGRESS.includes(progress)) {
    return res.status(400).json({ message: `Invalid progress. Must be one of: ${VALID_PROGRESS.join(', ')}` });
  }

  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const orderRef = adminDb.collection('orders').doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates: any = { progress };

    if (progress === 'entregue') {
      updates.status = 'delivered';
    }

    await orderRef.update(updates);
    const updatedOrder = { ...orderSnap.data(), ...updates };

    console.log(`Order ${id} progress updated to: ${progress}`);
    res.status(200).json({ message: 'Progress updated', order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating order progress', error: error.message });
  }
};
