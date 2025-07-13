import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',  // Flask server
});

export default API;
