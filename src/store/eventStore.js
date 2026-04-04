import { create } from 'zustand';
import api from '../services/api';

export const useEventStore = create((set, get) => ({
  eventos: [],
  loading: false,
  error: null,
  estados: [], // Estados desde la DB
  filtroEstado: null, // Estado actualmente seleccionado

  fetchEventos: async () => {
    set({ loading: true, error: null, filtroEstado: null });
    try {
      const response = await api.get('/eventos');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ eventos: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEstados: async () => {
    try {
      const response = await api.get('/eventos/meta');
      const estados = response.data.estados || [];
      set({ estados });
      return estados;
    } catch (error) {
      console.error('Error fetching estados:', error);
      return [];
    }
  },

  fetchEventosByEstado: async (idEstado) => {
    set({ loading: true, error: null, filtroEstado: idEstado });
    try {
      const response = await api.get(`/eventos/estado/${idEstado}`);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ eventos: data, loading: false });
    } catch (error) {
      console.error('[fetchEventosByEstado] Error:', error);
      set({ error: error.message, loading: false, eventos: [] });
    }
  },

  createEvento: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/eventos', data);
      set((state) => ({ 
        eventos: [...state.eventos, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateEvento: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/eventos/${id}`, data);
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id_evento === id ? response.data : e)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteEvento: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/eventos/${id}`);
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchEventosByEstado(filtroEstado);
      } else {
        await get().fetchEventos();
      }
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));