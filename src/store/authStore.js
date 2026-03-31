import { create } from 'zustand';
import api from '../services/api';

// Pestañas permitidas por nivel de acceso
const getAllowedTabs = (nivel) => {
  switch (nivel) {
    case 'SUPERADMIN':
      return ['dashboard', 'members', 'institutions', 'finances', 'events', 'inventory', 'users', 'congregations'];
    case 'ADMIN':
      return ['dashboard', 'members', 'institutions', 'finances', 'events', 'inventory'];
    case 'USUARIO':
      return ['dashboard', 'events', 'profile'];
    default:
      return ['dashboard'];
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  nivel: 'USUARIO',  // USUARIO, ADMIN, SUPERADMIN
  allowedTabs: ['dashboard'],

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      const nivel = user.nivel || 'USUARIO';
      const allowedTabs = getAllowedTabs(nivel);
      
      set({ 
        token, 
        user, 
        isAuthenticated: true,
        nivel,
        allowedTabs
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, nivel: 'USUARIO', allowedTabs: ['dashboard'] });
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('/auth/me response:', response.data);
      const user = response.data;
      const nivel = user.nivel || user.role || 'USUARIO';
      console.log('nivel determined:', nivel);
      const allowedTabs = getAllowedTabs(nivel);
      console.log('allowedTabs:', allowedTabs);
      set({ user, nivel, allowedTabs });
    } catch (error) {
      console.error('fetchUser error:', error);
      get().logout();
    }
  },
}));
