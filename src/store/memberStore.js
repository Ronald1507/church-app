import { create } from 'zustand';
import api from '../services/api';

export const useMemberStore = create((set, get) => ({
  members: [],
  loading: false,
  error: null,
  estados: [], // Estados de miembros desde la DB
  filtroEstado: null, // Estado actualmente seleccionado

  fetchMembers: async () => {
    set({ loading: true, error: null, filtroEstado: null });
    try {
      const response = await api.get('/miembros');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false, members: [] });
    }
  },

  fetchEstados: async () => {
    try {
      const response = await api.get('/miembros/opciones');
      const estados = response.data.estados || [];
      set({ estados });
      return estados;
    } catch (error) {
      console.error('Error fetching estados:', error);
      return [];
    }
  },

  fetchMembersByEstado: async (idEstado) => {
    set({ loading: true, error: null, filtroEstado: idEstado });
    try {
      const response = await api.get(`/miembros/estado/${idEstado}`);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
    } catch (error) {
      console.error('[fetchMembersByEstado] Error:', error);
      set({ error: error.message, loading: false, members: [] });
    }
  },

  fetchInactivos: async () => {
    set({ loading: true, error: null });
    try {
      console.log('[fetchInactivos] Calling /miembros/todos');
      const response = await api.get('/miembros/todos');
      console.log('[fetchInactivos] Response:', response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
    } catch (error) {
      console.error('[fetchInactivos] Error:', error);
      console.error('[fetchInactivos] Error response:', error.response?.data);
      set({ error: error.message, loading: false, members: [] });
    }
  },

  fetchEliminados: async () => {
    set({ loading: true, error: null });
    try {
      console.log('[fetchEliminados] Calling /miembros/eliminados');
      const response = await api.get('/miembros/eliminados');
      console.log('[fetchEliminados] Response status:', response.status);
      console.log('[fetchEliminados] Response data:', response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ members: data, loading: false });
    } catch (error) {
      console.error('[fetchEliminados] Error:', error);
      console.error('[fetchEliminados] Error response:', error.response?.data);
      set({ error: error.message, loading: false, members: [] });
    }
  },

  toggleMostrarInactivos: async () => {
    const currentMostrarInactivos = get().mostrarInactivos;
    const newValue = !currentMostrarInactivos;
    
    set({ mostrarInactivos: newValue, mostrarEliminados: false });
    
    if (newValue) {
      await get().fetchInactivos();
    } else {
      await get().fetchMembers();
    }
  },

  toggleMostrarEliminados: async () => {
    const currentMostrarEliminados = get().mostrarEliminados;
    const newValue = !currentMostrarEliminados;
    
    set({ mostrarEliminados: newValue, mostrarInactivos: false });
    
    if (newValue) {
      await get().fetchEliminados();
    } else {
      await get().fetchMembers();
    }
  },

  toggleMemberStatus: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/miembros/${id}/status`);
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchMembersByEstado(filtroEstado);
      } else {
        await get().fetchMembers();
      }
      return { success: true };
    } catch (error) {
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
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchMembersByEstado(filtroEstado);
      } else {
        await get().fetchMembers();
      }
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));