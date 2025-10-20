import api from './api';
import { type Grupo } from '../tipos/usuario';

export const obtenerGrupos = async (): Promise<Grupo[]> => {
  const { data } = await api.get('/grupos');
  return data;
};

export const obtenerGruposDisponibles = async (): Promise<Grupo[]> => {
  const { data } = await api.get('/grupos/disponibles');
  return data;
};

export const obtenerMiGrupo = async (): Promise<Grupo | null> => {
  try {
    const { data } = await api.get('/grupos/mi-grupo');
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const obtenerGruposPorPeriodo = async (periodoId: number): Promise<Grupo[]> => {
  const { data } = await api.get(`/grupos/periodo/${periodoId}`);
  return data;
};

export const obtenerGrupoPorId = async (id: number): Promise<Grupo> => {
  const { data } = await api.get(`/grupos/${id}`);
  return data;
};

export const crearGrupo = async (grupo: any): Promise<Grupo> => {
  const { data } = await api.post('/grupos', grupo);
  return data;
};

export const actualizarGrupo = async (id: number, grupo: any): Promise<Grupo> => {
  const { data } = await api.patch(`/grupos/${id}`, grupo);
  return data;
};

export const inscribirseAGrupo = async (grupoId: number): Promise<any> => {
  const { data } = await api.post(`/grupos/${grupoId}/inscribirse`);
  return data;
};

export const desinscribirseDeGrupo = async (grupoId: number): Promise<any> => {
  const { data } = await api.delete(`/grupos/${grupoId}/desinscribirse`);
  return data;
};

export const asignarEstudiante = async (grupoId: number, estudianteId: number): Promise<Grupo> => {
  const { data } = await api.post(`/grupos/${grupoId}/asignar-estudiante`, { id_estudiante: estudianteId });
  return data;
};

export const removerEstudiante = async (grupoId: number, estudianteId: number): Promise<Grupo> => {
  const { data } = await api.delete(`/grupos/${grupoId}/remover-estudiante/${estudianteId}`);
  return data;
};

export const eliminarGrupo = async (id: number): Promise<void> => {
  await api.delete(`/grupos/${id}`);
};