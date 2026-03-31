import { create } from 'zustand';
import api from '../services/api';

export const useMemberStore = create((set, get) => ({
  members: [],
  loading: false,
  error: null,
  mostrarInactivos: false,

  fetchMembers: async () => {
    console.log('[fetchMembers] Starting...');
    set({ loading: true, error: null });
    try {
      console.log('[fetchMembers] Calling /miembros');
      const response = await api.get('/miembros');
      console.log('[fetchMembers] Response:', response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
      console.log('[fetchMembers] Members loaded:', data.length);
    } catch (error) {
      console.error('[fetchMembers] Error:', error);
      set({ error: error.message, loading: false, members: [] });
    }
  },

  fetchAllMembers: async () => {
    console.log('[fetchAllMembers] Starting...');
    set({ loading: true, error: null });
    try {
      console.log('[fetchAllMembers] Calling /miembros/todos');
      const response = await api.get('/miembros/todos');
      console.log('[fetchAllMembers] Response:', response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
      console.log('[fetchAllMembers] Members loaded:', data.length);
    } catch (error) {
      console.error('[fetchAllMembers] Error:', error);
      set({ error: error.message, loading: false, members: [] });
    }
  },

  toggleMostrarInactivos: async () => {
    const currentMostrarInactivos = get().mostrarInactivos;
    const newValue = !currentMostrarInactivos;
    
    console.log('[toggleMostrarInactivos] Current:', currentMostrarInactivos, '-> new:', newValue);
    
    set({ mostrarInactivos: newValue });
    
    // Llamar a la API directamente según el estado
    if (newValue) {
      console.log('[toggleMostrarInactivos] Fetching inactive members...');
      set({ loading: true, error: null });
      try {
        console.log('[toggleMostrarInactivos] Calling /miembros/todos');
        const response = await api.get('/miembros/todos');
        console.log('[toggleMostrarInactivos] Response status:', response.status);
        console.log('[toggleMostrarInactivos] Response data:', response.data);
        const data = Array.isArray(response.data) ? response.data : [];
        set({ members: data, loading: false });
        console.log('[toggleMostrarInactivos] Loaded:', data.length, 'inactive members');
      } catch (error) {
        console.error('[toggleMostrarInactivos] Error:', error);
        console.error('[toggleMostrarInactivos] Error response:', error.response);
        set({ error: error.message, loading: false, members: [] });
      }
    } else {
      console.log('[toggleMostrarInactivos] Fetching active members...');
      set({ loading: true, error: null });
      try {
        console.log('[toggleMostrarInactivos] Calling /miembros');
        const response = await api.get('/miembros');
        console.log('[toggleMostrarInactivos] Response status:', response.status);
        console.log('[toggleMostrarInactivos] Response data:', response.data);
        const data = Array.isArray(response.data) ? response.data : [];
        set({ members: data, loading: false });
        console.log('[toggleMostrarInactivos] Loaded:', data.length, 'active members');
      } catch (error) {
        console.error('[toggleMostrarInactivos] Error:', error);
        console.error('[toggleMostrarInactivos] Error response:', error.response);
        set({ error: error.message, loading: false, members: [] });
      }
    }
  },

  toggleMemberStatus: async (id) => {
    console.log('[toggleMemberStatus] Called with id:', id);
    set({ loading: true, error: null });
    try {
      console.log('[toggleMemberStatus] Calling API...');
      const response = await api.patch(`/miembros/${id}/status`);
      console.log('[toggleMemberStatus] API response:', response.data);
      
      // Recargar según el filtro actual
      const mostrarInactivos = get().mostrarInactivos;
      console.log('[toggleMemberStatus] mostrarInactivos:', mostrarInactivos);
      
      if (mostrarInactivos) {
        console.log('[toggleMemberStatus] Reloading inactive members...');
        const response = await api.get('/miembros/todos');
        const data = Array.isArray(response.data) ? response.data : [];
        set({ members: data, loading: false });
      } else {
        console.log('[toggleMemberStatus] Reloading active members...');
        const response = await api.get('/miembros');
        const data = Array.isArray(response.data) ? response.data : [];
        set({ members: data, loading: false });
      }
      return { success: true };
    } catch (error) {
      console.error('[toggleMemberStatus] Error:', error);
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
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