import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/public'; // Cambia si tu backend está en otra URL

export const publicApi = {
    buscarProyectos: async (query: string) => {
        const response = await axios.get(`${API_BASE_URL}/proyectos/buscar`, {
        params: { q: query },
        });
        return response.data;
    },

    obtenerUltimosProyectos: async () => {
        const response = await axios.get(`${API_BASE_URL}/proyectos/ultimos`);
        return response.data;
    },
};