export interface Order {
  id: string;
  date: string;
  total: number;
  currency: string; // Ex: 'EUR', 'BRL', 'USD'
  mainPlanName: string;
  maintenancePlanName?: string;
  status: 'succeeded' | 'pending' | 'failed';
  invoiceUrl?: string; // Link para a fatura
}