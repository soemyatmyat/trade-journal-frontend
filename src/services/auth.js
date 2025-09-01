import { defineStore } from 'pinia';
import jwtDecode from 'jwt-decode';
import api from './api';

// Pinia store to manage authentication state
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null
  }),
  getters: {
    isAuthenticated: (state) => {
      if (!state.accessToken) return false
      try {
        const { exp } = jwtDecode(state.accessToken)
        return Date.now() < exp * 1000
      } catch {
        return false
      }
    }
  },
  actions: {
    setToken(token) {
      this.accessToken = token;
    },
    clearToken() {
      this.accessToken = null;
    },
    async refreshToken() {
      try {
        const res = await api.post('/auth/refresh')  
        const access_token = res.data.access_token;
        this.setToken(access_token)  
      } catch (err) {
        this.clearToken()
        throw err
      }
    },
    logout() {
      this.clearToken();
    },
  }
});
