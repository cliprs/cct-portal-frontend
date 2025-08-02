import api from './api';

export interface Transaction {
  id: string;
  transactionId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'TRADE' | 'BONUS' | 'FEE';
  amount: number;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    accountNumber: string;
    platform: string;
  };
}

export interface TransactionResponse {
  success: boolean;
  message?: string;
  data?: Transaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary?: {
    totalAmount: number;
    totalFees: number;
    transactionTypes: Record<string, number>;
    statusCounts: Record<string, number>;
  };
}

export interface CreateTransactionData {
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  paymentMethod?: string;
  description?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

// Get transaction history
export const getTransactionHistory = async () => {
  const response = await api.get<TransactionResponse>('/transactions/history');
  return response.data;
};

// Create deposit transaction
export const createDeposit = async (data: CreateTransactionData) => {
  const response = await api.post<TransactionResponse>('/transactions/deposit', data);
  return response.data;
};

// Create withdrawal transaction
export const createWithdrawal = async (data: CreateTransactionData) => {
  const response = await api.post<TransactionResponse>('/transactions/withdraw', data);
  return response.data;
};

// Create transfer transaction
export const createTransfer = async (data: CreateTransactionData) => {
  const response = await api.post<TransactionResponse>('/transactions/transfer', data);
  return response.data;
};

// Get transaction by ID
export const getTransactionById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Transaction }>(`/transactions/${id}`);
  return response.data;
};

// Cancel transaction
export const cancelTransaction = async (id: string) => {
  const response = await api.put<{ success: boolean; message: string }>(`/transactions/${id}/cancel`);
  return response.data;
};

// Export transaction history
export const exportTransactionHistory = async (filters?: {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/transactions/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};