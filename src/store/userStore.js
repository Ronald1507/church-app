import { create } from 'zustand';
import api from '../services/api';

export const useUserStore = create((set, get) => ({
  usuarios: [],
  loading: false,
  error: null,
  estados: [], // Estados desde la DB
  filtroEstado: null, // Estado actualmente seleccionado

  fetchUsuarios: async () => {
    set({ loading: true, error: null, filtroEstado: null });
    try {
      const response = await api.get('/usuarios');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ usuarios: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEstados: async () => {
    try {
      const response = await api.get('/usuarios/opciones');
      const estados = response.data.estados || [];
      set({ estados });
      return estados;
    } catch (error) {
      console.error('Error fetching estados:', error);
      return [];
    }
  },

  fetchUsuariosByEstado: async (idEstado) => {
    set({ loading: true, error: null, filtroEstado: idEstado });
    try {
      const response = await api.get(`/usuarios/estado/${idEstado}`);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ usuarios: data, loading: false });
    } catch (error) {
      console.error('[fetchUsuariosByEstado] Error:', error);
      set({ error: error.message, loading: false, usuarios: [] });
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
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchUsuariosByEstado(filtroEstado);
      } else {
        await get().fetchUsuarios();
      }
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));