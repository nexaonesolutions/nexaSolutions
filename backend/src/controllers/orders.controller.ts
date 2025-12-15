import { Request, Response } from 'express';
import { authenticate } from './auth.controller';
import fs from 'fs';
import path from 'path';

interface Order {
  id: string;
  userId: number;
  date: string;
  total: number;
  mainPlanName: string;
  maintenancePlanName?: string;
}

const dbPath = path.resolve(__dirname, '../../db.json');

const readDb = (): { orders: Order[] } => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { orders: [] };
  }
};

const writeDb = (data: { orders: Order[] }) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Helper to generate IDs
const generateId = () => 'ord_' + Date.now();

export const getUserOrders = [authenticate, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  console.log(`Recebido pedido para /api/orders do utilizador:`, req.user); // Added log
  const db = readDb();
  const userOrders = db.orders.filter(o => o.userId === userId);
  res.status(200).json(userOrders);
}];

export const createOrder = [authenticate, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { total, mainPlanName, maintenancePlanName } = req.body;

  if (!total || !mainPlanName) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  const db = readDb();
  const newOrder: Order = {
    id: generateId(),
    userId,
    date: new Date().toISOString(),
    total: Number(total),
    mainPlanName,
    maintenancePlanName,
  };

  db.orders.push(newOrder);
  writeDb(db);
  res.status(201).json({ message: 'Order created', order: newOrder });
}];
