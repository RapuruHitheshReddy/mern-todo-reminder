// client/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // ✅ Include cookies in requests
});



export default api;
