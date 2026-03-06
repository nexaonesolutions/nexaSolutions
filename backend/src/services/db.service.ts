import { promises as fs } from 'fs';
import path from 'path';

interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  cpf: string;
  phone: string;
  role?: 'client' | 'admin';
}

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
  invoiceUrl?: string;
  status?: string;
  progress?: 'analise' | 'desenvolvimento' | 'bugs' | 'finalizado' | 'entregue';
}

interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'nexa' | 'client';
  text: string;
  timestamp: string;
}

interface PaymentAttempt {
  id: string;
  userId?: number | string;
  userName?: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

interface DbData {
  users: User[];
  orders: Order[];
  messages: ChatMessage[];
  paymentAttempts: PaymentAttempt[];
}

interface PasswordReset {
  email: string;
  code: string;
  expires: string;
  verified: boolean;
}

interface ResetsDbData {
  resets: PasswordReset[];
}

const dbPath = path.resolve(__dirname, '../db.json');
const resetsDbPath = path.resolve(__dirname, '../password_resets.json');

const initializeDb = async (): Promise<DbData> => {
  try {
    await fs.access(dbPath);
    const data = await fs.readFile(dbPath, 'utf-8');
    const jsonData = JSON.parse(data);
    return {
      users: jsonData.users || [],
      orders: jsonData.orders || [],
      messages: jsonData.messages || [],
      paymentAttempts: jsonData.paymentAttempts || [],
    };
  } catch (error) {
    const initialData: DbData = { users: [], orders: [], messages: [], paymentAttempts: [] };
    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
};


export const readDb = async (): Promise<DbData> => {
  return await initializeDb();
};

export const writeDb = async (data: DbData): Promise<void> => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
};

const initializeResetsDb = async (): Promise<ResetsDbData> => {
  try {
    await fs.access(resetsDbPath);
    const data = await fs.readFile(resetsDbPath, 'utf-8');
    const jsonData = JSON.parse(data);
    return {
      resets: jsonData.resets || []
    };
  } catch (error) {
    const initialData: ResetsDbData = { resets: [] };
    await fs.writeFile(resetsDbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
};

export const readResetsDb = async (): Promise<ResetsDbData> => {
  return await initializeResetsDb();
};

export const writeResetsDb = async (data: ResetsDbData): Promise<void> => {
  await fs.writeFile(resetsDbPath, JSON.stringify(data, null, 2));
};
