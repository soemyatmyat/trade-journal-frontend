import axios from 'axios';
const insidertrades = axios.create({
  baseURL: import.meta.env.VITE_INSIDER_TRADES_API,
  crossDomain: true,
});

// use interceptors to globally intercept and modify requests or responses 
// before they are handled by the .then() or .catch() methods of the promise. 
insidertrades.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

async function login(username, password) {
  const params = new URLSearchParams();
  params.append('username', import.meta.env.VITE_INSIDER_TRADES_API_KEY);
  params.append('password', import.meta.env.VITE_INSIDER_TRADES_API_PASS);
  params.append('grant_type', 'password');

  try {
    const response = await insidertrades.post(`/auth/token`, params);
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return access_token;
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    throw err;
  }
}

export const getInsiderTrades = async (ticker_id, from_date, to_date) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    await login();
  }

  const params = {
    from_date: from_date,
    to_date: to_date,
  }
  return insidertrades.get(`/insider_trades/${ticker_id}`, { params: params });
}

export default insidertrades