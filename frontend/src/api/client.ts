// src/api/client.ts
import axios from 'axios';

// ✅ Usamos el mismo baseURL que en tu backend (ajusta puerto si es necesario)
export const API = axios.create({
    baseURL: 'http://localhost:3000/api',
  // Puedes añadir interceptores aquí más tarde para el token
});