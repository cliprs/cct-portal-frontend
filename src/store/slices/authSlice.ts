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
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN'; // ✅ Added role property
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const checkStoredAuth = (): Partial<AuthState> => {
  try {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      // Verify token is not expired
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const isExpired = Date.now() > payload.exp * 1000;
        
        if (isExpired) {
          // Clean up expired tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return {};
        }
      } catch (tokenError) {
        // Invalid token format, clean up
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return {};
      }
      
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored auth data:', error);
    // Clean up corrupted data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  
  return {};
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  ...checkStoredAuth()
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      // Validate required data exists
      if (!action.payload.user || !action.payload.token) {
        console.error('❌ Login success called without required user or token data');
        return;
      }

      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.token);
      
      console.log('✅ Auth state updated successfully');
      console.log('✅ User role:', action.payload.user.role); // ✅ Now TypeScript won't complain
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      
      // Clean up storage
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
      
      // Clean up storage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      console.log('✅ User logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    refreshToken: (state, action: PayloadAction<string>) => {
      if (action.payload) {
        state.token = action.payload;
        localStorage.setItem('accessToken', action.payload);
      }
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