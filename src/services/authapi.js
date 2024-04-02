import axios from 'axios';

axios.defaults.baseURL = 'http://127.0.0.1:8000/';
axios.defaults.crossDomain = true;

const login = async (payload) => {
  try {
    const headers = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    const response = await axios.post('auth/token', payload, headers);
    return response.data.access_token;
  } catch (error) {
    console.error('Authentication error: ', error);
    throw error;
  }
};

export default login;
