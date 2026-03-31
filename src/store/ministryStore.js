import { create } from 'zustand';
import api from '../services/api';

export const useMinistryStore = create((set) => ({
  ministerios: [],
  loading: false,
  error: null,

  fetchMinisterios: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/ministerios');
      set({ ministerios: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createMinisterio: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/ministerios', data);
      set((state) => ({ 
        ministerios: [...state.ministerios, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateMinisterio: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/ministerios/${id}`, data);
      set((state) => ({
        ministerios: state.ministerios.map((m) => (m.id_ministerio === id ? response.data : m)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteMinisterio: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/ministerios/${id}`);
      set((state) => ({
        ministerios: state.ministerios.filter((m) => m.id_ministerio !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));