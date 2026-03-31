import { create } from 'zustand';
import api from '../services/api';

export const useFinanceStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/transactions');
      set({ transactions: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createTransaction: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/transactions', data);
      set((state) => ({
        transactions: [...state.transactions, response.data],
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },
}));
