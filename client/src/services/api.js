// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: 'https://mern-todo-reminder-8knm.onrender.com',
  withCredentials: true,  // ✅ Include cookie in requests
});


export default api;
