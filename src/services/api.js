import axios from 'axios';
import { useAuthStore } from './auth';
import jwtDecode from 'jwt-decode';

// Helper to get cookie value by name
function getCookie(name) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
}

// Axios instance for BE API
const api = axios.create({
  baseURL: import.meta.env.VITE_BE_API,
  withCredentials: true,
  xsrfCookieName: "csrf_token",
  xsrfHeaderName: "X-CSRF-TOKEN"
});

// use interceptors to globally intercept and modify requests or responses 
// before they are handled by the .then() or .catch() methods of the promise. 
api.interceptors.request.use(async (config) => {
    const auth = useAuthStore(); 

    // Attach CSRF token only for refresh endpoint
    if (config.url && config.url.includes('/auth/refresh')) {
      const csrfToken = getCookie('csrf_token');
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      }
      return config;
    }

    // if access token exists and not expired, attach it to Authorization header otherwise try to refresh
    if (auth.accessToken) {
      const { exp } = jwtDecode(auth.accessToken)
      if (Date.now() >= exp * 1000) {
        // try to refresh
        await refreshToken();
      }
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
  
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and token refresh
api.interceptors.response.use(
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
        const response = await api.post('auth/refresh', null, {
          withCredentials: true,
        });
        const { access_token } = response.data.access_token; // get the new access_token from the refresh response
        auth.setToken(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`; // update the Authorization header with the new token
        return api.request(originalRequest); // retry the original request with the new token
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError); // if there is an issue with refreshing the token or maybe refresh token has expired
        auth.logout(); // clear the token in the store
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh', null, {
      withCredentials: true,
    });
    const access_token = response.data.access_token;
    const auth = useAuthStore();
    auth.setToken(access_token);
    return access_token;
  } catch (err) {
    const auth = useAuthStore();
    auth.clearToken();
    console.error('Login failed:', err.response?.data || err.message);
    throw err;
  }
};

// LOGIN
export const login = async (payload) => {
  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  try {
    const response = await api.post('/auth/token', payload, headers);
    const access_token = response.data.access_token;
    const auth = useAuthStore(); // call pinia and set the token
    auth.setToken(access_token);
    return access_token
  } catch (err) {
    //console.error(err); //todo: to remove
    console.error('Login failed:', err.response?.data || err.message);
    throw err;
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

export const getHistoricalPrice = (ticker_id, from_date, to_date, frequency) => {
  const params = {
    from_date: from_date,
    to_date: to_date,
    frequency: frequency 
  }
  // console.log("Params: ", params);

  return api.get(`/tickers/historical_prices/${ticker_id}`, { params: params });
}

export const getMetrics = (ticker_id) => {
  return api.get(`/tickers/metrics/${ticker_id}`);
}

export default api