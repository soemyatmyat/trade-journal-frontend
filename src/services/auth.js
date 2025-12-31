import { defineStore } from 'pinia';
import jwtDecode from 'jwt-decode';
import api from './api';

let refreshPromise = null;

// Pinia store to manage authentication state and own token lifecycle
export const useAuthStore = defineStore('auth', {
  state: () => ({
    tokens: {
      access: null,
      insider: null,
    },
  }),
  getters: {
    // check if there is a token and if it's still valid. If expired, return false
    isAuthenticated: (state) => {
      if (!state.accessToken) return false
    },
    isExpired: (state) => {
      if (!state.accessToken) return true
      try {
        const { exp } = jwtDecode(state.accessToken)
        return Date.now() >= exp * 1000
      } catch {
        return false
      }
    }
  },
  actions: {
    async getAccessToken(payload) {
      const headers = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded' // html form format (username & password)
        }
      };
      try {
        const response = await api.post('/auth/token', payload, headers); // post to the api /auth/token endpoint
        const access_token = response.data.access_token;
        this.setToken('access',access_token);
      } catch (err) {
        this.clearToken();
        throw err;
      }
    },
    setToken(service, token) {
      this.tokens[service] = token;
    },
    clearToken(service='access') {
      this.tokens[service] = null;
    },
    async refreshAccessToken() {
      try {
        const response = await api.post('/auth/refresh', null, {
          withCredentials: true,
        }); 
        const access_token = response.data.access_token;
        this.setToken('access',access_token)  
      } catch (err) {
        this.clearToken()
        throw err
      }
    },
    logout() {
      this.clearToken('access');
      this.clearToken('insider');
    },
  }
});

