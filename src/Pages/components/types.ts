export interface Order {
  id: string;
  date: string;
  total: number;
  currency: string; // Ex: 'EUR', 'BRL', 'USD'
  mainPlanName: string;
  maintenancePlanName?: string;
  briefing?: any;
  paymentMethod?: string;
  paymentDetails?: any;
  status: 'succeeded' | 'pending' | 'failed' | 'delivered';
  progress?: 'analise' | 'desenvolvimento' | 'bugs' | 'finalizado' | 'entregue';
  invoiceUrl?: string; // Link para a fatura
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'nexa' | 'client';
  text: string;
  timestamp: string;
}