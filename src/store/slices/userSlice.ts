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

const initialState: UserState = {
  profile: null,
  financialSummary: {
    equity: 15000,
    totalProfit: 2500,
    balance: 17500,
    wallet: 1200,
    currency: 'USD'
  },
  kycStatus: {
    status: 'approved',
    documents: {
      idFront: true,
      idBack: true,
      proofOfResidence: true
    }
  },
  accountSummary: {
    activeAccounts: 3,
    usedWalletAddresses: 2,
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

export const {
  setLoading,
  setError,
  setUserProfile,
  updateUserProfile,
  setFinancialSummary,
  setKYCStatus,
  setAccountSummary,
  loadMockData
} = userSlice.actions;

export default userSlice.reducer;