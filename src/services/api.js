import axios from 'axios';
import { useAuthStore } from './auth';
import router from '@/router'
import { getCookie } from '@/services/util';

// Axios instance for BE API
const api = axios.create({
  baseURL: import.meta.env.VITE_BE_API,
  withCredentials: true, // send cookies with requests
  xsrfCookieName: "csrf_token", // name of the cookie to read the CSRF token from
  xsrfHeaderName: "X-CSRF-TOKEN" // name of the header to send the CSRF token in
});

// use interceptors to globally intercept and modify requests or responses 
// **before** they are handled by the .then() or .catch() methods of the promise. 
api.interceptors.request.use(async (config) => {
  const auth = useAuthStore()
  // console.log('Request URL:', config.url);

  if (config.url?.startsWith('/auth/refresh')) { // for refresh endpoint, only add CSRF token
    const csrfToken = getCookie('csrf_token')
    // console.log('CSRF Token for refresh:', csrfToken);
    if (csrfToken) config.headers['X-CSRF-TOKEN'] = csrfToken 
    return config
  }

  // skip these endpoints for checking access token // todo: should it be in the env?
  const skipEndpoints = [
    '/auth/token',
    '/tickers/historical_prices/',
    '/tickers/metrics/'
  ];
  // If the callback returns true for any element, .some() immediately returns true.
  if (skipEndpoints.some(endpoint => config.url?.startsWith(endpoint))) {
    // console.log(`Skipping auth check for ${config.url}`);
    return config
  }

  // For protected endpoints, check access token and self-heal if expired
  if (auth.tokens['access']) {
    try {
      if (auth.isExpired) {
        await auth.refreshAccessToken()
      }
      config.headers.Authorization = `Bearer ${auth.tokens['access']}`
    } catch (err) {
      console.error('Error decoding or refreshing token:', err)
      auth.logout() 
      router.push({ name: 'login' })
      return Promise.reject(err)
    }
  } else {
    try {
      await auth.refreshAccessToken()
      config.headers.Authorization = `Bearer ${auth.tokens['access']}`
    } catch (err) {
      auth.logout()
      router.push({ name: 'login' })
      return Promise.reject(new Error('No access token'))
    }
  }
  return config
}, (error) => Promise.reject(error))

// use interceptor to handle 401 and token refresh 
// **after** response is received
api.interceptors.response.use(
  (response) => response, // if no server error, return the response as is
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    // otherwise, rehydrate token on 401 response though this is a safe-guard
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post('auth/refresh', null, {
          withCredentials: true,
        });
        const { access_token } = response.data.access_token; // get the new access_token from the refresh response
        auth.setToken('access', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`; // update the Authorization header with the new token
        return api.request(originalRequest); // retry the original request with the new token
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError); // if there is an issue with refreshing the token or maybe refresh token has expired
        auth.logout(); // clear the token in the store
        return Promise.reject(refreshError);
      }
    }

    auth.logout(); // clear the token in the store
    return Promise.reject(error);
  }
);

// login function
export const login = async (payload) => {
  try {
    const auth = useAuthStore();
    await auth.getAccessToken(payload);
    return auth.tokens['access'];
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
  return null;
}

// logout function 
export const logout = async () => {
  try {
    await api.post('/auth/logout', null, {
      withCredentials: true,
    });
  } catch (err) {
    console.error('Logout failed:', err.response?.data || err.message);
  }
}

// READ == POSITIONS
export const getPositions = () => {
  return api.get('/positions');
}
// CREATE == POSITIONS
export const addNewPosition = (positionData) => {
  return api.post('/positions', positionData);
}
// DELETE == POSITIONS
export const removePosition = (position_id) => {
  return api.delete(`/positions/${position_id}`)
}
// UPDATE == POSITIONS
export const updatePosition = (position_id, positionData) => {
  return api.put(`/positions/${position_id}`, positionData);
}

// READ == TICKERS
export const getTicker = (ticker_id) => {
  return api.get(`/tickers/${ticker_id}`)
}
// READ == OPTIONS
export const getOption = (optionData) => {
  return api.post('/tickers/options/', optionData)
}

// READ == HISTORICAL PRICES for a ticker
export const getHistoricalPrice = (ticker_id, from_date, to_date, frequency) => {
  const params = {
    from_date: from_date,
    to_date: to_date,
    frequency: frequency 
  }
  return api.get(`/tickers/historical_prices/${ticker_id}`, { params: params });
}

// READ == METRICS for a ticker
export const getMetrics = (ticker_id) => {
  return api.get(`/tickers/metrics/${ticker_id}`);
}

export default api