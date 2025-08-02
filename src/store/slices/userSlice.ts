import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  birthDate: string;
  nationality: string;
}

export interface FinancialSummary {
  equity: number;
  totalProfit: number;
  balance: number;
  wallet: number;
  currency: string;
}

export interface KYCStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
  documents: {
    idFront: boolean;
    idBack: boolean;
    proofOfResidence: boolean;
  };
}

export interface AccountSummary {
  activeAccounts: number;
  usedWalletAddresses: number;
  accountStatus: 'active' | 'suspended' | 'restricted';
}

interface UserState {
  profile: UserProfile | null;
  financialSummary: FinancialSummary;
  kycStatus: KYCStatus;
  accountSummary: AccountSummary;
  loading: boolean;
  error: string | null;
}

// 🔧 DEMO DATA REMOVED - Set to 0
const initialState: UserState = {
  profile: null,
  financialSummary: {
    equity: 0,
    totalProfit: 0,
    balance: 0,
    wallet: 0,
    currency: 'USD'
  },
  kycStatus: {
    status: 'not_uploaded',
    documents: {
      idFront: false,
      idBack: false,
      proofOfResidence: false
    }
  },
  accountSummary: {
    activeAccounts: 0,
    usedWalletAddresses: 0,
    accountStatus: 'active'
  },
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setFinancialSummary: (state, action: PayloadAction<FinancialSummary>) => {
      state.financialSummary = action.payload;
    },
    setKYCStatus: (state, action: PayloadAction<KYCStatus>) => {
      state.kycStatus = action.payload;
    },
    setAccountSummary: (state, action: PayloadAction<AccountSummary>) => {
      state.accountSummary = action.payload;
    },
    // 🔧 loadMockData REMOVED - No more demo data loading
    clearUserData: (state) => {
      state.profile = null;
      state.financialSummary = {
        equity: 0,
        totalProfit: 0,
        balance: 0,
        wallet: 0,
        currency: 'USD'
      };
      state.kycStatus = {
        status: 'not_uploaded',
        documents: {
          idFront: false,
          idBack: false,
          proofOfResidence: false
        }
      };
      state.accountSummary = {
        activeAccounts: 0,
        usedWalletAddresses: 0,
        accountStatus: 'active'
      };
    }
  }
});

export const {
  setLoading,
  setError,
  setUserProfile,
  updateUserProfile,
  setFinancialSummary,
  setKYCStatus,
  setAccountSummary,
  clearUserData
} = userSlice.actions;

export default userSlice.reducer;