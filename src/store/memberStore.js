import { create } from 'zustand';
import api from '../services/api';

export const useMemberStore = create((set) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/members');
      set({ members: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createMember: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/members', data);
      set((state) => ({ 
        members: [...state.members, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateMember: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/members/${id}`, data);
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? response.data : m)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/members/${id}`);
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },
}));
