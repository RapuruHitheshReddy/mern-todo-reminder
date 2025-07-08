import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5000',
  withCredentials: true, // ✅ Include cookies in requests
});

export default api;
