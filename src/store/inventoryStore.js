import { create } from 'zustand';
import api from '../services/api';

export const useInventoryStore = create((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/inventario');
      set({ items: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
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
      set((state) => ({
        items: state.items.filter((i) => i.id_item !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));