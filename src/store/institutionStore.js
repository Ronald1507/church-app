import { create } from 'zustand';
import api from '../services/api';

export const useInstitutionStore = create((set, get) => ({
  instituciones: [],
  loading: false,
  error: null,
  estados: [], // Estados desde la DB
  filtroEstado: null, // Estado actualmente seleccionado

  fetchInstituciones: async () => {
    set({ loading: true, error: null, filtroEstado: null });
    try {
      const response = await api.get('/instituciones');
      const data = Array.isArray(response.data) ? response.data : [];
      set({ instituciones: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEstados: async () => {
    try {
      const response = await api.get('/instituciones/meta');
      const estados = response.data.estados || [];
      set({ estados });
      return estados;
    } catch (error) {
      console.error('Error fetching estados:', error);
      return [];
    }
  },

  fetchInstitucionesByEstado: async (idEstado) => {
    set({ loading: true, error: null, filtroEstado: idEstado });
    try {
      const response = await api.get(`/instituciones/estado/${idEstado}`);
      const data = Array.isArray(response.data) ? response.data : [];
      set({ instituciones: data, loading: false });
    } catch (error) {
      console.error('[fetchInstitucionesByEstado] Error:', error);
      set({ error: error.message, loading: false, instituciones: [] });
    }
  },

  createInstitucion: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/instituciones', data);
      set((state) => ({ 
        instituciones: [...state.instituciones, response.data], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  updateInstitucion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/instituciones/${id}`, data);
      set((state) => ({
        instituciones: state.instituciones.map((i) => (i.id_institucion === id ? response.data : i)),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },

  deleteInstitucion: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/instituciones/${id}`);
      
      const filtroEstado = get().filtroEstado;
      
      // Recargar según el filtro actual
      if (filtroEstado) {
        await get().fetchInstitucionesByEstado(filtroEstado);
      } else {
        await get().fetchInstituciones();
      }
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.response?.data?.error };
    }
  },
}));