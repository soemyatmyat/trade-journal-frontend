import axios from 'axios';
import { defineStore } from 'pinia';

// Helper to get cookie value by name
function getCookie(name) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
}

// Axios instance for insider trades API
const insidertrades = axios.create({
  baseURL: import.meta.env.VITE_INSIDER_TRADES_API,
  crossDomain: true,
  withCredentials: true,
});

// Pinia store to manage authentication state
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
  }),
  actions: {
    setToken(token) {
      this.accessToken = token;
    },
    clearToken() {
      this.accessToken = null;
    },
    logout() {
      this.clearToken();
    },
  },
});

// Request interceptor to attach Authorization and CSRF headers
insidertrades.interceptors.request.use(
  (config) => {
    const auth = useAuthStore();
    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    // Attach CSRF token only for refresh endpoint
    if (config.url && config.url.includes('/auth/refresh')) {
      const csrfToken = getCookie('csrf_token');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and token refresh
insidertrades.interceptors.response.use(
  (response) => response, // if no server error, return response as is
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await insidertrades.post('/auth/refresh', null, {
          withCredentials: true,
        });
        const { access_token } = response.data; // get the new access_token from the refresh response
        auth.setToken(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`; // update the Authorization header with the new token
        return insidertrades.request(originalRequest); // retry the original request with the new token
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError); // if there is an issue with refreshing the token or maybe refresh token has expired
        auth.logout(); // clear the token in the store
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Login function to get access token
async function login() {
  const params = new URLSearchParams();
  params.append('username', import.meta.env.VITE_INSIDER_TRADES_API_KEY);
  params.append('password', import.meta.env.VITE_INSIDER_TRADES_API_PASS);
  params.append('grant_type', 'password');

  try {
    const response = await insidertrades.post('/auth/token', params);
    const { access_token } = response.data;
    const auth = useAuthStore();
    auth.setToken(access_token);
    return access_token;
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    throw err;
  }
}

// Fetch insider trades data, ensuring user is logged in
export const getInsiderTrades = async (ticker_id, from_date, to_date) => {
  const auth = useAuthStore();
  if (!auth.accessToken) {
    await login();
  }

  const params = { from_date, to_date };
  return insidertrades.get(`/insider_trades/${ticker_id}`, { params });
};

export default insidertrades;
