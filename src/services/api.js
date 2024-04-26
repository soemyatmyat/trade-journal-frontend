import axios from 'axios';
const api = axios.create({
  // baseURL: 'https://trade-journal-5hot.onrender.com/',
  baseURL: import.meta.env.VITE_BE_API,
  crossDomain: true,
});

// use interceptors to globally intercept and modify requests or responses 
// before they are handled by the .then() or .catch() methods of the promise. 
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// READ
export const getPositions = () => {
  return api.get('/positions');
}
// CREATE
export const addNewPosition = (positionData) => {
  return api.post('/positions', positionData);
}
// DELETE
export const removePosition = (position_id) => {
  return api.delete(`/positions/${position_id}`)
}
// UPDATE
export const updatePosition = (position_id, positionData) => {
  return api.put(`/positions/${position_id}`, positionData);
}

// READ 
export const getTicker = (ticker_id) => {
  return api.get(`/tickers/${ticker_id}`)
}

export const getOption = (optionData) => {
  return api.post('/tickers/options/', optionData)
}

export const getHistoricalPrice = (ticker_id, from_date, to_date, frequency) => {
  const params = {
    from_date: from_date,
    to_date: to_date,
    frequency: frequency 
  }

  return api.get(`/tickers/historical_prices/${ticker_id}`, { params: params });
}

export default api