import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import kycReducer from './slices/kycSlice';
import authReducer from './slices/authSlice'; // 🔧 Real authSlice import

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null as any,
    financialSummary: {
      equity: 15000,
      totalProfit: 2500,
      balance: 17500,
      wallet: 1200,
      currency: 'USD'
    },
    kycStatus: {
      status: 'approved' as 'pending' | 'approved' | 'rejected' | 'not_uploaded',
      documents: {
        idFront: true,
        idBack: true,
        proofOfResidence: true
      }
    },
    accountSummary: {
      activeAccounts: 3,
      usedWalletAddresses: 2,
      accountStatus: 'active' as 'active' | 'suspended' | 'restricted'
    },
    loading: false,
    error: null as string | null
  },
  reducers: {
    loadMockData: (state) => {
      state.profile = {
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        country: 'Turkey',
        city: 'İzmir',
        address: '123 Main Street',
        postalCode: '35000',
        birthDate: '1990-01-01',
        nationality: 'Turkish'
      };
    }
  }
});

// ✅ Enhanced Accounts Slice with Full Functionality
export interface TradingAccount {
  id: string;
  accountNumber: string;
  accountType: 'Standard' | 'ECN' | 'Cent' | 'Demo';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'TRY';
  balance: number;
  leverage: '1:200' | '1:500' | '1:1000' | '1:2000';
  status: 'active' | 'inactive';
  platform: 'MT4' | 'MT5';
  server: string;
  createdAt: string;
  isIslamic: boolean;
}

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: [] as TradingAccount[],
    loading: false,
    error: null as string | null,
    selectedAccount: null as TradingAccount | null,
  },
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAccounts: (state, action: PayloadAction<TradingAccount[]>) => {
      state.accounts = action.payload;
      state.error = null;
    },
    addAccount: (state, action: PayloadAction<TradingAccount>) => {
      state.accounts.push(action.payload);
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
    },
    setSelectedAccount: (state, action: PayloadAction<TradingAccount | null>) => {
      state.selectedAccount = action.payload;
    },
    updateAccountBalance: (state, action: PayloadAction<{ accountId: string; balance: number }>) => {
      const { accountId, balance } = action.payload;
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        account.balance = balance;
      }
    },
    clearAccountsData: (state) => {
      state.accounts = [];
      state.selectedAccount = null;
      state.error = null;
    },
  }
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    loading: false,
    error: null as string | null
  },
  reducers: {}
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {}
});

// 🔧 Store configuration with REAL authSlice
export const store = configureStore({
  reducer: {
    auth: authReducer, // 🔧 Real auth reducer from authSlice.ts
    user: userSlice.reducer,
    accounts: accountsSlice.reducer,
    transactions: transactionsSlice.reducer,
    notifications: notificationsSlice.reducer,
    kyc: kycReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export actions
export const { loadMockData } = userSlice.actions;

// ✅ Export accounts actions
export const {
  setLoading,
  setError,
  setAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  setSelectedAccount,
  updateAccountBalance,
  clearAccountsData,
} = accountsSlice.actions;