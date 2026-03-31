import { create } from 'zustand';
import api from '../services/api';

export const useMemberStore = create((set) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/miembros');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
    } catch (error) {
      console.error('Error fetching members:', error);
      set({ error: error.message, loading: false, members: [] });
    }
  },

  createMember: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/miembros', data);
      set((state) => ({ 
        members: [...state.members, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateMember: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/miembros/${id}`, data);
      set((state) => ({
        members: state.members.map((m) => (m.id_miembro === id ? response.data : m)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/miembros/${id}`);
      set((state) => ({
        members: state.members.filter((m) => m.id_miembro !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));