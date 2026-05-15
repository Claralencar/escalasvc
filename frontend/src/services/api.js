import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.91.176:8022'
});

export default api;