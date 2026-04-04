import { create } from 'zustand';
import api from '../services/api';

export const useInventoryStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  estados: [], // Estados desde la DB
  filtroEstado: null, // Estado actualmente seleccionado

  fetchItems: async () => {
    set({ loading: true, error: null, filtroEstado: null });
    try {
      const response = await api.get('/inventario');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ items: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEstados: async () => {
    try {
      const response = await api.get('/inventario/meta');
      const estados = response.data.estados || [];
      set({ estados });
      return estados;
    } catch (error) {
      console.error('Error fetching estados:', error);
      return [];
    }
  },

  fetchItemsByEstado: async (idEstado) => {
    set({ loading: true, error: null, filtroEstado: idEstado });
    try {
      const response = await api.get(`/inventario/estado/${idEstado}`);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ items: data, loading: false });
    } catch (error) {
      console.error('[fetchItemsByEstado] Error:', error);
      set({ error: error.message, loading: false, items: [] });
    }
  },

  createItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/inventario', data);
      set((state) => ({ 
        items: [...state.items, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateItem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/inventario/${id}`, data);
      set((state) => ({
        items: state.items.map((i) => (i.id_item === id ? response.data : i)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/inventario/${id}`);
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchItemsByEstado(filtroEstado);
      } else {
        await get().fetchItems();
      }
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));