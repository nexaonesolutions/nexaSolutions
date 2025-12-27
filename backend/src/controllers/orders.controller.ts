import { Request, Response } from 'express';
import { authenticate } from './auth.controller';
import { readDb, writeDb } from '../services/db.service';

interface Order {
  id: string;
  userId: number;
  date: string;
  total: number;
  mainPlanName: string;
  maintenancePlanName?: string;
}

// Helper to generate IDs
const generateId = () => 'ord_' + Date.now();

export const getUserOrders = [authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  console.log(`Recebido pedido para /api/orders do utilizador:`, req.user); // Added log
  const db = await readDb();
  const userOrders = db.orders.filter((o: Order) => o.userId === userId);
  res.status(200).json(userOrders);
}];

export const createOrder = [authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { total, mainPlanName, maintenancePlanName } = req.body;

  if (!total || !mainPlanName) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  const db = await readDb();
  const newOrder: Order = {
    id: generateId(),
    userId,
    date: new Date().toISOString(),
    total: Number(total),
    mainPlanName,
    maintenancePlanName,
  };

  db.orders.push(newOrder);
  await writeDb(db);
  res.status(201).json({ message: 'Order created', order: newOrder });
}];
