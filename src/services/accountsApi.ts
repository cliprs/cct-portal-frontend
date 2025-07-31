// src/services/accountsApi.ts
import { apiService, ApiResponse } from './api';

// ============================================
// INTERFACES & TYPES
// ============================================

export interface TradingAccountApi {
  id: string;
  accountNumber: string;
  platform: 'MT4' | 'MT5';
  accountType: 'STANDARD' | 'ECN' | 'STP' | 'MICRO' | 'VIP';
  currency: 'USD' | 'EUR' | 'GBP' | 'TRY' | 'AED';
  balance: number;
  leverage: 'L1' | 'L10' | 'L25' | 'L50' | 'L100' | 'L200' | 'L300' | 'L400' | 'L500';
  server: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED';
  isIslamic: boolean;
  createdAt: string;
  updatedAt: string;
  transactionCount?: number;
}

export interface CreateAccountRequest {
  platform?: 'MT4' | 'MT5';
  accountType?: 'STANDARD' | 'ECN' | 'STP' | 'MICRO' | 'VIP';
  currency?: 'USD' | 'EUR' | 'GBP' | 'TRY' | 'AED';
  leverage?: 'L1' | 'L10' | 'L25' | 'L50' | 'L100' | 'L200' | 'L300' | 'L400' | 'L500';
  server?: string;
  isIslamic?: boolean;
}

export interface UpdateAccountRequest {
  platform?: 'MT4' | 'MT5';
  accountType?: 'STANDARD' | 'ECN' | 'STP' | 'MICRO' | 'VIP';
  currency?: 'USD' | 'EUR' | 'GBP' | 'TRY' | 'AED';
  leverage?: 'L1' | 'L10' | 'L25' | 'L50' | 'L100' | 'L200' | 'L300' | 'L400' | 'L500';
  server?: string;
  isIslamic?: boolean;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface AccountsQueryParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED';
  platform?: 'MT4' | 'MT5';
  accountType?: 'STANDARD' | 'ECN' | 'STP' | 'MICRO' | 'VIP';
  sortBy?: 'createdAt' | 'updatedAt' | 'balance' | 'accountNumber' | 'platform';
  sortOrder?: 'asc' | 'desc';
}

export interface AccountsResponse {
  accounts: TradingAccountApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AccountDetailsResponse {
  account: TradingAccountApi;
  statistics: {
    totalTransactions: number;
    lastActivity: string;
    profitLoss: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    type: string;
    amount: number;
    netAmount: number;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

// ============================================
// ACCOUNTS API SERVICE
// ============================================

class AccountsApiService {
  private readonly baseUrl = '/accounts';

  /**
   * Get all user's trading accounts with pagination and filtering
   */
  async getAccounts(params?: AccountsQueryParams): Promise<ApiResponse<AccountsResponse>> {
    try {
      console.log('🔍 Fetching trading accounts...', params);

      const queryString = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryString.append(key, value.toString());
          }
        });
      }

      const url = queryString.toString() ? 
        `${this.baseUrl}?${queryString.toString()}` : 
        this.baseUrl;

      const response = await apiService.get<AccountsResponse>(url);
      
      console.log('✅ Trading accounts fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch trading accounts:', error);
      throw error;
    }
  }

  /**
   * Get single trading account with details
   */
  async getAccountById(accountId: string): Promise<ApiResponse<AccountDetailsResponse>> {
    try {
      console.log(`🔍 Fetching account details for ID: ${accountId}`);

      const response = await apiService.get<AccountDetailsResponse>(`${this.baseUrl}/${accountId}`);
      
      console.log('✅ Account details fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch account details:', error);
      throw error;
    }
  }

  /**
   * Create new trading account
   */
  async createAccount(accountData: CreateAccountRequest): Promise<ApiResponse<{ account: TradingAccountApi }>> {
    try {
      console.log('🏗️ Creating new trading account...', accountData);

      const response = await apiService.post<{ account: TradingAccountApi }>(
        this.baseUrl, 
        accountData
      );
      
      console.log('✅ Trading account created successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to create trading account:', error);
      throw error;
    }
  }

  /**
   * Update existing trading account
   */
  async updateAccount(
    accountId: string, 
    accountData: UpdateAccountRequest
  ): Promise<ApiResponse<{ account: TradingAccountApi }>> {
    try {
      console.log(`📝 Updating account ${accountId}...`, accountData);

      const response = await apiService.put<{ account: TradingAccountApi }>(
        `${this.baseUrl}/${accountId}`, 
        accountData
      );
      
      console.log('✅ Trading account updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to update trading account:', error);
      throw error;
    }
  }

  /**
   * Close trading account
   */
  async closeAccount(accountId: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🗑️ Closing account ${accountId}...`);

      const response = await apiService.delete(`${this.baseUrl}/${accountId}`);
      
      console.log('✅ Trading account closed successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to close trading account:', error);
      throw error;
    }
  }

  /**
   * Change trading account password
   */
  async changeAccountPassword(
    accountId: string, 
    passwordData: ChangePasswordRequest
  ): Promise<ApiResponse<any>> {
    try {
      console.log(`🔐 Changing password for account ${accountId}...`);

      const response = await apiService.post(
        `${this.baseUrl}/${accountId}/password`, 
        passwordData
      );
      
      console.log('✅ Account password changed successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to change account password:', error);
      throw error;
    }
  }

  /**
   * Health check for accounts service
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/health`);
      return response;
    } catch (error) {
      console.error('❌ Accounts service health check failed:', error);
      throw error;
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Transform backend account data to frontend format
 */
export function transformAccountForFrontend(backendAccount: TradingAccountApi): any {
  return {
    id: backendAccount.id,
    accountNumber: backendAccount.accountNumber,
    accountType: backendAccount.accountType === 'STANDARD' ? 'Standard' :
                 backendAccount.accountType === 'ECN' ? 'ECN' :
                 backendAccount.accountType === 'STP' ? 'STP' :
                 backendAccount.accountType === 'MICRO' ? 'Cent' :
                 backendAccount.accountType === 'VIP' ? 'VIP' : 'Standard',
    currency: backendAccount.currency,
    balance: backendAccount.balance,
    leverage: backendAccount.leverage.replace('L', '1:'), // L500 -> 1:500
    status: backendAccount.status.toLowerCase(), // ACTIVE -> active
    platform: backendAccount.platform,
    server: backendAccount.server,
    createdAt: backendAccount.createdAt.split('T')[0], // ISO date to YYYY-MM-DD
    isIslamic: backendAccount.isIslamic
  };
}

/**
 * Transform frontend form data to backend format
 */
export function transformAccountForBackend(frontendData: any): CreateAccountRequest {
  return {
    platform: frontendData.platform,
    accountType: frontendData.accountType?.toUpperCase() === 'STANDARD' ? 'STANDARD' :
                 frontendData.accountType?.toUpperCase() === 'ECN' ? 'ECN' :
                 frontendData.accountType?.toUpperCase() === 'CENT' ? 'MICRO' :
                 frontendData.accountType?.toUpperCase() === 'SPREAD' ? 'STP' : 'STANDARD',
    currency: frontendData.currency,
    leverage: frontendData.leverage?.replace('1:', 'L'), // 1:500 -> L500
    server: frontendData.server,
    isIslamic: frontendData.isIslamic || false
  };
}

/**
 * Format leverage display
 */
export function formatLeverage(leverage: string): string {
  if (leverage.startsWith('L')) {
    return leverage.replace('L', '1:');
  }
  return leverage;
}

/**
 * Format account status for display
 */
export function formatAccountStatus(status: string): { text: string; color: string } {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return { text: 'Active', color: 'success' };
    case 'INACTIVE':
      return { text: 'Inactive', color: 'warning' };
    case 'SUSPENDED':
      return { text: 'Suspended', color: 'error' };
    case 'CLOSED':
      return { text: 'Closed', color: 'default' };
    default:
      return { text: status, color: 'default' };
  }
}

// Create and export singleton instance
export const accountsApi = new AccountsApiService();

// Export default
export default accountsApi;