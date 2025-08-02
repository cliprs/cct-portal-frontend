import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import kycReducer from './slices/kycSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice'; // 🔧 Real userSlice import
import accountsReducer from './slices/accountsSlice'; // 🔧 Move to separate file
import transactionsReducer from './slices/transactionsSlice'; // 🔧 Move to separate file
import notificationsReducer from './slices/notificationsSlice'; // 🔧 Move to separate file

// 🔧 DEMO userSlice REMOVED! Using real userSlice from ./slices/userSlice.ts

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

// 🔧 Store configuration with ALL REAL slices
export const store = configureStore({
  reducer: {
    auth: authReducer,     // 🔧 Real auth reducer
    user: userReducer,     // 🔧 Real user reducer (not demo!)
    accounts: accountsReducer,
    transactions: transactionsReducer,
    notifications: notificationsReducer,
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

// 🔧 Export only necessary actions (remove loadMockData export!)
// Actions should be imported from individual slice files