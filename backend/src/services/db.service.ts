import { promises as fs } from 'fs';
import path from 'path';

interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  cpf: string;
  phone: string;
}

interface Order {
  id: string;
  userId: number;
  date: string;
  total: number;
  mainPlanName: string;
  maintenancePlanName?: string;
}

interface DbData {
  users: User[];
  orders: Order[];
}

const dbPath = path.resolve(__dirname, '../db.json');

const initializeDb = async (): Promise<DbData> => {
  try {
    await fs.access(dbPath);
    const data = await fs.readFile(dbPath, 'utf-8');
    const jsonData = JSON.parse(data);
    return {
        users: jsonData.users || [],
        orders: jsonData.orders || [],
    };
  } catch (error) {
    const initialData: DbData = { users: [], orders: [] };
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
