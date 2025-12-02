import { API } from '../api/client';

export const adminApi = {
  // ✅ Corregido: ruta exacta del controlador
    listarTribunales: () => API.get('/admin/usuarios/tribunales'),

    // ✅ Asignar tribunal (coherente con tu backend)
    asignarTribunal: (proyectoId: number, tribunalIds: number[]) =>
    API.patch(`/admin/proyectos/${proyectoId}/tribunales`, { tribunalIds }),
};