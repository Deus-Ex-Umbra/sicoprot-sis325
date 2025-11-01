import api from './api';
// import { type Observacion } from '../tipos/usuario';

import type { Observacion } from '../tipos/observacion';

export const obtenerObservacionesPorDocumento = async (documentoId: number): Promise<Observacion[]> => {
  const { data } = await api.get(`/observaciones/por-documento/${documentoId}`);
  return data;
};

export const obtenerObservacionesPorProyecto = async (proyectoId: number): Promise<Observacion[]> => {
  const { data } = await api.get(`/observaciones/por-proyecto/${proyectoId}`);
  return data;
};

// export const obtenerObservacionesPorEstudiante = async (): Promise<Observacion[]> => {
//   const { data } = await api.get('/observaciones/por-estudiante');
//   return data;
// };

export const crearObservacion = async (documentoId: number, observacion: any): Promise<Observacion> => {
  const { data } = await api.post(`/observaciones/${documentoId}/crear`, observacion);
  return data;
};

export const eliminarObservacion = async (observacionId: number): Promise<void> => {
  await api.delete(`/observaciones/${observacionId}`);
};


// Para el estudiante
export const obtenerObservacionesPorEstudiante = async (): Promise<Observacion[]> => {
  const response = await api.get('/observaciones/por-estudiante');
  return response.data;
};

// Reemplaza esta función
export const obtenerObservacionesPorRevisor = async () => {
  const response = await api.get('/observaciones/mias'); // ← nuevo endpoint
  return response.data;
};


// Cambiar estado (asesor)
export const actualizarObservacion = async (
  id: number,
  datos: { estado: string }
): Promise<Observacion> => {
  const response = await api.patch(`/observaciones/${id}/estado`, datos);
  return response.data;
};