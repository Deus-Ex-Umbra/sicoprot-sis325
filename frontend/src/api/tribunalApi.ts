// src/api/tribunalApi.ts
import { API } from './client';

export const tribunalApi = {
  // ✅ Listar proyectos asignados al tribunal
    listarProyectos: () => API.get('/tribunal/proyectos'),

    // ✅ Crear evaluación: un solo método, claro
    crearEvaluacion: (proyectoId: number, data: { observaciones?: string; calificacion?: number }) =>
    API.post(`/tribunal/proyectos/${proyectoId}/evaluar`, data),
};