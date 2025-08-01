import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  kycStatus?: string;
  kycProgress?: number;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 🔧 Gerçek authentication için boş initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 🔧 localStorage'dan token kontrol et
const checkStoredAuth = (): Partial<AuthState> => {
  try {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored auth data:', error);
  }
  
  return {};
};

// Apply stored auth to initial state
const finalInitialState: AuthState = {
  ...initialState,
  ...checkStoredAuth()
};

const authSlice = createSlice({
  name: 'auth',
  initialState: finalInitialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // 🔧 localStorage'a da kaydet
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      
      // 🔧 localStorage'ı temizle
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // 🔧 localStorage'ı temizle
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    // 🔧 User profile güncellemesi için
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    // 🔧 Token yenileme için
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('accessToken', action.payload);
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
  refreshToken
} = authSlice.actions;

export default authSlice.reducer;