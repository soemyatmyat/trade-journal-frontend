import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BE_API;
axios.defaults.crossDomain = true;

console.log("AXIOS: ", axios.defaults.baseURL);

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
