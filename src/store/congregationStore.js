import { create } from 'zustand';
import api from '../services/api';

export const useCongregationStore = create((set) => ({
  congregaciones: [],
  loading: false,
  error: null,

  fetchCongregaciones: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/congregaciones');
      set({ congregaciones: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createCongregacion: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/congregaciones', data);
      set((state) => ({ 
        congregaciones: [...state.congregaciones, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateCongregacion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/congregaciones/${id}`, data);
      set((state) => ({
        congregaciones: state.congregaciones.map((c) => (c.id_congregacion === id ? response.data : c)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteCongregacion: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/congregaciones/${id}`);
      set((state) => ({
        congregaciones: state.congregaciones.filter((c) => c.id_congregacion !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));