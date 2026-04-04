import { create } from 'zustand';
import api from '../services/api';

export const useMinistryStore = create((set, get) => ({
  ministerios: [],
  loading: false,
  error: null,
  estados: [], // Estados desde la DB
  filtroEstado: null, // Estado actualmente seleccionado

  fetchMinisterios: async () => {
    set({ loading: true, error: null, filtroEstado: null });
    try {
      const response = await api.get('/ministerios');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ ministerios: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEstados: async () => {
    try {
      const response = await api.get('/ministerios/meta');
      const estados = response.data.estados || [];
      set({ estados });
      return estados;
    } catch (error) {
      console.error('Error fetching estados:', error);
      return [];
    }
  },

  fetchMinisteriosByEstado: async (idEstado) => {
    set({ loading: true, error: null, filtroEstado: idEstado });
    try {
      const response = await api.get(`/ministerios/estado/${idEstado}`);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ ministerios: data, loading: false });
    } catch (error) {
      console.error('[fetchMinisteriosByEstado] Error:', error);
      set({ error: error.message, loading: false, ministerios: [] });
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
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchMinisteriosByEstado(filtroEstado);
      } else {
        await get().fetchMinisterios();
      }
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));