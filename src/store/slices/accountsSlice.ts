import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { accountsApi, transformAccountForFrontend, type AccountsQueryParams } from '../../services/accountsApi';

export interface TradingAccount {
  id: string;
  accountNumber: string;
  accountType: 'Standard' | 'ECN' | 'Cent' | 'Demo' | 'VIP' | 'STP';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'TRY' | 'AED';
  balance: number;
  leverage: '1:1' | '1:10' | '1:25' | '1:50' | '1:100' | '1:200' | '1:300' | '1:400' | '1:500';
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  platform: 'MT4' | 'MT5';
  server: string;
  createdAt: string;
  isIslamic: boolean;
  updatedAt?: string;
  transactionCount?: number;
}

export interface AccountsState {
  accounts: TradingAccount[];
  loading: boolean;
  error: string | null;
  selectedAccount: TradingAccount | null;
  filters: {
    accountType?: string;
    platform?: string;
    status?: string;
    search?: string;
  };
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  lastFetch: string | null;
  backendConnected: boolean;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
  selectedAccount: null,
  filters: {},
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  lastFetch: null,
  backendConnected: false,
};

// ============================================
// ASYNC THUNKS FOR API CALLS
// ============================================

/**
 * Fetch accounts from backend API
 */
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (params: AccountsQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await accountsApi.getAccounts(params);
      
      if (response.success && response.data) {
        return {
          accounts: response.data.accounts.map(transformAccountForFrontend),
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.message || 'Failed to fetch accounts');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch accounts');
    }
  }
);

/**
 * Create new trading account
 */
export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: any, { rejectWithValue }) => {
    try {
      const response = await accountsApi.createAccount(accountData);
      
      if (response.success && response.data) {
        return transformAccountForFrontend(response.data.account);
      } else {
        throw new Error(response.message || 'Failed to create account');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create account');
    }
  }
);

/**
 * Update existing trading account
 */
export const updateExistingAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ accountId, updateData }: { accountId: string; updateData: any }, { rejectWithValue }) => {
    try {
      const response = await accountsApi.updateAccount(accountId, updateData);
      
      if (response.success && response.data) {
        return {
          accountId,
          updatedAccount: transformAccountForFrontend(response.data.account)
        };
      } else {
        throw new Error(response.message || 'Failed to update account');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update account');
    }
  }
);

/**
 * Close trading account
 */
export const closeAccount = createAsyncThunk(
  'accounts/closeAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await accountsApi.closeAccount(accountId);
      
      if (response.success) {
        return accountId;
      } else {
        throw new Error(response.message || 'Failed to close account');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to close account');
    }
  }
);

/**
 * Change account password
 */
export const changeAccountPassword = createAsyncThunk(
  'accounts/changePassword',
  async ({ accountId, newPassword }: { accountId: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await accountsApi.changeAccountPassword(accountId, { newPassword });
      
      if (response.success) {
        return accountId;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

// ============================================
// ACCOUNTS SLICE
// ============================================

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Backend connection status
    setBackendConnected: (state, action: PayloadAction<boolean>) => {
      state.backendConnected = action.payload;
    },
    
    // Accounts management (for manual/mock operations)
    setAccounts: (state, action: PayloadAction<TradingAccount[]>) => {
      state.accounts = action.payload;
      state.pagination.total = action.payload.length;
      state.error = null;
      state.lastFetch = new Date().toISOString();
    },
    
    addAccount: (state, action: PayloadAction<TradingAccount>) => {
      state.accounts.unshift(action.payload); // Add to beginning
      state.pagination.total = state.accounts.length;
    },
    
    updateAccount: (state, action: PayloadAction<{ id: string; updates: Partial<TradingAccount> }>) => {
      const { id, updates } = action.payload;
      const index = state.accounts.findIndex(account => account.id === id);
      if (index !== -1) {
        state.accounts[index] = { ...state.accounts[index], ...updates };
      }
    },
    
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(account => account.id !== action.payload);
      state.pagination.total = state.accounts.length;
    },
    
    // Account selection
    setSelectedAccount: (state, action: PayloadAction<TradingAccount | null>) => {
      state.selectedAccount = action.payload;
    },
    
    // Filters and pagination
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Real-time updates
    updateAccountBalance: (state, action: PayloadAction<{ accountId: string; balance: number }>) => {
      const { accountId, balance } = action.payload;
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        account.balance = balance;
      }
    },
    
    updateAccountStatus: (state, action: PayloadAction<{ accountId: string; status: TradingAccount['status'] }>) => {
      const { accountId, status } = action.payload;
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        account.status = status;
      }
    },
    
    // Clear all data (for logout)
    clearAccountsData: (state) => {
      return { ...initialState };
    },
    
    // Refresh data marker
    markDataStale: (state) => {
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    // ============================================
    // FETCH ACCOUNTS
    // ============================================
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts;
        state.pagination = { ...state.pagination, ...action.payload.pagination };
        state.lastFetch = new Date().toISOString();
        state.backendConnected = true;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.backendConnected = false;
      })
      
    // ============================================
    // CREATE ACCOUNT
    // ============================================
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // ============================================
    // UPDATE ACCOUNT
    // ============================================
      .addCase(updateExistingAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingAccount.fulfilled, (state, action) => {
        state.loading = false;
        const { accountId, updatedAccount } = action.payload;
        const index = state.accounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
          state.accounts[index] = updatedAccount;
        }
        state.error = null;
      })
      .addCase(updateExistingAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // ============================================
    // CLOSE ACCOUNT
    // ============================================
      .addCase(closeAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeAccount.fulfilled, (state, action) => {
        state.loading = false;
        const accountId = action.payload;
        const account = state.accounts.find(acc => acc.id === accountId);
        if (account) {
          account.status = 'closed';
        }
        state.error = null;
      })
      .addCase(closeAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // ============================================
    // CHANGE PASSWORD
    // ============================================
      .addCase(changeAccountPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeAccountPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changeAccountPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================
// ACTION CREATORS
// ============================================

export const {
  setLoading,
  setError,
  setBackendConnected,
  setAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  setSelectedAccount,
  setFilters,
  setPagination,
  updateAccountBalance,
  updateAccountStatus,
  clearAccountsData,
  markDataStale,
} = accountsSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectAccounts = (state: { accounts: AccountsState }) => state.accounts.accounts;
export const selectAccountsLoading = (state: { accounts: AccountsState }) => state.accounts.loading;
export const selectAccountsError = (state: { accounts: AccountsState }) => state.accounts.error;
export const selectSelectedAccount = (state: { accounts: AccountsState }) => state.accounts.selectedAccount;
export const selectAccountsFilters = (state: { accounts: AccountsState }) => state.accounts.filters;
export const selectAccountsPagination = (state: { accounts: AccountsState }) => state.accounts.pagination;
export const selectBackendConnected = (state: { accounts: AccountsState }) => state.accounts.backendConnected;
export const selectLastFetch = (state: { accounts: AccountsState }) => state.accounts.lastFetch;

// Get account by ID
export const selectAccountById = (accountId: string) => (state: { accounts: AccountsState }) => 
  state.accounts.accounts.find(account => account.id === accountId);

// Get accounts by platform
export const selectAccountsByPlatform = (platform: 'MT4' | 'MT5') => (state: { accounts: AccountsState }) =>
  state.accounts.accounts.filter(account => account.platform === platform);

// Get active accounts
export const selectActiveAccounts = (state: { accounts: AccountsState }) =>
  state.accounts.accounts.filter(account => account.status === 'active');

// Get total balance across all accounts
export const selectTotalBalance = (state: { accounts: AccountsState }) =>
  state.accounts.accounts.reduce((total, account) => total + account.balance, 0);

// Get accounts summary
export const selectAccountsSummary = (state: { accounts: AccountsState }) => {
  const accounts = state.accounts.accounts;
  return {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'active').length,
    totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
    platforms: {
      mt4: accounts.filter(acc => acc.platform === 'MT4').length,
      mt5: accounts.filter(acc => acc.platform === 'MT5').length,
    },
    accountTypes: {
      standard: accounts.filter(acc => acc.accountType === 'Standard').length,
      ecn: accounts.filter(acc => acc.accountType === 'ECN').length,
      cent: accounts.filter(acc => acc.accountType === 'Cent').length,
      demo: accounts.filter(acc => acc.accountType === 'Demo').length,
      vip: accounts.filter(acc => acc.accountType === 'VIP').length,
      stp: accounts.filter(acc => acc.accountType === 'STP').length,
    },
    lastUpdate: state.accounts.lastFetch,
  };
};

// Check if data needs refresh (older than 5 minutes)
export const selectNeedsRefresh = (state: { accounts: AccountsState }) => {
  if (!state.accounts.lastFetch) return true;
  const lastFetch = new Date(state.accounts.lastFetch);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastFetch.getTime()) / (1000 * 60);
  return diffMinutes > 5; // Refresh if older than 5 minutes
};

export default accountsSlice.reducer;