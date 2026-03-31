import { create } from 'zustand';
import api from '../services/api';

export const useUserStore = create((set) => ({
  usuarios: [],
  loading: false,
  error: null,

  fetchUsuarios: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/usuarios');
      set({ usuarios: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createUsuario: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/usuarios', data);
      set((state) => ({ 
        usuarios: [...state.usuarios, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateUsuario: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/usuarios/${id}`, data);
      set((state) => ({
        usuarios: state.usuarios.map((u) => (u.id_usuario === id ? response.data : u)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteUsuario: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/usuarios/${id}`);
      set((state) => ({
        usuarios: state.usuarios.filter((u) => u.id_usuario !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));