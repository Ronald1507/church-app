import { create } from 'zustand';
import api from '../services/api';

export const useEventStore = create((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/events');
      set({ events: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createEvent: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/events', data);
      set((state) => ({
        events: [...state.events, response.data],
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  getAttendance: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/attendance`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },
}));
