import { create } from 'zustand';
import api from '../services/api';

export const useInstitutionStore = create((set) => ({
  instituciones: [],
  loading: false,
  error: null,

  fetchInstituciones: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/instituciones');
      set({ instituciones: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createInstitucion: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/instituciones', data);
      set((state) => ({ 
        instituciones: [...state.instituciones, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateInstitucion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/instituciones/${id}`, data);
      set((state) => ({
        instituciones: state.instituciones.map((i) => (i.id_institucion === id ? response.data : i)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteInstitucion: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/instituciones/${id}`);
      set((state) => ({
        instituciones: state.instituciones.filter((i) => i.id_institucion !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));