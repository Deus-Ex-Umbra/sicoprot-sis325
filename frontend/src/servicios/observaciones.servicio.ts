import api from './api';
import { type Observacion } from '../tipos/usuario';

export const obtenerObservacionesPorDocumento = async (documentoId: number): Promise<Observacion[]> => {
  const { data } = await api.get(`/observaciones/por-documento/${documentoId}`);
  return data;
};

export const crearObservacion = async (documentoId: number, observacion: any): Promise<Observacion> => {
  const { data } = await api.post(`/observaciones/${documentoId}/crear`, observacion);
  return data;
};

// ✨ NUEVA FUNCIÓN: Cambiar estado de observación
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