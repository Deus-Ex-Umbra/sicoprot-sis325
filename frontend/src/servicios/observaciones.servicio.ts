import api from './api';
import { type Observacion } from '../tipos/usuario';

export const obtenerObservacionesPorDocumento = async (documentoId: number): Promise<Observacion[]> => {
  const { data } = await api.get(`/observaciones/por-documento/${documentoId}`);
  return data;
};

export const obtenerObservacionesPorProyecto = async (proyectoId: number): Promise<Observacion[]> => {
  const { data } = await api.get(`/observaciones/por-proyecto/${proyectoId}`);
  return data;
};

export const obtenerObservacionesPorEstudiante = async (): Promise<Observacion[]> => {
  const { data } = await api.get('/observaciones/por-estudiante');
  return data;
};

export const crearObservacion = async (documentoId: number, observacion: any): Promise<Observacion> => {
  const { data } = await api.post(`/observaciones/${documentoId}/crear`, observacion);
  return data;
};

export const actualizarObservacion = async (
  observacionId: number, 
  datos: any
): Promise<Observacion> => {
  const { data } = await api.patch(`/observaciones/${observacionId}`, datos);
  return data;
};

export const eliminarObservacion = async (observacionId: number): Promise<void> => {
  await api.delete(`/observaciones/${observacionId}`);
};

export const cambiarEstadoObservacion = async (
  observacionId: number, 
  estado: string, 
  comentarios_asesor?: string
): Promise<{ message: string; observacion: Observacion }> => {
  const { data } = await api.patch(`/observaciones/${observacionId}/estado`, {
    estado,
    comentarios_asesor
  });
  return data;
};