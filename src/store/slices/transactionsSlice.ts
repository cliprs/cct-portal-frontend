import { createSlice } from '@reduxjs/toolkit';

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: { transactions: [], loading: false },
  reducers: {}
});

export default transactionsSlice.reducer;